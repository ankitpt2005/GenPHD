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

1. Start at the landing page, then sign up or sign in.
2. Complete onboarding to establish the active project context.
3. Take the adaptive diagnostic (or skip it). It produces a skill-gap vector across the six GenAI competencies and generates a personalized roadmap DAG that targets your weakest areas in prerequisite order and ends at a shippable capstone artifact.
4. Ask a technical decision from the dashboard or Decisions view; the API returns a typed, source-aware Decision Brief.
5. Start the attached Build Mission, complete it, and review the updated roadmap and learning evidence.

In demo mode, onboarding context is retained for the active browser session so the dashboard, project view, roadmap, and visible memory reflect the project just created. A configured Supabase workspace persists the same context privately for the signed-in user.

The primary product surfaces have canonical routes: `/onboarding`, `/diagnostic`, `/dashboard`, `/roadmap`, `/consensus`, `/projects`, `/challenges`, `/timeline`, `/memory`, and `/settings`. The public account, policy, support, and recovery routes are also available from the UI Blueprint.

## Local API routes

| Route | Purpose |
|---|---|
| `POST /api/decisions` | Validates a question and returns a Decision Brief |
| `POST /api/consensus` | Fans the question out to several models and returns a reconciled consensus report (agreements, conflicts, one next step) plus the grounded brief |
| `POST /api/onboarding` | Validates first-run project context and creates the active project |
| `GET /api/diagnostic` | Returns the adaptive placement questions (no answer keys) |
| `POST /api/diagnostic` | Grades answers into a skill-gap vector and generates the roadmap DAG |
| `GET /api/challenges` | Returns a framework-current coding challenge for a competency (no grading keys) |
| `POST /api/challenges/grade` | Grades a code submission against the challenge criteria (AI grader, heuristic fallback) and records evidence on a pass |
| `POST /api/missions/complete` | Records a mission outcome and returns skill evidence |
| `GET /api/projects/active` | Returns the active demo project |
| `GET /api/roadmap` | Returns current roadmap milestones and the latest skill-gap vector |
| `GET /api/memory` | Returns visible memory items |

## Supabase setup

1. Create a Supabase project and enable Email/password sign-in in **Authentication**.
2. Add `http://localhost:3000/auth/callback` to the project's allowed redirect URLs. Add the production equivalent before deployment.
3. Copy `.env.example` to `.env.local` and provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Run the migrations in order in the Supabase SQL editor: `0001_genphd_core.sql`, `0002_decision_brief_persistence.sql`, `0003_diagnostic_and_roadmap_dag.sql`, `0004_multi_model_consensus.sql`, `0005_coding_challenges.sql`.
5. Run `supabase/seed.sql` to load the shared competency and source catalog.
6. Configure a Cloudflare Turnstile widget for your local and production hostnames. Add its public site key as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
7. In Supabase **Authentication → Bot and Abuse Protection**, enable CAPTCHA, select **Cloudflare Turnstile**, and store the matching Turnstile secret there. Do not add that private key to the app.
8. Enable email confirmation in Supabase Auth and add `http://localhost:3000/auth/callback` plus the production callback URL to the allowed redirect URLs.
9. Restart the app and create an account from **Sign up**. Workspace routes are gated by verified Supabase claims and cannot be opened before authentication.

`GENPHD_ALLOW_DEMO_MODE` is `false` by default. Set it to `true` only for local, non-production exploration without Supabase; never enable it in a deployed environment.

The schema includes user-scoped Row Level Security for projects, decisions, decision options, claims, missions, reviews, skill evidence, and memory. The server always uses the signed-in user's session for workspace requests; it does not use the service role key for normal product flows.

## Deploy to Render

This repository includes a compact, multi-stage Docker deployment through `render.yaml`. It builds Next.js in standalone mode and ships only the traced production server and static assets—never local `node_modules`, `.next`, or `.env` files.

1. Push the repository, then create a **Blueprint** from `render.yaml` in Render. The service targets the Singapore region and exposes `/api/health` as its health check.
2. In Render, enter the prompted environment values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_SITE_URL`, and the AI-provider keys you intend to use. Keep `GENPHD_ALLOW_DEMO_MODE=false`.
3. Create a Cloudflare Turnstile widget in **Managed** mode. Add the Render hostname only (for example, `genphd.onrender.com`—no protocol, path, or port) and use a separate widget for local development.
4. Put the widget's **site key** in Render as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Put its **secret key only in Supabase** under **Authentication → Bot and Abuse Protection → CAPTCHA**; never place that secret in Render or this repository.
5. In Supabase **Authentication → URL Configuration**, set the Site URL to the Render HTTPS URL and add `https://your-render-host/auth/callback` to Redirect URLs. Enable email confirmation and the Email/password provider.

The server injects the browser-safe Supabase and Turnstile values at runtime. After changing them in Render, choose **Save and deploy**; secret values are never emitted to the browser.

## AI provider boundary

`lib/decision/provider.ts` isolates Decision Brief generation behind one typed provider interface. When `OPENROUTER_API_KEY` is set, GenPHD calls OpenRouter's multi-model auto router (`openrouter/auto-beta` by default) on the server. Groq is the next fallback when `GROQ_API_KEY` is set, followed by OpenAI when `OPENAI_API_KEY` is set. Each response is validated, merged with fixed source evidence, and rejected in favor of the next provider—or the deterministic Decision Brief—if malformed or unavailable. Keys are never sent to the browser.

`GENPHD_DECISION_PROVIDERS=openrouter,groq,openai` controls provider priority. `OPENROUTER_COST_QUALITY_TRADEOFF` accepts `0` (favor quality) through `10` (favor cost); the default is `6`. Set `OPENROUTER_MODEL`, `GROQ_MODEL`, or `OPENAI_MODEL` to a specific model when needed. OpenAI defaults to `gpt-5.6-sol`.

## Agent registry

The `.agents` folder is an active, versioned part of the Decision Brief system.
It defines three server-side reasoning contracts: a decision editor, an evidence
guardian, and a mission designer. `lib/decision/provider.ts` combines these
contracts in every live provider request, while schema validation and the
deterministic fallback keep the result safe and predictable.

## Verification

```powershell
npm run lint
npm run typecheck
npm run build
```
