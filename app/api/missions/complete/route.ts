import { NextResponse } from "next/server";
import { completeMission, completeMissionInputSchema } from "../../../../lib/missions/complete";

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  const input = completeMissionInputSchema.safeParse(payload);

  if (!input.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: input.error.issues[0]?.message ?? "Invalid mission completion." },
      { status: 400 },
    );
  }

  return NextResponse.json(completeMission(input.data));
}
