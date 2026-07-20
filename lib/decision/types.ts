import { z } from "zod";

export const confidenceSchema = z.enum(["high", "medium-high", "medium", "low", "insufficient-evidence"]);

export const createDecisionInputSchema = z.object({
  question: z.string().trim().min(12, "Ask a complete decision question.").max(800),
  projectId: z.string().trim().min(1).default("docuquery"),
  constraints: z.array(z.string().trim().min(1).max(120)).max(8).optional(),
});

export const sourceEvidenceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  detail: z.string(),
  tier: z.enum(["Official documentation", "Project context", "Practice guide"]),
  isExternal: z.boolean(),
  publishedAt: z.string(),
});

export const conflictSchema = z.object({
  title: z.string(),
  detail: z.string(),
  kind: z.enum(["tradeoff", "missing-context", "version-risk"]),
});

export const missionSchema = z.object({
  id: z.string(),
  title: z.string(),
  objective: z.string(),
  estimateMinutes: z.number().int().positive(),
  acceptanceCriteria: z.array(z.string()).min(1),
  competency: z.string(),
});

export const decisionBriefSchema = z.object({
  id: z.string(),
  question: z.string(),
  status: z.literal("ready"),
  recommendation: z.string(),
  summary: z.string(),
  confidence: confidenceSchema,
  confidenceReason: z.string(),
  tradeoff: z.string(),
  counterfactual: z.string(),
  evidence: z.array(sourceEvidenceSchema).min(1),
  conflicts: z.array(conflictSchema),
  nextAction: missionSchema,
  createdAt: z.string(),
  promptVersion: z.string(),
});

export type CreateDecisionInput = z.infer<typeof createDecisionInputSchema>;
export type SourceEvidence = z.infer<typeof sourceEvidenceSchema>;
export type DecisionBrief = z.infer<typeof decisionBriefSchema>;
