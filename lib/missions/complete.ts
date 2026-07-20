import { z } from "zod";

export const completeMissionInputSchema = z.object({
  missionId: z.string().trim().min(1),
  competency: z.string().trim().min(1).max(120),
  outcomeNote: z.string().trim().max(1_000).optional(),
});

export const missionCompletionSchema = z.object({
  missionId: z.string(),
  status: z.literal("completed"),
  completedAt: z.string(),
  skillEvidence: z.object({
    competency: z.string(),
    state: z.literal("practicing"),
    provenance: z.literal("mission"),
  }),
  roadmapUpdate: z.string(),
});

export type CompleteMissionInput = z.infer<typeof completeMissionInputSchema>;

export function completeMission(input: CompleteMissionInput) {
  const completedAt = new Date().toISOString();
  return missionCompletionSchema.parse({
    missionId: input.missionId,
    status: "completed",
    completedAt,
    skillEvidence: {
      competency: input.competency,
      state: "practicing",
      provenance: "mission",
    },
    roadmapUpdate: "Evaluation evidence recorded. Source-grounded answer traces are now the next recommended milestone.",
  });
}
