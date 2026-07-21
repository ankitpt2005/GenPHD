# GenPHD — Build Status & Feature Tracker

> Living document. Updated as features land. "Vision" = the product brief:
> an AI learning companion (diagnostic → roadmap → challenges → streak/review),
> reframed around **multi-model consensus** ("ChatGPT, Claude, and Gemini disagree —
> we show where they agree/conflict and give one trusted next step, and remember it").

## Legend
✅ Done & verified · 🟡 Partial / in progress · ⬜ Not started

---

## Pillar status

### ✅ 1. Diagnostic assessment → skill-gap vector
Adaptive placement test across the 6 GenAI competencies (prompting, embeddings, vector DBs,
retrieval, agent frameworks, evals), producing a quantified skill-gap vector.
- Question bank (server-side keys): `lib/diagnostic/questions.ts`
- Deterministic ceiling scoring + LLM open-response grading: `lib/diagnostic/scoring.ts`, `lib/diagnostic/open-grader.ts`
- API: `GET/POST /api/diagnostic` (`app/api/diagnostic/route.ts`)
- UI: adaptive quiz + gap-vector summary (`components/onboarding-flow.tsx` → `DiagnosticFlow`)
- Persistence: `diagnostic_runs` + per-competency `skill_evidence` (`lib/workspace/repository.ts`, migration `0003`)

### ✅ 2. Personalized roadmap DAG
Gap-driven DAG of milestones in prerequisite order, ending at a shippable capstone artifact.
- Deterministic generator + DAG state logic: `lib/roadmap/generate.ts`
- LLM generation with validation + fallback: `lib/roadmap/provider.ts`
- Rendered with locked/now/next/later + capstone: `components/genphd-app.tsx` → `Roadmap`
- Persistence: roadmap columns on `build_missions` (`depends_on`, `sort_order`, `kind`), migration `0003`

### ✅ 3. Multi-model consensus (the differentiator)
Ask once, fan out to 3 models, show agreement/conflict, give one trusted next step, remember it.
- [x] `lib/consensus/types.ts` — ConsensusReport schema
- [x] `lib/consensus/provider.ts` — parallel fan-out to named models + analysis pass + graceful degrade (multi-model → single-model → deterministic)
- [x] `lib/ai/chat.ts` — `runOpenRouterModel` per-named-model helper (fan-out via OpenRouter)
- [x] `POST /api/consensus` + persistence (`consensus jsonb` on `decisions`, migration `0004`)
- [x] Consensus view: model panels + agreements + conflicts + one trusted next step (`components/genphd-app.tsx` → `Consensus`)
- [x] Remembered across sessions (persisted in `decisions.consensus`; surfaced via `GET /api/decisions`) and within-session via `genphd-consensus` sessionStorage
- Models configurable via `GENPHD_CONSENSUS_MODELS` (default GPT/Claude/Gemini); requires `OPENROUTER_API_KEY` for the live multi-model path, otherwise deterministic single-panel fallback.

### ⬜ 4. Streak + adaptive review
Daily streak, streak freezes, spaced repetition on missed concepts, "knowledge is N weeks stale" flag.
- [ ] Schema: `streaks`, `review_items` (spaced-repetition schedule), staleness metadata on `skill_evidence`
- [ ] Streak logic (increment, freeze, break) + daily nudge surface
- [ ] Spaced-repetition scheduler seeded from diagnostic misses
- [ ] Staleness flag driven by `source_versions` (`published_at`) vs recorded mastery date
- [ ] UI: streak widget, review queue, staleness banner
- Note: current copy says "progress is outcomes, not streaks" — revise when built (decision: add streaks per vision).

### ⬜ 5. Live coding challenges + AI grader
Auto-generated, framework-current challenges with an AI grader (not multiple choice).
- [ ] Challenge generator (per competency/milestone, framework-current)
- [ ] Code editor surface + submission
- [ ] AI grader (rubric-based; sandboxed execution is a later enhancement)
- [ ] Wire into `/challenges` (currently reskins the decision brief's next action)

---

## Cross-cutting / housekeeping
- [ ] Landing page → clearer entry into the app (diagnostic-first CTA)
- [x] Competency catalog aligned to the 6 vision dimensions (`lib/competencies.ts`, migration `0003`)
- [ ] Update README as each pillar lands

## How to run / verify
- Automated: `npm run typecheck && npm run lint && npm run test`
- Manual (no DB): `GENPHD_ALLOW_DEMO_MODE=true npm run dev` → sign up → onboarding → diagnostic → roadmap
- Supabase mode: run migrations `0001`→`0004` + `seed.sql`, then the same flow
- LLM paths (consensus, roadmap, grading): set `OPENROUTER_API_KEY` (or `GROQ_API_KEY`/`OPENAI_API_KEY`); all fall back deterministically without keys

## Next up
1. Streak + adaptive review (pillar 4) — decision made to add streaks per vision; revise the "not streaks" copy.
2. Live coding challenges + AI grader (pillar 5) — largest lift; rubric-based grading first, sandboxed execution later.
3. Landing page diagnostic-first CTA.

## Migrations
`0001` core · `0002` decision brief persistence · `0003` diagnostic + roadmap DAG · `0004` multi-model consensus
