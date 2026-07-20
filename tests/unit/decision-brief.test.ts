import { describe, expect, it } from "vitest";
import { createDecisionBrief } from "../../lib/decision/brief";
import { createDecisionInputSchema } from "../../lib/decision/types";

describe("createDecisionBrief", () => {
  it("recommends a simple workflow when orchestration is premature", () => {
    const brief = createDecisionBrief({
      question: "Should I use LangGraph for this two-day RAG project?",
      projectId: "docuquery",
      constraints: ["two-day deadline", "Python", "one retrieval flow"],
    });

    expect(brief.status).toBe("ready");
    expect(brief.recommendation).toBe("Use a simple workflow for version one.");
    expect(brief.nextAction).toMatchObject({
      id: "mission-rag-evaluation",
      competency: "RAG evaluation",
      estimateMinutes: 45,
    });
    expect(brief.evidence.map((source) => source.tier)).toEqual([
      "Official documentation",
      "Project context",
      "Practice guide",
    ]);
  });

  it("creates a focused evaluation mission for evaluation questions", () => {
    const brief = createDecisionBrief({
      question: "How should I evaluate RAG answer quality before launch?",
      projectId: "docuquery",
    });

    expect(brief.recommendation).toContain("small evaluation set");
    expect(brief.nextAction).toMatchObject({
      id: "mission-evaluation-baseline",
      competency: "AI evaluation",
    });
    expect(brief.conflicts[0]?.kind).toBe("tradeoff");
  });

  it("uses supplied constraints for questions without a specialized rule", () => {
    const brief = createDecisionBrief({
      question: "Which experiment should I run before expanding the product scope?",
      projectId: "docuquery",
      constraints: ["six hours available", "single developer"],
    });

    expect(brief.recommendation).toContain("smallest implementation");
    expect(brief.summary).toContain("six hours available, single developer");
    expect(brief.conflicts[0]?.kind).toBe("missing-context");
  });
});

describe("createDecisionInputSchema", () => {
  it("applies the default project id and rejects incomplete questions", () => {
    const parsed = createDecisionInputSchema.parse({
      question: "Should I create a test suite before I ship this app?",
    });

    expect(parsed.projectId).toBe("docuquery");
    expect(createDecisionInputSchema.safeParse({ question: "Too short" }).success).toBe(false);
  });
});
