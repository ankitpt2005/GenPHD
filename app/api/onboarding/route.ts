import { NextResponse } from "next/server";
import { apiErrorResponse } from "../../../lib/api/route-error";
import { getWorkspaceContext } from "../../../lib/workspace/context";
import { onboardingInputSchema } from "../../../lib/workspace/onboarding";
import { completeOnboarding } from "../../../lib/workspace/repository";

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  const input = onboardingInputSchema.safeParse(payload);

  if (!input.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: input.error.issues[0]?.message ?? "Invalid onboarding details." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await completeOnboarding(await getWorkspaceContext(), input.data), { status: 201 });
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
