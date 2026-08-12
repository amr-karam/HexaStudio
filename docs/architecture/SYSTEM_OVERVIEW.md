# HEXA STUDIO — SYSTEM OVERVIEW

**Version:** 2.1.5
**Date:** 2026-08-09
**Status:** Active — Concise Entry Point
**Purpose:** One-page map to architecture documentation

> This is the **concise pointer** to the architecture documentation tree.
> For the canonical deep dive, see [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md).

## 1. AT A GLANCE

| Layer | Technology | App |
|-------|-----------|-----|
| Frontend | Next.js 16.2.11 (App Router) | apps/frontend |
| Backend (BFF) | NestJS 11 (REST + Socket.io) | apps/backend |
| CMS | Strapi 5 (headless) | apps/cms |
| Mobile | Expo / React Native | apps/mobile |
| Premium Layer | NestJS + React | hexa-hub |
| Shared | TypeScript types, UI components, utils | packages/* |

## 2. INFRASTRUCTURE AT A GLANCE

| Layer | Technology |
|-------|-----------|
| Edge | Cloudflare WAF + Cloudflared Tunnel |
| Ingress | Traefik v3 |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| Vector Search | Qdrant |
| Object Storage | MinIO (S3-compatible) |
| ERP | Odoo 17.0 |
| DevOps | GitLab CE (CI/CD + Registry) |
| Observability | Prometheus, Grafana, Loki, Sentry |

## 3. ARCHITECTURE DOCUMENT MAP

| Topic | Document |
|-------|----------|
| High-level topology | [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) |
| High-level design | [HIGH_LEVEL_DESIGN.md](HIGH_LEVEL_DESIGN.md) |
| Low-level design | [LOW_LEVEL_DESIGN.md](LOW_LEVEL_DESIGN.md) |
| Microservices | [MICROSERVICES.md](MICROSERVICES.md) |
| Data flow | [DATA_FLOW.md](DATA_FLOW.md) |
| API | [API_ARCHITECTURE.md](API_ARCHITECTURE.md) |
| Database | [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) |
| Deployment | [DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md) |
| Domain model | [DOMAIN_MODEL.md](DOMAIN_MODEL.md) |
| Event flow | [EVENT_FLOW.md](EVENT_FLOW.md) |
| Integration | [INTEGRATION_ARCHITECTURE.md](INTEGRATION_ARCHITECTURE.md) |
| Network | [NETWORK_ARCHITECTURE.md](NETWORK_ARCHITECTURE.md) |
| Service catalog | [SERVICE_CATALOG.md](SERVICE_CATALOG.md) |
| Security | [SECURITY_ARCHITECTURE.md](SECURITY_ARCHITECTURE.md) |
| 3D rendering | [3d-rendering-pipeline.md](3d-rendering-pipeline.md) |
| Frontend | [frontend-architecture.md](frontend-architecture.md) |
| Backend | [backend-architecture.md](backend-architecture.md) |
| CMS | [cms-architecture.md](cms-architecture.md) |
| Auth flow | [authentication-flow.md](authentication-flow.md) |

## 4. ADR INDEX

See [../adr/README.md](../adr/README.md) for the canonical ADR index (11 ADRs active).

## 5. REFERENCES

- [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) — canonical deep dive
- [README.md](README.md) — manifest
- [/ARCHITECTURE.md](../../ARCHITECTURE.md) — root architecture document
- [/AGENTS.md](../../AGENTS.md) — agent operating manual
- [/GOVERNANCE.md](../../GOVERNANCE.md) — highest authority