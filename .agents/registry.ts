export type GenPhdAgentId = "decision-editor" | "evidence-guardian" | "mission-designer";

export type GenPhdAgent = {
  id: GenPhdAgentId;
  name: string;
  responsibility: string;
  instruction: string;
  version: string;
};

/**
 * Server-side agent contracts. These are intentionally small: GenPHD uses
 * specialized reasoning roles inside one decision workflow, rather than
 * exposing an unnecessary multi-agent control surface to the user.
 */
export const genPhdAgents: Record<GenPhdAgentId, GenPhdAgent> = {
  "decision-editor": {
    id: "decision-editor",
    name: "Decision editor",
    responsibility: "Turn a project question into one concise, useful recommendation.",
    instruction: "State one practical recommendation, name the tradeoff, and include a credible alternative. Prefer the smallest implementation that can validate the next project assumption.",
    version: "v1",
  },
  "evidence-guardian": {
    id: "evidence-guardian",
    name: "Evidence guardian",
    responsibility: "Keep recommendations grounded in the evidence actually supplied to the workflow.",
    instruction: "Use only the supplied project context and trusted evidence. Never invent sources, benchmark results, product capabilities, or certainty. Lower confidence and name what is unknown when the evidence is incomplete.",
    version: "v1",
  },
  "mission-designer": {
    id: "mission-designer",
    name: "Mission designer",
    responsibility: "Translate a recommendation into one bounded, observable build action.",
    instruction: "Create a next action that can be completed in one focused session. Its acceptance criteria must be observable, concise, and directly connected to the recommendation.",
    version: "v1",
  },
};

export function decisionWorkflowInstruction() {
  return Object.values(genPhdAgents)
    .map((agent) => `${agent.name}: ${agent.instruction}`)
    .join("\n");
}

export function decisionWorkflowVersion() {
  return Object.values(genPhdAgents)
    .map((agent) => `${agent.id}-${agent.version}`)
    .join("+");
}
