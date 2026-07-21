// Canonical GenAI competency catalog — the single source of truth shared by the
// diagnostic, the skill-gap vector, roadmap generation, and Supabase persistence.
// The `id` values match the `competencies` table primary keys (see supabase/seed.sql).

export type CompetencyId =
  | "prompting"
  | "embeddings"
  | "vector-dbs"
  | "retrieval"
  | "agent-frameworks"
  | "evals";

export type Competency = {
  id: CompetencyId;
  label: string;
  description: string;
  // Position in the natural prerequisite chain (lower = earlier to learn).
  order: number;
};

export const COMPETENCIES: Competency[] = [
  { id: "prompting", label: "Prompting", description: "Writes constrained, testable prompts for a target task.", order: 0 },
  { id: "embeddings", label: "Embeddings", description: "Understands how text becomes vectors and how to choose an embedding model.", order: 1 },
  { id: "vector-dbs", label: "Vector databases", description: "Stores, indexes, and queries embeddings with the right index and metadata.", order: 2 },
  { id: "retrieval", label: "Retrieval strategies", description: "Designs and inspects a reliable retrieval path (chunking, reranking, hybrid).", order: 3 },
  { id: "agent-frameworks", label: "Agent frameworks", description: "Wires up agents and tool use with a current framework only when the problem needs it.", order: 4 },
  { id: "evals", label: "Evaluations", description: "Defines a compact, representative evaluation loop for an AI feature.", order: 5 },
];

export const COMPETENCY_IDS: CompetencyId[] = COMPETENCIES.map((competency) => competency.id);

const byId = new Map<CompetencyId, Competency>(COMPETENCIES.map((competency) => [competency.id, competency]));

export function competencyById(id: CompetencyId): Competency {
  const competency = byId.get(id);
  if (!competency) throw new Error(`Unknown competency id: ${id}`);
  return competency;
}

export function competencyLabel(id: CompetencyId): string {
  return byId.get(id)?.label ?? id;
}

export function isCompetencyId(value: string): value is CompetencyId {
  return byId.has(value as CompetencyId);
}

// Maps any free-text label or keyword (from an LLM response or legacy data) onto a
// canonical competency id, so the decision flow and roadmap always resolve to a valid FK.
export function normalizeCompetencyId(value: string): CompetencyId {
  const normalized = value.trim().toLowerCase();
  if (isCompetencyId(normalized)) return normalized;
  if (normalized.includes("prompt")) return "prompting";
  if (normalized.includes("embed")) return "embeddings";
  if (normalized.includes("vector") || normalized.includes("pgvector") || normalized.includes("index")) return "vector-dbs";
  if (normalized.includes("retriev") || normalized.includes("rag") || normalized.includes("rerank") || normalized.includes("chunk")) return "retrieval";
  if (normalized.includes("agent") || normalized.includes("workflow") || normalized.includes("orchestrat") || normalized.includes("tool")) return "agent-frameworks";
  if (normalized.includes("eval") || normalized.includes("test") || normalized.includes("measur") || normalized.includes("system")) return "evals";
  return "retrieval";
}
