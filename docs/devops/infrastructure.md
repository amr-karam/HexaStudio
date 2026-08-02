# Infrastructure Overview

**Last Updated:** 2026-07-08

---

## Server Specification

| Component | Specification |
|-----------|---------------|
| CPU | 8 vCPUs (Intel Xeon / AMD EPYC) |
| RAM | 32 GB |
| Storage | 500 GB NVMe SSD (root) + 1 TB SSD (data) |
| Network | 1 Gbps dedicated |
| OS | Ubuntu 24.04 LTS |
| Docker | CE 26+ |
| Docker Compose | v2 |

## Network Topology

```
Internet
    │
    ▼
Cloudflare (CDN, WAF, DNS)
    │
    ▼
Firewall (UFW): Ports 80, 443 only
    │
    ▼
Docker Host
    │
    ├── Traefik (Reverse Proxy, SSL)
    │       │
    │       ├── Public Network
    │       │   ├── Frontend :3000
    │       │   ├── Backend API :4000
    │       │   ├── Grafana :3001
    │       │   └── Uptime Kuma :3002
    │       │
    │       └── Internal Network (internal: true)
    │           ├── PostgreSQL :5432
    │           ├── Redis :6379
    │           ├── MinIO :9000
    │           ├── Strapi :1337
    │           └── Odoo :8069
    │
    ├── Monitoring Stack (Public Network)
    │   ├── Prometheus :9090
    │   ├── Grafana :3001
    │   ├── Loki :3100
    │   ├── Promtail
    │   ├── Node Exporter :9100
    │   └── cAdvisor :8080
    │
    └── Volume Mounts
        ├── postgres_data → /data/postgres
        ├── redis_data → /data/redis
        ├── minio_data → /data/minio
        └── monitoring_data → /data/monitoring
```

## Firewall Rules (UFW)

```bash
# Allow SSH (management IP only)
sudo ufw allow from <management-ip> to any port 22

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Docker network
sudo ufw allow from 172.16.0.0/12

# Deny all other incoming
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw enable
```

## Docker Resource Limits

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  postgres:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G

  redis:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  minio:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
```

## Volume Strategy

| Volume | Size | Backup | Purpose |
|--------|------|--------|---------|
| `postgres_data` | 100 GB | Yes (pg_dump + WAL) | Database files |
| `redis_data` | 1 GB | No (ephemeral) | Cache data |
| `minio_data` | 500 GB | Yes (mc mirror) | File storage |
| `loki_data` | 50 GB | No (retention policy) | Log storage |
| `prometheus_data` | 20 GB | No (retention policy) | Metrics |

## Monitoring Ports (Cloudflare Access)

Monitoring endpoints are protected behind Cloudflare Access (Zero Trust):

- `monitor.hexastudio.net` — Grafana
- `status.hexastudio.net` — Uptime Kuma
- `prometheus.hexastudio.net` — Prometheus API (restricted)

## Related Documents

- `DEPLOYMENT_STRATEGY.md` — Deployment pipeline
- `devops/monitoring-setup.md` — Monitoring configuration
- `devops/disaster-recovery.md` — DR plan
- `devops/incident-response.md` — Incident runbook
