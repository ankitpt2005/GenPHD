import { NextResponse } from "next/server";
import { getChallenge } from "../../../../lib/challenges/bank";
import { gradeChallenge } from "../../../../lib/challenges/grader";
import { gradeInputSchema } from "../../../../lib/challenges/types";

export async function POST(request: Request) {
  const parsed = gradeInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR", message: "Submit a challenge id and non-empty code." }, { status: 400 });

  const challenge = getChallenge(parsed.data.challengeId);
  if (!challenge) return NextResponse.json({ error: "NOT_FOUND", message: "Unknown challenge." }, { status: 404 });

  return NextResponse.json({ challengeId: challenge.id, grade: gradeChallenge(challenge, parsed.data.code) });
}
