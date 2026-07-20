import { NextResponse } from "next/server";
import { apiErrorResponse } from "../../../lib/api/route-error";
import { getDecisionProvider } from "../../../lib/decision/provider";
import { createDecisionInputSchema, decisionBriefSchema } from "../../../lib/decision/types";
import { getWorkspaceContext } from "../../../lib/workspace/context";
import { getLatestDecisionState, persistDecisionBrief } from "../../../lib/workspace/repository";

export async function GET() {
  try {
    return NextResponse.json(await getLatestDecisionState(await getWorkspaceContext()));
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}

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
    const persistedBrief = await persistDecisionBrief(context, brief);
    return NextResponse.json(persistedBrief, { status: 201 });
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
