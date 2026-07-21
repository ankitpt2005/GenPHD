import { z } from "zod";
import { runChatCompletion, stripCodeFence } from "../ai/chat";
import { QUESTION_BANK, type DiagnosticAnswers } from "./questions";

const OPEN_MAX_POINTS = 20;

const gradesSchema = z.object({
  grades: z.array(z.object({ id: z.string(), score: z.coerce.number() })),
});

/**
 * Grade the diagnostic's open responses with the LLM provider chain, returning a map of
 * open-question id -> score (0..20). Returns {} when no answers were given or no provider
 * is configured; the deterministic scorer then applies partial credit instead.
 */
export async function gradeOpenResponses(answers: DiagnosticAnswers): Promise<Record<string, number>> {
  if (answers.skipped) return {};

  const items = QUESTION_BANK.map((group) => ({
    id: group.open.id,
    prompt: group.open.prompt,
    rubric: group.open.rubric,
    answer: (answers.open[group.open.id] ?? "").trim(),
  })).filter((item) => item.answer.length >= 12);

  if (items.length === 0) return {};

  const user = `Grade each short answer from a learner on a 0 to ${OPEN_MAX_POINTS} scale using its rubric. Reward correct, specific reasoning; do not reward fluff. Return only JSON: {"grades":[{"id":"...","score":0}]}.

${items
    .map((item) => `Question id: ${item.id}\nPrompt: ${item.prompt}\nRubric: ${item.rubric}\nLearner answer: ${item.answer}`)
    .join("\n\n")}`;

  const content = await runChatCompletion({
    system: "You are a precise grader. You return strictly valid JSON.",
    user,
    maxTokens: 700,
    temperature: 0,
  }).catch(() => null);

  if (!content) return {};

  try {
    const parsed = gradesSchema.parse(JSON.parse(stripCodeFence(content)));
    const grades: Record<string, number> = {};
    for (const grade of parsed.grades) {
      grades[grade.id] = Math.min(OPEN_MAX_POINTS, Math.max(0, Math.round(grade.score)));
    }
    return grades;
  } catch {
    return {};
  }
}
