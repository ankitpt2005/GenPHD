import { describe, expect, it } from "vitest";
import { COMPETENCY_IDS } from "../../lib/competencies";
import { QUESTION_BANK, diagnosticAnswersSchema } from "../../lib/diagnostic/questions";
import { gradeDiagnostic, neutralGapVector, scoreToState } from "../../lib/diagnostic/scoring";

function answersFor(getOption: (group: (typeof QUESTION_BANK)[number]) => Record<string, string>) {
  const mcq: Record<string, string> = {};
  for (const group of QUESTION_BANK) Object.assign(mcq, getOption(group));
  return diagnosticAnswersSchema.parse({ mcq, open: {} });
}

describe("diagnostic scoring", () => {
  it("maps scores to states at the documented thresholds", () => {
    expect(scoreToState(0)).toBe("emerging");
    expect(scoreToState(39)).toBe("emerging");
    expect(scoreToState(40)).toBe("practicing");
    expect(scoreToState(75)).toBe("practicing");
    expect(scoreToState(76)).toBe("validated");
  });

  it("covers every competency exactly once", () => {
    const vector = neutralGapVector();
    expect(vector.map((entry) => entry.competencyId).sort()).toEqual([...COMPETENCY_IDS].sort());
  });

  it("returns a neutral vector when skipped", () => {
    const vector = gradeDiagnostic(diagnosticAnswersSchema.parse({ skipped: true }));
    expect(vector.every((entry) => entry.state === "practicing")).toBe(true);
  });

  it("scores all-wrong as emerging and all-correct as validated", () => {
    const allWrong = answersFor((group) =>
      Object.fromEntries(
        group.mcq.map((question) => {
          const wrong = question.options.find((option) => option.id !== question.correctOptionId);
          return [question.id, wrong?.id ?? question.options[0].id];
        }),
      ),
    );
    const allRight = answersFor((group) =>
      Object.fromEntries(group.mcq.map((question) => [question.id, question.correctOptionId])),
    );

    for (const entry of gradeDiagnostic(allWrong)) expect(entry.state).toBe("emerging");
    // Both MCQs correct = 80 points -> validated, even before any open-response credit.
    for (const entry of gradeDiagnostic(allRight)) expect(entry.state).toBe("validated");
  });

  it("applies LLM open-response scores on top of MCQ credit", () => {
    const foundationalOnly = answersFor((group) => ({ [group.mcq[0].id]: group.mcq[0].correctOptionId }));
    const openScores = Object.fromEntries(QUESTION_BANK.map((group) => [group.open.id, 20]));
    const graded = gradeDiagnostic(foundationalOnly, openScores);
    // 45 (foundational) + 20 (open) = 65 -> practicing, not yet validated.
    expect(graded.every((entry) => entry.score === 65 && entry.state === "practicing")).toBe(true);
  });
});
