# HEXA Studio — OBSERVABILITY

> Version: 1.0 | Last Updated: 2026-07-26

## Table of Contents

1. [Overview](#1-overview)
2. [Metrics (Prometheus)](#2-metrics-prometheus)
3. [Logs (Loki)](#3-logs-loki)
4. [Traces (Tempo / OpenTelemetry)](#4-traces-tempo--opentelemetry)
5. [Dashboards (Grafana)](#5-dashboards-grafana)
6. [SLOs & Error Budgets](#6-slos--error-budgets)
7. [Health Checks](#7-health-checks)
8. [Alerting Rules](#8-alerting-rules)
9. [Synthetic Monitoring (Uptime Kuma)](#9-synthetic-monitoring-uptime-kuma)
10. [Notification Channels](#10-notification-channels)
11. [Sentry Error Tracking](#11-sentry-error-tracking)
12. [Related Documentation](#12-related-documentation)

---

## 1. Overview

HEXA Vision enforces comprehensive observability using the **RED Method** (Rate, Errors, Duration) for services and the **USE Method** (Utilization, Saturation, Errors) for infrastructure. The stack provides a "Single Pane of Glass" for both system health and user experience.

### Observability Stack Topology

```
  ┌──────────────────────────────────────────────────────────────────────────────┐
  │                            OBSERVABILITY STACK                               │
  │                                                                              │
  │   ┌────────────────────┐    ┌────────────────────┐    ┌──────────────┐       │
  │   │  Prometheus v2.54  │    │     Loki v3.2.1    │    │ Tempo        │       │
  │   │ (Metrics Scraper)  │    │  (Log Aggregation) │    │ (Traces)     │       │
  │   └─────────┬──────────┘    └─────────┬──────────┘    └──────┬───────┘       │
  │             │                         │                      │               │
  │             └───────────┐   ┌─────────┘                      │               │
  │                         ▼   ▼                                ▼               │
  │                   ┌───────────────────────────────────────────────┐          │
  │                   │               Grafana v11.3.0                 │          │
  │                   │  (Dashboards + Alertmanager + Explore)        │          │
  │                   └───────────────────────────────────────────────┘          │
  │                             │                                                 │
  │                             ▼                                                 │
  │                   ┌──────────────────┐    ┌──────────────┐                    │
  │                   │  Alertmanager    │    │  Sentry      │                    │
  │                   │  (Alert Routing) │    │  (Errors)    │                    │
  │                   └──────────────────┘    └──────────────┘                    │
  └──────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
  Services ──► Metrics (Prometheus) ──► Grafana
  Services ──► Logs (Promtail) ──────► Loki ──► Grafana
  Backend  ──► Traces (OTLP) ───────► Tempo ──► Grafana
  Browser  ──► Web Vitals ──────────► API ────► Redis ──► Prometheus
  Browser  ──► Sentry SDK ──────────► Sentry.io
```

---

## 2. Metrics (Prometheus)

Prometheus scrapes metrics every **15s** across all targets. The evaluation interval for alert rules is **15s**.

### Scrape Targets

| Job Name | Endpoint | Container | Port |
|----------|----------|-----------|------|
| `prometheus` | Self-scrape | prometheus | 9090 |
| `traefik` | Traefik metrics | traefik | 8080 |
| `backend` | `/api/metrics` | hexa-backend | 4000 |
| `frontend` | `/_metrics` | hexa-frontend | 3000 |
| `cms` | Strapi metrics | hexa-cms | 1337 |
| `qdrant` | `/metrics` | hexa-qdrant | 6333 |
| `redis` | Redis metrics | hexa-redis | 6379 |
| `postgres` | Via postgres-exporter | postgres-exporter | 9187 |
| `minio` | MinIO metrics | hexa-minio | 9000 |
| `node-exporter` | Host metrics | node-exporter | 9100 |
| `cadvisor` | Container metrics | cadvisor | 8080 |

### Key Metrics & Alert Thresholds

| Metric | Source | Description | Alert Threshold |
|--------|--------|-------------|-----------------|
| `up{job="backend"}` | Prometheus | Backend service up | == 0 for 1m |
| `up{job="frontend"}` | Prometheus | Frontend service up | == 0 for 1m |
| `up{job="postgres"}` | Prometheus | PostgreSQL up | == 0 for 1m |
| `up{job="redis"}` | Prometheus | Redis up | == 0 for 1m |
| `up{job="minio"}` | Prometheus | MinIO up | == 0 for 1m |
| `up{job="qdrant"}` | Prometheus | Qdrant vector DB up | == 0 for 1m |
| `node_cpu_seconds_total` | node-exporter | CPU usage | > 85% for 10m |
| `node_memory_MemAvailable_bytes` | node-exporter | Available memory | < 15% for 5m |
| `node_load1` | node-exporter | 1m load average | > 8 for 5m |
| `node_filesystem_free_bytes` | node-exporter | Free disk space | < 10% for 5m (critical), < 25% for 10m (warning) |
| `http_requests_total{status=~"5.."}` | Traefik/Backend | 5xx error rate | > 5% for 2m |
| `http_request_duration_seconds` | Backend | API latency p99 | > 3s for 5m |
| `http_request_duration_seconds` | Frontend | Frontend latency p99 | > 2s for 5m |
| `container_cpu_usage_seconds_total` | cadvisor | Container CPU | > 0.8 cores for 5m |
| `container_memory_working_set_bytes` | cadvisor | Container memory | > 85% of limit for 5m |
| `container_restart_count` | cadvisor | Container restarts | > 3 in 15m (alerts.yml), > 5 in 1h (rules/alerts.yml) |
| `pg_stat_database_numbackends` | postgres-exporter | DB connections | > 80% of max for 5m |
| `pg_settings_max_connections` | postgres-exporter | Max connections | > 95% for 2m (critical) |
| `redis_memory_used_bytes` | redis-exporter | Redis memory | > 85% of max for 5m |
| `vector_search_duration_seconds` | Qdrant | Vector search p95 | > 1s for 5m |
| `embedding_generation_total{status="error"}` | Backend | Embedding failures | > 0.1/s for 2m |
| `embedding_tokens_total` | Backend | Embedding token cost | > 100k tokens/s for 5m |
| `backup_job_failed_total` | Backup service | Backup failure | > 0 in 1h |
| `backup_last_success_timestamp_seconds` | Backup service | Backup staleness | > 24h since last success |
| `ssl_certificate_expiration_timestamp_seconds` | SSL exporter | Certificate expiry | < 10 days (warning), < 0 (expired/critical) |

---

## 3. Logs (Loki)

Loki is configured with **filesystem storage**, **168h (7 day) retention**, and **20 MB/s ingestion rate limit**. Promtail ships container logs via Docker socket subscription.

### Log Sources

| Source | Log Type | Promtail Job | Pipeline | Retention | Alert |
|--------|----------|--------------|----------|-----------|-------|
| Backend (NestJS) | Structured JSON | `backend` | JSON parse (level, message, timestamp, context, trace) | 7 days | Error rate > 5% |
| Frontend (Next.js) | Structured JSON | `frontend` | JSON parse (level, message, timestamp, route, userId) | 7 days | 5xx rate > 1% |
| Nginx Access | Combined format | `nginx` / type=access | Regex parse (remote_addr, status, bytes) | 7 days | - |
| Nginx Error | Error log format | `nginx` / type=error | Regex parse (level, pid, tid, message) | 7 days | - |
| Docker containers | JSON-file driver | `containers` | JSON parse + regex pipeline | 7 days | - |

### Log-Based Alerts (Loki Ruler)

| Alert Name | Expression | For | Severity |
|------------|-----------|-----|----------|
| HighErrorRateLogs | Error/fatal/exception log rate > 5% of total | 5m | warning |
| CriticalErrorRateLogs | Critical/fatal/panic logs detected | 1m | critical |
| ExceptionSpike | Backend exception rate > 0.1/s | 2m | warning |
| SlowQueryLogSpike | Slow query log rate > 0.5/s | 5m | warning |
| AuthFailureSpike | Auth failure rate > 0.5/s | 5m | warning |
| DatabaseConnectionErrors | Connection refused/timeout/pool exhausted | 2m | critical |
| GCPressureLogs | GC pause / memory pressure / OOM | 2m | warning |
| SecurityEventDetected | SQL injection / XSS / CSRF / brute force | 1m | critical |
| DeploymentFailure | Deployment/build failure mentions | 0m | critical |
| HealthCheckFailures | Health/readiness/liveness probe failures | 2m | warning |

### Required Log Fields

```json
{
  "timestamp": "ISO8601",
  "level": "ERROR",
  "traceId": "uuid",
  "service": "hexa-api",
  "message": "Failed to fetch project from Strapi",
  "context": {
    "projectId": "proj_123",
    "userId": "user_456",
    "durationMs": 5200
  }
}
```

---

## 4. Traces (Tempo / OpenTelemetry)

Tempo is configured with **48h block retention**, **OTLP HTTP receiver on port 4318**, and local filesystem storage.

### Instrumentation

| Service | Instrumentation | Sampling | Exporter | Endpoint |
|---------|----------------|----------|----------|----------|
| Backend (NestJS) | `@opentelemetry/instrumentation-nestjs-core` + `http` + `express` | 100% (SimpleSpanProcessor) | OTLP HTTP | `http://tempo:4318/v1/traces` |
| Frontend (Next.js) | Not yet instrumented | - | - | - |
| CMS (Strapi) | Not yet instrumented | - | - | - |

### Backend Tracing Configuration

```typescript
// apps/backend/src/tracing.ts
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    'service.name': 'hexa-backend',
    'service.version': '1.0.0',
    'deployment.environment': process.env.NODE_ENV ?? 'development',
  }),
  spanProcessor: new SimpleSpanProcessor(
    new OTLPTraceExporter({ url: otlpEndpoint }),
  ),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
  ],
});
```

### Grafana Tempo Data Source Configuration

- **Traces to Logs**: Maps `service.name`, `http.method`, `http.url` tags to Loki
- **Service Map**: Powered by Prometheus
- **Node Graph**: Enabled for service dependency visualization
- **Trace Search**: Enabled

---

## 5. Dashboards (Grafana)

Grafana is configured with auto-provisioning from `/etc/grafana/provisioning/dashboards/`. Data sources (Prometheus, Tempo, Loki) are also auto-provisioned.

### Provisioned Data Sources

| Data Source | Type | URL | Notes |
|-------------|------|-----|-------|
| Prometheus | prometheus | `http://prometheus:9090` | Default, timeInterval=15s |
| Tempo | tempo | `http://tempo:3200` | Traces-to-logs linked to Loki |

### Provisioned Dashboards

| Dashboard File | Description | Panels |
|----------------|-------------|--------|
| `infra-overview.json` | Infrastructure Overview | CPU, memory, disk, network, container health |
| `infra-system.json` | System Overview | Node-level metrics, host details |
| `backend-red.json` | Backend RED Dashboard | Rate (req/s), Errors (5xx%), Duration (p50/p95/p99) |

### Dashboard Categories

| Dashboard | Data Source | Description |
|-----------|-------------|-------------|
| **Infrastructure Overview** | Prometheus | CPU, memory, disk, network across all nodes |
| **Backend RED** | Prometheus | Request rate, error rate, latency distributions |
| **System Overview** | Prometheus | Node-level metrics (load, memory, disk I/O) |
| **Trace Explorer** | Tempo | Distributed trace search and waterfall view |
| **Logs Explorer** | Loki | Ad-hoc log querying with label filters |
| **Web Vitals** | Prometheus | LCP, CLS, INP, FCP, TTFB distributions (to be implemented) |

---

## 6. SLOs & Error Budgets

### Service Level Objectives

| Service | SLI | Target | Window | Error Budget |
|---------|-----|--------|--------|-------------|
| Website (Frontend) | Uptime (HTTP 200) | 99.9% | 30d | 43.2 min/month |
| API (Backend) | Latency p99 < 500ms | 99.5% | 30d | 3.6 hours/month |
| API (Backend) | Error rate < 0.1% | 99.9% | 30d | 43.2 min/month |
| Portal (CMS) | Uptime | 99.5% | 30d | 3.6 hours/month |
| Session Health | Crash-free sessions | 99.5% | 1h rolling | - |

### Sentry Error Budget Alerts

| Alert Name | Condition | Severity | Channel |
|------------|-----------|----------|---------|
| Error Rate Exceeded | > 10 events/min for 5min | Critical | Slack #alerts-critical + PagerDuty |
| Error Rate % High | > 1% for 5min | Critical | Slack #alerts-critical |
| Session Error Rate | > 5% for 10min | Critical | Slack #alerts-critical |
| Crash Free Sessions | < 99% for 1h | Critical | Slack #releases |
| Error Rate % Warning | > 0.5% for 5min | Warning | Slack #alerts-warning |
| Session Error Rate Warning | > 2% for 10min | Warning | Slack #alerts-warning |
| Crash Free Sessions Warning | < 99.5% for 1h | Warning | Slack #releases |

### Error Budget Calculation

| SLA Target | Monthly Error Budget | Allowed Downtime/Month |
|------------|---------------------|----------------------|
| 99.9% | 0.1% | 43.2 minutes |
| 99.5% | 0.5% | 3.6 hours |
| 99.95% | 0.05% | 21.6 minutes |

---

## 7. Health Checks

### Service Health Endpoints

| Service | Endpoint | Interval | Timeout | Retries | Start Period |
|---------|----------|----------|---------|---------|-------------|
| PostgreSQL | `pg_isready` | 10s | 5s | 5 | - |
| Redis | `redis-cli ping` | 10s | 5s | 5 | - |
| Backend | `http://localhost:4000/api/health` | 30s (prod) / 10s (dev) | 10s (prod) / 5s (dev) | 3 | 40s |
| Frontend | `http://localhost:3000` | 30s (prod) / 10s (dev) | 10s (prod) / 5s (dev) | 3 | 40s |
| CMS | `http://localhost:1337/_health` (prod) / `http://localhost:1337/api/health` (dev) | 30s (prod) / 10s (dev) | 10s (prod) / 5s (dev) | 3 | 40s |
| Odoo DB | `pg_isready` (Odoo-specific) | 5s | 5s | 5 | - |
| Odoo | `http://localhost:8069/web/health` | 15s | 5s | 10 | - |
| Meilisearch | `http://localhost:7700/health` | 10s | 5s | 3 | - |
| Qdrant | `http://localhost:6333/healthz` | 10s | 5s | 3 | - |
| MinIO | `http://localhost:9000/minio/health/live` | 30s (prod) / 5s (dev) | 10s (prod) / 5s (dev) | 3 | 30s |
| Prometheus | `http://localhost:9090/-/healthy` | 30s | 10s | 3 | - |
| Grafana | `http://localhost:3000/api/health` | 30s | 10s | 3 | - |

### Backend Health Response

```json
{
  "status": "ok",
  "timestamp": "2026-07-26T12:00:00.000Z",
  "service": "hexastudio-api",
  "dependencies": {
    "odoo": "ok"
  }
}
```

The backend health endpoint (`GET /api/health`) currently checks connectivity to Odoo. Additional dependency checks (PostgreSQL, Redis, MinIO, CMS) are to be added.

---

## 8. Alerting Rules

### Infrastructure Alerts

| Alert Name | Expression | For | Severity | Description |
|------------|-----------|-----|----------|-------------|
| HostDown | `up{job="node-exporter"} == 0` | 1m | critical | Host node exporter unreachable |
| HighCPUUsage | `100 - avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100 > 85` | 5m (rules) / 10m (alerts.yml) | warning | Host CPU > 85% |
| HighMemoryUsage | `(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 > 90` | 5m | warning | Host memory > 90% |
| DiskSpaceCritical | `(node_filesystem_free_bytes / node_filesystem_size_bytes) * 100 < 10` | 5m | critical | Disk < 10% free |
| DiskSpaceWarning | `(node_filesystem_free_bytes / node_filesystem_size_bytes) * 100 < 25` | 10m | warning | Disk < 25% free |
| HighLoadAverage | `node_load1 > 8` | 5m | warning | 1m load average > 8 |
| ContainerHighCPU | `container_cpu_usage > 0.8 cores` (alerts.yml) / `> 0.9 cores` (rules) | 5m | warning | Container CPU > limit |
| ContainerHighMemory | `container_memory > 85% of limit` | 5m | warning | Container memory > 85% |
| ContainerRestartLoop | `restarts > 3 in 15m` (alerts.yml) / `> 5 in 1h` (rules) | 2m / 0m | critical | Container restart loop |

### Service Alerts

| Alert Name | Expression | For | Severity | Description |
|------------|-----------|-----|----------|-------------|
| BackendDown | `up{job="backend"} == 0` | 1m | critical | Backend service down |
| FrontendDown | `up{job="frontend"} == 0` | 1m | critical | Frontend service down |
| PostgresDown | `up{job="postgres"} == 0` | 1m | critical | PostgreSQL down |
| RedisDown | `up{job="redis"} == 0` | 1m | critical | Redis down |
| MinIODown | `up{job="minio"} == 0` | 1m | critical | MinIO down |
| QdrantDown | `up{job="qdrant"} == 0` | 1m | critical | Qdrant vector DB down |

### Application Performance Alerts

| Alert Name | Expression | For | Severity | Description |
|------------|-----------|-----|----------|-------------|
| HighErrorRate | `5xx rate > 5% of total` | 2m | critical | Backend 5xx > 5% |
| FrontendHighErrorRate | `5xx rate > 5% of total` | 2m | warning | Frontend 5xx > 5% |
| BackendHighLatency | `p95 > 2s` (hexa-alerts.yml) / `p99 > 3s` (alerts.yml) | 5m | warning | API p95 > 2s / p99 > 3s |
| FrontendHighLatency | `p99 > 2s` | 5m | warning | Frontend p99 > 2s |
| BackendLowThroughput | `request rate < 0.1 req/s` | 10m | info | Unusually low traffic |

### Database Alerts

| Alert Name | Expression | For | Severity | Description |
|------------|-----------|-----|----------|-------------|
| PostgresConnectionsHigh | `connections > 80% of max` | 5m | warning | PG connections > 80% |
| PostgresConnectionsCritical | `connections > 95% of max` | 2m | critical | PG connections > 95% |
| RedisMemoryHigh | `memory > 85% of max` | 5m | warning | Redis memory > 85% |

### AI / Vector Search Alerts

| Alert Name | Expression | For | Severity | Description |
|------------|-----------|-----|----------|-------------|
| VectorSearchHighLatency | `p95 > 1s` | 5m | warning | Vector search p95 > 1s |
| VectorSearchErrors | `error rate > 0.01/s` | 2m | critical | Vector search errors |
| EmbeddingGenerationFailures | `error rate > 0.1/s` | 2m | warning | Embedding failures |
| EmbeddingCostSpike | `tokens/s > 100,000` | 5m | warning | High token usage |
| NoNewProjectsIndexed | `vector_sync_total == 0 in 1h` | 0m | warning | Sync stalled |
| SearchTrafficAnomaly | `search rate < 0.01/s` | 30m | info | Low search traffic |

### Security Alerts

| Alert Name | Expression | For | Severity | Description |
|------------|-----------|-----|----------|-------------|
| SSLCertExpiringSoon | `expiry < 10 days` | 0m | warning | SSL cert expiring |
| SSLCertExpired | `expiry < now` | 0m | critical | SSL cert expired |

### Backup Alerts

| Alert Name | Expression | For | Severity | Description |
|------------|-----------|-----|----------|-------------|
| BackupFailed | `backup_job_success_total == 0 in 24h` / `backup_job_failed_total > 0` | 0m | warning / critical | Backup not running or failed |
| BackupOld | `time() - last_success > 86400` | 0m | warning | Backup stale > 24h |

### Web Vitals Alerts (RUM)

| Alert Name | Expression | For | Severity | Description |
|------------|-----------|-----|----------|-------------|
| LCPPoor | `LCP p75 > 2.5s` | 10m | warning | LCP exceeds threshold |
| CLSPoor | `CLS p75 > 0.1` | 10m | warning | CLS exceeds threshold |
| INPPoor | `INP p75 > 200ms` | 10m | warning | INP exceeds threshold |

---

## 9. Synthetic Monitoring (Uptime Kuma)

Uptime Kuma runs as a Docker container (`louislam/uptime-kuma:latest`) accessible at `https://uptime.hexastudio.net` via Traefik.

### Monitored Endpoints

| Monitor Name | URL | Interval | Status |
|-------------|-----|----------|--------|
| Website | `https://hexastudio.net` | 60s | Active |
| API | `https://api.hexastudio.net` | 60s | Active |
| API Health | `https://api.hexastudio.net/health` | 30s | Active |
| CMS | `https://cms.hexastudio.net` | 60s | Active |
| Odoo | `https://odoo.hexastudio.net` | 5m | Active |
| Portal | `https://portal.hexastudio.net` | 60s | Planned |
| Grafana | `https://grafana.hexastudio.net` | 5m | Active |
| Prometheus | `https://prometheus.hexastudio.net` | 5m | Active |
| GitLab | `http://19.16.1.100:8929` | 60s | Active |

---

## 10. Notification Channels

### Alert Routing

| Alert Severity | Channels | Response Time | Examples |
|---------------|----------|--------------|----------|
| **Critical** | Slack #alerts-critical + PagerDuty + Email | 15 minutes | Backend down, PG down, high 5xx, security events, backup failure |
| **Warning** | Slack #alerts-warning + Email | 1 hour | High CPU, disk space warning, slow queries, cert expiring |
| **Info** | Slack #alerts-info | Next business day | Low throughput, traffic anomalies |

### Slack Webhook Configuration

```bash
# Required environment variables
SENTRY_SLACK_CRITICAL_WEBHOOK=https://hooks.slack.com/services/xxx/xxx/xxx
SENTRY_SLACK_WARNING_WEBHOOK=https://hooks.slack.com/services/xxx/xxx/xxx
SENTRY_SLACK_RELEASES_WEBHOOK=https://hooks.slack.com/services/xxx/xxx/xxx
```

### PagerDuty Integration

- **Service**: `HEXA Studio Production`
- **Escalation Policy**: Immediate → Engineer on call → Engineering Lead
- **Notification**: Push + SMS + Phone call for critical alerts

---

## 11. Sentry Error Tracking

### Global Configuration

| Setting | Production | Staging | Development |
|---------|-----------|---------|-------------|
| Sample Rate | 100% (phase 1), 20% (target) | 100% | 0% |
| Environment | `production` | `staging` | `development` |
| Release Tracking | Commit SHA | Branch name | Local |

### Critical Alert Rules (Immediate Notification)

| Event | Trigger | Notification |
|-------|---------|-------------|
| Critical API Error | 5xx on `/api/projects/*` | Slack #alerts-critical |
| JS Runtime Error | Unhandled exception in 3D Canvas | Slack #alerts-frontend |
| Auth Failure Spike | > 5% login failures in 5m | PagerDuty + Email |
| CMS Timeout | Strapi request > 5s | Slack #alerts-backend |

### Custom Tags (Required on All Events)

| Tag | Values | Purpose |
|-----|--------|---------|
| `user_role` | Guest, Client, Admin | Role-based filtering |
| `device_type` | Mobile, Desktop, Tablet | Device-specific debugging |
| `scene_id` | string | 3D scene context |
| `api_version` | semver | API version tracking |

### Sentry Metrics in Grafana

```promql
# Error rate
rate(sentry_events_total{level="error"}[5m])

# Error rate percentage
sum(rate(sentry_events_total{level="error"}[5m])) / sum(rate(sentry_events_total[5m])) * 100

# Crash free sessions
sentry_release_crash_free_sessions_percent

# Release adoption
sentry_release_adoption_percent
```

---

## 12. Real User Monitoring (RUM)

### Implementation Status

- **Status**: Implemented (`apps/frontend/src/components/WebVitals.tsx`)
- **Mechanism**: `next/web-vitals` `useReportWebVitals` hook
- **Transport**: `navigator.sendBeacon` (fallback to `fetch` with `keepalive`)
- **Endpoint**: `NEXT_PUBLIC_VITALS_ENDPOINT` (configurable, default: `https://api.hexastudio.net/api/vitals`)

### Target Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | < 2.5s | 2.5s - 4s | > 4s |
| **FCP** | < 1.8s | 1.8s - 3s | > 3s |
| **CLS** | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **FID** | < 100ms | 100ms - 300ms | > 300ms |
| **TTFB** | < 800ms | 800ms - 1800ms | > 1800ms |
| **INP** | < 200ms | 200ms - 500ms | > 500ms |

### Data Pipeline

```
Browser --> sendBeacon --> /api/vitals --> Redis (rolling buffer, max 10k entries)
                                 |
                          Prometheus Exporter --> Grafana "Web Vitals" Dashboard
                                 |
                          Alerting (LCP p75 > 2.5s, CLS > 0.1, INP > 200ms)
```

---

## 13. Operational Commands

```bash
# Access Grafana dashboard
open https://grafana.hexastudio.net

# Reload Prometheus configuration without container restart
curl -X POST http://localhost:9090/-/reload

# Query Loki logs via LogCLI
logcli query '{container_name="hexa-backend-blue"} |= "ERROR"' --tail

# Trigger test error in Sentry
curl -X POST https://sentry.io/api/0/projects/hexa-studio/hexastudio/envelopes/ \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -d '{"event_id": "test-123", "level": "error", "message": "Test error budget alert"}'

# Check Prometheus targets
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[].labels.job'

# List all alert rules
curl -s http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[].name'

# Access container logs directly
docker logs hexa-backend --tail 100

# Verify Tempo is receiving traces
curl -s http://localhost:3200/ready
```

---

## 14. Related Documentation

- [MONITORING.md](./MONITORING.md) — Observability standards overview
- [MONITORING_SPEC.md](./MONITORING_SPEC.md) — Grafana panel specifications
- [SENTRY_ERROR_BUDGETS.md](./SENTRY_ERROR_BUDGETS.md) — Error budget configuration
- [WEB_VITALS_RUM.md](./WEB_VITALS_RUM.md) — Real User Monitoring setup
- [Backup & Disaster Recovery](./BACKUP.md) — Backup procedures
- [Docker Compose](../../docker-compose.yml) — Service definitions and health checks
- [Docker Compose Production](../../docker-compose.prod.yml) — Production monitoring stack
- [Prometheus Configuration](../../docker/prometheus/prometheus.yml) — Scrape targets
- [Grafana Dashboards](../../docker/grafana/provisioning/dashboards/) — Provisioned dashboards
