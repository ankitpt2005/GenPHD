<<<<<<< HEAD
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
=======
import { z } from "zod";
import { runChatCompletion, stripCodeFence } from "../ai/chat";
import { challengeGradeSchema, type Challenge, type ChallengeGrade } from "./types";

const modelGradeSchema = z.object({
  score: z.coerce.number().min(0).max(100),
  passed: z.boolean().optional(),
  criteria: z
    .array(z.object({ criterion: z.string(), met: z.boolean(), note: z.string().default("") }))
    .default([]),
  feedback: z.string().default(""),
});

// --- Submission analysis: figure out what the learner actually wrote ---------------

function stripComments(code: string) {
  return code
    .split("\n")
    .map((line) => line.replace(/#.*$/, ""))
    .join("\n");
}

function meaningfulLines(code: string): string[] {
  return stripComments(code)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const STUB_LINES = new Set(["...", "pass", "return", "return none", "raise notimplementederror"]);

// Lines the learner added beyond the starter, excluding comments and stub placeholders.
function addedImplementation(code: string, starter: string): string[] {
  const starterLines = new Set(meaningfulLines(starter).map((line) => line.toLowerCase()));
  return meaningfulLines(code).filter((line) => {
    const normalized = line.toLowerCase();
    return !starterLines.has(normalized) && !STUB_LINES.has(normalized);
  });
}

type SubmissionAnalysis = {
  added: string[];
  addedText: string;
  addedChars: number;
  hasEllipsis: boolean;
  unimplemented: boolean;
};

function analyzeSubmission(code: string, starter: string): SubmissionAnalysis {
  const added = addedImplementation(code, starter);
  const addedText = added.join("\n");
  const addedChars = addedText.replace(/\s/g, "").length;
  // A bare `...` placeholder body left in the submission signals an unfinished stub.
  const hasEllipsis = /(^|\n)\s*\.\.\.\s*(\n|$)/.test(code);
  const unimplemented = addedChars < 20 || added.length === 0;
  return { added, addedText, addedChars, hasEllipsis, unimplemented };
}

// --- Grades -----------------------------------------------------------------------

function stubGrade(challenge: Challenge, reason: string): ChallengeGrade {
  return challengeGradeSchema.parse({
    score: 0,
    passed: false,
    criteria: challenge.criteria.map((criterion) => ({ criterion, met: false, note: "No implementation detected." })),
    feedback: reason,
    gradedBy: "heuristic",
  });
}

function heuristicGrade(challenge: Challenge, analysis: SubmissionAnalysis): ChallengeGrade {
  const haystack = analysis.addedText.toLowerCase();
  const signals = challenge.signals.length ? challenge.signals : challenge.criteria;
  const matched = signals.filter((signal) => haystack.includes(signal.toLowerCase())).length;
  let score = signals.length ? Math.round((matched / signals.length) * 100) : analysis.addedChars > 60 ? 70 : 0;
  // A leftover `...` placeholder means the body is unfinished — cap the score.
  if (analysis.hasEllipsis) score = Math.min(score, 40);

  const passed = score >= 70 && !analysis.hasEllipsis;
  const metCount = Math.round(challenge.criteria.length * (matched / Math.max(signals.length, 1)));

  return challengeGradeSchema.parse({
>>>>>>> aed97a4 (feat: add coding challenges)
    score,
    passed,
    criteria: challenge.criteria.map((criterion, index) => ({
      criterion,
<<<<<<< HEAD
      met: Boolean(matches[index]),
      note: matches[index] ? "Expected implementation signal found." : "Not clearly present in this submission.",
    })),
    feedback: passed
      ? "The required implementation signals are present. Complete the build mission when you have tested this pattern in your own project."
      : "This offline check found missing implementation signals. Add working code for each requirement, then submit again.",
    gradedBy: "heuristic",
  };
=======
      met: passed ? index < metCount : index < metCount && !analysis.hasEllipsis,
      note: index < metCount ? "Expected building blocks detected in your code." : "Not clearly implemented in your submission.",
    })),
    feedback: `Offline heuristic: matched ${matched} of ${signals.length} expected building blocks in the code you wrote${analysis.hasEllipsis ? ", but the body still contains an unfinished `...` placeholder" : ""}. Add an AI provider key for correctness-aware grading.`,
    gradedBy: "heuristic",
  });
}

function buildPrompt(challenge: Challenge, code: string) {
  const criteria = challenge.criteria.map((criterion, index) => `${index + 1}. ${criterion}`).join("\n");
  return `You are grading a coding submission for an AI-engineering learning challenge. Be rigorous and skeptical.

Challenge: ${challenge.title}
Language: ${challenge.language} · Framework: ${challenge.framework}
Task: ${challenge.scenario}

Criteria:
${criteria}

Starter code the learner began from (do NOT give any credit for code that is unchanged from this):
\`\`\`
${challenge.starterCode}
\`\`\`

Submitted code:
\`\`\`
${code}
\`\`\`

Grade ONLY the learner's actual implementation. Fail the submission (low score, passed=false) if it is unchanged from the starter, is a stub, contains \`...\`/\`pass\` placeholder bodies, or is pseudo-code that would not run. A criterion is "met" only if working code satisfies it.

Return ONLY JSON: {"score": integer 0-100, "passed": boolean, "criteria": [{"criterion": string, "met": boolean, "note": one short sentence}], "feedback": 2-3 sentences of specific, constructive feedback}.`;
}

/**
 * Grade a code submission against a challenge's criteria. First rejects unchanged-starter
 * and stub submissions outright, then uses the LLM grader when configured, falling back to
 * a deterministic heuristic that only credits code the learner actually added.
 */
export async function gradeChallenge(challenge: Challenge, code: string): Promise<ChallengeGrade> {
  const analysis = analyzeSubmission(code, challenge.starterCode);

  // Hard gate: nothing meaningful was written beyond the starter.
  if (analysis.unimplemented) {
    return stubGrade(challenge, "This looks like the unchanged starter (or an empty stub). Implement the function, then submit again.");
  }

  const content = await runChatCompletion({
    system: "You are a precise, skeptical code grader. You return strictly valid JSON.",
    user: buildPrompt(challenge, code),
    maxTokens: 900,
    temperature: 0,
  }).catch(() => null);

  if (content) {
    try {
      const parsed = modelGradeSchema.parse(JSON.parse(stripCodeFence(content)));
      const score = Math.round(parsed.score);
      return challengeGradeSchema.parse({
        score,
        passed: parsed.passed ?? score >= 70,
        criteria: parsed.criteria.length
          ? parsed.criteria
          : challenge.criteria.map((criterion) => ({ criterion, met: score >= 70, note: "" })),
        feedback: parsed.feedback || "Graded against the challenge criteria.",
        gradedBy: "ai",
      });
    } catch {
      // fall through to heuristic
    }
  }

  return heuristicGrade(challenge, analysis);
>>>>>>> aed97a4 (feat: add coding challenges)
}
