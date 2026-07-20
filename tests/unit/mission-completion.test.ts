import { describe, expect, it } from "vitest";
import { completeMission, completeMissionInputSchema, missionCompletionSchema } from "../../lib/missions/complete";

describe("completeMission", () => {
  it("records practicing evidence and a roadmap update", () => {
    const completion = completeMission({
      missionId: "mission-rag-evaluation",
      competency: "RAG evaluation",
      outcomeNote: "Captured retrieved chunks for five representative questions.",
    });

    expect(completion).toMatchObject({
      missionId: "mission-rag-evaluation",
      status: "completed",
      skillEvidence: {
        competency: "RAG evaluation",
        state: "practicing",
        provenance: "mission",
      },
    });
    expect(missionCompletionSchema.safeParse(completion).success).toBe(true);
    expect(Number.isNaN(Date.parse(completion.completedAt))).toBe(false);
  });

  it("rejects incomplete or oversized mission input", () => {
    expect(completeMissionInputSchema.safeParse({ missionId: "", competency: "RAG evaluation" }).success).toBe(false);
    expect(
      completeMissionInputSchema.safeParse({
        missionId: "mission-rag-evaluation",
        competency: "RAG evaluation",
        outcomeNote: "x".repeat(1_001),
      }).success,
    ).toBe(false);
  });
});
