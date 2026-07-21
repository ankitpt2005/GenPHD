import { z } from "zod";
import { activeProjectSchema, roadmapMilestoneSchema, skillGapVectorSchema } from "./contracts";

export const onboardingInputSchema = z.object({
  goal: z.string().trim().min(3, "Tell us what you want to achieve.").max(160),
  projectName: z.string().trim().min(2, "Name the active project.").max(100),
  projectDescription: z.string().trim().min(12, "Describe the project outcome.").max(500),
  stack: z.array(z.string().trim().min(1).max(40)).min(1, "Add at least one technology.").max(8),
  weeklyHours: z.coerce.number().int().min(1).max(80),
  blocker: z.string().trim().min(8, "Name the current blocker.").max(800),
});

// Onboarding only establishes the project context now; the roadmap is generated after
// the diagnostic produces a skill-gap vector (see persistDiagnostic).
export const onboardingResultSchema = z.object({
  project: activeProjectSchema,
});

// Result of a completed (or skipped) diagnostic: the gap vector plus the roadmap it drove.
export const diagnosticResultSchema = z.object({
  gapVector: skillGapVectorSchema,
  milestones: z.array(roadmapMilestoneSchema),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;
export type OnboardingResult = z.infer<typeof onboardingResultSchema>;
export type DiagnosticResult = z.infer<typeof diagnosticResultSchema>;

export function createDemoOnboardingResult(input: OnboardingInput): OnboardingResult {
  return onboardingResultSchema.parse({
    project: {
      id: "demo-active-project",
      name: input.projectName,
      outcome: input.projectDescription,
      stack: input.stack,
      weeklyHours: input.weeklyHours,
      constraints: [input.blocker, `${input.weeklyHours} hours available this week`],
    },
  });
}
