# GenPHD agent registry

This folder contains the versioned, server-side reasoning contracts used by the
Decision Brief workflow. It is source code, not a user-facing agent dashboard.

## Active agents

| Agent | Responsibility |
| --- | --- |
| `decision-editor` | Produces one clear recommendation, tradeoff, and alternative. |
| `evidence-guardian` | Restricts claims to the project context and evidence supplied. |
| `mission-designer` | Produces a small build mission with observable acceptance criteria. |

`lib/decision/provider.ts` imports the registry directly. The roles are combined
into one typed Decision Brief request and are validated before results are saved.
This keeps the architecture auditable and focused without exposing unnecessary
multi-agent controls in the product UI.
