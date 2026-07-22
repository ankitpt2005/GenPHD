import { z } from "zod";
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
export type ConsensusReport = z.infer<typeof consensusReportSchema>;
