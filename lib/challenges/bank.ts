import type { Challenge, PublicChallenge } from "./types";

const challenge: Challenge = {
  id: "prompting-classify-v1",
  title: "Constrained ticket classifier",
  scenario: "Write `classify(client, ticket)` that asks an LLM to label a support ticket as billing, bug, feature, account, or unknown. Constrain the output, use low temperature, and return exactly the label string.",
  language: "Python",
  framework: "OpenAI SDK",
  starterCode: "ALLOWED = [\"billing\", \"bug\", \"feature\", \"account\", \"unknown\"]\n\n\ndef classify(client, ticket: str) -> str:\n    # Prompt the model to return only one label from ALLOWED.\n    ...\n",
  criteria: [
    "Passes the allowed labels to the model and instructs it to pick exactly one",
    "Uses a low temperature for deterministic output",
    "Falls back to 'unknown' when the answer is not in the allowed set",
  ],
  signals: ["messages", "temperature", "unknown"],
};

export function getChallenge(id?: string): Challenge | null {
  return !id || id === challenge.id ? challenge : null;
}

export function toPublicChallenge(value: Challenge): PublicChallenge {
  const { signals: _signals, ...publicChallenge } = value;
  return publicChallenge;
}
