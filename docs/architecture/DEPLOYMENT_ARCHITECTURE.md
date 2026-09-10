# Deployment Architecture

**Last Updated:** 2026-09-10

---

## Deployment Strategy

HEXA Studio uses a **Blue/Green Deployment** strategy for the production environment to ensure zero downtime and instant rollback.

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
│                      Cloudflare Tunnel                               │
│  - cloudflared exposes host services without a public IP            │
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

---

## Deployment Flow

1. **Build:** GitLab CI/CD pipeline builds Docker images from the monorepo.
2. **Push:** Images are pushed to the GitLab Container Registry (`registry.gitlab.hexastudio.net`).
3. **Deploy:** The pipeline triggers deployment on the production server via SSH.
4. **Verify:** Health checks confirm service readiness before traffic continues.
5. **Cleanup:** Old images and unused resources are pruned.

---

## Environment Configuration

| Environment | URL | Branch | Purpose |
|-------------|-----|--------|---------|
| Production | `hexastudio.net` | `main` | Live site |
| Staging | `staging.hexastudio.net` | `develop` | Pre-release testing |
| Development | `localhost:3000` | `feature/*` | Feature development |
| GitLab CE | `gitlab.hexastudio.net` | — | CI/CD + Container Registry |

**GitLab CE** is the **primary DevOps source of truth**. The legacy GitHub Actions pipeline has been fully migrated.

---

## Rollback Procedure

In case of critical failure:

1. Revert the commit in `main`.
2. Trigger the deployment pipeline on GitLab CI/CD.
3. Or manually redeploy the previous image tag via Docker Compose.

**Blue/Green rollback:** The `SOT` (Source of Truth) environment variable controls the active slot (`blue` or `green`). To rollback, change `SOT` to the inactive slot and redeploy.

---

## Scaling Path

- **Current:** Single-node Docker Compose
- **Mid-term:** Docker Swarm for high availability
- **Long-term:** Kubernetes for full orchestration and auto-scaling

Container health checks gate every deployment: `hexa-backend-blue` (4000), `hexa-frontend-blue` (3000), Strapi 5 (1337), Odoo 17 (8069), PostgreSQL, Redis, MinIO, Qdrant, Traefik, Grafana, Prometheus, Loki, Tempo, and observability exporters.
