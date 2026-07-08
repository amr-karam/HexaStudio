# Monitoring Setup

**Last Updated:** 2026-07-08

---

## Stack

| Component | Container | Port |
|-----------|-----------|------|
| Prometheus | prom/prometheus | 9090 |
| Grafana | grafana/grafana | 3001 |
| Loki | grafana/loki | 3100 |
| Promtail | grafana/promtail | — |
| Node Exporter | prom/node-exporter | 9100 |
| cAdvisor | google/cadvisor | 8080 |
| Uptime Kuma | louislam/uptime-kuma | 3002 |
| Sentry | SaaS | — |

## Prometheus Configuration

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'frontend'
    static_configs:
      - targets: ['frontend:3000']

  - job_name: 'backend'
    static_configs:
      - targets: ['backend:4000']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

## Grafana Dashboards

### System Overview
- CPU, memory, disk, network usage
- Container health and resource usage
- Uptime and availability

### Application Performance
- Request rate (by endpoint)
- Request duration (p50, p95, p99)
- Error rate (5xx / total)
- Active users and sessions

### 3D Performance
- Scene load time
- FPS distribution
- Draw calls and triangles
- Memory usage (GPU)
- Texture memory

### Business Metrics
- Daily active visitors
- Lead conversion rate
- Project pipeline stages
- Revenue tracking

### Database
- Connection count
- Query execution time
- Cache hit ratio
- Replication lag

## Loki Log Configuration

```yaml
# loki/loki-config.yml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1

schema_config:
  configs:
    - from: 2026-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache

limits_config:
  retention_period: 720h
  max_line_size: 256kb
```

## Promtail Configuration

```yaml
# promtail/promtail-config.yml
server:
  http_listen_port: 9080

positions:
  filename: /var/log/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: 'docker'
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: 'container'
```

## Alert Rules

```yaml
# prometheus/alerts.yml
groups:
  - name: hexa_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.service }}"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "{{ $labels.job }} is down"

      - alert: HighLatency
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High p99 latency on {{ $labels.service }}"

      - alert: DiskSpace
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 20
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk space below 20% on {{ $labels.instance }}"

      - alert: SSLExpiry
        expr: ssl_certificate_expiry_days < 14
        for: 1h
        labels:
          severity: critical
        annotations:
          summary: "SSL certificate for {{ $labels.domain }} expires in {{ $value }} days"
```

## Uptime Monitoring

Uptime Kuma monitors:

| Service | URL | Interval |
|---------|-----|----------|
| Website | https://hexastudio.net | 1 min |
| API | https://api.hexastudio.net | 1 min |
| API Health | https://api.hexastudio.net/health | 1 min |
| CMS | https://cms.hexastudio.net | 5 min |
| Odoo | https://odoo.hexastudio.net | 5 min |
| Monitoring | https://monitor.hexastudio.net | 5 min |

## Notification Channels

| Alert Severity | Channel | Response Time |
|---------------|---------|--------------|
| Critical | Slack + Email + PagerDuty | 15 min |
| Warning | Slack + Email | 1 hour |
| Info | Slack | Next business day |
