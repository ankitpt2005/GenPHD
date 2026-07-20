import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    items: [
      { id: "goal", scope: "project", label: "Active project", value: "DocuQuery — source-grounded document Q&A" },
      { id: "constraint", scope: "project", label: "Project constraint", value: "Two-day milestone with one retrieval flow" },
      { id: "skill", scope: "learning", label: "RAG evaluation", value: "Emerging" },
    ],
  });
}
