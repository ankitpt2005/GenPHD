/**
 * Small, versioned agent contracts used by GenPHD services.
 *
 * Keeping these instructions in source control makes the behaviour behind an
 * AI-assisted feature reviewable and lets the application report which prompt
 * contract produced a result.
 */
export const contentWriterVersion = () => "v1";

export const contentWriterInstruction = () => `
Write with calm, direct language for AI engineers.
Use only the approved facts supplied by the caller; do not invent metrics,
customer claims, security guarantees, integrations, or product features.
Make one clear point, prefer concrete verbs, and avoid hype, jargon, emojis,
and vague calls to action. Keep the draft consistent with GenPHD: evidence,
deliberate action, and remembered learning.
`.trim();
