# ADR-005: Containerization and Deployment

**Status:** Accepted
**Date:** 2026-07-08
**Deciders:** DevOps Engineer, Chief Architect

---

## Context

The platform has multiple services (frontend, backend, CMS, databases, monitoring) that must be deployed consistently across environments. We need a deployment strategy that is reproducible, scalable, and manageable.

## Decision

Use **Docker Compose with multi-stage Dockerfiles** and **Traefik** as reverse proxy.

### Services

| Service | Image | Port | Notes |
|---------|-------|------|-------|
| frontend | Custom (Next.js standalone) | 3000 | Multi-stage, 52MB |
| backend | Custom (NestJS) | 4000 | Multi-stage |
| cms | strapi/strapi (with custom Dockerfile) | 1337 | Node 20 Alpine |
| postgres | postgres:16-alpine | 5432 | App database |
| redis | redis:7-alpine | 6379 | Cache/sessions |
| minio | minio/minio | 9000/9001 | S3-compatible storage |
| traefik | traefik:v3 | 80/443/8080 | Reverse proxy + SSL |
| prometheus | prom/prometheus | 9090 | Metrics |
| grafana | grafana/grafana | 3000 | Dashboards |
| loki | grafana/loki | 3100 | Log aggregation |
| promtail | grafana/promtail | - | Log collector |
| watchtower | containrrr/watchtower | - | Auto-updates |
| backup | Custom | - | DB + MinIO backup |

### Deployment Flow

1. Code pushed to GitHub `stage` branch
2. CI (when available) builds images on server
3. Watchtower detects new images and updates containers
4. Traefik handles SSL termination via Let's Encrypt

### Infrastructure

- Single VPS (currently)
- Docker Compose for orchestration (no Swarm/K8s)
- .env file for environment-specific configuration
- docker-compose.override.yml for local development

## Consequences

### Positive
- Reproducible deployments across environments
- Single command to start all services
- Traefik auto-discovers containers for routing
- Watchtower enables automatic updates

### Negative
- Single point of failure (VPS)
- No horizontal scaling
- Docker Compose lacks native health-based rolling updates
- Watchtower can cause unexpected restarts

## Verification

- All containers start and pass health checks
- Traefik routes traffic correctly to each service
- Backup runs on schedule and uploads to MinIO
- Restore from backup verified quarterly
