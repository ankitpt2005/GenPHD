# GenPHD Design System & UX Bible

## 1. Design intent

GenPHD should feel like a calm, private workspace for serious thinking. The reference qualities are Apple-level restraint, Notion-level clarity, Linear-level density discipline, Raycast-level speed, and OpenAI-level focus.

It must never resemble a generic SaaS dashboard, a social feed, a gamified education app, or an admin console.

**Product feeling:** quiet confidence, intellectual rigor, deliberate momentum.

## 2. Non-negotiable principles

1. Less interface, more thinking.
2. Information hierarchy precedes decoration.
3. Whitespace is structural, not empty.
4. Every screen has one primary question to answer.
5. A card exists only when it groups a decision, action, or bounded input.
6. Motion explains a change; it never decorates idle space.
7. Never use gradients, neon, purple, or a default SaaS-template composition.
8. Confidence must never be communicated by color alone.
9. The user should see one clear primary action per screen.
10. Data-dense views earn their density through hierarchy, not through widgets.

## 3. Visual language

### Color tokens

The core system is monochrome. Semantic states are muted and appear only when they carry meaning.

```css
:root {
  --background: #0F0F0F;
  --surface: #181818;
  --surface-raised: #202020;
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;
  --text-tertiary: #71717A;
  --border: #2A2A2A;
  --border-strong: #3A3A3A;
  --success: #6F8F76;
  --warning: #B78752;
  --error: #A86565;
  --focus: #FFFFFF;
}
```

Rules:

- Black is the page field; raised surfaces are rare and intentional.
- White is reserved for high-priority copy, selected navigation, and primary actions.
- Semantic colors label outcome, risk, or validation only. They do not decorate graphs.
- Do not introduce blue gradients, purple gradients, rainbow charts, glows, or glassmorphism.

### Typography

Use **Geist** as the default. Inter is the fallback. IBM Plex Sans is acceptable for highly technical, documentation-like sections.

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| Display | 36 / 44 | 500 | Landing headline only |
| H1 | 28 / 36 | 500 | One page title |
| H2 | 20 / 28 | 500 | Major section |
| H3 | 16 / 24 | 500 | Component heading |
| Body | 15 / 24 | 400 | Default reading text |
| Body compact | 14 / 20 | 400 | Tables and secondary panels |
| Caption | 12 / 16 | 400 | Metadata and source details |
| Button | 14 / 20 | 500 | All actions |

Rules:

- Never use all-caps for large headings.
- Prefer sentence case.
- Keep body line lengths between 55 and 75 characters in reading layouts.
- Do not use more than three type sizes inside a compact component.

### Spacing and geometry

Use a 4px base unit.

| Token | Value | Use |
|---|---:|---|
| `space-1` | 4px | icon-to-label, micro gaps |
| `space-2` | 8px | compact controls |
| `space-3` | 12px | component internals |
| `space-4` | 16px | standard component padding |
| `space-5` | 20px | compact section gap |
| `space-6` | 24px | standard section gap |
| `space-8` | 32px | page section separation |
| `space-10` | 40px | major page separation |
| `space-12` | 48px | landing sections |

- Desktop content width: 1120px maximum.
- Reading panels: 720px maximum.
- Sidebar: 232px desktop; overlay drawer below 1024px.
- Header height: 56px.
- Control height: 36px default, 40px for the primary action.
- Corner radius: 8px for inputs and cards, 6px for compact controls. No excessive pill UI.

## 4. Layout rules

### App shell

- Left sidebar for global navigation and active project switching.
- A restrained top bar carries page context, command search, notifications, and profile.
- The content area has a single dominant column. Use a secondary rail only for supporting facts, never for promotional widgets.
- On mobile, use a top bar and a slide-over navigation drawer. Do not compress a desktop dashboard into tiny cards.

### Hierarchy

Every product page follows this order:

1. Page question or current state.
2. One primary object or action.
3. Supporting evidence or context.
4. Secondary history and controls.

## 5. Components

### Buttons

| Variant | Use | Rules |
|---|---|---|
| Primary | Commit, continue, start mission | One per view; white surface, dark label |
| Secondary | Review, compare, edit | Surface-colored with border |
| Ghost | Low-emphasis local action | No box until hover/focus |
| Destructive | Delete memory or project | Requires confirmation modal |

Buttons use clear verbs: `Start mission`, `Review decision`, `Save memory`. Avoid `Submit`, `Click here`, and `Learn more` as primary labels.

### Cards

Cards are only for a Decision Brief, Build Mission, bounded form, confirmation, or compact metric group. Do not wrap every section in a card. Use flat document-like layout for reading and timelines.

### Input and command search

- Inputs have a visible label, supporting hint, and error message area.
- The global command surface opens with `⌘/Ctrl + K`.
- Search results are grouped by actions, projects, decisions, and pages.

### Sidebar

Navigation order:

1. Dashboard
2. My roadmap
3. Decisions
4. My project
5. Build missions
6. Progress
7. Learning memory
8. Settings

The active item uses text contrast and a subtle neutral surface; it does not use a bright color block.

For first-time users, show a three-step guide explaining: complete today's action, ask a decision when blocked, and finish a mission to update the roadmap. The guide must remain accessible from a visible `How GenPHD works` action and the `?` keyboard shortcut.

### Timeline

A quiet vertical sequence. The date is secondary; the meaningful object is the decision, mission, or skill update. A timeline item opens in place or routes to its canonical record.

### Roadmap node

Each node shows: capability, project outcome, state, estimated effort, and one next action. Nodes should be a linear progression with optional branches, not a decorative mind map.

### Consensus card

Required structure:

1. Decision question.
2. Recommendation.
3. Confidence band with text explanation.
4. Supporting and conflicting evidence.
5. "Choose the alternative if…" counterfactual.
6. Recommended action.

### Challenge card

Shows a mission title, target outcome, time estimate, acceptance criteria, current state, and one action. It never shows XP, coins, or cartoon rewards.

### Skill graph and progress ring

- Default to competency rows or a compact radial progress summary.
- Use labels: `Emerging`, `Practicing`, `Validated`; never imply false numerical precision.
- Any ring must have a readable text equivalent and visible evidence link.

### Agent status

Do not expose a theatrical multi-agent dashboard. During a long request, show a single calm status line such as `Reviewing current evidence` with an expandable activity trace.

### Notifications

Use only for decisions that changed, missions due today, or an explicit source update relevant to an active project. Avoid notification badges as engagement bait.

### Modal, empty, loading, error, and skeleton states

- Modal: one decision, one primary action, one safe exit.
- Empty: explain the benefit and offer one direct setup action.
- Loading: preserve layout using skeletons; use a single status sentence for AI work.
- Error: state what failed, whether the user’s work was saved, and a recovery action.
- Success: confirm outcome briefly, then direct the user to the meaningful next step.

## 6. Motion

- Default transition: 150ms ease-out.
- Expand/collapse and panel transitions: 200ms ease-out.
- Route transition: content crossfade is optional; do not animate every component.
- Respect `prefers-reduced-motion` by removing nonessential motion.
- Use motion for timeline updates, evidence expansion, navigation drawers, and status progression only.

## 7. Accessibility

- Meet WCAG AA contrast at minimum.
- Every interactive element has a visible focus ring.
- Keyboard support: `⌘/Ctrl + K` command palette, `/` search, `g then d` dashboard, `g then r` roadmap, `g then c` consensus, `?` shortcuts.
- Every icon-only action has an accessible name.
- Use semantic headings, landmarks, native controls, and live regions for streamed AI status.
- Never convey confidence, validation, or error solely with color.

## 8. Design review checklist

Before shipping a screen, confirm:

- Does the first viewport answer one user question?
- Is there one obvious primary action?
- Can any card, chart, chip, badge, or color be removed?
- Does the screen still work with keyboard navigation and reduced motion?
- Would this look calm and credible without a logo or decorative illustration?
