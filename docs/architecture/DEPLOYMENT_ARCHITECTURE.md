# Deployment Architecture

**Last Updated:** 2026-09-04

---

## Deployment Strategy

HEXA Vision uses a **Blue-Green Deployment** strategy for the production environment to ensure zero downtime and instant rollback.

---

## Infrastructure Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Edge Layer (Cloudflare)                     │
│  - DNS, WAF, CDN, SSL Termination, Load Balancing                   │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Orchestration Layer                            │
│  - Traefik v3 (Reverse Proxy / Ingress)                             │
│  - Docker Compose (Service Orchestration)                           │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Application Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Frontend │  │ Backend  │  │ Strapi   │  │  Odoo    │              │
│  │ (Next.js)│  │ (NestJS) │  │ (Headless)│  │  (ERP)   │              │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Data Layer                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Postgres  │  │  Redis   │  │  MinIO   │  │  Qdrant  │              │
│  │ (DBs)     │  │  (Cache) │  │ (Storage)│  │ (Vector) │              │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

**Additional services:** Grafana (metrics), Prometheus (monitoring), Loki (logging), Promtail (log shipping), node-exporter (host metrics), Tempo (distributed tracing), cloudflared (edge tunnel), watchtower (image updates), backup + backup-verify (database operations).

---

## Deployment Flow

1. **Build:** GitLab CI/CD pipeline builds Docker images from the monorepo using Docker Buildx with caching.
2. **Push:** Images are pushed to **GitLab Container Registry** (`registry.gitlab.hexastudio.net`).
3. **Deploy:** SSH command triggers `scripts/deploy-zero-downtime.sh` on the production server, which performs a blue/green swap with health verification.
4. **Verify:** Health check endpoint (`GET /api/health`) is polled until it returns 200.
5. **Cleanup:** `docker system prune -f` removes old images.

---

## Environment Configuration

| Environment | URL | Branch | Purpose |
|-------------|-----|--------|---------|
| Production | `hexastudio.net` | `main` | Live site |
| Staging | `staging.hexastudio.net` | `develop` | Pre-release testing |
| Development | `localhost:3000` | `feature/*` | Feature development |
| GitLab CE | `gitlab.hexastudio.net` | — | CI/CD + Container Registry (port 8929) |

**GitLab CE** is the **primary DevOps source of truth**. The legacy GitHub Actions pipeline has been fully migrated. See `docs/devops/GITLAB_OPERATIONS.md` for operational runbook.

---

## Rollback Procedure

In case of critical failure:

1. Revert the commit in `main`.
2. Trigger the deployment pipeline on GitLab CI/CD.
3. Or manually: `docker compose up -d <service>:<previous-sha-tag>`.

**Blue/Green rollback:** The `SOT` (Source of Truth) environment variable controls the active slot (`blue` or `green`). To rollback, set `SOT=<inactive-slot>` and redeploy — Traefik routing labels swap atomically.

---

## Scaling Path

- **Current:** Single-node Docker Compose (28 containers, 3 blue/green services)
- **Mid-term:** Docker Swarm for high availability (replicas, load balancing)
- **Long-term:** Kubernetes (K8s) for full orchestration and auto-scaling

Container health checks gate every deployment: `hexa-backend-blue` (4000), `hexa-frontend-blue` (3000), Strapi 5 (1337), Odoo 17 (8069), PostgreSQL, Redis, MinIO, Qdrant, Traefik, Grafana, Prometheus, Loki, Tempo, etc.
