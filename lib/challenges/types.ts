import { z } from "zod";

export const challengeDifficultySchema = z.enum(["starter", "core", "stretch"]);

// Full challenge, including the server-only `signals` used by the heuristic fallback grader.
export const challengeSchema = z.object({
  id: z.string(),
  competencyId: z.string(),
  title: z.string(),
  scenario: z.string(),
  language: z.string(),
  framework: z.string(),
  starterCode: z.string(),
  criteria: z.array(z.string()).min(1),
  difficulty: challengeDifficultySchema,
  // Keywords a correct solution is expected to contain; never sent to the client.
  signals: z.array(z.string()).default([]),
});

// Client-safe view (no grading signals).
export const publicChallengeSchema = challengeSchema.omit({ signals: true });

export const criterionResultSchema = z.object({
  criterion: z.string(),
  met: z.boolean(),
  note: z.string(),
});

export const challengeGradeSchema = z.object({
  score: z.number().int().min(0).max(100),
  passed: z.boolean(),
  criteria: z.array(criterionResultSchema),
  feedback: z.string(),
  gradedBy: z.enum(["ai", "heuristic"]),
});

export const gradeInputSchema = z.object({
  challengeId: z.string().trim().min(1),
  code: z.string().trim().min(1).max(20_000),
});

export type Challenge = z.infer<typeof challengeSchema>;
export type PublicChallenge = z.infer<typeof publicChallengeSchema>;
export type ChallengeGrade = z.infer<typeof challengeGradeSchema>;
export type CriterionResult = z.infer<typeof criterionResultSchema>;
