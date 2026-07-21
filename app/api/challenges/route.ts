import { NextResponse } from "next/server";
<<<<<<< HEAD
import { getChallenge, toPublicChallenge } from "../../../lib/challenges/bank";

export function GET() {
  const challenge = getChallenge();
  return NextResponse.json({ challenge: challenge ? toPublicChallenge(challenge) : null });
=======
import { isCompetencyId } from "../../../lib/competencies";
import { challengeForCompetency, toPublicChallenge } from "../../../lib/challenges/bank";

// Serve a framework-current coding challenge for a competency (defaults sensibly).
// The grading `signals` are stripped — only the public challenge is returned.
export function GET(request: Request) {
  const competency = new URL(request.url).searchParams.get("competency") ?? "";
  const competencyId = isCompetencyId(competency) ? competency : "retrieval";
  return NextResponse.json({ challenge: toPublicChallenge(challengeForCompetency(competencyId)) });
>>>>>>> aed97a4 (feat: add coding challenges)
}
