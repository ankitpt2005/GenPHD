import { z } from "zod";
<<<<<<< HEAD
import { confidenceSchema, decisionBriefSchema } from "../decision/types";

export const consensusReportSchema = z.object({
  mode: z.enum(["multi", "single", "deterministic"]),
  brief: decisionBriefSchema,
  models: z.array(z.object({ provider: z.string(), recommendation: z.string(), summary: z.string() })).min(1).max(3),
  agreements: z.array(z.string()).max(3),
  conflicts: z.array(z.string()).max(3),
  confidence: confidenceSchema,
});

=======
import { confidenceSchema } from "../decision/types";

// One model's answer in the consensus panel.
export const modelAnswerSchema = z.object({
  model: z.string(),
  label: z.string(),
  headline: z.string(),
  detail: z.string(),
});

export const consensusConflictSchema = z.object({
  topic: z.string(),
  detail: z.string(),
  models: z.array(z.string()).default([]),
});

// The full multi-model consensus report shown on the Decisions view and remembered per project.
export const consensusReportSchema = z.object({
  id: z.string(),
  question: z.string(),
  models: z.array(modelAnswerSchema),
  agreements: z.array(z.string()),
  conflicts: z.array(consensusConflictSchema),
  recommendation: z.string(),
  confidence: confidenceSchema,
  nextStep: z.string(),
  createdAt: z.string(),
  mode: z.enum(["multi-model", "single-model", "deterministic"]),
});

export type ModelAnswer = z.infer<typeof modelAnswerSchema>;
export type ConsensusConflict = z.infer<typeof consensusConflictSchema>;
>>>>>>> a0a457e (feat: add diagnostic, roadmap DAG, and multi-model consensus)
export type ConsensusReport = z.infer<typeof consensusReportSchema>;
