import { COMPETENCIES, competencyLabel, type CompetencyId } from "../competencies";
import type { CompetencyScore, SkillGapVector, SkillState } from "../workspace/contracts";
import { QUESTION_BANK, type DiagnosticAnswers } from "./questions";

// Score weights per item. Ceiling behaviour is implicit: the applied MCQ is worth more
// than the foundational one, so a learner only reaches a high score by clearing the ladder.
const FOUNDATIONAL_POINTS = 45;
const APPLIED_POINTS = 35;
const OPEN_MAX_POINTS = 20;
// Partial credit for a non-empty open answer when no LLM grade is available.
const OPEN_UNGRADED_POINTS = 10;
// Score assigned to every competency when the learner skips the diagnostic.
const NEUTRAL_SCORE = 50;

export function scoreToState(score: number): SkillState {
  if (score < 40) return "emerging";
  if (score <= 75) return "practicing";
  return "validated";
}

/**
 * Grade a submitted diagnostic into a skill-gap vector.
 *
 * @param answers  Submitted MCQ selections and open responses.
 * @param openScores Optional per-open-question scores (0..OPEN_MAX_POINTS) from an LLM grader,
 *                   keyed by open-question id. When absent, non-empty answers get partial credit.
 */
export function gradeDiagnostic(answers: DiagnosticAnswers, openScores?: Record<string, number>): SkillGapVector {
  if (answers.skipped) {
    return neutralGapVector();
  }

  const vector: CompetencyScore[] = COMPETENCIES.map((competency) => {
    const group = QUESTION_BANK.find((entry) => entry.competencyId === competency.id);
    let score = 0;

    for (const question of group?.mcq ?? []) {
      const chosen = answers.mcq[question.id];
      if (chosen && chosen === question.correctOptionId) {
        score += question.difficulty === "applied" ? APPLIED_POINTS : FOUNDATIONAL_POINTS;
      }
    }

    if (group) {
      const openId = group.open.id;
      const graded = openScores?.[openId];
      if (typeof graded === "number") {
        score += clamp(graded, 0, OPEN_MAX_POINTS);
      } else if ((answers.open[openId] ?? "").trim().length >= 12) {
        score += OPEN_UNGRADED_POINTS;
      }
    }

    const bounded = clamp(Math.round(score), 0, 100);
    return {
      competencyId: competency.id,
      label: competency.label,
      score: bounded,
      state: scoreToState(bounded),
    };
  });

  return vector;
}

// A balanced default used when the diagnostic is skipped: every competency counts as a
// mild gap, so the roadmap generator still produces a full, prerequisite-ordered plan.
export function neutralGapVector(): SkillGapVector {
  return COMPETENCIES.map((competency) => ({
    competencyId: competency.id,
    label: competency.label,
    score: NEUTRAL_SCORE,
    state: scoreToState(NEUTRAL_SCORE),
  }));
}

// Rebuild a vector from persisted skill_evidence states (which carry no numeric score),
// mapping each state back to a representative score for display and roadmap regeneration.
const STATE_SCORE: Record<SkillState, number> = { emerging: 20, practicing: 60, validated: 90 };

export function gapVectorFromStates(states: Partial<Record<CompetencyId, SkillState>>): SkillGapVector {
  return COMPETENCIES.map((competency) => {
    const state = states[competency.id] ?? "practicing";
    return {
      competencyId: competency.id,
      label: competencyLabel(competency.id),
      score: STATE_SCORE[state],
      state,
    };
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
