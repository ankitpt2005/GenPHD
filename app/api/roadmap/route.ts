import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    milestones: [
      { id: "evaluate", state: "now", title: "Evaluate the retrieval pipeline", estimateMinutes: 45 },
      { id: "trace", state: "next", title: "Add source-grounded answer traces", estimateMinutes: 90 },
      { id: "orchestrate", state: "later", title: "Introduce workflow state only if needed", estimateMinutes: 120 },
    ],
  });
}
