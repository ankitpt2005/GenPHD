# GenPHD Build Prompt for Codex

Copy this prompt into a fresh implementation task before building the product.

---

You are implementing **GenPHD**, the decision intelligence layer for AI engineers.

Before changing code, read these documents completely and treat them as the source of truth, in this order:

1. `docs/01-product-requirements.md`
2. `docs/02-design-system-ux-bible.md`
3. `docs/03-system-design.md`
4. `docs/04-engineering-specification.md`
5. `docs/05-hackathon-bible.md`
6. `docs/06-ui-blueprint.md`

## Product objective

Build the smallest compelling Decision Loop:

```text
Onboarding -> Decision Brief -> Build Mission -> Reflection -> Updated roadmap
```

GenPHD is not an AI tutor, generic chatbot, analytics dashboard, or multi-agent theatre. The product helps an AI builder make an evidence-backed technical decision, take the next action, and learn from the outcome.

## Non-negotiable product rules

- Every substantial recommendation must show evidence, uncertainty, and one clear next action.
- Model agreement is not truth. Evidence quality, recency, user constraints, and conflict analysis determine confidence.
- Memory is visible, user-controlled, scoped, and never silently profiles the user.
- Source freshness is a background concern; do not build a freshness dashboard.
- Use the modular-monolith MVP architecture unless an approved requirement justifies a service split.
- Do not add features outside the documents without first flagging the conflict and asking for direction.

## Non-negotiable design rules

- Implement the UI Blueprint exactly. Never invent an extra screen, dashboard widget, chart, card, badge, gradient, or navigation item.
- Use the monochrome Design Bible tokens. No blue or purple gradients, neon, glassmorphism, gamification, or SaaS-template layouts.
- Every page answers one question and has one clear primary action.
- Use whitespace and hierarchy before cards. Do not wrap every section in a card.
- Build loading, empty, error, success, keyboard, focus, and responsive states along with each surface.
- Do not expose an agent-control dashboard. Show simple user-readable workflow status only.

## Engineering rules

- Use Next.js, TypeScript strict mode, Tailwind, shadcn/ui primitives, Supabase, Zod, and typed server-side AI calls as defined in the Engineering Specification.
- Keep secrets and provider calls server-side.
- Use Row Level Security and authorization checks for all user data.
- Use structured AI output validated by Zod; never render unvalidated model JSON.
- Use server components by default and avoid global state libraries unless justified.
- Implement routes, schemas, database migrations, tests, and error handling alongside features.
- Use FastAPI or LangGraph only when the specified implementation phase requires it.

## Build sequence

1. Create the app shell, typography, color tokens, navigation, and responsive foundation.
2. Implement authentication and the onboarding flow.
3. Implement the project model and initial roadmap.
4. Implement the Decision Brief workflow with seeded sources and typed responses.
5. Implement Build Mission creation and completion.
6. Implement memory, timeline, and the deterministic roadmap update.
7. Implement the designated loading, empty, error, and success states.
8. Add tests, accessibility review, seeded demo data, and demo recovery behavior.

## Definition of complete

Do not declare the work complete until the core loop works end to end, matches the UI Blueprint, has all critical states, is keyboard-accessible, validates its inputs and AI outputs, prevents cross-user data access, and can be demonstrated using the Hackathon Bible script.

When a detail is missing from the specifications, choose the smallest implementation consistent with the product thesis. Do not redesign the product.
