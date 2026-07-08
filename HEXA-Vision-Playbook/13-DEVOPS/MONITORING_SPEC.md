# Monitoring & Observability Specifications

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Overview

The observability stack is designed to provide a "Single Pane of Glass" for both system health (Infrastructure) and user experience (Frontend). We use a combination of **Prometheus/Grafana** for metrics and **Sentry** for error tracking.

## 1. Sentry Configuration (Error Tracking)

### Global Settings
- **Sample Rate:** 100% for Production (initial phase), 20% after stability.
- **Environment:** `production`, `staging`, `development`.
- **Release Tracking:** Linked to GitHub commit SHA.

### Critical Alerts (Immediate Notification)
| Event | Trigger | Notification Channel |
|-------|---------|---------------------|
| **Critical API Error** | 5xx error on `/api/projects/*` | Slack #alerts-critical |
| **JS Runtime Error** | Unhandled exception in 3D Canvas | Slack #alerts-frontend |
| **Auth Failure Spike** | > 5% of logins failing in 5m | PagerDuty / Email |
| **CMS Timeout** | Strapi request > 5s | Slack #alerts-backend |

### Custom Tags for Debugging
Every Sentry event must include:
- `user_role`: (Guest, Client, Admin)
- `device_type`: (Mobile, Desktop, Tablet)
- `scene_id`: (If error occurs within a 3D scene)
- `api_version`: (Current BFF version)

---

## 2. Prometheus & Grafana (Metrics)

### Infrastructure Dashboard (The "Health" View)
Focuses on the stability of the hosting environment.

| Panel | Metric | Goal | Alert Threshold |
|-------|--------|------|-----------------|
| **CPU Usage** | `node_cpu_seconds_total` | < 70% | > 90% for 5m |
| **Memory Pressure** | `node_memory_MemAvailable_bytes` | > 1GB | < 500MB |
| **Disk I/O** | `node_disk_io_time_seconds_total` | Low latency | > 20% util |
| **Network Throughput** | `node_network_receive_bytes_total` | Stable | Unexpected spikes |

### API Performance Dashboard (The "Speed" View)
Focuses on the NestJS BFF and Strapi performance.

| Panel | Metric | Goal | Alert Threshold |
|-------|--------|------|-----------------|
| **Request Latency** | `http_request_duration_seconds` | p95 < 300ms | p95 > 1s |
| **Error Rate** | `http_requests_total{status=~"5.."}` | < 0.1% | > 1% |
| **Concurrent Users** | `active_websocket_connections` | Linear growth | Sudden drop |
| **DB Query Time** | `postgresql_query_duration_seconds` | < 100ms | > 500ms |

### 3D Experience Dashboard (The "Quality" View)
Custom metrics sent from the frontend to a Prometheus Pushgateway.

| Panel | Metric | Goal | Alert Threshold |
|-------|--------|------|-----------------|
| **Avg FPS** | `hexa_frontend_fps` | > 55 FPS | < 30 FPS (Average) |
| **Asset Load Time** | `hexa_asset_load_duration_ms` | < 3s | > 10s |
| **Memory Leak** | `window.performance.memory.usedJSHeapSize` | Stable | Growth > 200MB/hr |
| **Canvas Crashes** | `hexa_webgl_context_lost_total` | 0 | > 1 per 100 sessions |

---

## 3. Logging Strategy (Loki)

All logs must be structured as JSON for easy querying in Grafana.

### Log Levels
- `INFO`: General application flow.
- `WARN`: Non-critical issues (e.g., slow API response).
- `ERROR`: Actionable failures (e.g., DB connection lost).
- `FATAL`: System crash / Data loss.

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

## 4. Review Cycle

- **Weekly Audit:** Review the "Error Top 10" in Sentry and prioritize fixes in the next sprint.
- **Monthly Tuning:** Adjust Prometheus alert thresholds based on actual traffic patterns.
