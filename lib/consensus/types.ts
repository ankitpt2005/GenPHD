import { z } from "zod";
import { confidenceSchema, decisionBriefSchema } from "../decision/types";

export const consensusReportSchema = z.object({
  mode: z.enum(["multi", "single", "deterministic"]),
  brief: decisionBriefSchema,
  models: z.array(z.object({ provider: z.string(), recommendation: z.string(), summary: z.string() })).min(1).max(3),
  agreements: z.array(z.string()).max(3),
  conflicts: z.array(z.string()).max(3),
  confidence: confidenceSchema,
});

export type ConsensusReport = z.infer<typeof consensusReportSchema>;
