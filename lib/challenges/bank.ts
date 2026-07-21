import type { CompetencyId } from "../competencies";
import type { Challenge, PublicChallenge } from "./types";

// Versioned, framework-current challenge bank — one hands-on challenge per competency.
// Bump the version when challenges are refreshed for new framework releases.
export const CHALLENGE_BANK_VERSION = "2026-07-challenges-v1";

export const CHALLENGE_BANK: Challenge[] = [
  {
    id: "prompting-classify",
    competencyId: "prompting",
    title: "Constrained ticket classifier",
    scenario:
      "Write `classify(client, ticket)` that asks an LLM to label a support ticket as one of billing, bug, feature, account, or unknown. Constrain the output, use low temperature, and return exactly the label string.",
    language: "python",
    framework: "OpenAI SDK",
    starterCode:
      "ALLOWED = [\"billing\", \"bug\", \"feature\", \"account\", \"unknown\"]\n\n\ndef classify(client, ticket: str) -> str:\n    # Prompt the model to return only one label from ALLOWED.\n    ...\n",
    criteria: [
      "Passes the allowed labels to the model and instructs it to pick exactly one",
      "Uses a low temperature for deterministic output",
      "Falls back to 'unknown' when the answer is not in the allowed set",
    ],
    difficulty: "starter",
    signals: ["def classify", "temperature", "unknown", "messages", "allowed"],
  },
  {
    id: "embeddings-similarity",
    competencyId: "embeddings",
    title: "Embeddings and cosine similarity",
    scenario:
      "Implement `embed_texts(client, texts)` returning a list of vectors, and `cosine_similarity(a, b)` returning a float in [-1, 1].",
    language: "python",
    framework: "OpenAI SDK",
    starterCode:
      "def embed_texts(client, texts: list[str]) -> list[list[float]]:\n    ...\n\n\ndef cosine_similarity(a: list[float], b: list[float]) -> float:\n    ...\n",
    criteria: [
      "Calls an embedding model and returns one vector per input text",
      "cosine_similarity normalizes by the vector magnitudes",
      "Handles equal-length vectors without index errors",
    ],
    difficulty: "starter",
    signals: ["embed", "cosine", "dot", "sqrt", "sum("],
  },
  {
    id: "vector-dbs-pgvector",
    competencyId: "vector-dbs",
    title: "pgvector upsert and search",
    scenario:
      "Using a psycopg connection, write `upsert_chunk(conn, id, text, embedding, metadata)` and `search(conn, query_embedding, k)` that returns the k nearest chunks using pgvector's `<=>` operator.",
    language: "python",
    framework: "pgvector",
    starterCode:
      "def upsert_chunk(conn, id, text, embedding, metadata):\n    ...\n\n\ndef search(conn, query_embedding, k=5):\n    ...\n",
    criteria: [
      "Uses parameterized SQL (no string interpolation of values)",
      "Orders by the `<=>` distance operator and limits to k",
      "Stores and returns chunk metadata alongside the text",
    ],
    difficulty: "core",
    signals: ["<=>", "execute", "order by", "limit", "%s"],
  },
  {
    id: "retrieval-langchain",
    competencyId: "retrieval",
    title: "Wire up a LangChain retriever",
    scenario:
      "Given a list of text documents, build a vector store with the current LangChain API, expose it as a retriever with k=4, and return the retrieved documents for a query.",
    language: "python",
    framework: "LangChain",
    starterCode:
      "def build_retriever(docs: list[str]):\n    # Embed docs, build a vector store, return a retriever (k=4).\n    ...\n\n\ndef retrieve(retriever, query: str):\n    ...\n",
    criteria: [
      "Embeds the documents and builds a vector store",
      "Creates a retriever configured with k=4",
      "Retrieves relevant documents for the query via the retriever",
    ],
    difficulty: "core",
    signals: ["as_retriever", "embedding", "vectorstore", "search_kwargs", "invoke"],
  },
  {
    id: "agent-frameworks-langgraph",
    competencyId: "agent-frameworks",
    title: "Minimal LangGraph tool loop",
    scenario:
      "Build a minimal LangGraph `StateGraph` with a model node and a tool node, and a conditional edge that routes back to the tool while the model requests it, then compiles the graph.",
    language: "python",
    framework: "LangGraph",
    starterCode:
      "from langgraph.graph import StateGraph, END\n\n\ndef build_graph(model_node, tool_node):\n    # Wire nodes and a conditional edge, then compile.\n    ...\n",
    criteria: [
      "Creates a StateGraph and adds the model and tool nodes",
      "Adds a conditional edge that loops to the tool when requested",
      "Compiles the graph and returns the runnable",
    ],
    difficulty: "stretch",
    signals: ["StateGraph", "add_node", "add_conditional_edges", "compile", "END"],
  },
  {
    id: "evals-harness",
    competencyId: "evals",
    title: "Tiny evaluation harness",
    scenario:
      "Write `evaluate(pipeline, dataset)` where dataset is a list of {input, expected}. Run the pipeline on each input, compare with a contains/exact match, and return the pass rate plus per-item results.",
    language: "python",
    framework: "stdlib",
    starterCode:
      "def evaluate(pipeline, dataset: list[dict]) -> dict:\n    # Return {\"pass_rate\": float, \"results\": [...]}.\n    ...\n",
    criteria: [
      "Runs the pipeline on every dataset item",
      "Compares each output against its expected value",
      "Returns an overall pass rate and per-item results",
    ],
    difficulty: "core",
    signals: ["for", "expected", "pass_rate", "results", "len("],
  },
];

export function challengeById(id: string): Challenge | undefined {
  return CHALLENGE_BANK.find((challenge) => challenge.id === id);
}

export function challengeForCompetency(competencyId: CompetencyId): Challenge {
  return CHALLENGE_BANK.find((challenge) => challenge.competencyId === competencyId) ?? CHALLENGE_BANK[0];
}

export function toPublicChallenge(challenge: Challenge): PublicChallenge {
  return {
    id: challenge.id,
    competencyId: challenge.competencyId,
    title: challenge.title,
    scenario: challenge.scenario,
    language: challenge.language,
    framework: challenge.framework,
    starterCode: challenge.starterCode,
    criteria: challenge.criteria,
    difficulty: challenge.difficulty,
  };
}
