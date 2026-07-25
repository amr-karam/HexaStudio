# 📊 OBSERVABILITY, METRICS & LOGGING STANDARDS

**Version:** 1.0.0 | **Scope:** Production Monitoring Stack | **Standard:** RED Method & USE Method Observability

---

## 1. OVERVIEW & METRIC FRAMEWORK

HEXA Vision enforces comprehensive observability using Prometheus (metrics), Grafana (visualization), Loki/Promtail (log aggregation), and Sentry (error budgets).

Observability adheres to two industry standard frameworks:
1. **RED Method (Services)**: **R**ate (requests/sec), **E**rrors (failed requests/sec), **D**uration (latency distribution p50/p95/p99).
2. **USE Method (Infrastructure)**: **U**tilization (% capacity), **S**aturation (queue lengths), **E**rrors (hardware/OS error counts).

---

## 2. OBSERVABILITY STACK TOPOLOGY

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           OBSERVABILITY STACK                          │
  │                                                                        │
  │   ┌────────────────────┐    ┌────────────────────┐    ┌────────────┐   │
  │   │  Prometheus v2.54  │    │     Loki v3.2.1    │    │ Sentry SDK │   │
  │   │ (Metrics Scraper)  │    │  (Log Aggregation) │    │(App Errors)│   │
  │   └─────────┬──────────┘    └─────────┬──────────┘    └─────┬──────┘   │
  │             │                         │                     │          │
  │             └───────────┐   ┌─────────┘                     │          │
  │                         ▼   ▼                               │          │
  │                   ┌───────────┐                             │          │
  │                   │  Grafana  │ ◄───────────────────────────┘          │
  │                   │  v11.3.0  │                                        │
  │                   └───────────┘                                        │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 3. PROMETHEUS SCRAPE TARGETS & ALERT RULES (`docker/prometheus/`)

Prometheus scrapes metrics every 15s across internal endpoints:
- `backend`: `/api/metrics` (NestJS Prometheus module).
- `node-exporter`: `:9100` (Host CPU, Memory, Disk I/O).
- `postgres-exporter`: `:9187` (DB connections, transaction rates).
- `redis-exporter`: `:9121` (Memory fragmentation, cache hit ratio).
- `cadvisor`: `:8080` (Container-level CPU/RAM resource limits).

### Critical Alert Rules (`docker/prometheus/rules/alerts.yml`)
- **`HighCPUUsage`**: CPU $> 85\%$ for $> 5$ minutes.
- **`HighMemoryUsage`**: Memory $> 90\%$ for $> 3$ minutes.
- **`HighErrorRate`**: HTTP 5xx errors $> 1\%$ of total traffic for $> 2$ minutes.
- **`DatabaseConnectionsExhausted`**: Active PG connections $> 80\%$ of `max_connections`.

---

## 4. LOG AGGREGATION & LOKI PARSING

Promtail captures Docker container stdout/stderr via socket subscription and ships structured JSON logs to Loki:

```yaml
# Promtail log pipeline configuration
pipeline_stages:
  - json:
      expressions:
        level: level
        message: message
        timestamp: timestamp
        correlationId: correlationId
  - labels:
      level:
```

Loki log retention policy is set to **168 hours (7 days)** with automatic pruning.

---

## 5. REAL USER MONITORING (RUM) & CORE WEB VITALS

Client-side performance metrics are captured by `WebVitals.tsx` in `apps/frontend` and shipped to `/api/vitals`:
- **LCP (Largest Contentful Paint)**: Target $< 1.2\text{s}$.
- **FCP (First Contentful Paint)**: Target $< 1.0\text{s}$.
- **TBT (Total Blocking Time)**: Target $< 150\text{ms}$.
- **CLS (Cumulative Layout Shift)**: Target $< 0.05$.

---

## 6. OPERATIONAL COMMANDS

```bash
# Access Grafana dashboard
open https://grafana.hexastudio.net

# Reload Prometheus configuration without container restart
curl -X POST http://localhost:9090/-/reload

# Query Loki logs via LogCLI
logcli query '{container_name="hexa-backend-blue"} |= "ERROR"' --tail
```

---

## 7. RELATED DOCUMENTATION

- [MONITORING_SPEC.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/13-DEVOPS/MONITORING_SPEC.md) — Grafana panel specifications.
- [SENTRY_ERROR_BUDGETS.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/13-DEVOPS/SENTRY_ERROR_BUDGETS.md) — Error budget tracking.
- [WEB_VITALS_RUM.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/13-DEVOPS/WEB_VITALS_RUM.md) — RUM setup.
