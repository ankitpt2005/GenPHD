import { z } from "zod";
import { contentWriterInstruction, contentWriterVersion } from "../../.agents/registry";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

const contentSurfaceSchema = z.enum(["landing", "about", "field-notes", "contact", "notion"]);

export const contentWriterInputSchema = z.object({
  surface: contentSurfaceSchema,
  topic: z.string().trim().min(3).max(140),
  audience: z.string().trim().min(3).max(180),
  facts: z.array(z.string().trim().min(3).max(280)).min(1).max(8),
  callToAction: z.string().trim().min(2).max(80).optional(),
});

const contentDraftSchema = z.object({
  eyebrow: z.string().trim().min(2).max(70),
  headline: z.string().trim().min(6).max(120),
  body: z.string().trim().min(20).max(520),
  callToAction: z.string().trim().min(2).max(80).nullable(),
});

const responseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().nullable() }) })).min(1),
});

type ContentWriterInput = z.infer<typeof contentWriterInputSchema>;
export type ContentDraft = z.infer<typeof contentDraftSchema>;

type WriterProvider = {
  endpoint: string;
  key: string;
  model: string;
  name: "openrouter" | "groq" | "openai";
  extraHeaders?: Record<string, string>;
  requestExtras?: Record<string, unknown>;
};

function stripCodeFence(content: string) {
  return content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
}

function configuredWriterProviders(): WriterProvider[] {
  const providers: WriterProvider[] = [];
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openAiKey = process.env.OPENAI_API_KEY?.trim();

  if (openRouterKey) providers.push({
    endpoint: OPENROUTER_ENDPOINT,
    extraHeaders: { "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000", "X-OpenRouter-Title": "GenPHD" },
    key: openRouterKey,
    model: process.env.OPENROUTER_CONTENT_MODEL?.trim() || process.env.OPENROUTER_MODEL?.trim() || "openrouter/auto-beta",
    name: "openrouter",
  });
  if (groqKey) providers.push({
    endpoint: GROQ_ENDPOINT,
    key: groqKey,
    model: process.env.GROQ_CONTENT_MODEL?.trim() || process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
    name: "groq",
  });
  if (openAiKey) providers.push({
    endpoint: OPENAI_ENDPOINT,
    key: openAiKey,
    model: process.env.OPENAI_CONTENT_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-5.6-sol",
    name: "openai",
  });
  return providers;
}

function buildWriterPrompt(input: ContentWriterInput) {
  return `You are GenPHD's in-house content writer. Return one valid JSON object only, with no markdown or code fence.

Writing contract:
${contentWriterInstruction()}

Write a compact content draft for the ${input.surface} surface.
Topic: ${input.topic}
Audience: ${input.audience}
Approved facts:\n${input.facts.map((fact) => `- ${fact}`).join("\n")}
Call to action: ${input.callToAction ?? "None"}

Return exactly: eyebrow, headline, body, callToAction. Use null for callToAction when none is needed.`;
}

function deterministicDraft(input: ContentWriterInput): ContentDraft {
  const factSentence = input.facts.slice(0, 2).join(" ");
  return contentDraftSchema.parse({
    eyebrow: input.surface === "notion" ? "GenPHD documentation" : "GenPHD",
    headline: input.topic,
    body: `${factSentence} Built for ${input.audience.toLowerCase()}.`,
    callToAction: input.callToAction ?? null,
  });
}

export async function createContentDraft(input: ContentWriterInput): Promise<ContentDraft & { mode: "deterministic" | WriterProvider["name"]; promptVersion: string }> {
  const parsed = contentWriterInputSchema.parse(input);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    for (const provider of configuredWriterProviders()) {
      try {
        const response = await fetch(provider.endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json", ...provider.extraHeaders },
          body: JSON.stringify({
            model: provider.model,
            messages: [{ role: "user", content: buildWriterPrompt(parsed) }],
            temperature: 0.5,
            max_tokens: 700,
            response_format: { type: "json_object" },
            ...provider.requestExtras,
          }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Content request failed.");
        const payload = responseSchema.parse(await response.json());
        const content = payload.choices[0]?.message.content;
        if (!content) throw new Error("Content response was empty.");
        return { ...contentDraftSchema.parse(JSON.parse(stripCodeFence(content))), mode: provider.name, promptVersion: `content-${contentWriterVersion()}` };
      } catch {
        // Try the next configured provider, then return a usable local draft.
      }
    }
    return { ...deterministicDraft(parsed), mode: "deterministic", promptVersion: `content-${contentWriterVersion()}` };
  } finally {
    clearTimeout(timeout);
  }
}
