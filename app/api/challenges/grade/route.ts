import { NextResponse } from "next/server";
<<<<<<< HEAD
import { getChallenge } from "../../../../lib/challenges/bank";
import { gradeChallenge } from "../../../../lib/challenges/grader";
import { gradeInputSchema } from "../../../../lib/challenges/types";

export async function POST(request: Request) {
  const parsed = gradeInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR", message: "Submit a challenge id and non-empty code." }, { status: 400 });

  const challenge = getChallenge(parsed.data.challengeId);
  if (!challenge) return NextResponse.json({ error: "NOT_FOUND", message: "Unknown challenge." }, { status: 404 });

  return NextResponse.json({ challengeId: challenge.id, grade: gradeChallenge(challenge, parsed.data.code) });
=======
import { apiErrorResponse } from "../../../../lib/api/route-error";
import { challengeById } from "../../../../lib/challenges/bank";
import { gradeChallenge } from "../../../../lib/challenges/grader";
import { gradeInputSchema } from "../../../../lib/challenges/types";
import { getWorkspaceContext } from "../../../../lib/workspace/context";
import { persistChallengeSubmission } from "../../../../lib/workspace/repository";

// Grade a code submission against its challenge (AI grader, heuristic fallback) and,
// on a pass, record challenge-sourced skill evidence.
export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  const input = gradeInputSchema.safeParse(payload);

  if (!input.success) {
    return NextResponse.json({ error: "VALIDATION_ERROR", message: "Submit a challenge id and non-empty code." }, { status: 400 });
  }

  const challenge = challengeById(input.data.challengeId);
  if (!challenge) {
    return NextResponse.json({ error: "NOT_FOUND", message: "Unknown challenge." }, { status: 404 });
  }

  try {
    const context = await getWorkspaceContext();
    const grade = await gradeChallenge(challenge, input.data.code);
    await persistChallengeSubmission(context, challenge, input.data.code, grade);
    return NextResponse.json({ challengeId: challenge.id, competencyId: challenge.competencyId, grade }, { status: 201 });
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
>>>>>>> aed97a4 (feat: add coding challenges)
}
