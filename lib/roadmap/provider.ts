import { z } from "zod";
import { normalizeCompetencyId, competencyLabel } from "../competencies";
import { runChatCompletion, stripCodeFence } from "../ai/chat";
import type { ActiveProject, SkillGapVector } from "../workspace/contracts";
import { generateRoadmap, type GeneratedMilestone } from "./generate";

const modelMilestoneSchema = z.object({
  slug: z.string().trim().min(1).max(48),
  title: z.string().trim().min(6).max(120),
  detail: z.string().trim().min(12).max(400),
  estimateMinutes: z.coerce.number().int().min(15).max(240),
  competency: z.string().trim().min(2),
  dependsOn: z.array(z.string().trim().min(1)).max(8).optional().default([]),
  kind: z.enum(["milestone", "capstone"]).optional().default("milestone"),
});

const modelRoadmapSchema = z.object({
  milestones: z.array(modelMilestoneSchema).min(2).max(8),
});

function buildPrompt(project: ActiveProject, gap: SkillGapVector) {
  const gapLines = gap
    .map((entry) => `- ${entry.label} (${entry.competencyId}): score ${entry.score}/100, ${entry.state}`)
    .join("\n");

  return `You are GenPHD's roadmap planner for an AI engineer. Return only one valid JSON object, no markdown.

Build a personalized learning roadmap as a DAG of milestones. Prioritize the weakest competencies and respect the natural prerequisite order (prompting -> embeddings -> vector databases -> retrieval -> agent frameworks -> evaluations). The final milestone must be a capstone that ships a concrete, demoable artifact tied to the project.

The JSON object has one field: milestones (an array of 2 to 8 objects). Each milestone has:
- slug: a short stable kebab-case id, unique within the array
- title: concrete and specific to the project
- detail: one or two sentences describing the observable outcome
- estimateMinutes: integer between 15 and 240
- competency: one of Prompting, Embeddings, Vector databases, Retrieval strategies, Agent frameworks, Evaluations
- dependsOn: array of slugs of earlier milestones that must come first (use [] for roots)
- kind: "milestone", except exactly one final "capstone"

Rules: dependsOn may only reference slugs that appear earlier in the array. Exactly one capstone, and it must be last and depend on the milestones it builds on. Do not invent competencies outside the list. Keep it focused on this learner's gaps.

Project: ${project.name} — ${project.outcome}
Stack: ${project.stack.join(", ") || "unspecified"}
Weekly hours available: ${project.weeklyHours}
Constraints: ${project.constraints.join("; ") || "none stated"}

Skill-gap vector:
${gapLines}`;
}

// Enforce DAG integrity: unique slugs, dependencies that reference earlier slugs, and
// exactly one capstone. Returns the normalized milestones, or null if the plan is unusable.
function toGeneratedMilestones(parsed: z.infer<typeof modelRoadmapSchema>): GeneratedMilestone[] | null {
  const seen = new Set<string>();
  const result: GeneratedMilestone[] = [];
  let capstones = 0;

  for (const milestone of parsed.milestones) {
    const slug = milestone.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (!slug || seen.has(slug)) return null;
    const dependsOn = milestone.dependsOn
      .map((dep) => dep.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
    if (dependsOn.some((dep) => !seen.has(dep))) return null; // must reference an earlier slug
    if (milestone.kind === "capstone") capstones += 1;

    const competencyId = normalizeCompetencyId(milestone.competency);
    seen.add(slug);
    result.push({
      slug,
      title: milestone.title,
      detail: milestone.detail,
      estimateMinutes: milestone.estimateMinutes,
      competencyId,
      competency: competencyLabel(competencyId),
      dependsOn,
      kind: milestone.kind,
    });
  }

  if (capstones !== 1 || result.at(-1)?.kind !== "capstone") return null;
  return result;
}

/**
 * Generate a roadmap DAG from the project context and skill-gap vector. Uses the configured
 * LLM provider chain when available, validating the result for DAG integrity, and falls back
 * to the deterministic rule-based generator on any failure.
 */
export async function generateRoadmapWithProvider(project: ActiveProject, gap: SkillGapVector): Promise<GeneratedMilestone[]> {
  const content = await runChatCompletion({
    system: "You return strictly valid JSON for a typed product workflow.",
    user: buildPrompt(project, gap),
    maxTokens: 1_600,
  }).catch(() => null);

  if (content) {
    try {
      const parsed = modelRoadmapSchema.parse(JSON.parse(stripCodeFence(content)));
      const milestones = toGeneratedMilestones(parsed);
      if (milestones) return milestones;
    } catch {
      // fall through to the deterministic roadmap
    }
  }

  return generateRoadmap(project, gap);
}
