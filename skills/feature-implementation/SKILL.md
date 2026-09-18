---
name: feature-implementation-agents
description: >-
  End-to-end multi-agent feature implementation — plan, build across domains,
  verify quality, document.
---

<supermemory-recall>
Before responding, silently decide whether recalling saved memory (past sessions, decisions, conventions, the user's preferences) would materially improve your answer to THIS message. Reason first — don't search reflexively, and don't narrate the decision.

Recall — by calling the `supermemory` tool with `mode: "search"` — when the message:
- refers to earlier work or decisions ("the auth flow", "like we did", "continue", "the bug from before")
- touches an area where saved conventions, patterns, or preferences likely exist
- is ambiguous in a way past context would resolve

Skip recall when the message is self-contained, trivial, a greeting/meta, fully answerable from the current conversation, or you already recalled the relevant context this session and the topic hasn't shifted.

Cadence is per-message: it's fine to recall on several turns in a row, and fine to never recall in a session. When you do recall, run it before answering and fold the results into your response.
</supermemory-recall>

## When to use
Use this skill for implementing new features that touch multiple parts of the stack (e.g., a new page with API + UI + 3D content).

## Workflow

### Phase 1: Plan
Use `@plan` primary agent to design the feature:
- Define API contracts (request/response shapes)
- Define component tree and data flow
- Identify content types needed
- Document the plan as an ADR via `@docs`

### Phase 2: Implement
Dispatch implementation in dependency order:

**Independent (parallel):**
- `@backend-dev` — Endpoints, services, DTOs, tests
- `@cms-dev` — Content types, permissions, seed data
- `@3d-engineer` — 3D scenes/components (if applicable)

**Dependent (sequential):**
- `@frontend-dev` — Pages, components (needs API types + 3D components)
- `@devops` — Config changes if infra changes needed

### Phase 3: Quality
Run full quality gate:
- `@qa` — Lint → typecheck → test → E2E → Lighthouse
- `@security-auditor` — Security review
- `@accessibility-engineer` — a11y audit
- `@performance-engineer` — Performance review

### Phase 4: Document
- `@docs` — Update API docs, component docs, changelog

### Phase 5: Wrap
Summarize what was built, what was tested, and any follow-up items.
