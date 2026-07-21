import { z } from "zod";

export const challengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  scenario: z.string(),
  language: z.string(),
  framework: z.string(),
  starterCode: z.string(),
  criteria: z.array(z.string()).min(1),
  signals: z.array(z.string()).min(1),
});

export const publicChallengeSchema = challengeSchema.omit({ signals: true });

export const challengeGradeSchema = z.object({
  score: z.number().int().min(0).max(100),
  passed: z.boolean(),
  criteria: z.array(z.object({ criterion: z.string(), met: z.boolean(), note: z.string() })),
  feedback: z.string(),
  gradedBy: z.literal("heuristic"),
});

export const gradeInputSchema = z.object({
  challengeId: z.string().trim().min(1),
  code: z.string().trim().min(1).max(20_000),
});

export type Challenge = z.infer<typeof challengeSchema>;
export type PublicChallenge = z.infer<typeof publicChallengeSchema>;
export type ChallengeGrade = z.infer<typeof challengeGradeSchema>;
