# GenPHD System Design

## 1. Architecture decision

Start with a **modular monolith**, not microservices.

The MVP has one product workflow, a small team, and a high need for fast iteration. Separating the frontend, API gateway, agent service, memory service, and freshness service on day one would add operational cost without improving the user experience.

Split a service only when there is a measured reason:

- A secure Python code-evaluation runtime is needed.
- Long-running ingestion jobs require isolated scaling.
- A subsystem has an independent deployment or security boundary.

## 2. Logical architecture

```text
Next.js application
  - App shell and product UI
  - Auth-aware server routes
  - Decision workflow orchestrator
  - Retrieval and source-validation module
  - Memory and roadmap services
  - Streaming response adapter

Supabase / PostgreSQL
  - Product data and row-level security
  - pgvector source retrieval when justified
  - Auth, storage, and realtime notifications

Background worker / queue
  - Source ingestion and versioning
  - Embedding jobs
  - Decision follow-up jobs
  - Notification scheduling

Optional Python service, post-MVP
  - Sandboxed code evaluation and specialized analysis
```

## 3. AI workflow

The product uses a controlled workflow, not an unconstrained autonomous agent.

### 3.1 Decision workflow

1. **Context Builder** loads active project, goals, constraints, prior decisions, and relevant skill evidence.
2. **Decision Router** classifies the request as a decision, research request, mission request, or ordinary product question.
3. **Evidence Retriever** searches the approved source corpus and project context.
4. **Parallel Deliberation** creates independent option analyses using distinct evaluation lenses.
5. **Claim Adjudicator** maps conclusions to evidence, detects conflicts, identifies uncertainty, and constructs a structured Decision Brief.
6. **Action Composer** creates the next Build Mission.
7. **Reflection Evaluator** updates outcomes, skill evidence, memory, and roadmap priority after the user acts.

### 3.2 What is not an agent

- Memory persistence and retrieval are services.
- Roadmap recalculation is a service.
- Source freshness is a scheduled pipeline.
- Challenge generation is a constrained action-template workflow.

Use LangGraph only if durable stateful branching, retry, and human-interruption handling becomes valuable. The initial implementation may use typed workflow functions and a persisted job state machine.

## 4. Consensus / Decision Intelligence Engine

### Input contract

```json
{
  "question": "Should I use LangGraph for this two-day RAG project?",
  "options": ["LangGraph", "simple application workflow"],
  "constraints": ["two-day deadline", "single retrieval flow", "Python"],
  "project_id": "uuid"
}
```

### Processing rules

- Resolve the user’s real decision before researching.
- Retrieve evidence before model deliberation.
- Extract atomic claims, such as support, limitation, cost, or implementation risk.
- Separate factual disagreement from value tradeoffs and missing context.
- Weight source quality, recency, project relevance, and constraint fit above model count.
- Require the final output to expose uncertainty and a counterfactual condition.
- Return `insufficient_evidence` when no defensible recommendation is possible.

### Source tiers

| Tier | Source type | Default treatment |
|---|---|---|
| 1 | Official documentation, release notes, API references | Preferred factual support |
| 2 | Maintainer repositories, issue discussions, technical papers | Supporting implementation context |
| 3 | Reputable practitioner articles and benchmarks | Context only; corroborate when consequential |
| 4 | Unsourced social posts or generic AI output | Never use as factual authority |

## 5. Memory design

### Memory classes

| Class | Examples | Retention |
|---|---|---|
| Explicit profile | goal, time budget, preferred stack | User-managed, persistent |
| Project memory | architecture, decisions, artifacts | Per-project, user-managed |
| Learning evidence | mission outcome, assessment result, review | Versioned and decays without evidence |
| Working context | current chat or temporary draft | Short-lived unless explicitly saved |
| Sensitive data | secrets, credentials, unrelated personal data | Do not persist |

### Memory rules

- Each memory item includes source, timestamp, scope, confidence, and user visibility.
- User-provided facts are distinct from model inference.
- Inferences expire or require verification.
- Users can edit, delete, export, and inspect all stored persistent memory.
- Do not infer a fixed "learning style" or store raw code by default.

## 6. Data model

### Core tables

| Table | Purpose |
|---|---|
| `profiles` | User profile and explicit preferences |
| `projects` | Active project, goal, stack, and constraints |
| `roadmap_milestones` | Ordered next capabilities and outcomes |
| `competencies` | Canonical skills taxonomy |
| `skill_evidence` | Timestamped, source-backed capability evidence |
| `decisions` | Decision question, status, recommendation, confidence |
| `decision_options` | Options considered and rank rationale |
| `claims` | Atomic factual or evaluative statements |
| `sources` | Canonical source identity and trust tier |
| `source_versions` | Retrieved version, publication date, checksum, freshness |
| `claim_evidence` | Claim-to-source links and support classification |
| `build_missions` | Action, acceptance criteria, due date, outcome |
| `mission_reviews` | Reflection and evaluator output |
| `memory_items` | User-visible persistent memories |
| `conversations` | Thread metadata and selectively persisted messages |
| `notifications` | Relevant, user-actionable product notices |
| `jobs` | Durable background job state |

### Key constraints

- `projects.user_id`, `decisions.user_id`, and all child records use row-level security.
- A decision snapshot is immutable after completion; revisions create a linked version.
- Source version data is immutable; a later retrieval creates a new version.
- `skill_evidence` is append-only; displayed competency state is a calculated projection.

## 7. APIs

All APIs require authenticated user context except public marketing routes. Use typed request and response schemas with Zod at the boundary.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/onboarding` | Create profile, project, and initial roadmap |
| `GET/POST` | `/api/projects` | List or create projects |
| `GET/PATCH` | `/api/projects/:id` | Read or update project context |
| `POST` | `/api/decisions` | Start a Decision Brief workflow |
| `GET` | `/api/decisions/:id` | Read streamed or completed decision |
| `POST` | `/api/decisions/:id/feedback` | Record usefulness or decision outcome |
| `POST` | `/api/missions` | Create a Build Mission |
| `POST` | `/api/missions/:id/complete` | Submit outcome and reflection |
| `GET` | `/api/roadmap` | Return next milestones and evidence |
| `GET/PATCH/DELETE` | `/api/memory/:id` | Inspect, edit, or delete memory |
| `GET` | `/api/timeline` | Return decision and learning history |
| `GET/PATCH` | `/api/settings` | Manage preferences and privacy |

## 8. Knowledge freshness pipeline

Freshness is a background pipeline, not an interactive agent.

1. Fetch a whitelisted source or release feed.
2. Normalize source content and metadata.
3. Detect content and version changes.
4. Store a new `source_version`.
5. Embed chunks only when content changed.
6. Find active decisions or projects affected by the change.
7. Queue a user notification only when the change materially affects a recommendation.

For the hackathon, use a curated static corpus with visible source dates. Do not falsely imply continuous live monitoring.

## 9. Queue, caching, and streaming

- Put ingestion, embedding, long decision evaluation, and notification delivery on a durable queue.
- Cache source retrieval results by normalized query, source version, and project scope.
- Never cache a final recommendation across projects without reapplying user constraints.
- Stream decision progress as user-readable phases: `Understanding your constraints`, `Reviewing current evidence`, `Comparing tradeoffs`, `Preparing a recommendation`.
- Store intermediate workflow state to support retry and recovery.

## 10. Security and authorization

- Use Supabase Auth and database row-level security.
- Verify ownership on every server-side query; do not trust client-provided user IDs.
- Encrypt secrets at rest and never include them in LLM prompts, logs, or traces.
- Apply prompt-injection defenses to ingested content: treat retrieved text as untrusted data, never as system instructions.
- Scan uploads and reject executable or unsupported file types in MVP.
- Provide account deletion and data export flows.

## 11. Observability and scaling

### Required telemetry

- Request ID, workflow state, model latency, retrieval latency, token/cost estimate, source count, validation failures, retries, and user-visible error state.
- Structured logs must redact user content, secrets, and authorization tokens.
- Track decision quality separately from model response length or chat volume.

### Scale path

1. Start with one application deployment, managed database, and managed queue.
2. Move ingestion workers independently when source jobs become noisy.
3. Add a secure Python evaluation service only when code review needs executable validation.
4. Introduce provider fallbacks only after a consistent decision schema and source validation layer exist.
