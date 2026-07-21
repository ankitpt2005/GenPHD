import { describe, expect, it } from "vitest";
import { diagnosticQuestions, gradeDiagnostic } from "../../lib/diagnostic/baseline";

describe("diagnostic baseline", () => {
  it("identifies correct and missing foundations deterministically", () => {
    const answers: Record<string, number> = Object.fromEntries(diagnosticQuestions.map((question) => [question.id, question.correct]));
    answers.retrieval = 0;
    const result = gradeDiagnostic(answers);
    expect(result.scores.find((entry) => entry.id === "retrieval")).toMatchObject({ score: 25, state: "emerging" });
    expect(result.summary).toContain("Retrieval");
  });
});
