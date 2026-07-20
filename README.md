# GenPHD

GenPHD is an AI-powered learning companion that accelerates personalized human development through adaptive learning, trusted AI guidance, and continuously evolving skill roadmaps.

It is a decision-intelligence workspace for AI engineers: turn an active project question into an evidence-aware Decision Brief, a focused Build Mission, and updated learning evidence.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Current working flow

1. Open the first-run guide to understand the three core actions.
2. Ask a technical decision from the dashboard or Decisions view.
3. The API validates the request and returns a typed, source-aware Decision Brief.
4. Start the attached Build Mission.
5. Complete the mission to record `Practicing` skill evidence and advance the roadmap.

## Local API routes

| Route | Purpose |
|---|---|
| `POST /api/decisions` | Validates a question and returns a Decision Brief |
| `POST /api/missions/complete` | Records a mission outcome and returns skill evidence |
| `GET /api/projects/active` | Returns the active demo project |
| `GET /api/roadmap` | Returns current roadmap milestones |
| `GET /api/memory` | Returns visible memory items |

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and provide the Supabase keys.
3. Run `supabase/migrations/0001_genphd_core.sql` in the Supabase SQL editor.
4. Run `supabase/seed.sql` to load the shared competency and source catalog.

The schema includes user-scoped Row Level Security for projects, decisions, missions, reviews, skill evidence, and memory.

## AI provider boundary

`lib/decision/provider.ts` isolates Decision Brief generation behind one typed provider interface. The current deterministic provider is intentionally safe for local development and demo reliability. A live provider must return the same validated `DecisionBrief` schema and should be enabled only after `OPENAI_API_KEY` is configured.

## Verification

```powershell
npm run lint
npm run typecheck
npm run build
```
