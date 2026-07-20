import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { seedDecisionBrief } from "../decision/brief";
import type { DecisionBrief } from "../decision/types";
import { completeMission, missionCompletionSchema, type CompleteMissionInput } from "../missions/complete";
import type { WorkspaceContext } from "./context";
import {
  activeProjectSchema,
  decisionStateSchema,
  memoryItemSchema,
  missionStatusSchema,
  roadmapMilestoneSchema,
  type ActiveProject,
  type DecisionState,
  type MemoryItem,
  type RoadmapMilestone,
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

const demoRoadmap: RoadmapMilestone[] = [
  {
    id: "evaluate",
    state: "now",
    title: "Evaluate the retrieval pipeline",
    detail: "Create five realistic evaluation questions and inspect retrieved chunks.",
    estimateMinutes: 45,
    competency: "RAG evaluation",
  },
  {
    id: "trace",
    state: "next",
    title: "Add source-grounded answer traces",
    detail: "Make every answer explain the chunks it used and where it is uncertain.",
    estimateMinutes: 90,
    competency: "Grounded generation",
  },
  {
    id: "orchestrate",
    state: "later",
    title: "Introduce workflow state only if needed",
    detail: "Reconsider orchestration once the project gains branching tools or approval steps.",
    estimateMinutes: 120,
    competency: "Agentic workflows",
  },
];

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

function competencyIdFor(label: string) {
  const normalized = label.toLowerCase();
  if (normalized === "rag evaluation") return "rag-evaluation";
  if (normalized === "ai evaluation") return "ai-evaluation";
  if (normalized === "agentic workflows") return "agentic-workflows";
  if (normalized === "ai system design") return "ai-system-design";
  return "retrieval";
}

function competencyLabelFor(id: string | null, fallback: string) {
  const labels: Record<string, string> = {
    "rag-evaluation": "RAG evaluation",
    "ai-evaluation": "AI evaluation",
    "agentic-workflows": "Agentic workflows",
    "ai-system-design": "AI system design",
    retrieval: "Retrieval",
  };
  return id ? (labels[id] ?? fallback) : fallback;
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

export async function getRoadmap(context: WorkspaceContext) {
  if (context.mode === "demo") return demoRoadmap;

  const project = await ensureActiveProject(context.supabase, context.userId);
  const result = await context.supabase
    .from("build_missions")
    .select("id, title, objective, estimate_minutes, competency_id, status")
    .eq("user_id", context.userId)
    .eq("project_id", project.id)
    .neq("status", "completed")
    .order("created_at", { ascending: true })
    .limit(3);
  requireSuccess(result.error);

  return (result.data ?? []).map((row, index) => {
    const mission = roadmapRowSchema.parse(row);
    return roadmapMilestoneSchema.parse({
      id: mission.id,
      state: index === 0 ? "now" : index === 1 ? "next" : "later",
      title: mission.title,
      detail: mission.objective,
      estimateMinutes: mission.estimate_minutes,
      competency: competencyLabelFor(mission.competency_id, "Project practice"),
    });
  });
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

export async function persistDecisionBrief(context: WorkspaceContext, brief: DecisionBrief): Promise<DecisionBrief> {
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
  const update = await context.supabase.from("decisions").update({ brief: persistedBrief }).eq("id", decisionId);
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
    .select("brief")
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
  });
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
