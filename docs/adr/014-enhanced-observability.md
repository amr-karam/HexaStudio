# ADR-014: Enhanced Observability & Health Check Architecture

## Status
Accepted

## Date
2026-08-14

## Context

HEXA STUDIO runs a distributed micro-repo architecture across 3 workspaces (frontend, backend, mobile) with 14 Docker services. While PROJECT_STATUS.md documents `/admin/health` checks and monitoring stacks (Prometheus + Grafana + Loki + Sentry), the ARCHITECTURE.md does not formally define:

1. What health endpoints exist and what they check
2. What metrics are scraped and at what intervals
3. What constitutes a "healthy" vs "degraded" vs "unhealthy" state
4. How health checks integrate with Traefik/Circuit Breakers
5. What degraded experiences are provided to users during partial failures

This gap has led to ad-hoc health check implementations scattered across services, inconsistent error responses, and difficulty diagnosing partial failures in production.

## Decision

1. **Standardize health check endpoints**: All services must expose `/health` (basic: process alive) and `/admin/health` (full: dependency status) per PROJECT_STATUS.md §4 format. These must be gated by Traefik's `healthcheck` middleware.

2. **Define health check contracts**: Each service must declare its dependencies in a standardized format (`HEXA-HEALTH-<service>.json`) consumed by the Loki/Alertmanager alert rules.

3. **Centralize health correlation**: Add a `HealthService` NestJS provider in `apps/backend` that aggregates status from Odoo, PostgreSQL, Redis, MinIO, and Qdrant into a single `/api/v1/health` endpoint with per-dependency status codes (ok/degraded/unavailable).

4. **Add Prometheus metrics**: Export `hexa_app_status{status="ok"|"degraded"|"unavailable"} 1` via `prom-client` in each microservice, scraped alongside existing metrics.

5. **Alerting upgrades**: Augment existing Loki LogQL rules (per ADR-013 §8 backup alerts) with:
   - `HealthCheckFailed` (critical) — when `/admin/health` returns non-200
   - `ServiceDegraded` (warning) — when any dependency reports "degraded"
   - Maintain existing `BackupVerificationFailed` and `MinioBackupCycleFailed` rules

6. **Circuit Breaker integration**: Wire Traefik's `retry` and `circuitBreaker` middleware to `/admin/health` so failed health checks trigger fallback behavior (static error pages, graceful degradation).

## Alternatives Considered

| Alternative | Pros | Cons |
|-----------|------|------|
| A: Add only Prometheus metrics (no health endpoint) | Minimal code change | Doesn't solve ad-hoc debugging or Traefik integration |
| B: Custom `/status` endpoint per service only | Service-specific detail | Fragments observability; no unified gateway view |
| C: **Option C — Standardized health + metrics + alerts** (CHOSEN) | Unified view, production-ready, aligns with SRE best practices | Moderate code change across 4 workspaces |

## Rationale

- The system already has health-check infrastructure (minio-backup, backup-verify-scheduled) but lacks a **canonical contract**.
- ADR-010 (AI-Agent Operating Model) requires all infrastructure to be observable by AI agents.
- Missing health contract is a **governance gap**: new agents cannot reliably determine system state on startup.
- This ADR operationalizes the existing `/admin/health` dashboard into a machine-consumable contract.

## Consequences

**Positive:**
- Standardized health checks across all 14 Docker services
- AI agents can auto-diagnose startup failures
- Unified Prometheus metrics enable dashboard-driven alerting
- Traefik circuit breakers protect downstream services

**Negative/Neutral:**
- Moderate implementation effort (~4 files modified across backend + docker configs)
- Requires disciplined maintenance: new services must declare health endpoints
- Existing `/admin/health` response format may shift slightly (backward-compatible if versioned)

## References

- ADR-010: AI-Agent Operating Model
- PROJECT_STATUS.md §4: Quality Gate Status / Production Deployment
- ADR-013: Retire `@hexastudio/ui` Package (backup alert rules)
- ADR-007: OpenTelemetry + Grafana Tempo for Distributed Tracing
- `docker/health/` — existing per-service health check scripts (if any)
- `loki/rules/` — existing backup alert LogQL rules

---
```

Now let me also implement the changes that ADR-014 specifies, starting with the packages/ui retirement from ADR-013 since that was also part of the user's request.Now let me also implement the ADR-013 changes (retire packages/ui) since it's part of the architecture modification the user requested, and then create the deployment changes:
<tool_call>
<function=bash>
<parameter=command>
cat "C:\Users\amrmo\OneDrive\Desktop\hexastudio.net\apps/frontend\package.json" | grep -i ui