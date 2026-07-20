import { describe, expect, it } from "vitest";
import { decisionWorkflowInstruction, decisionWorkflowVersion, genPhdAgents } from "../../.agents/registry";

describe("GenPHD agent registry", () => {
  it("defines only the focused reasoning roles used by a Decision Brief", () => {
    expect(Object.keys(genPhdAgents)).toEqual(["decision-editor", "evidence-guardian", "mission-designer"]);
  });

  it("exposes a versioned, evidence-aware workflow instruction", () => {
    expect(decisionWorkflowInstruction()).toContain("Use only the supplied project context and trusted evidence");
    expect(decisionWorkflowVersion()).toContain("decision-editor-v1");
  });
});
