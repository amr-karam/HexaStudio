# ADR-007: OpenTelemetry + Grafana Tempo for Distributed Tracing

## Status
Accepted

## Date
2026-07-26

## Context
HEXA Studio's architecture spans multiple services (Traefik, Backend, CMS, Odoo, PostgreSQL, Redis, MinIO, Qdrant) running across Docker containers. Debugging performance issues and understanding request flows across service boundaries was previously impossible — developers had no visibility into where latency was introduced.

Key drivers:
- Need to identify bottlenecks across the backend → database → external service call chain
- Incident Root Cause Analysis required correlating traces with logs and metrics
- The OBSERVABILITY.md governance document specified traces as a required pillar
- Grafana Tempo was already configured as a datasource in Grafana provisioning

## Decision
We will instrument the NestJS backend with OpenTelemetry and export traces to Grafana Tempo.

Implementation details:
- **Instrumentation**: `@opentelemetry/sdk-node` with `@opentelemetry/instrumentation-nestjs-core`, `@opentelemetry/instrumentation-http`, `@opentelemetry/instrumentation-express`
- **Exporter**: OTLP HTTP exporter to `http://tempo:4318`
- **Sampling**: 10% head-based probabilistic sampling for production (adjustable)
- **Storage**: Local file storage on the Tempo container with 48-hour retention
- **Dashboard**: Tempo datasource linked to Loki logs for traces↔logs correlation in Grafana

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Jaeger | Mature, widely adopted, UI familiar to many teams | Separate infrastructure; no native Grafana integration |
| SigNoz | Open source, full APM | Overhead of maintaining another full platform; less mature |
| Datadog APM | Zero-config, powerful | $15+/host/month; vendor lock-in |

## Rationale
- Tempo is already part of the monitoring stack (Grafana + Prometheus + Loki ecosystem)
- OpenTelemetry is the CNCF standard, avoiding vendor lock-in
- OTLP protocol allows future switching to any OTLP-compatible backend
- 10% sampling provides statistically significant data while keeping storage manageable

## Consequences
- Backend container will have 9 additional npm packages for OpenTelemetry (added to package.json)
- Minor increase in request latency (~1-2ms per traced request)
- Traces will be stored for 48 hours; longer retention requires object storage backend
- Frontend tracing (RUM) deferred to future ADR

## References
- `apps/backend/src/tracing.ts` — OpenTelemetry SDK initialization
- `docker/tempo/tempo.yml` — Tempo config (OTLP HTTP on port 4318)
- `docker/grafana/provisioning/datasources/datasources.yml` — Tempo datasource config
- `docker-compose.prod.yml` — Tempo service definition
- `docs/devops/OBSERVABILITY.md` — Observability governance
