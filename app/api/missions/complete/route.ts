import { NextResponse } from "next/server";
import { apiErrorResponse } from "../../../../lib/api/route-error";
import { completeMission, completeMissionInputSchema } from "../../../../lib/missions/complete";
import { getWorkspaceContext } from "../../../../lib/workspace/context";
import { completePersistentMission } from "../../../../lib/workspace/repository";

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  const input = completeMissionInputSchema.safeParse(payload);

  if (!input.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: input.error.issues[0]?.message ?? "Invalid mission completion." },
      { status: 400 },
    );
  }

  try {
    const context = await getWorkspaceContext();
    const completion = context.mode === "demo"
      ? completeMission(input.data)
      : await completePersistentMission(context, input.data);
    return NextResponse.json(completion);
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
