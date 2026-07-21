import { describe, expect, it } from "vitest";
import { COMPETENCIES } from "../../lib/competencies";
import type { ActiveProject, SkillGapVector } from "../../lib/workspace/contracts";
import { computeMilestoneStates, generateRoadmap } from "../../lib/roadmap/generate";

const project: ActiveProject = {
  id: "p1",
  name: "DocuQuery",
  outcome: "Source-grounded document Q&A",
  stack: ["Python", "pgvector"],
  weeklyHours: 6,
  constraints: ["two-day deadline"],
};

function vector(scores: Partial<Record<string, number>>): SkillGapVector {
  return COMPETENCIES.map((competency) => {
    const score = scores[competency.id] ?? 50;
    return {
      competencyId: competency.id,
      label: competency.label,
      score,
      state: score < 40 ? "emerging" : score <= 75 ? "practicing" : "validated",
    };
  });
}

describe("deterministic roadmap generation", () => {
  it("targets only gap competencies, in prerequisite order, ending in one capstone", () => {
    const milestones = generateRoadmap(project, vector({ embeddings: 20, retrieval: 30, prompting: 95, "vector-dbs": 90, "agent-frameworks": 90, evals: 90 }));
    const nonCapstone = milestones.filter((milestone) => milestone.kind === "milestone");

    expect(nonCapstone.map((milestone) => milestone.competencyId)).toEqual(["embeddings", "retrieval"]);
    expect(milestones.filter((milestone) => milestone.kind === "capstone")).toHaveLength(1);
    expect(milestones.at(-1)?.kind).toBe("capstone");
  });

  it("produces a valid DAG: dependencies reference earlier slugs and the capstone depends on all milestones", () => {
    const milestones = generateRoadmap(project, vector({ prompting: 10, evals: 10 }));
    const slugs = new Set<string>();
    for (const milestone of milestones) {
      for (const dependency of milestone.dependsOn) expect(slugs.has(dependency)).toBe(true);
      slugs.add(milestone.slug);
    }
    const capstone = milestones.at(-1);
    expect(capstone?.dependsOn).toEqual(milestones.slice(0, -1).map((milestone) => milestone.slug));
  });

  it("always yields at least one milestone even when everything is mastered", () => {
    const milestones = generateRoadmap(project, vector({ prompting: 90, embeddings: 90, "vector-dbs": 90, retrieval: 90, "agent-frameworks": 90, evals: 90 }));
    expect(milestones.length).toBeGreaterThanOrEqual(2); // one focus milestone + capstone
  });
});

describe("computeMilestoneStates", () => {
  it("locks milestones until their dependencies complete", () => {
    const items = [
      { key: "a", dependsOn: [] },
      { key: "b", dependsOn: ["a"] },
      { key: "cap", dependsOn: ["a", "b"] },
    ];
    const fresh = computeMilestoneStates(items, new Set());
    expect(fresh).toEqual({ a: "now", b: "locked", cap: "locked" });

    const afterA = computeMilestoneStates(items, new Set(["a"]));
    expect(afterA).toEqual({ b: "now", cap: "locked" });

    const afterAB = computeMilestoneStates(items, new Set(["a", "b"]));
    expect(afterAB).toEqual({ cap: "now" });
  });
});
