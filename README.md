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

1. Create a Supabase project and enable Email (magic-link) sign-in in **Authentication**.
2. Add `http://localhost:3000/auth/callback` to the project's allowed redirect URLs. Add the production equivalent before deployment.
3. Copy `.env.example` to `.env.local` and provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Run `supabase/migrations/0001_genphd_core.sql`, then `supabase/migrations/0002_decision_brief_persistence.sql`, in the Supabase SQL editor.
5. Run `supabase/seed.sql` to load the shared competency and source catalog.
6. Restart the app and use **Sign in** to create a private workspace. The app remains in demo mode until both public Supabase values are configured.

The schema includes user-scoped Row Level Security for projects, decisions, decision options, claims, missions, reviews, skill evidence, and memory. The server always uses the signed-in user's session for workspace requests; it does not use the service role key for normal product flows.

## AI provider boundary

`lib/decision/provider.ts` isolates Decision Brief generation behind one typed provider interface. When `OPENROUTER_API_KEY` is set, GenPHD calls OpenRouter's multi-model auto router (`openrouter/auto-beta` by default) on the server. When `GROQ_API_KEY` is also set, Groq is the next fallback. Each response is validated, merged with fixed source evidence, and rejected in favor of the next provider—or the deterministic Decision Brief—if malformed or unavailable. Keys are never sent to the browser.

`GENPHD_DECISION_PROVIDERS=openrouter,groq` controls provider priority. `OPENROUTER_COST_QUALITY_TRADEOFF` accepts `0` (favor quality) through `10` (favor cost); the default is `6`. Set `OPENROUTER_MODEL` or `GROQ_MODEL` to a specific model when needed.

## Verification

```powershell
npm run lint
npm run typecheck
npm run build
```
