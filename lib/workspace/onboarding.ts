import { z } from "zod";
import { activeProjectSchema, roadmapMilestoneSchema } from "./contracts";

export const onboardingInputSchema = z.object({
  goal: z.string().trim().min(3, "Tell us what you want to achieve.").max(160),
  projectName: z.string().trim().min(2, "Name the active project.").max(100),
  projectDescription: z.string().trim().min(12, "Describe the project outcome.").max(500),
  stack: z.array(z.string().trim().min(1).max(40)).min(1, "Add at least one technology.").max(8),
  weeklyHours: z.coerce.number().int().min(1).max(80),
  blocker: z.string().trim().min(8, "Name the current blocker.").max(800),
});

export const onboardingResultSchema = z.object({
  project: activeProjectSchema,
  milestones: z.array(roadmapMilestoneSchema).length(3),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;
export type OnboardingResult = z.infer<typeof onboardingResultSchema>;

export function createInitialRoadmap(input: OnboardingInput) {
  const focus = input.projectName.trim();

  return [
    {
      id: "evaluate",
      state: "now" as const,
      title: `Define the first evaluation for ${focus}`,
      detail: `Turn the current blocker into five observable checks before expanding the implementation.`,
      estimateMinutes: 45,
      competency: "AI evaluation",
    },
    {
      id: "trace",
      state: "next" as const,
      title: "Make the project outcome traceable",
      detail: "Capture the evidence, assumptions, and limits behind each meaningful project result.",
      estimateMinutes: 90,
      competency: "Retrieval",
    },
    {
      id: "review",
      state: "later" as const,
      title: "Review the workflow only after evidence exists",
      detail: "Revisit framework complexity when the current evaluation exposes a repeated delivery constraint.",
      estimateMinutes: 60,
      competency: "AI system design",
    },
  ];
}

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
    milestones: createInitialRoadmap(input),
  });
}
