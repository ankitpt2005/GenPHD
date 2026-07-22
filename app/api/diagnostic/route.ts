import { NextResponse } from "next/server";
import { apiErrorResponse } from "../../../lib/api/route-error";
import { competencyLabel } from "../../../lib/competencies";
import { gradeOpenResponses } from "../../../lib/diagnostic/open-grader";
import { diagnosticAnswersSchema, getPublicQuestionBank } from "../../../lib/diagnostic/questions";
import { gradeDiagnostic } from "../../../lib/diagnostic/scoring";
import { getWorkspaceContext } from "../../../lib/workspace/context";
import { persistDiagnostic } from "../../../lib/workspace/repository";

// Serve the question bank without answer keys.
export function GET() {
  return NextResponse.json({ competencies: getPublicQuestionBank(competencyLabel) });
}

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  const answers = diagnosticAnswersSchema.safeParse(payload ?? {});

  if (!answers.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Your diagnostic answers could not be read." },
      { status: 400 },
    );
  }

  try {
    const openScores = await gradeOpenResponses(answers.data);
    const gapVector = gradeDiagnostic(answers.data, openScores);
    const result = await persistDiagnostic(await getWorkspaceContext(), gapVector);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
