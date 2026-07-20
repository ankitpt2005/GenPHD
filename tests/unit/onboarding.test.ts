import { describe, expect, it } from "vitest";
import { createDemoOnboardingResult, createInitialRoadmap, onboardingInputSchema } from "../../lib/workspace/onboarding";

const input = {
  goal: "Build a credible AI engineering portfolio project",
  projectName: "DocuQuery",
  projectDescription: "A source-grounded document assistant that makes retrieval quality visible.",
  stack: ["Python", "FastAPI", "pgvector"],
  weeklyHours: 6,
  blocker: "Deciding which evaluation work proves that retrieval is reliable enough to ship.",
};

describe("onboarding", () => {
  it("validates the smallest context needed for a first roadmap", () => {
    expect(onboardingInputSchema.safeParse(input).success).toBe(true);
    expect(onboardingInputSchema.safeParse({ ...input, stack: [] }).success).toBe(false);
    expect(onboardingInputSchema.safeParse({ ...input, weeklyHours: 0 }).success).toBe(false);
  });

  it("creates an ordered, project-specific demo roadmap", () => {
    const milestones = createInitialRoadmap(input);
    const result = createDemoOnboardingResult(input);

    expect(milestones.map((milestone) => milestone.state)).toEqual(["now", "next", "later"]);
    expect(milestones).toHaveLength(3);
    expect(result.project).toMatchObject({ name: "DocuQuery", weeklyHours: 6 });
    expect(result.milestones[0]?.title).toContain("DocuQuery");
  });
});
