# ADR-009: Enterprise Architecture Governance Framework

## Status
Accepted

## Date
2026-07-26

## Context
HEXA Studio had accumulated significant technical assets (20+ Docker services, 155+ API endpoints, 3 databases, multiple applications) without a formal governance structure. Key problems:

1. No single source of truth for project architecture — developers had to read docker-compose.yml and grep code to understand the system
2. Security posture was undocumented — no threat model, no incident response plan, no compliance mapping
3. Risk management was ad-hoc — no centralized register of operational risks
4. No observability SLAs or documented alerting rules
5. Infrastructure configuration had no documented governance (backup policies, scaling strategy, disaster recovery)
6. CI/CD pipeline had no documented approval gates, rollback procedures, or security scanning requirements

## Decision
We will adopt a formal Enterprise Architecture Governance framework with mandatory documentation spanning 12 domains:

1. **PROJECT_INDEX.md** — Complete project index (folder tree, tech stack, services, routes, env vars, contracts)
2. **PROJECT_HEALTH.md** — Automated health scoreboard across 10+ dimensions with scores and priorities
3. **SECURITY_BASELINE.md** — Threat model, OWASP Top 10 mapping, incident response runbook, compliance framework
4. **SERVICE_CATALOG.md** — All 20 Docker services with purpose, dependencies, health checks, backup/DR
5. **DATABASE_CATALOG.md** — All databases (PostgreSQL, Redis, MinIO, Qdrant) with schemas, indexes, backup policies
6. **API_CATALOG.md** — All 155+ endpoints with auth, validation, rate limits, response shapes
7. **ODOO_MODEL_CATALOG.md** — 15 Odoo integration models with sync direction, field mapping, conflict resolution
8. **OBSERVABILITY.md** — Metrics, logs, traces, 35+ alert rules, SLOs, RUM web vitals
9. **INFRASTRUCTURE_GOVERNANCE.md** — 17-section DevOps governance (server hardening, Docker, GitLab, DR, scaling)
10. **CI_CD_GOVERNANCE.md** — Pipeline stages, job definitions, branch strategy, rollback, security scanning
11. **RISK_REGISTER.md** — 25 risks across 6 categories with likelihood, impact, mitigation, owners
12. **ADRs** — Architecture Decision Records for all significant decisions

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| No formal governance | Zero documentation overhead | Knowledge silos, inconsistent decisions, audit failures |
| External tool (Notion/Confluence) | Rich editing, collaboration | Not version-controlled, stale, no code proximity |
| README-only | Simple, close to code | No structure, no cross-referencing, no automated validation |

## Rationale
- All documents live in the monorepo alongside code — stays in sync, version-controlled, reviewable in PRs
- Each document has a clear purpose with cross-references to code and configuration
- Lightweight enough to maintain as part of normal development workflow
- Satisfies enterprise compliance requirements for SOC 2, ISO 27001 readiness
- Documents are structured for automated validation (schema checks in CI)

## Consequences
- Initial creation required 11 documents totaling 7,831 lines
- Ongoing maintenance burden: documents must be updated alongside code changes
- CI pipeline should validate document consistency (future work)
- New architectural decisions must be documented via ADRs before implementation
- Onboarding new developers is significantly faster with indexed documentation

## References
- `docs/ADR/` — Architecture Decision Records
- `PROJECT_INDEX.md` — Master project index
- `PROJECT_HEALTH.md` — Project health dashboard
- `docs/` — Full governance document set
- `docs/product/PROJECT_CONSTITUTION.md` — Project constitution
- `docs/product/ENTERPRISE_ARCHITECTURE_GOVERNANCE.md` — Governance framework
