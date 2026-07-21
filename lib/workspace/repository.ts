import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { seedDecisionBrief } from "../decision/brief";
import type { DecisionBrief } from "../decision/types";
import { completeMission, missionCompletionSchema, type CompleteMissionInput } from "../missions/complete";
import { competencyLabel, normalizeCompetencyId, type CompetencyId } from "../competencies";
import { consensusReportSchema, type ConsensusReport } from "../consensus/types";
import type { Challenge, ChallengeGrade } from "../challenges/types";
import { QUESTION_BANK_VERSION } from "../diagnostic/questions";
import { neutralGapVector } from "../diagnostic/scoring";
import { computeMilestoneStates, generateRoadmap, type GeneratedMilestone } from "../roadmap/generate";
import { generateRoadmapWithProvider } from "../roadmap/provider";
import type { WorkspaceContext } from "./context";
import {
  createDemoOnboardingResult,
  diagnosticResultSchema,
  onboardingResultSchema,
  type DiagnosticResult,
  type OnboardingInput,
} from "./onboarding";
import {
  activeProjectSchema,
  decisionStateSchema,
  memoryItemSchema,
  missionStatusSchema,
  roadmapMilestoneSchema,
  skillGapVectorSchema,
  type ActiveProject,
  type DecisionState,
  type MemoryItem,
  type RoadmapMilestone,
  type SkillGapVector,
} from "./contracts";

export class WorkspacePersistenceError extends Error {
  constructor() {
    super("Your workspace could not be updated. Please retry in a moment.");
  }
}

const demoProject: ActiveProject = {
  id: "docuquery",
  name: "DocuQuery",
  outcome: "Source-grounded document Q&A",
  stack: ["Python", "FastAPI", "pgvector"],
  weeklyHours: 6,
  constraints: ["two-day deadline", "one retrieval flow", "portfolio-quality explanation"],
};

// Convert generated (slug-keyed) milestones into the display contract, deriving each
// milestone's state from which of its dependencies are complete.
function generatedToContract(milestones: GeneratedMilestone[], completed: Set<string> = new Set()): RoadmapMilestone[] {
  const states = computeMilestoneStates(
    milestones.map((milestone) => ({ key: milestone.slug, dependsOn: milestone.dependsOn })),
    completed,
  );
  return milestones
    .filter((milestone) => states[milestone.slug])
    .map((milestone, index) =>
      roadmapMilestoneSchema.parse({
        id: milestone.slug,
        state: states[milestone.slug],
        title: milestone.title,
        detail: milestone.detail,
        estimateMinutes: milestone.estimateMinutes,
        competency: milestone.competency,
        dependsOn: milestone.dependsOn,
        sortOrder: index,
        kind: milestone.kind,
      }),
    );
}

const demoRoadmap: RoadmapMilestone[] = generatedToContract(generateRoadmap(demoProject, neutralGapVector()));

const demoMemory: MemoryItem[] = [
  { id: "goal", scope: "project", label: "Active project", value: "DocuQuery — source-grounded document Q&A", provenance: "onboarding" },
  { id: "constraint", scope: "project", label: "Project constraint", value: "Two-day milestone with one retrieval flow", provenance: "onboarding" },
  { id: "skill", scope: "learning", label: "RAG evaluation", value: "Emerging", provenance: "diagnostic" },
];

const activeProjectRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  outcome: z.string(),
  stack: z.array(z.string()),
  constraints: z.array(z.string()),
});

const decisionRowSchema = z.object({
  brief: z.unknown().nullable(),
  consensus: z.unknown().nullable().default(null),
});

const missionRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  competency_id: z.string().nullable(),
  status: missionStatusSchema,
  completed_at: z.string().nullable(),
});

const roadmapRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  objective: z.string(),
  estimate_minutes: z.number().int(),
  competency_id: z.string().nullable(),
  status: missionStatusSchema,
  depends_on: z.array(z.string().uuid()).nullable().default([]),
  sort_order: z.number().int().nullable(),
  kind: z.enum(["milestone", "capstone"]).nullable().default("milestone"),
});

const memoryRowSchema = z.object({
  id: z.string().uuid(),
  category: z.enum(["profile", "project", "learning", "decision"]),
  label: z.string(),
  value: z.string(),
  provenance: z.enum(["user", "mission", "decision", "diagnostic", "inference"]),
});

function requireSuccess(error: unknown) {
  if (error) {
    throw new WorkspacePersistenceError();
  }
}

function competencyIdFor(label: string): CompetencyId {
  return normalizeCompetencyId(label);
}

function competencyLabelFor(id: string | null, fallback: string) {
  return id ? competencyLabel(normalizeCompetencyId(id)) : fallback;
}

function toActiveProject(row: z.infer<typeof activeProjectRowSchema>): ActiveProject {
  return activeProjectSchema.parse({ ...row, weeklyHours: 6 });
}

async function ensureActiveProject(supabase: SupabaseClient, userId: string) {
  const existing = await supabase
    .from("projects")
    .select("id, name, outcome, stack, constraints")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  requireSuccess(existing.error);

  if (existing.data) {
    return toActiveProject(activeProjectRowSchema.parse(existing.data));
  }

  const created = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      name: demoProject.name,
      outcome: demoProject.outcome,
      stack: demoProject.stack,
      constraints: demoProject.constraints,
      is_active: true,
    })
    .select("id, name, outcome, stack, constraints")
    .single();
  requireSuccess(created.error);

  const project = toActiveProject(activeProjectRowSchema.parse(created.data));
  const memory = await supabase.from("memory_items").insert(
    demoMemory.map((item) => ({
      user_id: userId,
      project_id: project.id,
      category: item.scope,
      label: item.label,
      value: item.value,
      provenance: "user",
      confidence: "high",
    })),
  );
  requireSuccess(memory.error);

  return project;
}

export async function getActiveProject(context: WorkspaceContext) {
  if (context.mode === "demo") return demoProject;
  return ensureActiveProject(context.supabase, context.userId);
}

export async function completeOnboarding(context: WorkspaceContext, input: OnboardingInput) {
  if (context.mode === "demo") return createDemoOnboardingResult(input);

  const profile = await context.supabase.from("profiles").upsert({
    id: context.userId,
    career_goal: input.goal,
    weekly_hours: input.weeklyHours,
  });
  requireSuccess(profile.error);

  const deactivateExisting = await context.supabase
    .from("projects")
    .update({ is_active: false })
    .eq("user_id", context.userId)
    .eq("is_active", true);
  requireSuccess(deactivateExisting.error);

  const projectResult = await context.supabase
    .from("projects")
    .insert({
      user_id: context.userId,
      name: input.projectName,
      outcome: input.projectDescription,
      stack: input.stack,
      constraints: [input.blocker, `${input.weeklyHours} hours available this week`],
      is_active: true,
    })
    .select("id, name, outcome, stack, constraints")
    .single();
  requireSuccess(projectResult.error);

  const project = toActiveProject(activeProjectRowSchema.parse(projectResult.data));

  const memoryResult = await context.supabase.from("memory_items").insert([
    {
      user_id: context.userId,
      project_id: project.id,
      category: "profile",
      label: "Career goal",
      value: input.goal,
      provenance: "user",
      confidence: "high",
    },
    {
      user_id: context.userId,
      project_id: project.id,
      category: "project",
      label: "Current blocker",
      value: input.blocker,
      provenance: "user",
      confidence: "high",
    },
  ]);
  requireSuccess(memoryResult.error);

  return onboardingResultSchema.parse({
    project: { ...project, weeklyHours: input.weeklyHours },
  });
}

// Read the roadmap DAG for a project and derive each milestone's display state. Only
// missions with a sort_order belong to the roadmap (decision-generated missions have none).
async function readRoadmapMissions(supabase: SupabaseClient, userId: string, projectId: string): Promise<RoadmapMilestone[]> {
  const result = await supabase
    .from("build_missions")
    .select("id, title, objective, estimate_minutes, competency_id, status, depends_on, sort_order, kind")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .not("sort_order", "is", null)
    .order("sort_order", { ascending: true });
  requireSuccess(result.error);

  const rows = (result.data ?? []).map((row) => roadmapRowSchema.parse(row));
  const completed = new Set(rows.filter((row) => row.status === "completed").map((row) => row.id));
  const states = computeMilestoneStates(
    rows.map((row) => ({ key: row.id, dependsOn: row.depends_on ?? [] })),
    completed,
  );

  return rows
    .filter((row) => states[row.id])
    .map((row) =>
      roadmapMilestoneSchema.parse({
        id: row.id,
        state: states[row.id],
        title: row.title,
        detail: row.objective,
        estimateMinutes: row.estimate_minutes,
        competency: competencyLabelFor(row.competency_id, "Project practice"),
        dependsOn: row.depends_on ?? [],
        sortOrder: row.sort_order ?? 0,
        kind: row.kind ?? "milestone",
      }),
    );
}

// Generate a roadmap DAG and persist it, resolving slug dependencies to mission UUIDs.
// Non-completed roadmap missions are replaced; completed history is preserved.
async function persistRoadmapMissions(supabase: SupabaseClient, userId: string, project: ActiveProject, gap: SkillGapVector): Promise<void> {
  const milestones = await generateRoadmapWithProvider(project, gap);

  const cleared = await supabase
    .from("build_missions")
    .delete()
    .eq("user_id", userId)
    .eq("project_id", project.id)
    .not("sort_order", "is", null)
    .neq("status", "completed");
  requireSuccess(cleared.error);

  const slugToId = new Map<string, string>();
  let sortOrder = 0;
  for (const milestone of milestones) {
    const dependsOn = milestone.dependsOn
      .map((slug) => slugToId.get(slug))
      .filter((id): id is string => Boolean(id));
    const inserted = await supabase
      .from("build_missions")
      .insert({
        user_id: userId,
        project_id: project.id,
        competency_id: milestone.competencyId,
        title: milestone.title,
        objective: milestone.detail,
        acceptance_criteria: [],
        estimate_minutes: milestone.estimateMinutes,
        status: "not_started",
        depends_on: dependsOn,
        sort_order: sortOrder,
        kind: milestone.kind,
        metadata: { slug: milestone.slug, source: "diagnostic-roadmap" },
      })
      .select("id")
      .single();
    requireSuccess(inserted.error);
    slugToId.set(milestone.slug, z.object({ id: z.string().uuid() }).parse(inserted.data).id);
    sortOrder += 1;
  }
}

export async function getRoadmap(context: WorkspaceContext) {
  if (context.mode === "demo") return demoRoadmap;

  const project = await ensureActiveProject(context.supabase, context.userId);
  const existing = await readRoadmapMissions(context.supabase, context.userId, project.id);
  if (existing.length > 0) return existing;

  // No roadmap yet (diagnostic not taken): generate a neutral one so the workspace is populated.
  await persistRoadmapMissions(context.supabase, context.userId, project, neutralGapVector());
  return readRoadmapMissions(context.supabase, context.userId, project.id);
}

export async function getSkillGapVector(context: WorkspaceContext): Promise<SkillGapVector> {
  if (context.mode === "demo") return neutralGapVector();

  const project = await ensureActiveProject(context.supabase, context.userId);
  const run = await context.supabase
    .from("diagnostic_runs")
    .select("gap_vector")
    .eq("user_id", context.userId)
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  requireSuccess(run.error);

  const parsed = run.data ? skillGapVectorSchema.safeParse(run.data.gap_vector) : null;
  return parsed?.success ? parsed.data : neutralGapVector();
}

// Record a completed diagnostic: persist the gap vector, one skill_evidence row per
// competency, and regenerate the roadmap from the new vector.
export async function persistDiagnostic(context: WorkspaceContext, gap: SkillGapVector): Promise<DiagnosticResult> {
  if (context.mode === "demo") {
    const milestones = await generateRoadmapWithProvider(demoProject, gap);
    return diagnosticResultSchema.parse({ gapVector: gap, milestones: generatedToContract(milestones) });
  }

  const project = await ensureActiveProject(context.supabase, context.userId);

  const run = await context.supabase.from("diagnostic_runs").insert({
    user_id: context.userId,
    project_id: project.id,
    gap_vector: gap,
    question_bank_version: QUESTION_BANK_VERSION,
  });
  requireSuccess(run.error);

  const evidence = await context.supabase.from("skill_evidence").insert(
    gap.map((entry) => ({
      user_id: context.userId,
      project_id: project.id,
      competency_id: entry.competencyId,
      state: entry.state,
      source_type: "diagnostic",
      note: `Diagnostic score ${entry.score}/100`,
    })),
  );
  requireSuccess(evidence.error);

  await persistRoadmapMissions(context.supabase, context.userId, project, gap);
  const milestones = await readRoadmapMissions(context.supabase, context.userId, project.id);
  return diagnosticResultSchema.parse({ gapVector: gap, milestones });
}

export async function getMemoryItems(context: WorkspaceContext) {
  if (context.mode === "demo") return demoMemory;

  const project = await ensureActiveProject(context.supabase, context.userId);
  const result = await context.supabase
    .from("memory_items")
    .select("id, category, label, value, provenance")
    .eq("user_id", context.userId)
    .or(`project_id.eq.${project.id},project_id.is.null`)
    .eq("is_user_visible", true)
    .order("created_at", { ascending: true });
  requireSuccess(result.error);

  return (result.data ?? []).map((row) => memoryItemSchema.parse(memoryRowSchema.parse(row)));
}

export async function persistDecisionBrief(context: WorkspaceContext, brief: DecisionBrief, consensus?: ConsensusReport): Promise<DecisionBrief> {
  if (context.mode === "demo") return brief;

  const project = await ensureActiveProject(context.supabase, context.userId);
  const decision = await context.supabase
    .from("decisions")
    .insert({
      user_id: context.userId,
      project_id: project.id,
      question: brief.question,
      status: "ready",
      recommendation: brief.recommendation,
      summary: brief.summary,
      confidence: brief.confidence,
      confidence_reason: brief.confidenceReason,
      tradeoff: brief.tradeoff,
      counterfactual: brief.counterfactual,
      prompt_version: brief.promptVersion,
    })
    .select("id")
    .single();
  requireSuccess(decision.error);

  const decisionId = z.object({ id: z.string().uuid() }).parse(decision.data).id;
  const option = await context.supabase.from("decision_options").insert({
    decision_id: decisionId,
    label: brief.recommendation,
    rank: 1,
    rationale: brief.summary,
  });
  requireSuccess(option.error);

  const mission = await context.supabase
    .from("build_missions")
    .insert({
      user_id: context.userId,
      project_id: project.id,
      decision_id: decisionId,
      competency_id: competencyIdFor(brief.nextAction.competency),
      title: brief.nextAction.title,
      objective: brief.nextAction.objective,
      acceptance_criteria: brief.nextAction.acceptanceCriteria,
      estimate_minutes: brief.nextAction.estimateMinutes,
      status: "not_started",
    })
    .select("id")
    .single();
  requireSuccess(mission.error);

  const missionId = z.object({ id: z.string().uuid() }).parse(mission.data).id;
  const persistedBrief: DecisionBrief = {
    ...brief,
    nextAction: { ...brief.nextAction, id: missionId },
  };
  const update = await context.supabase
    .from("decisions")
    .update({ brief: persistedBrief, consensus: consensus ?? null })
    .eq("id", decisionId);
  requireSuccess(update.error);

  return persistedBrief;
}

export async function getLatestDecisionState(context: WorkspaceContext): Promise<DecisionState> {
  if (context.mode === "demo") {
    return decisionStateSchema.parse({ brief: seedDecisionBrief, missionStatus: "not_started" });
  }

  const project = await ensureActiveProject(context.supabase, context.userId);
  const result = await context.supabase
    .from("decisions")
    .select("brief, consensus")
    .eq("user_id", context.userId)
    .eq("project_id", project.id)
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  requireSuccess(result.error);

  if (!result.data) {
    const brief = await persistDecisionBrief(context, seedDecisionBrief);
    return decisionStateSchema.parse({ brief, missionStatus: "not_started" });
  }

  const decision = decisionRowSchema.parse(result.data);
  const brief = decisionStateSchema.shape.brief.parse(decision.brief);
  const consensus = decision.consensus ? consensusReportSchema.safeParse(decision.consensus) : null;
  const mission = await context.supabase
    .from("build_missions")
    .select("status")
    .eq("id", brief.nextAction.id)
    .eq("user_id", context.userId)
    .maybeSingle();
  requireSuccess(mission.error);

  return decisionStateSchema.parse({
    brief,
    missionStatus: missionStatusSchema.parse(mission.data?.status ?? "not_started"),
    consensus: consensus?.success ? consensus.data : undefined,
  });
}

// Record a graded coding-challenge submission, and on a pass add challenge-sourced
// skill evidence for the challenge's competency.
export async function persistChallengeSubmission(context: WorkspaceContext, challenge: Challenge, code: string, grade: ChallengeGrade): Promise<void> {
  if (context.mode === "demo") return;

  const project = await ensureActiveProject(context.supabase, context.userId);
  const competencyId = normalizeCompetencyId(challenge.competencyId);

  const submission = await context.supabase.from("challenge_submissions").insert({
    user_id: context.userId,
    project_id: project.id,
    challenge_id: challenge.id,
    competency_id: competencyId,
    code,
    score: grade.score,
    passed: grade.passed,
    grade,
  });
  requireSuccess(submission.error);

  if (grade.passed) {
    const evidence = await context.supabase.from("skill_evidence").insert({
      user_id: context.userId,
      project_id: project.id,
      competency_id: competencyId,
      state: grade.score >= 90 ? "validated" : "practicing",
      source_type: "challenge",
      source_id: challenge.id,
      note: `Coding challenge passed (${grade.score}/100)`,
    });
    requireSuccess(evidence.error);
  }
}

export async function completePersistentMission(context: WorkspaceContext, input: CompleteMissionInput) {
  if (context.mode === "demo") return completeMission(input);

  const missionResult = await context.supabase
    .from("build_missions")
    .select("id, project_id, competency_id, status, completed_at")
    .eq("id", input.missionId)
    .eq("user_id", context.userId)
    .maybeSingle();
  requireSuccess(missionResult.error);

  if (!missionResult.data) {
    throw new WorkspacePersistenceError();
  }

  const mission = missionRowSchema.parse(missionResult.data);
  const competency = competencyLabelFor(mission.competency_id, input.competency);
  const completedAt = mission.completed_at ?? new Date().toISOString();

  if (mission.status !== "completed") {
    const update = await context.supabase
      .from("build_missions")
      .update({ status: "completed", completed_at: completedAt })
      .eq("id", mission.id)
      .eq("user_id", context.userId);
    requireSuccess(update.error);

    const review = await context.supabase.from("mission_reviews").insert({
      mission_id: mission.id,
      user_id: context.userId,
      outcome_note: input.outcomeNote ?? null,
    });
    requireSuccess(review.error);

    if (mission.competency_id) {
      const evidence = await context.supabase.from("skill_evidence").insert({
        user_id: context.userId,
        project_id: mission.project_id,
        competency_id: mission.competency_id,
        state: "practicing",
        source_type: "mission",
        source_id: mission.id,
        note: input.outcomeNote ?? null,
        observed_at: completedAt,
      });
      requireSuccess(evidence.error);
    }

    const memory = await context.supabase.from("memory_items").insert({
      user_id: context.userId,
      project_id: mission.project_id,
      category: "learning",
      label: competency,
      value: "Practicing",
      provenance: "mission",
      confidence: "high",
    });
    requireSuccess(memory.error);
  }

  return missionCompletionSchema.parse({
    missionId: mission.id,
    status: "completed",
    completedAt,
    skillEvidence: { competency, state: "practicing", provenance: "mission" },
    roadmapUpdate: "Evaluation evidence recorded. Source-grounded answer traces are now the next recommended milestone.",
  });
}
