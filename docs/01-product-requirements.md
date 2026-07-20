# GenPHD Product Requirements Document

**Product:** GenPHD  
**Positioning:** Decision intelligence for AI engineers  
**Tagline:** Turn conflicting AI advice into an evidence-backed next build action.

## 1. Product thesis

GenPHD is not a generic AI tutor or another multi-model chat interface. It helps an AI builder make a technical decision, take the next practical action, record the result, and use that result to improve the next recommendation.

The core loop is:

```text
Project context -> evidence -> deliberation -> decision brief -> build mission -> reflection -> updated memory
```

## 2. Problem

Aspiring and early-career AI engineers face fast-moving frameworks, inconsistent guidance, stale tutorials, and too many possible paths. General AI assistants can answer one question, but they do not maintain a transparent record of the user's constraints, decisions, skills, and project outcomes.

## 3. Target user

### Primary: project-based AI learner

A developer with basic Python or JavaScript skills who is building a GenAI portfolio project and needs to make credible engineering choices quickly.

### Secondary: early-career AI engineer

An engineer working on an AI feature who needs grounded technical recommendations, a decision record, and targeted skill development.

## 4. Jobs to be done

- When I receive conflicting AI advice, help me decide what is appropriate for *my* constraints.
- When I am unsure what to learn, identify the highest-value practical skill gap.
- When I complete a project task, convert that evidence into an updated roadmap rather than making me restart from zero.
- When a past decision is challenged, show why it was made and what would change it.

## 5. MVP experience

1. User supplies a goal, active project, stack, available time, and current blocker.
2. GenPHD creates a concise roadmap with the next three milestones.
3. User asks a decision question, such as "Should I use LangGraph for this two-day RAG project?"
4. The Decision Brief returns source-backed evidence, tradeoffs, a recommendation, uncertainty, and one next action.
5. GenPHD creates a Build Mission with a focused outcome and acceptance criteria.
6. User records the result. The product updates learning evidence and the next recommendation.

## 6. MVP functional requirements

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-1 | Guided onboarding | A user reaches a useful first recommendation in under 60 seconds. |
| FR-2 | Project context | Users can create one active project with goal, stack, time budget, and constraints. |
| FR-3 | Decision Brief | Every recommendation includes options, evidence, tradeoffs, confidence, and a next action. |
| FR-4 | Build Mission | Each mission has a target outcome, estimated time, acceptance criteria, and reflection prompt. |
| FR-5 | Learning memory | Decisions, outcomes, skill evidence, and explicit preferences persist and are inspectable. |
| FR-6 | Adaptive roadmap | Completing or skipping a mission changes the next three milestones. |
| FR-7 | Decision timeline | Users can replay a decision, its evidence, its outcome, and any later revision. |

## 7. Non-goals for the MVP

- A broad multi-subject learning platform.
- A live crawler for the whole AI ecosystem.
- Autonomous code execution or deployment.
- Gamified leaderboards, XP, badges, or social feeds.
- An administrative analytics dashboard.
- Claiming that model majority is truth.

## 8. Success metrics

| Category | Metric |
|---|---|
| Activation | User creates a first decision and accepts a first mission in the initial session. |
| Product value | Recommendation-to-mission completion rate within 48 hours. |
| Learning | Improvement on unseen practical project tasks. |
| Trust | Source coverage, explicit uncertainty coverage, and post-outcome usefulness rating. |
| Retention | Weekly completed decision loops, not number of chat messages. |
| Reliability | Decision latency, failed retrieval rate, and cost per completed loop. |

## 9. Principle decisions

- **Evidence before opinion:** every factual claim needs a source or an uncertainty label.
- **Constraint fit over popularity:** a right answer for one project may be wrong for another.
- **Action over content:** every meaningful recommendation ends in an executable next step.
- **Memory with consent:** no hidden personality profiling; memory is visible, editable, and deletable.
- **Fewer surfaces, stronger loop:** the default dashboard answers only, "What should I do today?"

## 10. Future expansion

After MVP validation, add repository-aware evidence, secure code evaluation, source freshness alerts, shared decision records, and portfolio-ready skill evidence. Each must strengthen the Decision Loop; none should become standalone dashboard clutter.
