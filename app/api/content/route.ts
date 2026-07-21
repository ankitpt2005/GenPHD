import { NextResponse } from "next/server";
import { apiErrorResponse } from "../../../lib/api/route-error";
import { contentWriterInputSchema, createContentDraft } from "../../../lib/content/writer";
import { getWorkspaceContext } from "../../../lib/workspace/context";

export async function POST(request: Request) {
  const payload: unknown = await request.json().catch(() => null);
  const input = contentWriterInputSchema.safeParse(payload);

  if (!input.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: input.error.issues[0]?.message ?? "Invalid content request." },
      { status: 400 },
    );
  }

  try {
    await getWorkspaceContext();
    return NextResponse.json(await createContentDraft(input.data));
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
