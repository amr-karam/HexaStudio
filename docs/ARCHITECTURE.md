# HexaStudio Architecture (v1)

## Overview

HexaStudio.net runs as a Dockerized microservices stack behind Traefik v3, with Cloudflare as the edge CDN/WAF in production.

```
                    ┌─────────────┐
                    │  Cloudflare │
                    │  CDN / WAF  │
                    └──────┬──────┘
                           │ HTTPS
                    ┌──────▼──────┐
                    │  Traefik v3 │
                    │  (reverse   │
                    │   proxy)    │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  Next.js    │ │   NestJS    │ │   Strapi    │
    │  Frontend   │ │   API       │ │   CMS       │
    │  :3000      │ │   :4000     │ │   :1337     │
    └─────────────┘ └──────┬──────┘ └──────┬──────┘
                           │               │
                    ┌──────▼───────────────▼──────┐
                    │   hexastudio_internal       │
                    │   (no public exposure)    │
                    ├──────────┬──────────┬───────┤
                    │ Postgres │  Redis   │ MinIO │
                    │   :5432  │  :6379   │ :9000 │
                    └──────────┴──────────┴───────┘
```

## Networks

| Network | Purpose | Public |
|---------|---------|--------|
| `hexastudio_web` | Traefik-routed services | Yes (via Traefik :80/:443) |
| `hexastudio_internal` | PostgreSQL, Redis, inter-service DB traffic | No (`internal: true`) |

PostgreSQL and Redis have **no published ports**. Only services on both networks (backend, cms) can reach them.

## Services

### Traefik v3

- Routes by `Host()` header using env vars (`FRONTEND_HOST`, `API_HOST`, etc.)
- Dynamic middlewares: secure headers, compression, rate limiting
- Prometheus metrics on `:8080`
- Production: enable ACME/Let's Encrypt via `TRAEFIK_ACME_ENABLED`

### Next.js Frontend (`apps/frontend`)

- Next.js 16.2.11 with App Router, standalone Docker output
- TailwindCSS 4, Three.js/R3F/Drei
- **Architecture:** Feature-based structure (`src/features`) for domain isolation.
- **UI Components:** Atomic design approach with a dedicated `/ui` library.
- **Stability:** Global Error Boundaries and Loading states implemented.
- **Performance:** `DynamicComponent` wrapper for route-based and component-level lazy loading.
- TanStack Query + Zustand providers scaffolded
- Sentry via `NEXT_PUBLIC_SENTRY_DSN`

### NestJS API (`apps/backend`)

- Global prefix: `/api`
- Swagger: `/api/docs`
- **Architecture:** Modular feature-based structure (`src/modules`).
- **Core Layer:** Dedicated `/src/core` for global filters, interceptors, and guards.
- **Standardized API:** Global Exception Filter ensures consistent `ApiResponse<T>` format across all endpoints.
- Security: Helmet, CORS (env), `@nestjs/throttler` rate limiting
- Validation: `class-validator` global pipe
- Authentication: JWT-based auth with `UsersModule` and `AuthModule` implemented
- Sentry via `SENTRY_DSN`

### Strapi CMS (`apps/cms`)

- Strapi 5 with PostgreSQL (`hexastudio_cms` database)
- Starter content type: `Category`
- Planned types: blog, testimonials, portfolio, services, SEO content

### PostgreSQL 16

- Init script creates `hexastudio_api` and `hexastudio_cms` databases
- Persistent volume: `postgres_data`

### Redis 7

- Password-protected, AOF persistence
- Use cases: rate limiting (via `@nestjs/throttler`) and cache

### MinIO

- Buckets (auto-created by `minio-init`): `uploads`, `models`, `textures`, `videos`, `hdr`, `backups`
- API routed at `MINIO_API_HOST`, console at `MINIO_CONSOLE_HOST`

### Monitoring

| Component | Role |
|-----------|------|
| Prometheus | Metrics collection (Traefik, backend, node-exporter) |
| Grafana | Dashboards (pre-provisioned Prometheus + Loki datasources) |
| Loki | Log aggregation |
| Promtail | Docker container log shipping |
| node-exporter | Host metrics |

## Environment Variables

All configuration is via `.env` (copy from `.env.example`). Required secrets:

- `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `MINIO_ROOT_PASSWORD`
- `JWT_SECRET`, Strapi keys/salts
- `GRAFANA_ADMIN_PASSWORD`

Optional:

- `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`
- Host overrides for production domains

## Production Deployment (Ubuntu 24.04)

### Host setup

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Clone repo, configure env
cp .env.example .env
# Set production domains:
#   FRONTEND_HOST=hexastudio.net
#   API_HOST=api.hexastudio.net
#   CMS_HOST=cms.hexastudio.net
#   etc.
```

### Cloudflare

1. Point DNS A/AAAA records to server IP (proxied orange cloud)
2. SSL/TLS mode: **Full (strict)** once origin certs are configured
3. Enable WAF rules, bot protection as needed
4. Optional: restrict origin to Cloudflare IPs only (iptables/nginx)

### SSL / TLS

- Option A: Cloudflare origin certificate on Traefik
- Option B: Let's Encrypt via Traefik ACME (`TRAEFIK_ACME_ENABLED=true`)
- Update `docker/traefik/traefik.yml` with certificate resolvers

### Start

```bash
docker compose up -d --build
```

## Security Checklist

- [x] PostgreSQL/Redis on internal network only
- [x] Helmet on API
- [x] CORS configured via env
- [x] Rate limiting (NestJS throttler + Traefik middleware)
- [x] Input validation (class-validator)
- [x] Traefik secure headers middleware
- [x] Backup automation (daily pg_dump, 30-day retention)
- [x] CI/CD pipeline (GitHub Actions → GHCR → SSH deploy)
- [x] Docker auto-updates (Watchtower)
- [ ] TLS/HTTPS in production
- [ ] Cloudflare WAF rules
- [ ] Strapi admin hardening (2FA, IP allowlist)

## Current Status

1. **SSL/TLS** — Traefik ACME or Cloudflare origin certs
2. **Cloudflare** — DNS, WAF, cache rules for static/3D assets
3. **Sentry** — Add DSNs to production `.env`
4. **Strapi content types** — blog, portfolio, services, testimonials, SEO
5. **MinIO integration** — Backend upload service for 3D assets
6. **Grafana dashboards** — Pre-built panels for API/infra metrics

## Local Troubleshooting

```bash
# Validate compose syntax
docker compose config

# View logs
docker compose logs -f backend

# Reset volumes (destructive)
docker compose down -v
```

## Decisions Needed

1. **Production domains** — Confirm subdomain scheme (`api.`, `cms.`, `storage.`)
2. **SSL strategy** — Cloudflare origin cert vs Let's Encrypt
3. **Strapi media** — Local uploads vs MinIO provider for CMS assets
4. **3D asset delivery** — Direct MinIO/CDN vs proxied through API
