# Deployment Architecture

**Last Updated:** 2026-07-08

---

## Deployment Strategy

HEXA Vision uses a **Blue-Green Deployment** strategy for the production environment to ensure zero downtime and instant rollback.

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
│  │ Postgres  │  │  Redis   │  │  MinIO   │  │  S3      │              │
│  │ (DBs)     │  │  (Cache) │  │ (Storage)│  │ (Backup) │              │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

## Deployment Flow

1. **Build:** GitHub Action builds Docker images from the monorepo.
2. **Push:** Images are pushed to GitHub Container Registry (GHCR).
3. **Deploy:** SSH command triggers `docker compose pull` on the production server.
4. **Update:** `docker compose up -d --remove-orphans` performs a rolling update.
5. **Verify:** Health check endpoint `/api/health` is polled until it returns 200.
6. **Cleanup:** `docker system prune -f` removes old images.

## Environment Configuration

| Environment | URL | Branch | Purpose |
|-------------|-----|--------|---------|
| Production | hexastudio.net | `main` | Live site |
| Staging | staging.hexastudio.net | `develop` | Pre-release testing |
| Development | localhost:3000 | `feature/*` | Feature development |

## Rollback Procedure

In case of critical failure:

1. Revert the commit in `main`.
2. Trigger the deployment pipeline.
3. Or manually: `docker compose up -d <service>:<previous-tag>`.

## Scaling Path

- **Current:** Single-node Docker Compose
- **Mid-term:** Docker Swarm for high availability (replicas, load balancing)
- **Long-term:** Kubernetes (K8s) for full orchestration and auto-scaling
