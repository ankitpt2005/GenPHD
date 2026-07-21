import { describe, expect, it } from "vitest";
<<<<<<< HEAD
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
=======
import { COMPETENCY_IDS } from "../../lib/competencies";
import { CHALLENGE_BANK, challengeById, challengeForCompetency, toPublicChallenge } from "../../lib/challenges/bank";
import { gradeChallenge } from "../../lib/challenges/grader";

describe("challenge bank", () => {
  it("has one challenge per competency and stable ids", () => {
    const competencies = CHALLENGE_BANK.map((challenge) => challenge.competencyId).sort();
    expect(competencies).toEqual([...COMPETENCY_IDS].sort());
    for (const competency of COMPETENCY_IDS) {
      expect(challengeForCompetency(competency).competencyId).toBe(competency);
    }
  });

  it("never leaks grading signals to the public challenge", () => {
    for (const challenge of CHALLENGE_BANK) {
      expect(toPublicChallenge(challenge)).not.toHaveProperty("signals");
    }
  });
});

describe("heuristic grading (no AI provider configured)", () => {
  it("passes a real solution containing the expected building blocks", async () => {
    const challenge = challengeById("vector-dbs-pgvector")!;
    const code = `
def upsert_chunk(conn, id, text, embedding, metadata):
    conn.execute("insert into chunks (id, text, embedding, meta) values (%s,%s,%s,%s)", (id, text, embedding, metadata))

def search(conn, query_embedding, k=5):
    return conn.execute("select text, meta from chunks order by embedding <=> %s limit %s", (query_embedding, k)).fetchall()
`;
    const grade = await gradeChallenge(challenge, code);
    expect(grade.gradedBy).toBe("heuristic");
    expect(grade.passed).toBe(true);
    expect(grade.score).toBeGreaterThanOrEqual(70);
  });

  it("rejects the UNCHANGED starter code with a 0 (the reported bug)", async () => {
    for (const challenge of CHALLENGE_BANK) {
      const grade = await gradeChallenge(challenge, challenge.starterCode);
      expect(grade.passed, `${challenge.id} should fail on unchanged starter`).toBe(false);
      expect(grade.score, `${challenge.id} score`).toBe(0);
    }
  });

  it("rejects an empty stub", async () => {
    const challenge = challengeById("vector-dbs-pgvector")!;
    const grade = await gradeChallenge(challenge, "def upsert_chunk():\n    pass\n");
    expect(grade.passed).toBe(false);
    expect(grade.score).toBeLessThan(60);
  });

  it("does not pass a submission that still contains a `...` placeholder body", async () => {
    const challenge = challengeById("retrieval-langchain")!;
    const code = `
def build_retriever(docs):
    store = SomeVectorStore.from_texts(docs, embedding=Embeddings())
    return store.as_retriever(search_kwargs={"k": 4})

def retrieve(retriever, query):
    ...
`;
    const grade = await gradeChallenge(challenge, code);
    expect(grade.passed).toBe(false);
    expect(grade.score).toBeLessThanOrEqual(40);
  });

  it("only credits code the learner added, not tokens already in the starter", async () => {
    const challenge = challengeById("prompting-classify")!;
    // Starter already contains ALLOWED, "unknown", and `def classify` — appending a comment
    // must not earn signal credit.
    const grade = await gradeChallenge(challenge, `${challenge.starterCode}\n# unknown allowed classify\n`);
    expect(grade.passed).toBe(false);
    expect(grade.score).toBe(0);
>>>>>>> aed97a4 (feat: add coding challenges)
  });
});
