import { z } from "zod";
import { decisionBriefSchema } from "../decision/types";

export const missionStatusSchema = z.enum(["not_started", "in_progress", "completed", "skipped"]);

export const activeProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  outcome: z.string(),
  stack: z.array(z.string()),
  weeklyHours: z.number().int().positive(),
  constraints: z.array(z.string()),
});

export const roadmapMilestoneSchema = z.object({
  id: z.string(),
  state: z.enum(["now", "next", "later"]),
  title: z.string(),
  detail: z.string(),
  estimateMinutes: z.number().int().positive(),
  competency: z.string(),
});

export const memoryItemSchema = z.object({
  id: z.string(),
  scope: z.enum(["project", "learning", "decision", "profile"]),
  label: z.string(),
  value: z.string(),
  provenance: z.string(),
});

export const decisionStateSchema = z.object({
  brief: decisionBriefSchema,
  missionStatus: missionStatusSchema,
});

export type ActiveProject = z.infer<typeof activeProjectSchema>;
export type RoadmapMilestone = z.infer<typeof roadmapMilestoneSchema>;
export type MemoryItem = z.infer<typeof memoryItemSchema>;
export type DecisionState = z.infer<typeof decisionStateSchema>;
