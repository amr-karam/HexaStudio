# DevOps Guide

This directory contains DevOps runbooks and infrastructure documentation for the HEXA Vision platform.

## Contents

| File | Description |
|------|-------------|
| `infrastructure.md` | Complete infrastructure overview |
| `docker-compose-guide.md` | Docker Compose usage guide |
| `ci-cd-pipeline.md` | CI/CD pipeline documentation |
| `monitoring-setup.md` | Prometheus/Grafana/Loki setup |
| `backup-restore.md` | Backup and restore procedures |
| `disaster-recovery.md` | Disaster recovery plan |
| `incident-response.md` | Incident response runbook |
| `ssl-certificates.md` | SSL/TLS certificate management |
| `server-setup.md` | Server provisioning guide |
| `database-maintenance.md` | PostgreSQL maintenance procedures |
| `scaling-guide.md` | Horizontal and vertical scaling |
| `security-hardening.md` | Server hardening checklist |

## Quick Reference

### Useful Commands

```bash
# Deploy all services
docker compose -f docker-compose.prod.yml up -d

# Check service logs
docker compose logs -f frontend

# Restart specific service
docker compose restart backend

# Backup all databases
./scripts/backup.sh

# Health check
curl https://hexastudio.net/api/health
```

### Monitoring URLs

| Service | URL |
|---------|-----|
| Grafana | https://monitor.hexastudio.net |
| Prometheus | https://prometheus.hexastudio.net |
| Sentry | https://sentry.hexastudio.net |
| Uptime Kuma | https://status.hexastudio.net |

### Alert Contacts

| Channel | Contact |
|---------|---------|
| Slack | #ops-alerts |
| Email | ops@hexastudio.net |
| PagerDuty | On-call rotation |
