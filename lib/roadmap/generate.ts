import { COMPETENCIES, competencyLabel, type CompetencyId } from "../competencies";
import type { ActiveProject, MilestoneState, SkillGapVector } from "../workspace/contracts";

// A roadmap milestone before persistence: dependencies are expressed with stable local
// slugs, which the repository resolves to build_missions UUIDs at insert time.
export type GeneratedMilestone = {
  slug: string;
  title: string;
  detail: string;
  estimateMinutes: number;
  competencyId: CompetencyId;
  competency: string;
  dependsOn: string[];
  kind: "milestone" | "capstone";
};

const CAPSTONE_SLUG = "capstone";

// A competency counts as a gap worth a milestone until it reaches mastery.
function isGap(score: number) {
  return score <= 75;
}

type MilestoneTemplate = (project: ActiveProject) => { title: string; detail: string; estimateMinutes: number };

const MILESTONE_TEMPLATES: Record<CompetencyId, MilestoneTemplate> = {
  prompting: (project) => ({
    title: `Write a constrained prompt for ${project.name}`,
    detail: "Draft a prompt with an explicit output schema, one worked example, and low temperature, then verify it holds on three tricky inputs.",
    estimateMinutes: 45,
  }),
  embeddings: (project) => ({
    title: `Choose and test an embedding model for ${project.name}`,
    detail: "Embed a small sample from your sources, compare cosine similarity for related vs unrelated passages, and record why the model fits your latency and cost budget.",
    estimateMinutes: 60,
  }),
  "vector-dbs": (project) => ({
    title: "Store your vectors with the right index and metadata",
    detail: `Load embeddings into your store (${project.stack.join(", ") || "your stack"}), add source, chunk position, and title metadata, and confirm nearest-neighbor queries return sensible neighbours.`,
    estimateMinutes: 75,
  }),
  retrieval: (project) => ({
    title: `Make retrieval reliable for ${project.name}`,
    detail: "Tune chunking, add hybrid or reranked retrieval, and inspect the retrieved chunks beside answers on paraphrased questions.",
    estimateMinutes: 90,
  }),
  "agent-frameworks": (project) => ({
    title: "Add orchestration only where it earns its place",
    detail: `Decide, in writing, whether ${project.name} needs branching, tool use, or persistence — and add a current framework only for the steps that genuinely require it.`,
    estimateMinutes: 90,
  }),
  evals: (project) => ({
    title: `Build a small eval set for ${project.name}`,
    detail: "Write 5-8 representative questions with expected grounding and a pass/fail check, then run it as your regression gate before shipping changes.",
    estimateMinutes: 60,
  }),
};

/**
 * Deterministic, rule-based roadmap generator (also the fallback when the LLM provider
 * is unavailable or returns an invalid plan). Produces a DAG: a milestone per gap
 * competency in prerequisite order, each depending on the nearest earlier gap milestone,
 * ending in a project-specific capstone artifact that depends on every milestone.
 */
export function generateRoadmap(project: ActiveProject, gap: SkillGapVector): GeneratedMilestone[] {
  const scoreById = new Map<string, number>(gap.map((entry) => [entry.competencyId, entry.score]));

  // Competencies needing work, in natural prerequisite order. If everything is mastered,
  // still target the single weakest so the learner always has a next step.
  let weak = COMPETENCIES.filter((competency) => isGap(scoreById.get(competency.id) ?? 50));
  if (weak.length === 0) {
    const weakest = [...COMPETENCIES].sort(
      (a, b) => (scoreById.get(a.id) ?? 100) - (scoreById.get(b.id) ?? 100),
    )[0];
    weak = weakest ? [weakest] : [];
  }

  const milestones: GeneratedMilestone[] = weak.map((competency, index) => {
    const template = MILESTONE_TEMPLATES[competency.id](project);
    const previous = weak[index - 1];
    return {
      slug: competency.id,
      title: template.title,
      detail: template.detail,
      estimateMinutes: template.estimateMinutes,
      competencyId: competency.id,
      competency: competency.label,
      dependsOn: previous ? [previous.id] : [],
      kind: "milestone" as const,
    };
  });

  milestones.push({
    slug: CAPSTONE_SLUG,
    title: `Ship ${project.name}: ${project.outcome}`,
    detail: "Integrate the milestones into one working, evaluated pipeline you can demo and explain end to end.",
    estimateMinutes: 120,
    competencyId: "evals",
    competency: competencyLabel("evals"),
    dependsOn: milestones.map((milestone) => milestone.slug),
    kind: "capstone" as const,
  });

  return milestones;
}

/**
 * Derive display states for an ordered milestone list given the set of completed keys.
 * A milestone is `locked` until every dependency is complete; among the unlocked,
 * incomplete milestones the first is `now`, the second `next`, the rest `later`.
 * Completed milestones receive no state (callers drop them from the view).
 */
export function computeMilestoneStates(
  items: { key: string; dependsOn: string[] }[],
  completed: Set<string>,
): Record<string, MilestoneState> {
  const states: Record<string, MilestoneState> = {};
  let rank = 0;
  for (const item of items) {
    if (completed.has(item.key)) continue;
    if (item.dependsOn.some((dependency) => !completed.has(dependency))) {
      states[item.key] = "locked";
      continue;
    }
    states[item.key] = rank === 0 ? "now" : rank === 1 ? "next" : "later";
    rank += 1;
  }
  return states;
}
