# GenPHD

### Decision intelligence for AI engineers

**GenPHD turns a scattered technical question into one evidence-backed next move — then remembers what the project learned.**

[Open the live product](https://genphd.onrender.com) · [See the product requirements](docs/01-product-requirements.md) · [Read the architecture](docs/03-system-design.md)

---

## Why GenPHD

AI engineers rarely lack advice. They lack a reliable way to decide **what to trust, what to build next, and what evidence to carry forward**.

GenPHD is not another chat window or a generic dashboard. It is a private workspace that connects:

1. **Project context** — outcome, stack, constraints, time, and blocker.
2. **Decision intelligence** — an evidence-aware brief with trade-offs, conflicts, and a bounded next action.
3. **Deliberate practice** — a roadmap, build mission, and coding challenge that turn advice into proof of capability.
4. **Learning memory** — a traceable record that improves the next decision instead of rewarding streaks.

> **One question → one trusted recommendation → one buildable mission → durable learning evidence.**

## Product loop

| Step | What the engineer does | What GenPHD delivers |
| --- | --- | --- |
| 1. Frame the work | Describe the project, stack, available time, and current blocker. | A private project context. |
| 2. Diagnose the gap | Take a short adaptive baseline across six GenAI competencies. | A skill-gap vector and prerequisite-aware roadmap. |
| 3. Ask a decision | Ask a real question such as *“Should I use pgvector or Pinecone for this RAG project?”* | A Decision Brief with evidence, trade-offs, conflicts, confidence, and a next move. |
| 4. Compare perspectives | Request consensus for higher-stakes choices. | Multi-model agreements, disagreements, and one reconciled next step. |
| 5. Build proof | Complete a focused mission or practical coding challenge. | Recorded completion and competency evidence. |
| 6. Continue with context | Return to the dashboard, roadmap, or memory. | A workspace that remembers what changed and why. |

## What makes it different

| Capability | GenPHD approach |
| --- | --- |
| Decision support | Structured briefs, not unbounded chatbot replies. Every recommendation exposes its evidence and trade-off. |
| Personalization | Roadmaps are shaped by project constraints and diagnostic gaps, not a fixed course sequence. |
| Multi-model consensus | Configured models are fanned out and reconciled into agreements, conflicts, and a trusted next step. |
| Skill evidence | Progress is tied to missions and practical work, not engagement metrics or streaks. |
| Memory | Project context, decisions, and evidence remain visible and scoped to the active workspace. |
| Safe fallback | AI flows degrade from multi-model → single model → deterministic guidance when a provider is unavailable. |

## Architecture

```mermaid
flowchart LR
    U[AI engineer] --> W[Next.js workspace]
    W --> A[Secure API layer]

    A --> P[Project context]
    A --> D[Decision engine]
    A --> G[Diagnostic + roadmap engine]
    A --> C[Coding challenge grader]

    D --> M[Consensus reconciler]
    M --> AI[OpenAI / OpenRouter / Groq]
    D --> AI
    C --> AI

    A --> S[(Supabase Postgres)]
    S --> R[RLS-scoped projects, decisions, missions, memory]

    U --> T[Cloudflare Turnstile]
    T --> A
    U --> AU[Supabase Auth]
    AU --> A
```

### Trust boundary

- **Supabase Auth** verifies sessions on the server; workspace routes are not available before authentication.
- **Row Level Security** scopes projects, decisions, roadmaps, missions, diagnostic runs, and memory to the signed-in user.
- **Cloudflare Turnstile** protects sign-up and sign-in; its secret stays in Supabase Auth, never in this repository.
- **Provider keys are server-only.** The browser never receives OpenAI, OpenRouter, or Groq credentials.
- **AI output is schema-validated** before being shown or persisted. Invalid provider responses fall back safely.

## Judge walkthrough

The shortest way to evaluate the product:

1. Visit the [live app](https://genphd.onrender.com) and choose **Start one project**.
2. Create an account, verify the email link, then sign in through the protected authentication flow.
3. Complete onboarding with a real AI project and its constraints.
4. Run the diagnostic, or skip it to inspect the default starter path.
5. From **Dashboard**, ask a technical decision. Review the evidence, trade-off, confidence, and attached mission.
6. Open **My roadmap** to see the ordered learning path, then **Build missions** or **Coding challenges** to produce evidence.
7. Open **Learning memory** to see the project context and decision history that influence the next recommendation.

## Workspace surfaces

| Surface | Purpose |
| --- | --- |
| Dashboard | Answers: **“What should I do today?”** |
| My roadmap | Answers: **“What should I learn next?”** |
| Decisions | Answers: **“What should I trust?”** |
| My project | Keeps scope, stack, time, and constraints visible. |
| Build missions | Turns a decision into a small, testable action. |
| Coding challenges | Lets users submit practical code and receive criterion-based grading. |
| Progress | Records meaningful work, not activity noise. |
| Learning memory | Shows the context and evidence shaping future decisions. |

## Tech stack

- **Frontend:** Next.js 16, React, TypeScript, CSS
- **Authentication and database:** Supabase Auth + Postgres + Row Level Security
- **AI orchestration:** typed provider boundary for OpenAI, OpenRouter, and Groq
- **Bot protection:** Cloudflare Turnstile with server-validated Supabase sessions
- **Validation:** Zod schemas, unit tests, typed API contracts
- **Deployment:** compact multi-stage Docker image on Render

## Run locally

### Prerequisites

- Node.js 22+
- A Supabase project for private workspaces
- A Cloudflare Turnstile widget for authentication protection
- At least one AI provider key for live AI generation (OpenAI, OpenRouter, or Groq)

```powershell
git clone https://github.com/ankitpt2005/GenPHD.git
cd GenPHD
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required configuration

Set the following values in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public browser key from Supabase |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public Cloudflare Turnstile widget key |
| `NEXT_PUBLIC_SITE_URL` | Local or deployed application URL |
| `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, or `GROQ_API_KEY` | At least one server-only AI provider key |

Never commit `.env.local`, provider keys, database passwords, or Turnstile secrets.

### Database setup

1. Create a Supabase project and enable **Email/password** authentication.
2. Add `http://localhost:3000/auth/callback` to Supabase Auth redirect URLs.
3. Apply the migrations in [`supabase/migrations`](supabase/migrations) in numeric order.
4. Run [`supabase/seed.sql`](supabase/seed.sql) to load the competency and source catalog.
5. Enable Cloudflare Turnstile in **Supabase Auth → Bot and Abuse Protection**. Store the matching Turnstile secret there, not in application code.

`GENPHD_ALLOW_DEMO_MODE` is deliberately `false` by default. It can be enabled only for local, non-production exploration without Supabase.

## API highlights

| Endpoint | Responsibility |
| --- | --- |
| `POST /api/onboarding` | Validates and creates project context + initial roadmap. |
| `GET/POST /api/diagnostic` | Serves adaptive questions and persists the skill-gap result. |
| `POST /api/decisions` | Produces a validated, source-aware Decision Brief. |
| `POST /api/consensus` | Reconciles multiple model perspectives into one decision report. |
| `GET /api/challenges` | Returns a competency-relevant coding challenge without grading keys. |
| `POST /api/challenges/grade` | Grades a submitted solution and records evidence on a pass. |
| `POST /api/missions/complete` | Records a completed mission and updates learning evidence. |
| `GET /api/memory` | Returns the visible, project-scoped memory used by the workspace. |
| `GET /api/health` | Deployment health check. |

## Verify before shipping

```powershell
npm run typecheck
npm test
npm run build
```

## Deployment

The repository includes [`render.yaml`](render.yaml) and a small multi-stage [`Dockerfile`](Dockerfile). Render builds the standalone Next.js server and only ships traced production assets—never local `.env`, `.next`, or `node_modules`.

For a production deploy, set the Supabase public values, Turnstile site key, public site URL, and server-only provider keys in Render. Keep `GENPHD_ALLOW_DEMO_MODE=false`, then add the deployed `/auth/callback` URL to Supabase Auth redirect URLs.

---

Built for engineers who want a clearer next move—not another tab full of advice.
