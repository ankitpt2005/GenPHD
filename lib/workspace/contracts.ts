import { z } from "zod";
import { decisionBriefSchema } from "../decision/types";
import { consensusReportSchema } from "../consensus/types";

export const missionStatusSchema = z.enum(["not_started", "in_progress", "completed", "skipped"]);

export const activeProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  outcome: z.string(),
  stack: z.array(z.string()),
  weeklyHours: z.number().int().positive(),
  constraints: z.array(z.string()),
});

export const milestoneStateSchema = z.enum(["now", "next", "later", "locked"]);
export const milestoneKindSchema = z.enum(["milestone", "capstone"]);

export const roadmapMilestoneSchema = z.object({
  id: z.string(),
  state: milestoneStateSchema,
  title: z.string(),
  detail: z.string(),
  estimateMinutes: z.number().int().positive(),
  competency: z.string(),
  dependsOn: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  kind: milestoneKindSchema.default("milestone"),
});

export const skillStateSchema = z.enum(["emerging", "practicing", "validated"]);

export const competencyScoreSchema = z.object({
  competencyId: z.string(),
  label: z.string(),
  score: z.number().min(0).max(100),
  state: skillStateSchema,
});

// The skill-gap vector: one score/state per canonical competency, weakest first is
// the caller's concern — the array preserves the natural prerequisite order.
export const skillGapVectorSchema = z.array(competencyScoreSchema).min(1);

export const memoryItemSchema = z.object({
  id: z.string(),
  scope: z.enum(["project", "learning", "decision", "profile"]),
  label: z.string(),
  value: z.string(),
  provenance: z.string(),
});

export const decisionStateSchema = z.object({
  brief: decisionBriefSchema,
  missionStatus: missionStatusSchema,
  consensus: consensusReportSchema.optional(),
});

export type ActiveProject = z.infer<typeof activeProjectSchema>;
export type RoadmapMilestone = z.infer<typeof roadmapMilestoneSchema>;
export type MemoryItem = z.infer<typeof memoryItemSchema>;
export type DecisionState = z.infer<typeof decisionStateSchema>;
export type MilestoneState = z.infer<typeof milestoneStateSchema>;
export type MilestoneKind = z.infer<typeof milestoneKindSchema>;
export type SkillState = z.infer<typeof skillStateSchema>;
export type CompetencyScore = z.infer<typeof competencyScoreSchema>;
export type SkillGapVector = z.infer<typeof skillGapVectorSchema>;
