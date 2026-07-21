import { z } from "zod";

export const diagnosticQuestions = [
  { id: "prompting", label: "Prompt design", prompt: "Which prompt constraint most improves a classifier's reliability?", options: ["Ask for a detailed explanation", "Specify allowed labels and require exactly one", "Use the highest temperature", "Let the model choose any format"], correct: 1 },
  { id: "embeddings", label: "Embeddings", prompt: "What should be stored with an embedding to make retrieval inspectable?", options: ["Only the vector", "The source chunk and metadata", "The user's password", "A screenshot of the model"], correct: 1 },
  { id: "vector-dbs", label: "Vector databases", prompt: "What is a useful first filter alongside semantic similarity?", options: ["Random ordering", "Relevant metadata such as document or tenant", "The current time only", "A longer system prompt"], correct: 1 },
  { id: "retrieval", label: "Retrieval", prompt: "What is the quickest way to diagnose a poor RAG answer?", options: ["Change models immediately", "Inspect the retrieved chunks beside the answer", "Add more agents", "Increase the token limit"], correct: 1 },
  { id: "agent-frameworks", label: "Agent workflows", prompt: "When is a workflow framework justified?", options: ["For every chatbot", "When durable state, tools, or branching steps are genuinely needed", "Before defining the first task", "Only to add more UI"], correct: 1 },
  { id: "evals", label: "Evaluation", prompt: "What makes an evaluation set useful for a first release?", options: ["Many random questions", "Representative inputs with observable pass/fail checks", "Only questions the model already answers", "A single average score"], correct: 1 },
] as const;

export const diagnosticInputSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
});

export const diagnosticResultSchema = z.object({
  scores: z.array(z.object({ id: z.string(), label: z.string(), score: z.number().int().min(0).max(100), state: z.enum(["emerging", "practicing", "validated"]) })),
  summary: z.string(),
});

export type DiagnosticResult = z.infer<typeof diagnosticResultSchema>;

export function gradeDiagnostic(answers: Record<string, number>): DiagnosticResult {
  const scores = diagnosticQuestions.map((question) => {
    const score = answers[question.id] === question.correct ? 100 : 25;
    return { id: question.id, label: question.label, score, state: score >= 90 ? "validated" as const : "emerging" as const };
  });
  const weakest = scores.filter((entry) => entry.score < 90).map((entry) => entry.label);
  return diagnosticResultSchema.parse({
    scores,
    summary: weakest.length ? `Start with ${weakest.slice(0, 2).join(" and ")}. Your roadmap will keep the next step bounded to your active project.` : "Strong baseline across the six foundations. Use your roadmap to turn that knowledge into project evidence.",
  });
}
