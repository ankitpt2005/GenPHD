import type { Challenge, ChallengeGrade } from "./types";

function cleanCode(code: string) {
  return code.replace(/#.*$/gm, "").toLowerCase();
}

// This grader deliberately never executes learner-provided code. It provides an
// offline readiness check; completing the surrounding Build Mission records evidence.
export function gradeChallenge(challenge: Challenge, code: string): ChallengeGrade {
  const normalized = cleanCode(code);
  const addedCode = code.replace(challenge.starterCode, "").trim();
  const hasImplementation = addedCode.length > 20 && !/^(?:\.\.\.|pass)$/m.test(addedCode);
  const matches = challenge.signals.map((signal) => normalized.includes(signal));
  const metCount = matches.filter(Boolean).length;
  const score = hasImplementation ? Math.round((metCount / challenge.signals.length) * 100) : 0;
  const passed = hasImplementation && score >= 67 && !/^(?:\.\.\.|pass)$/m.test(addedCode);

  return {
    score,
    passed,
    criteria: challenge.criteria.map((criterion, index) => ({
      criterion,
      met: Boolean(matches[index]),
      note: matches[index] ? "Expected implementation signal found." : "Not clearly present in this submission.",
    })),
    feedback: passed
      ? "The required implementation signals are present. Complete the build mission when you have tested this pattern in your own project."
      : "This offline check found missing implementation signals. Add working code for each requirement, then submit again.",
    gradedBy: "heuristic",
  };
}
