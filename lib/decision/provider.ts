import { z } from "zod";
import { createDecisionBrief } from "./brief";
import {
  confidenceSchema,
  conflictSchema,
  decisionBriefSchema,
  missionSchema,
  type CreateDecisionInput,
  type DecisionBrief,
} from "./types";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const modelConfidenceSchema = z.union([z.string(), z.number()]).transform((value) => {
  if (typeof value === "number") {
    const score = value <= 1 ? value * 10 : value;
    if (score >= 8.5) return "high";
    if (score >= 7) return "medium-high";
    if (score >= 4) return "medium";
    return "low";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized.includes("insufficient") || normalized.includes("uncertain")) return "insufficient-evidence";
  if (normalized.includes("high")) return normalized.includes("medium") ? "medium-high" : "high";
  if (normalized.includes("low")) return "low";
  return "medium";
}).pipe(confidenceSchema);

const modelConflictSchema = conflictSchema.extend({
  kind: z.string().trim().transform((value) => {
    const normalized = value.toLowerCase();
    if (normalized.includes("trade")) return "tradeoff";
    if (normalized.includes("version") || normalized.includes("compatib")) return "version-risk";
    return "missing-context";
  }).pipe(conflictSchema.shape.kind),
});

const modelCompetencySchema = z.string().trim().transform((value) => {
  const normalized = value.toLowerCase();
  if (normalized.includes("rag") || normalized.includes("retrieval evaluation")) return "RAG evaluation";
  if (normalized.includes("agent") || normalized.includes("workflow")) return "Agentic workflows";
  if (normalized.includes("system") || normalized.includes("architecture")) return "AI system design";
  if (normalized.includes("evaluation")) return "AI evaluation";
  return "Retrieval";
}).pipe(z.enum(["RAG evaluation", "AI evaluation", "Agentic workflows", "AI system design", "Retrieval"]));

const modelDecisionSchema = z.object({
  recommendation: z.string().trim().min(12).max(280),
  summary: z.string().trim().min(24).max(900),
  confidence: modelConfidenceSchema,
  confidenceReason: z.string().trim().min(12).max(500),
  tradeoff: z.string().trim().min(12).max(600),
  counterfactual: z.string().trim().min(12).max(600),
  conflicts: z.array(modelConflictSchema).max(6),
  nextAction: missionSchema.pick({ title: true, objective: true, estimateMinutes: true, acceptanceCriteria: true, competency: true }).extend({
    estimateMinutes: z.coerce.number().int().min(15).max(180),
    competency: modelCompetencySchema,
  }),
});

const openRouterResponseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().nullable() }) })).min(1),
});

type ModelDecision = z.infer<typeof modelDecisionSchema>;

export type DecisionProvider = {
  createBrief(input: CreateDecisionInput): Promise<DecisionBrief>;
  mode: "deterministic" | "openrouter";
};

class DeterministicDecisionProvider implements DecisionProvider {
  mode = "deterministic" as const;

  async createBrief(input: CreateDecisionInput) {
    return createDecisionBrief(input);
  }
}

function stripCodeFence(content: string) {
  return content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}

function costQualityTradeoff() {
  const value = Number.parseInt(process.env.OPENROUTER_COST_QUALITY_TRADEOFF ?? "6", 10);
  return Number.isInteger(value) && value >= 0 && value <= 10 ? value : 6;
}

function buildPrompt(input: CreateDecisionInput, baseline: DecisionBrief) {
  const sources = baseline.evidence.map((source) => `- ${source.title}: ${source.detail}`).join("\n");
  const constraints = input.constraints?.length ? input.constraints.join(", ") : "two-day deadline, Python, one retrieval flow";

  return `You are GenPHD's technical decision editor. Return only one valid JSON object, with no markdown or code fence.

Create a concise, honest Decision Brief for an AI engineer. Respect the project constraints and only rely on the evidence supplied below. Do not invent sources, citations, product capabilities, benchmark results, or factual claims. When evidence is incomplete, lower confidence and name the uncertainty.

The JSON object must have exactly these fields:
recommendation, summary, confidence, confidenceReason, tradeoff, counterfactual, conflicts, nextAction.

conflicts is an array of at most three objects with title, detail, and kind. kind must be tradeoff, missing-context, or version-risk.
nextAction must have title, objective, estimateMinutes, acceptanceCriteria, and competency. Use one competency from: RAG evaluation, AI evaluation, Agentic workflows, AI system design, Retrieval. Keep estimateMinutes between 15 and 180 and acceptanceCriteria to exactly three short, observable checks. Keep every text value concise.

Decision question: ${input.question.trim()}
Project constraints: ${constraints}
Trusted evidence:
${sources}`;
}

function mergeModelDecision(baseline: DecisionBrief, decision: ModelDecision): DecisionBrief {
  return decisionBriefSchema.parse({
    ...baseline,
    ...decision,
    nextAction: {
      ...decision.nextAction,
      id: baseline.nextAction.id,
      acceptanceCriteria: decision.nextAction.acceptanceCriteria.slice(0, 3),
    },
    conflicts: decision.conflicts.slice(0, 3),
    evidence: baseline.evidence,
    createdAt: new Date().toISOString(),
    promptVersion: "openrouter-decision-v1",
  });
}

class OpenRouterDecisionProvider implements DecisionProvider {
  mode = "openrouter" as const;

  constructor(private readonly apiKey: string, private readonly model: string) {}

  async createBrief(input: CreateDecisionInput) {
    const baseline = createDecisionBrief(input);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(OPENROUTER_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
          "X-OpenRouter-Title": "GenPHD",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: "You return strictly valid JSON for a typed product workflow." },
            { role: "user", content: buildPrompt(input, baseline) },
          ],
          temperature: 0.2,
          max_tokens: 2_200,
          response_format: { type: "json_object" },
          plugins: [{ id: "auto-router", cost_quality_tradeoff: costQualityTradeoff() }],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("OpenRouter request failed.");
      }

      const payload = openRouterResponseSchema.parse(await response.json());
      const content = payload.choices[0]?.message.content;
      if (!content) {
        throw new Error("OpenRouter returned no decision content.");
      }

      const decision = modelDecisionSchema.parse(JSON.parse(stripCodeFence(content)));
      return mergeModelDecision(baseline, decision);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        const reason = error instanceof Error ? `${error.name}: ${error.message}` : "UnknownError";
        console.warn(`[GenPHD] OpenRouter Decision Brief fallback: ${reason}`);
      }
      return baseline;
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function getDecisionProvider(): DecisionProvider {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return new DeterministicDecisionProvider();
  }

  return new OpenRouterDecisionProvider(apiKey, process.env.OPENROUTER_MODEL?.trim() || "openrouter/auto-beta");
}
