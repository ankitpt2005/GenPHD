// A minimal, reusable OpenAI-compatible chat helper that mirrors the provider fallback
// order used by lib/decision/provider.ts (OpenRouter -> Groq -> OpenAI). It is deliberately
// standalone so features like roadmap generation and open-response grading can share the
// same provider selection without depending on the Decision Brief pipeline.
import { z } from "zod";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

type LiveProviderMode = "openrouter" | "groq" | "openai";

type ProviderConfig = {
  mode: LiveProviderMode;
  apiKey: string;
  endpoint: string;
  model: string;
  extraHeaders?: Record<string, string>;
  requestExtras?: Record<string, unknown>;
};

const responseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().nullable() }) })).min(1),
});

function costQualityTradeoff() {
  const value = Number.parseInt(process.env.OPENROUTER_COST_QUALITY_TRADEOFF ?? "6", 10);
  return Number.isInteger(value) && value >= 0 && value <= 10 ? value : 6;
}

function configuredProviders(): ProviderConfig[] {
  const order = (process.env.GENPHD_DECISION_PROVIDERS ?? "openrouter,groq,openai")
    .split(",")
    .map((provider) => provider.trim().toLowerCase())
    .filter((provider): provider is LiveProviderMode => provider === "openrouter" || provider === "groq" || provider === "openai");

  const configured = new Map<LiveProviderMode, ProviderConfig>();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();

  if (openRouterKey) {
    configured.set("openrouter", {
      mode: "openrouter",
      apiKey: openRouterKey,
      endpoint: OPENROUTER_ENDPOINT,
      model: process.env.OPENROUTER_MODEL?.trim() || "openrouter/auto-beta",
      extraHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-OpenRouter-Title": "GenPHD",
      },
      requestExtras: { plugins: [{ id: "auto-router", cost_quality_tradeoff: costQualityTradeoff() }] },
    });
  }
  if (groqKey) {
    configured.set("groq", { mode: "groq", apiKey: groqKey, endpoint: GROQ_ENDPOINT, model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile" });
  }
  if (openAiKey) {
    configured.set("openai", { mode: "openai", apiKey: openAiKey, endpoint: OPENAI_ENDPOINT, model: process.env.OPENAI_MODEL?.trim() || "gpt-5.6-sol" });
  }

  return [...new Set(order)].flatMap((provider) => {
    const config = configured.get(provider);
    return config ? [config] : [];
  });
}

export function hasConfiguredProvider() {
  return configuredProviders().length > 0;
}

/**
 * Run a single JSON-mode chat completion against the first available provider, falling
 * through the chain on error. Returns the message content, or null when no provider is
 * configured or every provider fails — callers must supply their own deterministic fallback.
 */
export async function runChatCompletion(params: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  for (const config of configuredProviders()) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
          ...config.extraHeaders,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: "system", content: params.system },
            { role: "user", content: params.user },
          ],
          temperature: params.temperature ?? 0.2,
          max_tokens: params.maxTokens ?? 1_800,
          response_format: { type: "json_object" },
          ...config.requestExtras,
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`${config.mode} request failed`);
      const payload = responseSchema.parse(await response.json());
      const content = payload.choices[0]?.message.content;
      if (content) return content;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[GenPHD] ${config.mode} chat completion fallback: ${error instanceof Error ? error.name : "UnknownError"}`);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

export function stripCodeFence(content: string) {
  return content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}

export function hasOpenRouter() {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

/**
 * Call one specific model through OpenRouter (the single-key multiplexer used for the
 * multi-model consensus fan-out). Returns the message content, or null if no OpenRouter
 * key is set or the request fails. Callers fan this out across several model ids.
 */
export async function runOpenRouterModel(
  model: string,
  params: { system: string; user: string; maxTokens?: number; temperature?: number },
): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-OpenRouter-Title": "GenPHD",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
        temperature: params.temperature ?? 0.3,
        max_tokens: params.maxTokens ?? 600,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`openrouter ${model} failed`);
    const payload = responseSchema.parse(await response.json());
    return payload.choices[0]?.message.content ?? null;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[GenPHD] consensus model ${model} fallback: ${error instanceof Error ? error.name : "UnknownError"}`);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
