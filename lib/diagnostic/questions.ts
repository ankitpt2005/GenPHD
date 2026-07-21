import { z } from "zod";
import type { CompetencyId } from "../competencies";

// Difficulty tiers used by the adaptive/ceiling scoring in ./scoring.ts.
export type Difficulty = "foundational" | "applied";

export type McqQuestion = {
  id: string;
  competencyId: CompetencyId;
  difficulty: Difficulty;
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
};

export type OpenQuestion = {
  id: string;
  competencyId: CompetencyId;
  prompt: string;
  // Server-only grading rubric; never sent to the client.
  rubric: string;
};

export type CompetencyQuestions = {
  competencyId: CompetencyId;
  mcq: McqQuestion[];
  open: OpenQuestion;
};

// Versioned, framework-current question bank. Bump QUESTION_BANK_VERSION whenever the
// content changes so recorded diagnostics can be flagged stale later.
export const QUESTION_BANK_VERSION = "2026-07-diag-v1";

export const QUESTION_BANK: CompetencyQuestions[] = [
  {
    competencyId: "prompting",
    mcq: [
      {
        id: "prompting-f",
        competencyId: "prompting",
        difficulty: "foundational",
        prompt: "What is the most reliable way to get consistent structured (e.g. JSON) output from an LLM?",
        options: [
          { id: "a", text: "Politely ask for JSON in the prompt" },
          { id: "b", text: "Constrain the format with the provider's structured-output / JSON mode and a schema" },
          { id: "c", text: "Raise the temperature so it explores formats" },
          { id: "d", text: "Send the request several times and pick the shortest" },
        ],
        correctOptionId: "b",
      },
      {
        id: "prompting-a",
        competencyId: "prompting",
        difficulty: "applied",
        prompt: "You classify support tickets into 5 categories plus an occasional 'unknown'. Which change most improves reliability?",
        options: [
          { id: "a", text: "Increase max_tokens" },
          { id: "b", text: "A few labeled examples, an explicit 'unknown' instruction, and low temperature" },
          { id: "c", text: "Ask the model to be creative" },
          { id: "d", text: "Remove the system prompt to save tokens" },
        ],
        correctOptionId: "b",
      },
    ],
    open: {
      id: "prompting-o",
      competencyId: "prompting",
      prompt: "How would you stop an LLM from returning a category that isn't in your allowed list?",
      rubric: "Credit for: constrained decoding / enum / structured output, validation with retry, explicit instruction + examples, low temperature.",
    },
  },
  {
    competencyId: "embeddings",
    mcq: [
      {
        id: "embeddings-f",
        competencyId: "embeddings",
        difficulty: "foundational",
        prompt: "What does an embedding model produce for a piece of text?",
        options: [
          { id: "a", text: "A one-sentence summary" },
          { id: "b", text: "A fixed-length numeric vector that captures semantic meaning" },
          { id: "c", text: "A SQL query" },
          { id: "d", text: "A list of tokens" },
        ],
        correctOptionId: "b",
      },
      {
        id: "embeddings-a",
        competencyId: "embeddings",
        difficulty: "applied",
        prompt: "Two texts have high cosine similarity between their embeddings. What does that most directly indicate?",
        options: [
          { id: "a", text: "They are the same length" },
          { id: "b", text: "They are semantically similar" },
          { id: "c", text: "They share the exact same keywords" },
          { id: "d", text: "They were written by the same author" },
        ],
        correctOptionId: "b",
      },
    ],
    open: {
      id: "embeddings-o",
      competencyId: "embeddings",
      prompt: "When would you pick a smaller/faster embedding model over a larger one, and what is the tradeoff?",
      rubric: "Credit for: latency/cost/throughput vs retrieval quality, dimensionality, scale considerations.",
    },
  },
  {
    competencyId: "vector-dbs",
    mcq: [
      {
        id: "vector-dbs-f",
        competencyId: "vector-dbs",
        difficulty: "foundational",
        prompt: "Why use a vector database or index (e.g. pgvector) instead of a plain SQL LIKE query for semantic search?",
        options: [
          { id: "a", text: "It is cheaper to host" },
          { id: "b", text: "It enables approximate nearest-neighbor search over embeddings at scale" },
          { id: "c", text: "It removes the need to create embeddings" },
          { id: "d", text: "It can store images natively" },
        ],
        correctOptionId: "b",
      },
      {
        id: "vector-dbs-a",
        competencyId: "vector-dbs",
        difficulty: "applied",
        prompt: "You store 5M chunks and exact search is too slow. What helps most?",
        options: [
          { id: "a", text: "Add more metadata columns" },
          { id: "b", text: "Use an ANN index (e.g. HNSW / IVFFlat) and tune its parameters" },
          { id: "c", text: "Increase the embedding dimensions" },
          { id: "d", text: "Lower the model temperature" },
        ],
        correctOptionId: "b",
      },
    ],
    open: {
      id: "vector-dbs-o",
      competencyId: "vector-dbs",
      prompt: "What metadata would you store alongside each vector for a document Q&A system, and why?",
      rubric: "Credit for: source id/url, chunk position, title/section, timestamps — enabling filtering, citation, and freshness.",
    },
  },
  {
    competencyId: "retrieval",
    mcq: [
      {
        id: "retrieval-f",
        competencyId: "retrieval",
        difficulty: "foundational",
        prompt: "In a RAG pipeline, what is 'chunking'?",
        options: [
          { id: "a", text: "Compressing the model weights" },
          { id: "b", text: "Splitting source documents into passages before embedding them" },
          { id: "c", text: "Batching API calls together" },
          { id: "d", text: "Caching previous answers" },
        ],
        correctOptionId: "b",
      },
      {
        id: "retrieval-a",
        competencyId: "retrieval",
        difficulty: "applied",
        prompt: "Relevant passages aren't retrieved for paraphrased questions. Which change most directly helps recall?",
        options: [
          { id: "a", text: "Lower top_k" },
          { id: "b", text: "Add hybrid search (dense + keyword) and/or a reranker" },
          { id: "c", text: "Increase temperature" },
          { id: "d", text: "Drop all metadata" },
        ],
        correctOptionId: "b",
      },
    ],
    open: {
      id: "retrieval-o",
      competencyId: "retrieval",
      prompt: "How would you measure whether your retriever is actually returning the right chunks?",
      rubric: "Credit for: labeled query→relevant-chunk sets, recall@k / precision, inspecting retrieved chunks beside answers, hit rate.",
    },
  },
  {
    competencyId: "agent-frameworks",
    mcq: [
      {
        id: "agent-frameworks-f",
        competencyId: "agent-frameworks",
        difficulty: "foundational",
        prompt: "What primarily distinguishes an 'agent' from a single LLM call?",
        options: [
          { id: "a", text: "It always uses a larger model" },
          { id: "b", text: "It can decide to call tools and loop over multiple steps toward a goal" },
          { id: "c", text: "It always uses retrieval" },
          { id: "d", text: "It runs entirely on-device" },
        ],
        correctOptionId: "b",
      },
      {
        id: "agent-frameworks-a",
        competencyId: "agent-frameworks",
        difficulty: "applied",
        prompt: "When is a stateful agent framework (e.g. LangGraph) justified over a simple sequential chain?",
        options: [
          { id: "a", text: "Always, for any LLM app" },
          { id: "b", text: "When the task needs branching, tool use, retries, persistence, or human-in-the-loop" },
          { id: "c", text: "Only for chatbots" },
          { id: "d", text: "Never — chains are always enough" },
        ],
        correctOptionId: "b",
      },
    ],
    open: {
      id: "agent-frameworks-o",
      competencyId: "agent-frameworks",
      prompt: "Describe a task where a single prompt is enough and adding an agent would only add risk.",
      rubric: "Credit for: deterministic single-step task, no branching/tools, agents adding latency/cost/failure surface, over-engineering.",
    },
  },
  {
    competencyId: "evals",
    mcq: [
      {
        id: "evals-f",
        competencyId: "evals",
        difficulty: "foundational",
        prompt: "Why build an evaluation set for an AI feature before scaling it?",
        options: [
          { id: "a", text: "To increase token usage" },
          { id: "b", text: "To objectively measure whether changes improve or regress quality" },
          { id: "c", text: "Because the framework requires it" },
          { id: "d", text: "To reduce embedding size" },
        ],
        correctOptionId: "b",
      },
      {
        id: "evals-a",
        competencyId: "evals",
        difficulty: "applied",
        prompt: "You changed a prompt and 'it feels better'. What is the most trustworthy next step?",
        options: [
          { id: "a", text: "Ship it — intuition is enough" },
          { id: "b", text: "Run it against a small, representative eval set and compare metrics" },
          { id: "c", text: "Ask the model whether it improved" },
          { id: "d", text: "Increase temperature and retry" },
        ],
        correctOptionId: "b",
      },
    ],
    open: {
      id: "evals-o",
      competencyId: "evals",
      prompt: "What would a minimal but useful eval set for a document Q&A bot contain?",
      rubric: "Credit for: representative questions incl. edge cases, expected answers/grounding, pass/fail or graded criteria, small but realistic.",
    },
  },
];

// Client-safe view: MCQ options without the correct answer, plus the open prompt.
export type PublicMcqQuestion = Omit<McqQuestion, "correctOptionId">;
export type PublicOpenQuestion = Omit<OpenQuestion, "rubric">;
export type PublicCompetencyQuestions = {
  competencyId: CompetencyId;
  label: string;
  mcq: PublicMcqQuestion[];
  open: PublicOpenQuestion;
};

export function getPublicQuestionBank(labelFor: (id: CompetencyId) => string): PublicCompetencyQuestions[] {
  return QUESTION_BANK.map((group) => ({
    competencyId: group.competencyId,
    label: labelFor(group.competencyId),
    mcq: group.mcq.map((question) => ({
      id: question.id,
      competencyId: question.competencyId,
      difficulty: question.difficulty,
      prompt: question.prompt,
      options: question.options,
    })),
    open: { id: group.open.id, competencyId: group.open.competencyId, prompt: group.open.prompt },
  }));
}

// Submitted answers: mcq maps question id -> chosen option id; open maps question id -> free text.
export const diagnosticAnswersSchema = z.object({
  skipped: z.boolean().optional().default(false),
  mcq: z.record(z.string(), z.string()).optional().default({}),
  open: z.record(z.string(), z.string().max(2000)).optional().default({}),
});

export type DiagnosticAnswers = z.infer<typeof diagnosticAnswersSchema>;
