# ADR-010: AI-Agent Operating Model

## Status
Accepted

## Date
2026-08-02

## Context
HEXA Studio is governed by `GOVERNANCE.md` (v1.0.0, the "Engineering Operating System"). The governance document defines what must happen (architecture, security, quality gates) but does not formally define **who executes** — the human/AI-agent operating hierarchy that carries work from governance to production.

Across the repository the agent roles had organically accumulated in multiple locations (`.ai/agents/`, `.opencode/prompts/`, `docs/agents/`) with inconsistent naming (e.g. `CHIEF_ARCHITECT.md` vs `chief-architect-agent.md` vs `architect.md`). The intended delivery pipeline — GOVERNANCE → ORCHESTRATOR → ARCHITECT/BUILDER/REVIEWER → GitLab Merge Request → CI/CD → Staging → Production — was only implicit and never formally recorded as the operating model.

## Decision
We adopt the following canonical operating model:

```
GOVERNANCE.md
      ▼
ORCHESTRATOR
      ▼
┌──────────┬──────────┬──────────┐
▼          ▼          ▼          ▼
ARCHITECT  BUILDER    REVIEWER   (specialists)
│          │          │
├─ Frontend ├─ Frontend ├─ QA
├─ Backend  ├─ Backend  ├─ Security
├─ CMS      ├─ CMS      ├─ Performance
├─ DevOps   └─ Three.js └─ SEO
└─ Security
      ▼
GitLab Merge Request
      ▼
CI/CD
      ▼
Staging
      ▼
Production
```

Roles and their canonical definitions:

| Role | Definition file | Responsibility |
|------|-----------------|----------------|
| ORCHESTRATOR | `.opencode/prompts/orchestrator.txt` | Decompose → parallel dispatch → sequential chains → quality gate → consolidate. ASKs before editing/running bash. |
| ARCHITECT | `.ai/agents/architect.md` | System architecture integrity, ADR authorship, package boundaries, microservice patterns. |
| BUILDER | `.ai/agents/builder.md` (new) | Implementation lead — coordinates domain builders (Frontend, Backend, CMS, Three.js). |
| REVIEWER | `.ai/agents/reviewer.md` | Gatekeeper — QA, Security, Performance, SEO verification before merge. |
| Domain builders | `.ai/agents/frontend.md`, `backend.md`, `cms.md`, `threejs.md` | Feature implementation in each domain. |
| Review specialists | `.ai/agents/qa.md`, `security.md`, `performance.md`, `seo.md` | Domain verification and audits. |

Role files live in `.ai/agents/` (machine-consumable role definitions). Human-readable agent guides remain in `docs/agents/`. Orchestrator prompt(s) live in `.opencode/prompts/`.

The delivery pipeline is:
1. GOVERNANCE sets the rules (architecture, security, engineering standards).
2. ORCHESTRATOR plans and delegates work to ARCHITECT / BUILDER / REVIEWER.
3. Work is implemented by builders and verified by reviewers.
4. Changes flow through GitLab Merge Requests into CI/CD.
5. CI/CD validates (quality gates, security scanning) and promotes to Staging.
6. Verified staging builds release to Production.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| No formal operating model | Zero documentation overhead | Role drift, ambiguous ownership, inconsistent execution |
| Single generalist agent | Simple | No specialization, quality gaps across domains |
| Siloed independent agents | Autonomy | No orchestration, no pipeline ownership, coordination failures |

## Rationale
- The model matches the existing repository layout (`.ai/agents/`, `.opencode/prompts/`, `.gitlab-ci.yml`, `docker-compose.staging.yml`, `docker-compose.prod.yml`) — it formalizes what already exists rather than inventing new structure.
- Clear separation: GOVERNANCE (rules) → ORCHESTRATOR (coordination) → ARCHITECT/BUILDER/REVIEWER (execution) → GitLab/CI/CD (delivery).
- Role definition files are lightweight, version-controlled, and consumable by both humans and AI tooling.
- Builds on ADR-009 (Enterprise Architecture Governance Framework) by defining the operational layer under it.

## Consequences
- `.ai/agents/builder.md` must be created to complete the BUILDER role definition.
- Future agent roles should be added to `.ai/agents/` and referenced here.
- `docs/agents/README.md` is the canonical agents area index.
- GOVERNANCE.md should link each section to its `docs/<area>/` manifest.
- New agent-driven decisions follow this pipeline; ADRs record decisions per ADR-009.

## References
- `GOVERNANCE.md` — Engineering Governance (operating manual)
- `docs/adr/009-enterprise-governance-framework.md` — Governance framework (superset)
- `.ai/agents/*.md` — Role definitions (ARCHITECT, BUILDER, REVIEWER, builders, specialists)
- `.opencode/prompts/orchestrator.txt` — ORCHESTRATOR prompt
- `docs/agents/` — Human-readable agent guides
- `docs/devops/README.md` — DevOps manifest (CI/CD, staging, production references)
