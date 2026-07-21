import { describe, expect, it } from "vitest";
import { gradeDiagnostic } from "../../lib/diagnostic/baseline";
import { personalizeRoadmap } from "../../lib/roadmap/personalize";

describe("personalizeRoadmap", () => {
  it("prioritizes a milestone that matches the lowest diagnostic score", () => {
    const diagnostic = gradeDiagnostic({ prompting: 1, embeddings: 1, "vector-dbs": 1, retrieval: 0, "agent-frameworks": 1, evals: 1 });
    const roadmap = personalizeRoadmap([
      { id: "eval", state: "now", title: "Write evaluation checks", detail: "pass fail", estimateMinutes: 45, competency: "Evaluation" },
      { id: "retrieve", state: "next", title: "Inspect retrieval", detail: "retrieved chunks", estimateMinutes: 45, competency: "Retrieval" },
    ], diagnostic);
    expect(roadmap[0]).toMatchObject({ id: "retrieve", state: "now" });
  });
});
