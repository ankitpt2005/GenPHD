import { describe, expect, it } from "vitest";
import { contentWriterInputSchema } from "../../lib/content/writer";

describe("in-house content writer", () => {
  it("accepts grounded copy requests for supported product surfaces", () => {
    expect(contentWriterInputSchema.safeParse({
      surface: "landing",
      topic: "Evidence-backed AI decisions",
      audience: "AI engineers",
      facts: ["GenPHD keeps project context and decisions together."],
      callToAction: "Start a project",
    }).success).toBe(true);
  });
});
