import { NextResponse } from "next/server";
import { getChallenge, toPublicChallenge } from "../../../lib/challenges/bank";

export function GET() {
  const challenge = getChallenge();
  return NextResponse.json({ challenge: challenge ? toPublicChallenge(challenge) : null });
}
