import { NextResponse } from "next/server";
import { apiErrorResponse } from "../../../lib/api/route-error";
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
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
