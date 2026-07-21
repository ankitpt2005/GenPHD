import type { DiagnosticResult } from "../diagnostic/baseline";
import type { RoadmapMilestone } from "../workspace/contracts";

function capabilityScore(milestone: RoadmapMilestone, diagnostic: DiagnosticResult) {
  const text = `${milestone.competency} ${milestone.title} ${milestone.detail}`.toLowerCase();
  const match = diagnostic.scores.find((score) => {
    const key = score.id.replace("-", " ");
    return text.includes(key) || text.includes(score.label.toLowerCase().replace(" strategies", ""));
  });
  return match?.score ?? 60;
}

// Preserve the user's actual project milestones; only make the first suggested
// action reflect a demonstrated skill gap.
export function personalizeRoadmap(milestones: RoadmapMilestone[], diagnostic: DiagnosticResult) {
  return [...milestones]
    .map((milestone, index) => ({ milestone, index, score: capabilityScore(milestone, diagnostic) }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map(({ milestone }, index) => ({ ...milestone, state: index === 0 ? "now" as const : index === 1 ? "next" as const : "later" as const }));
}
