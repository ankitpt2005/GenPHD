import { NextResponse } from "next/server";
import { apiErrorResponse } from "../../../lib/api/route-error";
import { getWorkspaceContext } from "../../../lib/workspace/context";
import { getMemoryItems } from "../../../lib/workspace/repository";

export async function GET() {
  try {
    return NextResponse.json({ items: await getMemoryItems(await getWorkspaceContext()) });
  } catch (error) {
    const response = apiErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
