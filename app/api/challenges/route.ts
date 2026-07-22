import { NextResponse } from "next/server";
import { isCompetencyId } from "../../../lib/competencies";
import { challengeForCompetency, toPublicChallenge } from "../../../lib/challenges/bank";

// Serve a framework-current coding challenge for a competency (defaults sensibly).
// The grading `signals` are stripped — only the public challenge is returned.
export function GET(request: Request) {
  const competency = new URL(request.url).searchParams.get("competency") ?? "";
  const competencyId = isCompetencyId(competency) ? competency : "retrieval";
  return NextResponse.json({ challenge: toPublicChallenge(challengeForCompetency(competencyId)) });
}
