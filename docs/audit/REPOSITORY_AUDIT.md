# Repository Audit — HEXA STUDIO

> **Status:** Verified 2026-08-02 against the live repo (package.json files, docker-compose set, git state). This is the authoritative PHASE 0 discovery artifact.

## Framework & Runtime (verified from package.json)

| Layer | Technology | Verified Version |
|-------|-----------|------------------|
| Frontend | Next.js (App Router), React, TypeScript | Next.js `16.2.11`, React `^19.0.0`, TS `^5.7.0` |
| Backend | NestJS, TypeScript | `@nestjs/core ^11.1.28`, TS `^5.7.0` |
| Mobile | Expo / React Native | workspace `apps/mobile` |
| CMS | Strapi (headless) | workspace `apps/cms` |
| ERP | Odoo 17.0 (custom module `hexa_studio`) | `odoo/` tree |
| Runtime | Node.js | `>=20` (local: v24.16.0) |
| Package manager | npm (monorepo workspaces) | `npm@11.17.0`, 6 workspaces |

## Monorepo Workspaces (verified)

```
apps/frontend      Next.js 16 + React 19 + Three.js
apps/backend       NestJS 11 REST/WS + JWT
apps/mobile        Expo (React Native)
apps/cms           Strapi 5
packages/types     shared types (@hexastudio/types)
packages/ui        shared UI
packages/utils     shared utilities
```

## Core Dependency Groups

- **3D:** three `^0.171.0`, @react-three/fiber, @react-three/drei, postprocessing, XR
- **State:** Redux Toolkit (root), Zustand + TanStack Query (apps) — see ADR-006
- **Styling/Animation:** TailwindCSS `^4.0.0`, Framer Motion, GSAP
- **Observability:** Sentry, OpenTelemetry, prom-client, Web Vitals
- **API/Realtime:** Socket.io, Axios, NestJS Swagger, class-validator, helmet

## Infrastructure (verified)

- **Reverse proxy / ingress:** Traefik v3 (Nginx explicitly NOT used)
- **Data:** PostgreSQL 16, Redis 7 (ioredis), MinIO (S3-compatible)
- **Containerization:** Docker + docker-compose (root: `docker-compose*.yml`, `infrastructure/` does not exist)
- **CI/CD:** GitLab CE (`.gitlab-ci.yml`, `.gitlab-ci-optimized.yml`), protected branches
- **Edge:** Cloudflare (CDN/WAF), Cloudflared tunnel

## Risks & Findings

1. **Repository root hygiene (high):** the repo root accumulates operational artifacts (deploy logs, `*.log`, `*.zip`, `*.rar`, shell/python scripts, audit reports, `hexastudio_key`, `overview.json`, `lh-report.json`). These should be moved under `ops/` or `scripts/` and ignored; the root should hold only manifests.
2. **Dependency overrides (medium):** 9 overrides in root `package.json` (framer-motion, cookie, tmp, uuid, postcss, sharp, @types/react, @xmldom/xmldom, js-yaml) mask transitive conflicts — see `docs/engineering/DEPENDENCY_MANAGEMENT.md` for the reduction strategy.
3. **State management mixing (medium):** Redux Toolkit + Zustand + TanStack Query coexist; ADR-006 defines the intended split, enforcement is a review checklist item.
4. **Secret exposure (medium):** `gitlab-docker-compose.full.yml:211` contains a hardcoded default `GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:-admin@2024}` — see `docs/audit/SECURITY_AUDIT.md`.
5. **Documentation:** doc tree consolidated into `docs/<area>/` (ADR-011); 3 empty dirs remain untracked (`agents-moved`, `architecture-moved`, `product-governance`).

## References
- `docs/architecture/SYSTEM_ARCHITECTURE.md`, `docs/audit/CURRENT_ARCHITECTURE.md`, `docs/audit/DEPENDENCY_AUDIT.md`, `docs/audit/INFRASTRUCTURE_AUDIT.md`, `docs/audit/SECURITY_AUDIT.md`, `GOVERNANCE.md`, `PROJECT_STATUS.md`
