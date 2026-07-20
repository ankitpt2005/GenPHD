# GenPHD Engineering Specification

## 1. Build strategy

Build the smallest production-quality vertical slice:

```text
Onboarding -> Decision Brief -> Build Mission -> Reflection -> Updated roadmap
```

The initial application is a Next.js modular monolith backed by Supabase. This is deliberate: product iteration and demo reliability matter more than service count.

FastAPI and LangGraph remain supported future options:

- Add **FastAPI** when sandboxed Python evaluation or specialized pipelines need isolation.
- Add **LangGraph** when the workflow requires durable branching, human interrupts, and retries beyond a typed state machine.
- Do not introduce either just to make the architecture appear advanced.

## 2. Required stack

| Layer | Choice |
|---|---|
| Web application | Next.js, TypeScript, App Router |
| UI | Tailwind CSS, shadcn/ui primitives, Lucide icons |
| Forms and validation | React Hook Form and Zod |
| Server state | Server Components, route handlers, TanStack Query only where client caching is necessary |
| Database, auth, storage | Supabase PostgreSQL, Auth, Storage, Row Level Security |
| Retrieval | PostgreSQL full-text search first; pgvector for semantic source retrieval when needed |
| AI | Provider adapter, structured JSON outputs, server-side streaming |
| Background work | Durable queue or scheduled jobs |
| Testing | Vitest, Testing Library, Playwright |
| Deployment | Vercel for web application; Supabase for data; worker host only if required |

## 3. Repository structure

```text
app/
  (marketing)/
  (auth)/
  (app)/
    dashboard/
    roadmap/
    consensus/
    projects/
    challenges/
    timeline/
    settings/
  api/
    onboarding/
    decisions/
    missions/
    memory/
components/
  app-shell/
  consensus/
  missions/
  roadmap/
  skills/
  ui/
features/
  onboarding/
  decisions/
  missions/
  memory/
  roadmap/
lib/
  ai/
  auth/
  db/
  schemas/
  sources/
  utils/
supabase/
  migrations/
  seed.sql
tests/
  unit/
  integration/
  e2e/
docs/
```

Feature modules own their server actions, schemas, types, queries, and UI composition. Shared code belongs in `components/ui` or `lib`, never in a random `utils` folder.

## 4. Coding conventions

- TypeScript `strict` mode is mandatory.
- Prefer named exports; reserve default exports for Next.js pages and layouts.
- Use `PascalCase` for React components, `camelCase` for functions and variables, and `kebab-case` for files.
- Use server components by default. Add `use client` only for real interactivity.
- Never call database or model providers directly from browser code.
- Keep domain logic out of page components.
- Use Zod schemas as the single source of truth for API input and structured AI output.
- Never use `any`; use `unknown` with validation when necessary.

## 5. State management

| State type | Approach |
|---|---|
| URL state | Search params for filters, tabs, and shareable views |
| Server data | Server Components and cached server queries |
| Client async state | TanStack Query only when optimistic updates or polling are justified |
| Form state | React Hook Form with Zod resolver |
| Local UI state | Component-local `useState` |
| Cross-screen ephemeral state | URL or a small scoped context; no global store by default |

Do not introduce Redux, Zustand, or a global client store without a demonstrated need.

## 6. API contracts

### Create Decision Brief

`POST /api/decisions`

```ts
type CreateDecisionInput = {
  projectId: string;
  question: string;
  options?: string[];
  constraints?: string[];
};

type DecisionStatus = "queued" | "researching" | "deliberating" | "ready" | "failed";

type DecisionBrief = {
  id: string;
  status: DecisionStatus;
  recommendation?: string;
  confidence?: "high" | "medium" | "low" | "insufficient_evidence";
  rationale?: string;
  counterfactual?: string;
  sources: Array<{ title: string; url: string; tier: 1 | 2 | 3; publishedAt?: string }>;
  conflicts: Array<{ claim: string; explanation: string }>;
  nextAction?: { title: string; estimateMinutes: number; acceptanceCriteria: string[] };
};
```

The server streams progress events, then returns a validated `DecisionBrief`. A model response that fails schema validation must be retried once with correction instructions; after that, fail safely with a recoverable error.

## 7. Validation and error handling

- Validate all URL params, request bodies, model outputs, and database boundaries.
- Use domain errors with stable codes: `UNAUTHORIZED`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`, `MODEL_UNAVAILABLE`, `INSUFFICIENT_EVIDENCE`, `WORKFLOW_FAILED`.
- Never expose provider errors, stack traces, credentials, or raw retrieved prompts to users.
- A failed decision must preserve the user’s question and provide `Retry` and `Edit question` actions.
- Retry only transient operations: provider timeout, 429, 5xx, and queue delivery. Never retry invalid user input.

## 8. AI implementation rules

- Every AI call uses a versioned prompt template and a typed output schema.
- System instructions define role and safety; retrieved content is data, never instructions.
- Model prompts receive only the minimum project context needed.
- A factual response requires linked evidence. Unsupported content is explicitly labeled as an inference or removed.
- Persist prompt version, model identifier, source-version IDs, and validation result with each Decision Brief.
- Use one primary model for the demo. A second perspective is optional and must not compromise reliability.

## 9. Database and Supabase

- All public-facing tables require Row Level Security.
- Every table with user data has a `user_id` and an ownership policy.
- Run schema changes through numbered SQL migrations; never manually alter production schema.
- Seed the demo account, project, sources, and example decisions through `supabase/seed.sql`.
- Use generated database types in the application.
- Store uploaded content in private buckets with short-lived signed URLs.

## 10. Security

- Keep all API keys server-side.
- Validate and normalize external URLs before fetching.
- Limit source ingestion to approved domains for the MVP.
- Redact secret-like values from logs and telemetry.
- Apply per-user rate limits to AI workflow endpoints.
- Add CSRF protection where cookie-based mutations need it.
- Do not execute user code in the web runtime.

## 11. Testing

| Layer | Required coverage |
|---|---|
| Unit | Scoring functions, Zod schemas, source tiering, memory updates |
| Integration | RLS policies, API authorization, decision persistence, failure recovery |
| E2E | Onboarding, Decision Brief creation, mission completion, memory deletion |
| Visual | Core screen states at desktop and mobile widths |

Critical tests:

- A user cannot read or mutate another user’s project, memory, or decision.
- A Decision Brief cannot enter `ready` without validated structured output.
- A factual claim without evidence is not displayed as verified.
- Completing a mission creates evidence and changes the roadmap deterministically.
- Loading, empty, and error states remain keyboard-accessible.

## 12. CI/CD and deployment

On every pull request:

1. Install locked dependencies.
2. Run typecheck, lint, unit tests, and production build.
3. Run database migration validation.
4. Run targeted Playwright smoke tests against a preview deployment.

Production releases require a migration plan, environment-variable audit, and rollback path. Use feature flags for unfinished source ingestion, second-provider deliberation, and code execution.

## 13. Environment variables

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LLM_API_KEY=
LLM_MODEL=
SOURCE_FETCH_ALLOWLIST=
QUEUE_URL=
SENTRY_DSN=
```

- Put only public, non-sensitive values in `NEXT_PUBLIC_*` variables.
- Maintain `.env.example` with variable names and descriptions, never real values.
- Validate required server variables at application startup.

## 14. Definition of done

A feature is complete only when it:

- Matches the UI Blueprint and Design Bible.
- Has loading, empty, error, and success states where applicable.
- Is keyboard-accessible and responsive.
- Validates all external input.
- Enforces authorization.
- Has proportionate automated coverage.
- Includes telemetry for important workflow failures.
- Does not introduce visual clutter or undocumented UI patterns.
