import { NextResponse } from "next/server";
import { apiErrorResponse } from "../../../lib/api/route-error";
<<<<<<< HEAD
import { getConsensusProviders, getDecisionProvider } from "../../../lib/decision/provider";
import { createDecisionInputSchema } from "../../../lib/decision/types";
import { consensusReportSchema } from "../../../lib/consensus/types";

export async function POST(request: Request) {
  const input = createDecisionInputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "VALIDATION_ERROR", message: input.error.issues[0]?.message ?? "Enter a decision question." }, { status: 400 });

  try {
    const settled = await Promise.allSettled(getConsensusProviders().map(async (provider) => ({ provider: provider.mode, brief: await provider.createBrief(input.data) })));
    const answers = settled.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
    const fallback = answers[0] ?? { provider: "deterministic", brief: await getDecisionProvider().createBrief(input.data) };
    const distinctCompetencies = new Set(answers.map((answer) => answer.brief.nextAction.competency));
    const report = consensusReportSchema.parse({
      mode: answers.length > 1 ? "multi" : fallback.provider === "deterministic" ? "deterministic" : "single",
      brief: fallback.brief,
      models: (answers.length ? answers : [fallback]).map((answer) => ({ provider: answer.provider, recommendation: answer.brief.recommendation, summary: answer.brief.summary })),
      agreements: distinctCompetencies.size === 1 ? [`All available models prioritize ${fallback.brief.nextAction.competency}.`] : ["Models agree that the next action should remain bounded and evidence-backed."],
      conflicts: distinctCompetencies.size > 1 ? ["Models selected different capability priorities. Use your project constraint and the evidence below to choose the first experiment."] : [],
      confidence: fallback.brief.confidence,
    });
    return NextResponse.json(report, { status: 201 });
=======
import { buildConsensus } from "../../../lib/consensus/provider";
import { getDecisionProvider } from "../../../lib/decision/provider";
import { createDecisionInputSchema, decisionBriefSchema } from "../../../lib/decision/types";
import { getWorkspaceContext } from "../../../lib/workspace/context";
import { persistDecisionBrief } from "../../../lib/workspace/repository";

// Ask once, reconcile several models, and remember the result. Returns the grounded
// Decision Brief (which drives the Build Mission) plus the multi-model consensus report.
export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  const input = createDecisionInputSchema.safeParse(payload);

  if (!input.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: input.error.issues[0]?.message ?? "Invalid decision request." },
      { status: 400 },
    );
  }

  try {
    const context = await getWorkspaceContext();
    const brief = decisionBriefSchema.parse(await getDecisionProvider().createBrief(input.data));
    const consensus = await buildConsensus(input.data, brief);
    const persistedBrief = await persistDecisionBrief(context, brief, consensus);
    return NextResponse.json({ brief: persistedBrief, consensus }, { status: 201 });
>>>>>>> a0a457e (feat: add diagnostic, roadmap DAG, and multi-model consensus)
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
