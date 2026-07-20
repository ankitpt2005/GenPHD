import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    id: "docuquery",
    name: "DocuQuery",
    outcome: "Source-grounded document Q&A",
    stack: ["Python", "FastAPI", "pgvector"],
    weeklyHours: 6,
    constraints: ["two-day deadline", "one retrieval flow", "portfolio-quality explanation"],
  });
}
