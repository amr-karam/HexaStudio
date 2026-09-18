---
name: code-review-workflow-agents
description: >-
  Structured multi-agent code review process — security, a11y, performance, QA,
  and docs review in parallel.
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
Use this skill when a PR or feature needs thorough review across multiple dimensions. The `@review` or `@orchestrator` agent coordinates the process.

## Workflow

### 1. Understand scope
Read the diff and understand what changed. Identify which domains are affected (backend, frontend, 3D, CMS, infra).

### 2. Parallel review dispatch
Launch independent reviews simultaneously:
- `@security-auditor` — Auth, injection risks, data exposure, dependency vulns
- `@accessibility-engineer` — WCAG compliance, keyboard nav, screen readers
- `@performance-engineer` — Bundle size, render performance, CWV impact
- `@qa` — Lint, typecheck, test coverage, E2E smoke tests

### 3. Collect findings
Gather results from all reviewers. Each reports:
- Issues found (with severity: critical/major/minor)
- Remediation suggestions
- Pass/fail status

### 4. Remediation
If issues found, delegate to the appropriate domain agent:
- `@backend-dev` for backend security/performance fixes
- `@frontend-dev` for frontend a11y/performance fixes
- `@3d-engineer` for 3D optimization fixes

### 5. Re-verify
After fixes, re-run affected reviewers to confirm resolution.

### 6. Document
Delegate to `@docs` to record any ADRs or changelog entries.
