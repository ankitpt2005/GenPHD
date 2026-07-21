import { NextResponse } from "next/server";
import { apiErrorResponse } from "../../../lib/api/route-error";
import { getWorkspaceContext } from "../../../lib/workspace/context";
import { getRoadmap, getSkillGapVector } from "../../../lib/workspace/repository";

export async function GET() {
  try {
    const context = await getWorkspaceContext();
    const gapVector = await getSkillGapVector(context);
    const milestones = await getRoadmap(context);
    return NextResponse.json({ milestones, gapVector });
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
