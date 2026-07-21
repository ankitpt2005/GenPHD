import { describe, expect, it } from "vitest";
import { getChallenge } from "../../lib/challenges/bank";
import { gradeChallenge } from "../../lib/challenges/grader";

describe("challenge grader", () => {
  it("does not pass the unchanged starter", () => {
    const challenge = getChallenge();
    expect(challenge).not.toBeNull();
    expect(gradeChallenge(challenge!, challenge!.starterCode).passed).toBe(false);
  });

  it("passes a submission containing all required safeguards", () => {
    const challenge = getChallenge();
    const code = `${challenge!.starterCode}\n    response = client.chat.completions.create(messages=[{\"role\": \"user\", \"content\": ticket}], temperature=0.1)\n    label = response.choices[0].message.content.strip().lower()\n    return label if label in ALLOWED else \"unknown\"`;
    expect(gradeChallenge(challenge!, code)).toMatchObject({ passed: true, score: 100 });
  });
});
