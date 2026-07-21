import { z } from "zod";
import { hasOpenRouter, runChatCompletion, runOpenRouterModel, stripCodeFence } from "../ai/chat";
import type { DecisionBrief, CreateDecisionInput } from "../decision/types";
import { consensusReportSchema, type ConsensusReport, type ModelAnswer } from "./types";

// Default trio for the fan-out; override with GENPHD_CONSENSUS_MODELS (comma-separated
// OpenRouter model ids). These are the three answers judges expect us to reconcile.
function consensusModels(): { id: string; label: string }[] {
  const raw = process.env.GENPHD_CONSENSUS_MODELS?.trim();
  const ids = raw
    ? raw.split(",").map((value) => value.trim()).filter(Boolean)
    : ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-pro-1.5"];
  return ids.map((id) => ({ id, label: labelFor(id) }));
}

function labelFor(id: string) {
  const value = id.toLowerCase();
  if (value.includes("gpt") || value.includes("openai") || value.includes("o1")) return "GPT";
  if (value.includes("claude") || value.includes("anthropic")) return "Claude";
  if (value.includes("gemini") || value.includes("google")) return "Gemini";
  if (value.includes("llama") || value.includes("groq")) return "Llama";
  if (value.includes("mistral") || value.includes("mixtral")) return "Mistral";
  return id.split("/").pop() ?? id;
}

const modelReplySchema = z.object({
  headline: z.string().trim().min(3).max(160),
  detail: z.string().trim().min(8).max(700),
});

const analysisSchema = z.object({
  agreements: z.array(z.string().trim().min(3).max(240)).max(6).default([]),
  conflicts: z
    .array(z.object({ topic: z.string().trim().min(3).max(120), detail: z.string().trim().min(3).max(300), models: z.array(z.string()).default([]) }))
    .max(6)
    .default([]),
  recommendation: z.string().trim().min(8).max(400),
  confidence: z.enum(["high", "medium-high", "medium", "low", "insufficient-evidence"]).default("medium"),
  nextStep: z.string().trim().min(6).max(300),
});

async function askModel(model: { id: string; label: string }, question: string): Promise<ModelAnswer | null> {
  const content = await runOpenRouterModel(model.id, {
    system: "You are one AI assistant answering a technical question. You return strictly valid JSON.",
    user: `Answer this question for an AI engineer. Be specific and take a clear stance. Return JSON {"headline": one-line stance, "detail": 2-3 sentence reasoning}.\n\nQuestion: ${question}`,
  });
  if (!content) return null;
  try {
    const reply = modelReplySchema.parse(JSON.parse(stripCodeFence(content)));
    return { model: model.id, label: model.label, headline: reply.headline, detail: reply.detail };
  } catch {
    return null;
  }
}

async function analyze(question: string, answers: ModelAnswer[]) {
  const panel = answers.map((answer) => `${answer.label}: ${answer.headline} — ${answer.detail}`).join("\n");
  const content = await runChatCompletion({
    system: "You compare multiple AI answers and reconcile them. You return strictly valid JSON.",
    user: `Several models answered the same question. Identify where they AGREE and where they CONFLICT, then give one trusted recommendation, a confidence, and one concrete next step.

Return JSON with exactly: agreements (array of short strings), conflicts (array of {topic, detail, models}), recommendation (string), confidence (one of high, medium-high, medium, low, insufficient-evidence), nextStep (string).

Question: ${question}

Answers:
${panel}`,
    maxTokens: 900,
    temperature: 0.1,
  });
  if (!content) return null;
  try {
    return analysisSchema.parse(JSON.parse(stripCodeFence(content)));
  } catch {
    return null;
  }
}

/**
 * Build a multi-model consensus report for a question. Fans out to the configured models
 * in parallel (via OpenRouter), reconciles their answers into agreements/conflicts and one
 * trusted next step, and degrades gracefully:
 *   - >=2 model answers  -> "multi-model"
 *   - exactly 1 answer   -> "single-model"
 *   - none (no key/fail) -> "deterministic", derived from the Decision Brief
 * The `brief` supplies recommendation/next-step defaults so the view is always populated.
 */
export async function buildConsensus(input: CreateDecisionInput, brief: DecisionBrief): Promise<ConsensusReport> {
  const question = input.question.trim();
  const base = {
    id: brief.id,
    question,
    createdAt: new Date().toISOString(),
    recommendation: brief.recommendation,
    confidence: brief.confidence,
    nextStep: brief.nextAction.title,
  };

  let answers: ModelAnswer[] = [];
  if (hasOpenRouter()) {
    const settled = await Promise.all(consensusModels().map((model) => askModel(model, question)));
    answers = settled.filter((answer): answer is ModelAnswer => Boolean(answer));
  }

  if (answers.length >= 2) {
    const analysis = await analyze(question, answers);
    return consensusReportSchema.parse({
      ...base,
      models: answers,
      agreements: analysis?.agreements ?? [],
      conflicts: analysis?.conflicts ?? [],
      recommendation: analysis?.recommendation ?? base.recommendation,
      confidence: analysis?.confidence ?? base.confidence,
      nextStep: analysis?.nextStep ?? base.nextStep,
      mode: "multi-model",
    });
  }

  if (answers.length === 1) {
    return consensusReportSchema.parse({
      ...base,
      models: answers,
      agreements: [],
      conflicts: [],
      mode: "single-model",
    });
  }

  // No live models: present the deterministic Decision Brief as a single grounded panel.
  return consensusReportSchema.parse({
    ...base,
    models: [
      {
        model: "genphd/deterministic",
        label: "GenPHD",
        headline: brief.recommendation,
        detail: brief.summary,
      },
    ],
    agreements: [],
    conflicts: brief.conflicts.map((conflict) => ({ topic: conflict.title, detail: conflict.detail, models: [] })),
    mode: "deterministic",
  });
}
