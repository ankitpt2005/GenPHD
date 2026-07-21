import { NextResponse } from "next/server";
import { apiErrorResponse } from "../../../lib/api/route-error";
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
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
