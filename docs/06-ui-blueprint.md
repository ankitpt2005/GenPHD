# GenPHD UI Blueprint

This document defines the product surfaces. It is a build contract, not inspiration. Do not add screens, dashboard widgets, or visual patterns outside this blueprint.

## 1. Global app contract

### Routes

| Route | Screen |
|---|---|
| `/` | Landing |
| `/login` | Login |
| `/signup` | Sign up |
| `/onboarding` | Onboarding |
| `/diagnostic` | Baseline diagnostic |
| `/dashboard` | Today dashboard |
| `/roadmap` | Roadmap |
| `/consensus` and `/consensus/:id` | Decision Briefs |
| `/projects` and `/projects/:id` | Projects |
| `/challenges` and `/challenges/:id` | Build Missions |
| `/timeline` | Learning timeline |
| `/memory` | Learning memory |
| `/settings` | Settings |
| `/profile` | Profile |
| `/notifications` | Notifications |
| `/legal` | Legal index |
| `/privacy` | Privacy policy |
| `/terms` | Terms |
| `/contact` | Contact |

### Shell

- Desktop: 232px sidebar, 56px top bar, page content constrained to 1120px.
- Tablet and mobile: 56px top bar with menu drawer; no permanently compressed sidebar.
- Standard app page padding: 32px desktop, 24px tablet, 16px mobile.
- Major sections use 32px separation; related objects use 16px; compact controls use 8px.
- Use the typography and colors in the Design Bible without exception.

### Global keyboard map

| Shortcut | Action |
|---|---|
| `Ctrl/⌘ + K` | Open command palette |
| `/` | Focus page search when available |
| `g`, then `d` | Dashboard |
| `g`, then `r` | Roadmap |
| `g`, then `c` | Consensus |
| `g`, then `p` | Projects |
| `g`, then `t` | Timeline |
| `?` | Shortcut reference |
| `Esc` | Close modal, drawer, or command palette |

### Global state rules

- Preserve page hierarchy with skeletons; never replace the whole app with a spinner.
- Use an inline error state for recoverable section errors and an error page only for blocking failures.
- Success feedback appears near the completed action and routes the user toward the next meaningful step.
- All surfaces must work at 320px width, at 768px tablet width, and at desktop width.

### First-run orientation

After onboarding, show one short three-step guide: `Start with today's action`, `Ask a decision when blocked`, and `Complete a mission to update your roadmap`. It may be skipped, but remains available from `How GenPHD works` in the sidebar and the `?` shortcut. It must explain product actions rather than UI controls.

## 2. Landing (`/`)

**Purpose:** Explain the Decision Loop in one glance and earn a sign-up.

**Layout, spacing, typography:** A single centered reading column, 680px maximum, within a quiet full-height field. Use one Display headline, one 15px body paragraph, then a primary and secondary action. Separate sections by 48px. Do not use a fake product dashboard or decorative image collage.

**Components:** Wordmark, concise navigation, hero copy, primary `Start your first decision` button, secondary `See how it works` link, a three-step Decision Loop strip, trust statement, and minimal footer.

**States and interactions:** The secondary action scrolls to the Decision Loop strip. The primary action routes to sign-up. No carousel, auto-playing animation, newsletter wall, customer-logo parade, or pricing table in the first viewport.

**Motion, keyboard, responsive:** One 150ms anchor-scroll transition only. Navigation and CTA are fully tab-accessible. On mobile, collapse navigation into a menu; CTA buttons stack with full-width primary action.

## 3. Login (`/login`)

**Purpose:** Let a returning user safely enter the workspace.

**Layout, spacing, typography:** Centered 400px form column; H1, one supporting sentence, form labels, fields, and one primary button. Use 24px gaps between major groups and 12px between label and field.

**Components:** Email field, password field or provider sign-in, `Continue` button, password-reset link, sign-up link, inline validation text.

**States and interactions:** Disable the primary action only during submission. Invalid input receives a field-level message. Authentication failure appears above the form without clearing typed email.

**Motion, keyboard, responsive:** Focus email on load. Enter submits valid form. On mobile retain page padding; do not place the form in an oversized card.

## 4. Sign up (`/signup`)

**Purpose:** Create a user account and transition immediately to onboarding.

**Layout, spacing, typography:** Same simple 400px form composition as Login. H1 uses the action-oriented title `Start with one project`.

**Components:** Name, email, password or provider sign-up, consent text, `Create account` button, login link.

**States and interactions:** Validate password rules while typing without aggressive red warnings. On success, route to onboarding with a quiet progress indicator.

**Motion, keyboard, responsive:** Enter submits; focus follows first invalid field. The layout stays identical to Login at mobile widths.

## 5. Onboarding (`/onboarding`)

**Purpose:** Gather the smallest amount of context needed to create a useful first action.

**Layout, spacing, typography:** A 640px single-column guided form. Top area shows `Step 1 of 3` as caption, one H1 question, and a short explanation. Each step uses one question cluster; section gaps are 32px.

**Components:** Goal selection with editable text, active-project description, stack tags with text fallback, weekly time selector, current blocker text area, back/continue actions, completion summary.

**States and interactions:** Step 1: goal. Step 2: project and stack. Step 3: time and blocker. Save progress between steps. Finish creates a provisional roadmap and routes to Diagnostic or Dashboard according to user choice.

**Motion, keyboard, responsive:** Horizontal step transition is 200ms and respects reduced motion. Enter advances only when a single-line field is focused; text areas retain Enter. On mobile, choices become a one-column list and the primary action remains visible after content.

## 6. Baseline diagnostic (`/diagnostic`)

**Purpose:** Establish provisional capability evidence without turning onboarding into an exam.

**Layout, spacing, typography:** One question at a time in a 680px reading column. H1 is replaced by a compact progress label; question uses H2. Keep 32px between question and response.

**Components:** Short concept question, optional code or explanation response, confidence self-rating, `Skip for now`, progress indicator, final provisional skill summary.

**States and interactions:** Maximum five questions. A skipped answer is recorded as unknown, not incorrect. Completion shows `Emerging`, `Practicing`, and `Validated` competency labels with clear provisional language.

**Motion, keyboard, responsive:** Keyboard selection for choices, `n` for next only when no text area is focused, and visible focus states. On mobile, code input is a vertically scrolling field with no horizontal page overflow.

## 7. Today dashboard (`/dashboard`)

**Purpose:** Answer one question: **What should I do today?**

**Layout, spacing, typography:** Main column 720px plus optional 280px context rail on desktop. Start with greeting-free H1 such as `Today’s best next action`. Place the active Build Mission directly below it. Supporting content is separated by 32px, not packed into card grids.

**Components:** Active Build Mission card, active Decision Brief summary, next roadmap milestone, recent timeline item, project switcher. The secondary rail may show current project and compact competency evidence.

**States and interactions:** If there is no mission, the primary action becomes `Ask a decision` or `Create your first project`. Completing a mission opens the reflection flow, not a celebratory gamification screen.

**Motion, keyboard, responsive:** A completed mission collapses into the timeline after confirmation. `c` begins a new decision when not typing. On tablet and mobile, move rail content below the main action; never turn it into a horizontal card carousel.

## 8. Roadmap (`/roadmap`)

**Purpose:** Answer: **What should I learn or build next?**

**Layout, spacing, typography:** A 760px vertical pathway with an H1, one-sentence roadmap rationale, and three upcoming nodes. Use 24px vertical intervals between nodes and a thin neutral connecting line.

**Components:** Roadmap node, capability label, project outcome, estimated effort, evidence note, state badge, `Start mission` or `Review decision` action, optional collapsed future section.

**States and interactions:** Current milestone is expanded. Completed milestones collapse but remain inspectable. If evidence changes the plan, show a small `Updated because…` explanation before the revised node.

**Motion, keyboard, responsive:** Nodes expand in place over 200ms. Arrow keys move focus between nodes; Enter opens the focused node. On mobile the timeline stays vertical and labels wrap rather than shrink.

## 9. Consensus list (`/consensus`)

**Purpose:** Answer: **What decisions need my attention or have already been made?**

**Layout, spacing, typography:** H1, a compact search/filter row, then a flat chronological list. Each row is 72px minimum height with question, recommendation status, confidence text, and date. Avoid card grids.

**Components:** Search input, filter by active/reviewed/outdated, Decision Brief rows, `Ask a decision` primary action, empty-state setup link.

**States and interactions:** Active decisions show workflow status; ready decisions open detail. Outdated decisions show a muted source-version notice, never an alarming badge. Search updates the list without a full-page refresh.

**Motion, keyboard, responsive:** `/` focuses search. Up/down moves row focus. At mobile width, filter chips become a single select and the recommendation summary moves below the question.

## 10. Decision Brief detail (`/consensus/:id`)

**Purpose:** Answer: **What should I trust, and why?**

**Layout, spacing, typography:** Use a 760px reading column. The top contains decision question, recommendation, confidence explanation, and primary action. Supporting sections are an evidence list, disagreement analysis, and counterfactual. Use document layout; only the recommendation and mission preview are cards.

**Components:** Decision header, recommendation panel, confidence explanation, source cards, claim-to-source links, conflict list, `Choose the alternative if…` section, Build Mission preview, feedback action.

**States and interactions:** During generation, show phase text and skeleton blocks. Expand source context inline. Users can mark recommendation as helpful, not useful, or needing review. A low-confidence result must foreground unanswered questions.

**Motion, keyboard, responsive:** Source expansion uses 150ms height transition. `e` moves focus to evidence, `m` starts the mission. On mobile, source cards remain full width and side-by-side comparisons stack.

## 11. Projects list (`/projects`)

**Purpose:** Answer: **What am I building?**

**Layout, spacing, typography:** H1, short subheading, then a restrained list of projects. A project row contains name, intended outcome, current milestone, and last activity. Use 16px row gaps; do not use portfolio thumbnails.

**Components:** Project rows, active-project indicator, `New project` primary action, project search only after five projects, empty state.

**States and interactions:** One active project is visually selected. Archived projects are hidden behind a low-emphasis disclosure. Creating a project starts a concise form rather than a modal wizard.

**Motion, keyboard, responsive:** Arrow keys navigate rows. On mobile, metadata wraps beneath project name and the active state remains textual.

## 12. Project detail (`/projects/:id`)

**Purpose:** Explain the current project, its constraints, and its next decision.

**Layout, spacing, typography:** Main 720px column with a compact project header. A secondary rail on desktop contains stack, time budget, and editable constraints. Keep context secondary to current project action.

**Components:** Project overview, current objective, architecture assumptions, constraints editor, latest Decision Brief, next milestone, linked Build Missions, project activity.

**States and interactions:** Editing context is inline and explicit. Saving a meaningful constraint change offers `Re-evaluate current decision`; it never silently changes recommendations.

**Motion, keyboard, responsive:** Inline edits preserve layout. `e` focuses the first edit action. On mobile, the context rail appears after the current objective.

## 13. Build Mission list (`/challenges`)

**Purpose:** Answer: **Which practical task should I complete next?**

**Layout, spacing, typography:** H1 and one compact filter row, followed by a chronological mission list grouped by `Now`, `Next`, and `Completed`. Group gaps are 32px.

**Components:** Mission row/card, time estimate, target outcome, status, associated competency, `Start` action, filters.

**States and interactions:** There is only one `Now` mission. Completed items move to a collapsed group. Skipped missions require a short reason so the roadmap can adapt.

**Motion, keyboard, responsive:** `n` starts the next mission when focus is not in a field. Mobile layout places action below metadata with no horizontal chips overflow.

## 14. Build Mission detail (`/challenges/:id`)

**Purpose:** Help the user complete one focused engineering action.

**Layout, spacing, typography:** 720px task column. Start with outcome and acceptance criteria, then context, resources, optional hint, and reflection. The mission title is H1; acceptance criteria are body-sized checklist items.

**Components:** Outcome statement, time estimate, acceptance checklist, source/context links, expandable hint, completion form, reflection field, `Complete mission` primary action.

**States and interactions:** The completion action becomes enabled when the user confirms the outcome or supplies evidence. Hints are progressive disclosure. On completion, show the skill evidence that will be added and route to the updated roadmap.

**Motion, keyboard, responsive:** Space toggles checklist items. Completion confirmation uses a short inline success state, not confetti. On mobile, the primary action becomes a normal full-width bottom section, never a fixed obstructive bar.

## 15. Learning timeline (`/timeline`)

**Purpose:** Answer: **What have I learned, decided, and changed?**

**Layout, spacing, typography:** One 760px vertical timeline with date groups. Each entry favors the event title and result; metadata is caption-sized.

**Components:** Decision entries, mission completion entries, competency evidence entries, roadmap revision entries, date separators, filter control.

**States and interactions:** Clicking an event opens its canonical detail in a side sheet on desktop or a full route on mobile. Timeline filters use event type and active project only.

**Motion, keyboard, responsive:** New events receive one subtle highlight on arrival. Arrow keys traverse events. Mobile replaces the side sheet with navigation to preserve reading space.

## 16. Learning memory (`/memory`)

**Purpose:** Answer: **What does GenPHD remember about me and this project?**

**Layout, spacing, typography:** 760px reading column with a brief privacy explanation at the top. Group memory by Profile, Project, Learning Evidence, and Temporary Context. Use flat list rows, not knowledge-graph visuals.

**Components:** Memory row, source label, scope label, timestamp, edit action, delete action, export action, privacy controls.

**States and interactions:** Model inferences are explicitly labeled and offer `Confirm`, `Edit`, or `Remove`. Deletion opens a confirmation dialog that states what future personalization will lose. Export downloads a structured user file.

**Motion, keyboard, responsive:** `e` edits focused row and Delete requests confirmation. On mobile, actions move into a row overflow menu with accessible labels.

## 17. Settings (`/settings`)

**Purpose:** Let users control application behavior without exposing an admin console.

**Layout, spacing, typography:** A 720px settings page with left-aligned section navigation only when there are more than four sections. Use H2 sections with 24px gaps.

**Components:** Preferences, notification controls, source preferences, privacy controls, account data controls, danger zone.

**States and interactions:** Changes save explicitly or clearly autosave with status text. Dangerous actions use confirmation modal and typed confirmation only for account deletion.

**Motion, keyboard, responsive:** Switches retain native keyboard behavior. On mobile, section navigation becomes a select or anchor list; no settings cards wall.

## 18. Profile (`/profile`)

**Purpose:** Show and edit the user’s explicit identity, goals, and default preferences.

**Layout, spacing, typography:** 640px form column. Profile data is grouped as Identity, Goals, Stack Preferences, and Time Budget.

**Components:** Avatar fallback, display name, career goal, preferred stack, weekly availability, edit/save controls.

**States and interactions:** Changes that could materially alter recommendations offer an optional `Re-evaluate roadmap` action after save. Do not display inferred personality scores or public achievement badges.

**Motion, keyboard, responsive:** Standard form focus and validation. Mobile uses full-width controls and normal document flow.

## 19. Notifications (`/notifications`)

**Purpose:** Show only actionable changes relevant to active work.

**Layout, spacing, typography:** A 680px chronological list with one H1 and a `Mark all read` ghost action. Each row contains notification reason, impacted object, and one action.

**Components:** Notification row, unread indicator, source-update explanation, decision-review action, mission reminder action, empty state.

**States and interactions:** Notifications are grouped by Today, This week, Earlier. Read/unread state is secondary. Avoid badge-count anxiety and unrelated engagement prompts.

**Motion, keyboard, responsive:** Up/down row navigation; Enter opens action. Mobile wraps actions below the message.

## 20. Legal index (`/legal`)

**Purpose:** Provide a clear route to product policies.

**Layout, spacing, typography:** 680px reading column with H1, concise explanation, and flat links to Privacy, Terms, and Contact. Use 32px section spacing.

**Components:** Policy links, effective-date labels, contact link.

**States and interactions:** No dynamic loading state beyond normal route skeleton. Links open internal documents in the same tab.

**Motion, keyboard, responsive:** Standard document navigation; full keyboard access. Mobile is a single column.

## 21. Privacy (`/privacy`)

**Purpose:** Explain data, memory, source, and deletion practices in plain language.

**Layout, spacing, typography:** 720px documentation column with a table of contents on desktop only. Use H1, H2 sections, 15px body text, and 24px section gaps.

**Components:** Effective date, table of contents, data categories, memory controls, deletion/export instructions, contact link.

**States and interactions:** The document is static and versioned. Table-of-contents links scroll to headings. Never hide privacy controls behind marketing language.

**Motion, keyboard, responsive:** Reduced-motion-friendly anchor scroll. On mobile, table of contents becomes a top disclosure.

## 22. Terms (`/terms`)

**Purpose:** State service terms and limitations, including that recommendations are decision support rather than guarantees.

**Layout, spacing, typography:** Same document layout as Privacy. Use readable sections rather than dense legal-card composition.

**Components:** Effective date, table of contents, service-use terms, user responsibility, AI limitations, contact link.

**States and interactions:** Static versioned document. Internal anchors are the only interaction.

**Motion, keyboard, responsive:** Match Privacy behavior exactly.

## 23. Contact (`/contact`)

**Purpose:** Give users one dependable channel for support, feedback, and privacy requests.

**Layout, spacing, typography:** 560px form column with H1, short expectation-setting text, and field groups separated by 20px.

**Components:** Topic select, email, message field, optional attachment only if secure upload exists, send button, response-time note.

**States and interactions:** Validate fields before submission. Success message explains what happens next and retains a copy of the user’s message. Errors preserve form content.

**Motion, keyboard, responsive:** Enter never submits the text area; `Ctrl/⌘ + Enter` may submit a valid form. Mobile layout is single column.

## 24. Not found (`404`)

**Purpose:** Recover gracefully from a missing route or deleted object.

**Layout, spacing, typography:** Centered 560px column, H1 `This page is not available`, one sentence, and two actions. No illustration needed.

**Components:** Dashboard primary action, back secondary action, optional support link.

**States and interactions:** If the object exists but access is denied, show an authorization-specific message instead of a generic 404.

**Motion, keyboard, responsive:** Focus primary recovery action on load. Mobile stacks buttons.

## 25. Loading state

**Purpose:** Preserve orientation while data or a Decision Brief is being prepared.

**Layout, spacing, typography:** Mirror the target screen’s layout with neutral skeleton blocks. For AI work, show a single caption-sized phase line beneath the page title.

**Components:** Skeleton heading, skeleton content lines, progress phase line, optional cancel/retry only for long jobs.

**States and interactions:** Use `Understanding your constraints`, `Reviewing current evidence`, `Comparing tradeoffs`, and `Preparing a recommendation`. Do not show fake percentage completion or spinning decorative graphics.

**Motion, keyboard, responsive:** Reduced-motion mode uses static skeletons. Maintain landmark structure and announce phase changes through a polite live region.

## 26. Empty state

**Purpose:** Explain the value of an unconfigured area and offer one setup action.

**Layout, spacing, typography:** Inline within the canonical page column, not a large illustrated card. H2, one concise paragraph, and one primary action; 16px gaps.

**Components:** Context-specific title, explanation, one action. Example: `No decisions yet` and `Ask your first decision`.

**States and interactions:** Never show empty states for data still loading. A secondary link is allowed only when it reduces setup anxiety.

**Motion, keyboard, responsive:** No animation necessary. Primary action is first in tab order; layout stays full-width on mobile.

## 27. Success state

**Purpose:** Confirm meaningful completion and direct the user to the next step.

**Layout, spacing, typography:** Inline confirmation near the action or a short dedicated transition page for onboarding completion. H2, result summary, primary next action; no more than 480px width when standalone.

**Components:** Success text, optional evidence summary, next-action button, secondary close action.

**States and interactions:** Example: `Mission completed. Your RAG Evaluation evidence was updated.` The primary action is `View updated roadmap`, not `Earn rewards`.

**Motion, keyboard, responsive:** One subtle checkmark reveal is allowed but no confetti. Focus the next action after confirmation; stack actions on mobile.

## 28. Error state

**Purpose:** Clearly recover from a blocked action without blaming the user or losing work.

**Layout, spacing, typography:** Use an inline section first; full-page error only when a route cannot render. H2, plain-language cause, saved-work status, and recovery action.

**Components:** Error message, error code in caption text, `Retry` primary action, `Edit input` or `Go to dashboard` secondary action, support link when appropriate.

**States and interactions:** Distinguish unavailable model, insufficient evidence, authorization failure, and validation error. `Insufficient evidence` is not a system failure; it should guide the user to add constraints or sources.

**Motion, keyboard, responsive:** Focus the recovery action. No shaking, flashing, or animated red treatment. Mobile preserves action order and readable messages.

## 29. Screen implementation checklist

For every route, verify:

- One primary user question and one primary action.
- Correct H1, reading width, spacing, and surface hierarchy.
- Keyboard and screen-reader path works before visual polish.
- Desktop, tablet, and mobile layouts preserve content order.
- Loading, empty, error, and success behavior is intentional.
- No unapproved card grid, gradient, dashboard metric, badge, chart, or agent theatre has appeared.
