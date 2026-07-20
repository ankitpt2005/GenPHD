import { NextResponse } from "next/server";
import { getDecisionProvider } from "../../../lib/decision/provider";
import { createDecisionInputSchema, decisionBriefSchema } from "../../../lib/decision/types";

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  const input = createDecisionInputSchema.safeParse(payload);

  if (!input.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: input.error.issues[0]?.message ?? "Invalid decision request." },
      { status: 400 },
    );
  }

  const brief = decisionBriefSchema.parse(await getDecisionProvider().createBrief(input.data));
  return NextResponse.json(brief, { status: 201 });
}
