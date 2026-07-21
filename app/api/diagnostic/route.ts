import { NextResponse } from "next/server";
import { apiErrorResponse } from "../../../lib/api/route-error";
<<<<<<< HEAD
import { diagnosticInputSchema, gradeDiagnostic } from "../../../lib/diagnostic/baseline";
import { getWorkspaceContext } from "../../../lib/workspace/context";
import { getActiveProject } from "../../../lib/workspace/repository";

export async function POST(request: Request) {
  const input = diagnosticInputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "VALIDATION_ERROR", message: "Answer each diagnostic question before continuing." }, { status: 400 });

  try {
    const result = gradeDiagnostic(input.data.answers);
    const context = await getWorkspaceContext();
    if (context.mode === "persistent") {
      const project = await getActiveProject(context);
      const saved = await context.supabase.from("diagnostic_runs").insert({
        user_id: context.userId,
        project_id: project.id,
        gap_vector: result.scores,
        question_bank_version: "baseline-v1",
      });
      // Deploying the app before its SQL migration should never block onboarding.
      // The result remains in the browser session until the migration is applied.
      if (saved.error && saved.error.code !== "42P01") throw saved.error;
    }
=======
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
>>>>>>> a0a457e (feat: add diagnostic, roadmap DAG, and multi-model consensus)
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
