# HEXA Studio — Project Overview

**Analysis Date:** 2026-07-12  
**Analyst:** Kilo (Automated Codebase Analysis)  
**Project Root:** `C:\Users\amrmo\Desktop\Desktop\HexaStudio`

---

## 1. Executive Summary

HEXA Studio is a premium **3D Architecture Visualization Platform** built as a full-stack monorepo. It combines an immersive Next.js frontend with a NestJS backend, Strapi CMS, and real-time 3D rendering via React Three Fiber. The project is in **Phase 0 — Foundation**, with Sprint 6 (Enterprise Hardening) currently active, targeting a v1.0.0 release.

---

## 2. Technology Stack

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js 15 | ^15.1.0 |
| Language | TypeScript | ^5.7.0 |
| Styling | Tailwind CSS 4 | ^4.0.0 |
| 3D Engine | React Three Fiber | ^9.0.0 |
| 3D Helpers | @react-three/drei | ^10.0.0 |
| Post-processing | @react-three/postprocessing | ^3.0.4 |
| Animation | GSAP, Framer Motion | ^3.12.5, ^11.18.2 |
| State (Client) | Zustand | ^5.0.2 |
| State (Server) | TanStack Query | ^5.62.0 |
| Observability | Sentry | ^8.45.0 |
| Smooth Scroll | Lenis | ^1.3.25 |
| Testing | Vitest, Playwright | ^4.1.10, ^1.61.1 |

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | NestJS | ^10.4.15 |
| Language | TypeScript | ^5.7.0 |
| API Docs | Swagger | ^8.1.0 |
| Auth | Passport JWT | ^10.0.3 |
| Security | Helmet | ^8.0.0 |
| Rate Limiting | @nestjs/throttler | ^6.2.1 |
| Validation | class-validator | ^0.14.1 |
| HTTP Client | Axios | ^1.18.1 |
| Observability | Sentry | ^8.45.0 |
| Testing | Vitest, Supertest | ^4.1.9, ^7.2.2 |

### CMS
| Component | Technology | Version |
|-----------|-----------|---------|
| CMS | Strapi 5 | ^5.6.0 |
| Database | PostgreSQL 16 | 16-alpine |
| ORM | pg | ^8.13.1 |

### Data & Infrastructure
| Component | Technology | Version |
|-----------|-----------|---------|
| Primary DB | PostgreSQL 16 | 16-alpine |
| Cache/Session | Redis 7 | 7-alpine |
| Object Storage | MinIO | latest |
| Reverse Proxy | Traefik v3 | v2.11 |
| Edge/CDN | Cloudflare | — |
| Monitoring | Prometheus, Grafana | latest |
| Logging | Loki, Promtail | — |
| Container | Docker Compose | — |
| Monorepo | Turborepo | ^2.10.4 |

---

## 3. Project Structure

```
hexastudio/
├── apps/
│   ├── frontend/          # Next.js 15 app (port 3000)
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   ├── features/  # Feature-based modules
│   │   │   │   ├── portfolio/
│   │   │   │   ├── scene/     # 3D scene logic
│   │   │   │   ├── blog/
│   │   │   │   ├── services/
│   │   │   │   ├── auth/
│   │   │   │   └── ...
│   │   │   ├── components/
│   │   │   │   ├── ui/     # Reusable UI atoms
│   │   │   │   ├── three/  # R3F components
│   │   │   │   └── ...
│   │   │   ├── hooks/
│   │   │   ├── stores/     # Zustand stores
│   │   │   ├── providers/
│   │   │   ├── lib/
│   │   │   └── services/
│   │   ├── test/           # Vitest unit tests
│   │   ├── e2e/            # Playwright E2E tests
│   │   └── Dockerfile
│   │
│   ├── backend/           # NestJS API (port 4000)
│   │   ├── src/
│   │   │   ├── modules/    # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── projects/
│   │   │   │   ├── articles/
│   │   │   │   ├── services/
│   │   │   │   ├── contact/
│   │   │   │   ├── storage/
│   │   │   │   ├── odoo/
│   │   │   │   ├── portal/
│   │   │   │   ├── users/
│   │   │   │   ├── email/
│   │   │   │   ├── requests/
│   │   │   │   ├── accounting/
│   │   │   │   └── health/
│   │   │   ├── core/       # Filters, interceptors
│   │   │   ├── config/
│   │   │   └── main.ts
│   │   └── Dockerfile
│   │
│   └── cms/               # Strapi 5 (port 1337)
│       └── Dockerfile
│
├── packages/
│   ├── types/             # Shared TypeScript interfaces
│   │   └── src/index.ts
│   ├── ui/                # Shared UI component library
│   │   └── src/components/ui/
│   └── utils/             # Shared utility functions
│       └── src/index.ts
│
├── docker-compose.yml           # Local development
├── docker-compose.prod.yml      # Production deployment
├── turbo.json                   # Turborepo config
├── package.json                 # Root workspace config
├── tsconfig.json                # Base TypeScript config
└── HEXA-Vision-Playbook/        # Complete project documentation
```

---

## 4. Key Architectural Patterns

### 4.1 Monorepo Strategy
- **Turborepo** manages builds, linting, and testing across workspaces
- **Shared packages** (`types`, `ui`, `utils`) ensure type safety and UI consistency
- Workspaces: `apps/frontend`, `apps/backend`, `apps/cms`, `packages/*`

### 4.2 BFF (Backend-for-Frontend)
- NestJS acts as a BFF layer between Strapi CMS and Next.js
- Frontend **never** calls Strapi directly
- Backend aggregates, filters, and optimizes data for the 3D experience
- REST API with Swagger documentation (dev only)

### 4.3 Asset Pipeline
1. Artists upload GLB/GLTF models to Strapi
2. Strapi pushes to MinIO (S3-compatible storage)
3. Background process optimizes textures/compresses meshes (Draco)
4. NestJS generates "Scene Manifest" JSON
5. Next.js fetches manifest → R3F loads assets asynchronously

### 4.4 State Management
- **Zustand**: Client-side global state (UI preferences, 3D scene state)
- **TanStack Query**: Server-state synchronization, caching, background refetching

### 4.5 3D Scene Architecture
- `SceneCanvas` / `ExperienceCanvas`: R3F canvas wrappers
- `ArchitecturalModel`: Loads GLTF/GLB models
- `CameraController`: Cinematic camera movements via GSAP
- `Hotspot`: Interactive points in 3D space
- `PostProcessing`: Visual effects pipeline
- Stores: `asset-store.ts`, `camera-store.ts`

---

## 5. Current Sprint Status

**Sprint ID:** S-006 — Enterprise Hardening  
**Status:** ACTIVE

### Completed (P0)
- CI/CD pipeline with lint, typecheck, test, build gates
- CD pipeline via GHCR + SSH deploy
- Playwright E2E in CI
- Docker build fixes for monorepo
- Traefik dashboard secured
- First-load JS budget optimization (≤200KB)
- Bundle budgets achieved: 151–188KB across all routes

### Pending (P1/P0)
- v1.0.0 release tag
- Frontend component tests
- CMS admin IP allowlist
- Database backup verification
- Lighthouse audit (>95 score)

### Metrics
| Metric | Target | Current | Status |
|--------|---------|---------|--------|
| Story Points | 40 | 32 | 🟡 |
| Code Coverage | 80% | ~55% | 🟡 |
| First Load JS | ≤200KB | 151–188KB | 🟢 |
| Bug Count | <5 | 2 open | 🟢 |
| Pages Deployed | 18 | 18 | 🟢 |

---

## 6. Key Risks & Blockers

1. **Strapi React 19 peer dependency conflict** — Known upstream issue, low severity
2. **Code coverage at ~55%** — Below 80% target; frontend component tests pending
3. **Odoo integration** — XML-RPC webhook listeners implemented but may need additional testing
4. **3D performance at scale** — 60 FPS target requires ongoing LOD and instancing discipline

---

## 7. Deployment Topology

### Development
- Docker Compose with all services on internal networks
- Nginx reverse proxy for local routing
- Healthchecks for all critical services

### Production
- **Traefik v3** as reverse proxy with Cloudflare tunnel
- Cloudflare CDN/WAF in front
- MinIO exposed via Traefik labels for asset delivery
- All data stores on internal Docker network only
- Sentry for error tracking

---

## 8. Notable Implementation Details

- **18 Next.js pages** including portfolio, blog, services, portal, admin
- **13 NestJS modules** covering full business domain
- **Vitest** used for both frontend and backend unit tests
- **Playwright** for E2E with accessibility and SEO checks
- **Shared type package** (`@hexastudio/types`) enforces end-to-end type safety
- **Custom hooks** for 3D interactions: `useCinematicCamera`, `useScrollCamera`, `useAssetLoader`
- **Adaptive quality** system via `useAdaptiveQuality` hook

---

*End of Project Overview*
