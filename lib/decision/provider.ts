import { createDecisionBrief } from "./brief";
import type { CreateDecisionInput, DecisionBrief } from "./types";

export type DecisionProvider = {
  createBrief(input: CreateDecisionInput): Promise<DecisionBrief>;
  mode: "deterministic" | "openai";
};

class DeterministicDecisionProvider implements DecisionProvider {
  mode = "deterministic" as const;

  async createBrief(input: CreateDecisionInput) {
    return createDecisionBrief(input);
  }
}

// The provider boundary keeps the API contract stable while live model access is
// configured. A future OpenAI provider must return the same validated schema.
export function getDecisionProvider(): DecisionProvider {
  return new DeterministicDecisionProvider();
}
