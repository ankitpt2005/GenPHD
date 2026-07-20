# GenPHD Hackathon Bible

## 1. The only story to tell

AI engineers do not primarily need another chatbot. They need help turning conflicting, fast-changing AI advice into the right next engineering action for their project.

**GenPHD is the decision intelligence layer for AI engineers.** It grounds a recommendation in evidence and user context, exposes uncertainty, turns the answer into an action, and learns from the result.

Do not lead with a feature list. Do not lead with "we use multiple AI models." Lead with a painful decision and a visible outcome.

## 2. Opening hook

> "Every AI engineer has lost hours asking the same question in different tabs: ChatGPT says use agents, a tutorial says use a framework, the documentation says something else. GenPHD does not give you another answer. It gives you the evidence-backed next action for your project—and gets smarter from what happens next."

## 3. Five-minute live demo

### Scenario

Maya is building a RAG portfolio app. She has two days, knows Python, and needs to decide whether to use LangGraph or a simple application workflow.

### Script and timing

| Time | Presenter action | What judges should understand |
|---:|---|---|
| 0:00–0:35 | State Maya’s goal, time limit, project, and blocker. | GenPHD is project-aware, not a generic chat. |
| 0:35–1:05 | Show the concise roadmap and today’s focus. | Learning is anchored in an actual outcome. |
| 1:05–2:20 | Ask the decision question. Stream context, evidence review, and tradeoff analysis. | The system follows a deliberate reasoning workflow. |
| 2:20–3:10 | Reveal the Decision Brief: recommendation, citations, conflict, confidence, and counterfactual. | It is evidence-backed decision support, not a model vote. |
| 3:10–4:00 | Start the Build Mission: add five evaluation examples and trace retrieval quality. | Every answer produces an executable action. |
| 4:00–4:40 | Mark the mission complete using a prepared but genuine outcome. | Reflection updates learning evidence. |
| 4:40–5:00 | Show the roadmap changing and the decision recorded in the timeline. | The product has memory and a compounding loop. |

## 4. What must be real

- A working user flow from onboarding to Decision Brief to mission completion.
- A real structured-model response.
- Real, curated source documents with visible URLs and dates.
- Actual source-to-claim links in the Decision Brief.
- A real memory update and resulting roadmap change.

## 5. What may be prepared, with disclosure

- A seeded demonstration project and user profile.
- A curated source snapshot rather than an internet-wide live crawler.
- A prewritten fallback response if an external provider is unavailable.
- A recorded result from a completed Build Mission.

Never call prepared output “live.” Never present fabricated provider opinions, citations, or source freshness as real.

## 6. Product explanation in 30 seconds

> "GenPHD takes a developer’s goal, project, and constraints; retrieves current technical evidence; compares the real tradeoffs; and returns one transparent recommendation with a next build action. When the developer completes that action, GenPHD records the outcome and changes their roadmap. It is a decision loop, not another AI chat."

## 7. Architecture explanation in 30 seconds

> "The app is a focused workflow. Context Builder retrieves the project and learning history. Evidence Retriever gets current trusted sources. Parallel deliberation examines the options. A Claim Adjudicator links conclusions to evidence and identifies uncertainty. The Action Composer creates a Build Mission, and Reflection updates memory and the roadmap. Freshness is a background pipeline, not a theatrical agent."

## 8. Why the AI use is meaningful

| Superficial AI pattern | GenPHD behavior |
|---|---|
| Chat response | Structured decision workflow |
| Model majority vote | Evidence and constraint-weighted recommendation |
| Generic learning plan | Project-specific next action |
| Static memory | Outcome-driven updates |
| Long reasoning text | Inspectable claims, sources, conflicts, and counterfactuals |

## 9. Competitive positioning

| Category | What it misses | GenPHD answer |
|---|---|---|
| General AI assistant | A durable, accountable decision record | Project-aware Decision Brief plus outcome loop |
| Research assistant | The step from sources to technical action | Recommendation matched to time, stack, and project goal |
| Course platform | Real-time project constraints | Dynamic learning from active work |
| Coding copilot | Upstream architecture choice and downstream learning evidence | Decides what to build and what capability to strengthen |

## 10. Questions judges may ask

### "Why not ask ChatGPT or Claude?"

General assistants answer a turn. GenPHD remembers the project, exposes evidence and uncertainty, records the decision, converts it into a build task, and learns from the result.

### "Is multi-model consensus actually trustworthy?"

No model majority is automatically trustworthy. GenPHD treats multiple perspectives as inputs; source quality, freshness, project constraints, and explicit conflict analysis determine confidence.

### "What is defensible?"

Not the model calls. The defensible asset is a user-controlled history of project decisions, outcomes, capabilities, and calibrated recommendations. It becomes increasingly useful as the user builds.

### "Why does this need agents?"

It does not need a swarm of agents. It needs a controlled workflow that retrieves evidence, deliberates, acts, and reflects. The value is the closed loop.

### "How do you prevent hallucinations?"

Factual claims require source links. Unsupported claims are labeled as inferences or omitted. The system can return insufficient evidence rather than inventing confidence.

### "How does this make someone a better engineer?"

It measures practical evidence: completed missions, explanation quality, project artifacts, and unseen transfer tasks—not only time spent or quiz completion.

### "How do you scale source freshness?"

Whitelisted source feeds are ingested asynchronously, versioned, and only trigger a reevaluation when they affect an active decision or project.

## 11. Failure recovery

| Failure | Recovery |
|---|---|
| Model latency | Stream each completed stage and transition to an already-created decision snapshot. |
| Provider outage | Use a clearly labeled, precomputed fallback Decision Brief with real source cards. |
| Source fetch failure | Show cached, versioned source results and timestamp them. |
| Demo database issue | Use seeded local/demo account and a read-only backup route. |
| Network failure | Switch to a short screen recording only after explaining that it is a fallback. |

Rehearse the fallback. A calm recovery is more convincing than a fragile live integration.

## 12. Presentation structure

Use six slides maximum:

1. The problem: conflicting AI advice creates decision fatigue.
2. The insight: consensus is not trust; evidence plus context is.
3. The live demo.
4. The Decision Loop architecture.
5. The compounding advantage: memory, outcomes, and calibrated learning evidence.
6. The future: the trusted decision record for AI engineers.

## 13. Video script

For a 90-second submission video:

1. 0–15 sec: hook with the three-tab conflict problem.
2. 15–35 sec: show Maya’s project and question.
3. 35–60 sec: show Decision Brief, sources, conflict, and recommendation.
4. 60–78 sec: show Build Mission completion.
5. 78–90 sec: show memory and roadmap update, then tagline.

Voiceover should describe outcomes, not interface controls.

## 14. Business model

### Initial

Free single-project workspace with limited Decision Briefs. Paid individual tier for persistent projects, advanced evidence history, source integrations, and portfolio evidence.

### Later

Sell cohort and team plans to AI bootcamps, developer education programs, and AI engineering teams that want shared decision records.

## 15. Future vision

GenPHD can become a personal engineering decision record: the place where an AI engineer’s context, choices, evidence, architecture rationale, learning trajectory, and project outcomes compound over time.

## 16. Why OpenAI

Use OpenAI as the primary reasoning layer for structured Decision Brief generation, evidence synthesis, and adaptive Build Missions. The hackathon story is strongest when the product demonstrates disciplined AI behavior: structured outputs, source-aware reasoning, explicit uncertainty, and an outcome-driven feedback loop—not merely a chat wrapper.

## 17. Final pitch

> "GenPHD is the decision intelligence layer for AI engineers. It turns conflicting AI advice into an evidence-backed next build action, remembers the outcome, and continuously improves the engineer behind the project."
