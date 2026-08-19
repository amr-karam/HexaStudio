---
name: multi-agent-orchestration-agents
description: >-
  Orchestrate complex work by delegating to specialized subagents in parallel;
  coordinate dependency order, collect results, and pass findings between
  agents.
---

## When to use
Use this skill when you have a complex multi-step task that spans multiple domains (e.g., backend + frontend + QA, or 3D + performance + docs). The orchestrator agent (`@orchestrator`) coordinates the workflow.

## Workflow

### 1. Decompose
Break the task into independent work units:
- Each unit maps to one subagent's expertise
- Identify dependencies between units

### 2. Parallel dispatch
Dispatch independent units simultaneously via `@subagent-name`:
- `@backend-dev` — API/models/business logic
- `@frontend-dev` — UI/components/pages
- `@3d-engineer` — Three.js/R3F scenes
- `@cms-dev` — Strapi content types
- `@docs` — ADRs and documentation

### 3. Sequential chains
When unit B depends on unit A's output:
1. Run A first, collect results
2. Pass A's output as context to B
3. Continue the chain

### 4. Quality gate
After all work units complete, delegate to `@qa` for:
- Lint, typecheck, test, E2E, Lighthouse
- `@security-auditor` for security review
- `@accessibility-engineer` for a11y audit
- `@performance-engineer` for performance review

### 5. Consolidate
Collect all results, resolve any cross-cutting issues, and summarize.

## Example
For "Add a 3D product viewer page": dispatch `@3d-engineer` + `@backend-dev` in parallel (scene + product API), then chain `@frontend-dev` (integrate both), then `@qa` + `@docs` in parallel.
