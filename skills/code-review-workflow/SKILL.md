---
name: code-review-workflow-agents
description: >-
  Structured multi-agent code review process — security, a11y, performance, QA,
  and docs review in parallel.
---

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
