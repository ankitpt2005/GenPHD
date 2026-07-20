import type { CreateDecisionInput, DecisionBrief, SourceEvidence } from "./types";

const sourceCatalog: SourceEvidence[] = [
  {
    id: "langgraph-overview",
    title: "LangGraph overview",
    url: "https://langchain-ai.github.io/langgraph/",
    detail: "Stateful orchestration is most useful when work needs branching, persistence, retries, or human review.",
    tier: "Official documentation",
    isExternal: true,
    publishedAt: "2026-07-01",
  },
  {
    id: "openai-agent-evals",
    title: "OpenAI evaluation guidance",
    url: "https://developers.openai.com/api/docs/guides/evaluation-best-practices",
    detail: "A small, task-specific evaluation set is the fastest way to check whether an AI workflow is improving.",
    tier: "Official documentation",
    isExternal: true,
    publishedAt: "2026-07-01",
  },
  {
    id: "project-context",
    title: "DocuQuery project context",
    url: "https://genphd.local/projects/docuquery",
    detail: "The active project has a two-day milestone, one retrieval flow, and a portfolio-quality explanation goal.",
    tier: "Project context",
    isExternal: false,
    publishedAt: "2026-07-19",
  },
  {
    id: "practice-guide",
    title: "RAG evaluation checklist",
    url: "https://genphd.local/guides/rag-evaluation",
    detail: "Capturing retrieved chunks beside answers makes retrieval failures visible before adding application complexity.",
    tier: "Practice guide",
    isExternal: false,
    publishedAt: "2026-07-19",
  },
];

function includesOneOf(question: string, terms: string[]) {
  return terms.some((term) => question.includes(term));
}

function stableId(question: string) {
  let hash = 0;
  for (let index = 0; index < question.length; index += 1) {
    hash = (hash * 31 + question.charCodeAt(index)) | 0;
  }
  return `decision-${Math.abs(hash).toString(36)}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function createDecisionBrief(input: CreateDecisionInput): DecisionBrief {
  const normalizedQuestion = input.question.trim();
  const question = normalizedQuestion.toLowerCase();
  const isWorkflowQuestion = includesOneOf(question, ["langgraph", "agent", "workflow", "orchestrat", "state machine"]);
  const isEvaluationQuestion = includesOneOf(question, ["eval", "evaluate", "evaluation", "quality", "benchmark"]);
  const projectConstraints = input.constraints?.length
    ? input.constraints
    : ["two-day deadline", "Python", "one retrieval flow"];

  if (isWorkflowQuestion) {
    return {
      id: stableId(normalizedQuestion),
      question: normalizedQuestion,
      status: "ready",
      recommendation: "Use a simple workflow for version one.",
      summary: "The active project has one retrieval path and a short delivery window. Direct application code validates the product faster; use the saved time to measure answer quality.",
      confidence: "medium-high",
      confidenceReason: "The recommendation is supported by the project constraints and the absence of branching or persistent workflow requirements.",
      tradeoff: "You give up early extensibility in exchange for a credible, observable first release.",
      counterfactual: "Choose an orchestration framework when the project adds branching tools, durable state, retries, or a human approval step.",
      evidence: sourceCatalog.filter((source) => ["langgraph-overview", "project-context", "practice-guide"].includes(source.id)),
      conflicts: [
        {
          title: "Extensibility versus delivery speed",
          detail: "A framework can make future branching easier, but it creates setup and debugging cost before that complexity exists.",
          kind: "tradeoff",
        },
      ],
      nextAction: {
        id: "mission-rag-evaluation",
        title: "Evaluate the retrieval pipeline",
        objective: "Create five realistic evaluation questions and inspect the retrieved chunks beside each answer.",
        estimateMinutes: 45,
        acceptanceCriteria: ["Five evaluation questions written", "Retrieved chunks captured", "One failure pattern explained"],
        competency: "RAG evaluation",
      },
      createdAt: nowIso(),
      promptVersion: "decision-engine-v1",
    };
  }

  if (isEvaluationQuestion) {
    return {
      id: stableId(normalizedQuestion),
      question: normalizedQuestion,
      status: "ready",
      recommendation: "Start with a small evaluation set tied to real user tasks.",
      summary: "Before optimizing models or prompts, define a small set of representative questions and record both the answer and the retrieved evidence.",
      confidence: "medium-high",
      confidenceReason: "Evaluation improves the current project regardless of the eventual framework or model choice.",
      tradeoff: "A small evaluation set is less comprehensive than a benchmark suite, but it produces useful feedback quickly.",
      counterfactual: "Expand into a larger benchmark only after the first set identifies repeated failure patterns or the project needs release-level regression testing.",
      evidence: sourceCatalog.filter((source) => ["openai-agent-evals", "project-context", "practice-guide"].includes(source.id)),
      conflicts: [
        {
          title: "Speed versus coverage",
          detail: "A broad benchmark increases coverage but delays the first product feedback loop.",
          kind: "tradeoff",
        },
      ],
      nextAction: {
        id: "mission-evaluation-baseline",
        title: "Create an evaluation baseline",
        objective: "Write five representative user questions and record expected evidence for each response.",
        estimateMinutes: 40,
        acceptanceCriteria: ["Representative questions selected", "Expected evidence recorded", "One pass/fail rule defined"],
        competency: "AI evaluation",
      },
      createdAt: nowIso(),
      promptVersion: "decision-engine-v1",
    };
  }

  return {
    id: stableId(normalizedQuestion),
    question: normalizedQuestion,
    status: "ready",
    recommendation: "Choose the smallest implementation that validates the next project assumption.",
    summary: `Your current constraints are ${projectConstraints.join(", ")}. The highest-value next move is the one that creates evidence before increasing scope.`,
    confidence: "medium",
    confidenceReason: "The question needs project-specific validation, and the current source set does not justify a stronger recommendation.",
    tradeoff: "A narrower experiment may not answer every future architecture question, but it reduces decision risk now.",
    counterfactual: "Choose a broader implementation only when the project has clear evidence that the smaller experiment cannot meet its required outcome.",
    evidence: sourceCatalog.filter((source) => ["project-context", "practice-guide"].includes(source.id)),
    conflicts: [
      {
        title: "Missing project detail",
        detail: "The question does not specify a measurable success condition, so this recommendation stays intentionally conservative.",
        kind: "missing-context",
      },
    ],
    nextAction: {
      id: "mission-define-success",
      title: "Define the next measurable project outcome",
      objective: "Write one success criterion, one representative input, and one observable result before changing the architecture.",
      estimateMinutes: 25,
      acceptanceCriteria: ["Success criterion written", "Representative input selected", "Observable result defined"],
      competency: "AI system design",
    },
    createdAt: nowIso(),
    promptVersion: "decision-engine-v1",
  };
}

export const seedDecisionBrief = createDecisionBrief({
  question: "Should I use LangGraph for this two-day RAG project?",
  projectId: "docuquery",
  constraints: ["two-day deadline", "Python", "one retrieval flow"],
});
