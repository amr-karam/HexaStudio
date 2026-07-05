# AI Context & Project State — HEXA Studio
**Last Updated:** July 04, 2026
**Status:** Security Hardening Complete → Entering Sprint 4 (Content & SEO)

This file is the **primary entry point** for any AI agent joining the HEXA Studio project. It provides a high-level overview of the project's current state, architectural decisions, and the path forward.

---

## 1. Project Essence
HEXA Studio is a luxury 3D Architecture Visualization platform. It is not a standard website; it is a premium digital experience designed to communicate precision, luxury, and architectural excellence.

**Core Mantra:** *Design First. Quality over Speed. Cinematic Experience.*

---

## 2. The Knowledge Map (Read Order)
If you are new to this project, read these files in this specific order:
1. **`PROJECT_DIRECTIVE.md`**: The "North Star". Defines the visual and creative quality bar.
2. **`AGENTS.md`**: The "Operating Manual". Defines coding standards, tech stack, and architectural rules.
3. **`IMPLEMENTATION_ROADMAP.md`**: The "Tactical Plan". Detailed phases of what needs to be built.
4. **`AI_CONTEXT.md`** (This file): The "Current State". Summary of what is done and where we are.
5. **`IMPROVEMENT_ROADMAP.md`**: Sprint-by-sprint implementation tracking with checkboxes.

---

## 3. Technical Blueprint
### Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS 4.
- **3D Engine**: Three.js, React Three Fiber (R3F), @react-three/drei.
- **Animation**: GSAP (Complex sequences), Framer Motion (UI transitions).
- **Backend**: NestJS (BFF Pattern), PostgreSQL 16, Redis 7.
- **CMS**: Strapi 5 (Headless Content Source).
- **Infrastructure**: Docker Compose, Nginx, MinIO (S3 Storage).

### Architecture
- **Monorepo Structure**:
    - `/apps/frontend`: The cinematic user interface.
    - `/apps/backend`: The API orchestration layer (BFF).
    - `/apps/cms`: Strapi 5 content management system.
    - `/packages/types`: Shared TypeScript interfaces (Single Source of Truth).
    - `/packages/utils`: Shared helper functions (`cn()`, `formatDate`, `slugify`, `truncate`).

### Security Architecture
- **Env Validation**: Zod schema in `apps/backend/src/config/env.ts` validates all required env vars at startup — throws with clear errors if missing.
- **JWT**: httpOnly cookies (not localStorage) — `Set-Cookie` on login/register, `credentials: 'include'` on frontend fetch.
- **Storage**: Bucket whitelist, path traversal protection, presigned URL expiry bounds (60–86400s).
- **Docker Networks**: Segmented into `hexa_web` (frontend, nginx, backend, cms), `hexa_data` (postgres, redis, minio — internal only), `hexa_monitoring` (prometheus, grafana).
- **Redis**: Password-protected via `REDIS_PASSWORD` env var with `requirepass`.

---

## 4. Current Progress (What's Done)
### ✅ Sprint 1 — Architecture Refactor (v0.1.0)
- [x] Feature-based folder structure in frontend/backend.
- [x] Shared packages `@hexastudio/types` and `@hexastudio/utils`.
- [x] Global error handling (`GlobalErrorBoundary` + `GlobalExceptionFilter`).
- [x] Lazy loading infrastructure, barrel exports, hooks scaffolding.

### ✅ Sprint 2 — Foundation Services (v0.3.0)
- [x] Strapi CMS content types: Portfolio, Article, Service, Category.
- [x] BFF integration: `ProjectsModule`, `ArticlesModule`, `ServicesModule` fetch from Strapi.
- [x] JWT auth: `AuthModule` with register/login/me/refresh endpoints.
- [x] Frontend auth: `AuthProvider` context + `useAuth` hook.
- [x] Frontend pages: `/portfolio`, `/blog`.
- [x] MinIO storage: Private buckets, `MinioService`, presigned URLs.
- [x] CI: GitHub Actions with lint, typecheck, build, security audit.
- [x] Sentry integration (client/server/edge config).
- [x] Accessibility: Skip-to-content, `focus-visible`, `prefers-reduced-motion`.

### ✅ Sprint 3 — 3D Core Fixes (v0.4.0)
- [x] Fixed `SceneCanvas.tsx` — now delegates to `ExperienceCanvas`.
- [x] Fixed dual animation loop — migrated from `requestAnimationFrame` to R3F's `useFrame`.
- [x] Fixed camera control conflict — `OrbitControls` disables rotate/zoom during GSAP transitions.
- [x] Added `SceneErrorBoundary` wrapping R3F Canvas.
- [x] Added `prefers-reduced-motion` integration in `useCinematicCamera`.
- [x] Added geometry/material disposal on `ArchitecturalModel` unmount.
- [x] Added loading fallback scene (wireframe box) during Suspense.
- [x] Added fog for depth cues, removed conflicting `BakeShadows`.

### ✅ Security Hardening (v0.5.0)
- [x] **SEC-01/02**: Removed hardcoded JWT secret and MinIO credentials — both validated at startup via `getEnv()`.
- [x] **SEC-03**: Migrated JWT from localStorage to httpOnly cookies with logout endpoint.
- [x] **SEC-04**: Fixed Strapi v5 relation mapping — handles both v4 `{ data: { id, attributes } }` and v5 `{ id, name, slug }` shapes.
- [x] **SEC-05**: Added bucket whitelist and path traversal protection to storage endpoint.
- [x] **SEC-06**: Segmented Docker networks (web, data-internal, monitoring).
- [x] **SEC-07**: Added Redis authentication via `REDIS_PASSWORD`.
- [x] **SEC-08**: Swagger disabled in production.

---

## 5. The Immediate Horizon (What's Next)
We are entering **Sprint 4 — Content & SEO**.

**Sprint 4 Priorities:**
1. **Portfolio Gallery**: ISR (Incremental Static Regeneration) for project listing, dynamic project detail pages with 3D model embed.
2. **Editorial Project Detail**: Magazine-style layout with project metadata, gallery, and interactive 3D viewer.
3. **SEO Foundation**: Dynamic metadata via `generateMetadata`, JSON-LD structured data, auto-generated `sitemap.xml`, `robots.txt`.
4. **Blog Enhancement**: Article detail pages with rich content rendering.
5. **Lighthouse CI**: Add Lighthouse performance audit to CI pipeline.

**After Sprint 4:**
- **Sprint 5**: Motion Orchestration (GSAP timelines syncing 3D camera with UI reveals, scroll-driven narrative).
- **Sprint 6**: Design System Polish (Awwwards-level typography, spacing, micro-interactions).
- **Sprint 7**: Contact & Studio pages, form validation, email integration.
- **Sprint 8**: Performance optimization, final QA, production deployment.

---

## 6. Critical Constraints for AI
- **No Generic UI**: Avoid standard Tailwind templates. Every section must feel handcrafted.
- **Performance Budget**: 3D scenes must maintain 60 FPS. Use Draco compression and adaptive quality.
- **Type Safety**: Never use `any`. Shared types must live in `/packages/types`.
- **Self-Documenting**: Code must be clean. Only add comments to explain "Why", not "What".
- **Security First**: Always use `getEnv()` for secrets. Never hardcode credentials. Use httpOnly cookies for JWT.
- **Strapi v5 Relations**: Relations are `{ data: { id, attributes: { ... } } }` — always handle null/undefined.
- **R3F Rules**: Use `useFrame` for animation loops, not `requestAnimationFrame`. Dispose geometries/materials on unmount.

---

## 7. Key Files Quick Reference
| Purpose | Path |
|---------|------|
| Env validation | `apps/backend/src/config/env.ts` |
| Auth (cookie-based) | `apps/backend/src/modules/auth/auth.controller.ts` |
| JWT strategy | `apps/backend/src/modules/auth/strategies/jwt.strategy.ts` |
| Frontend auth hook | `apps/frontend/src/features/auth/hooks/useAuth.tsx` |
| Strapi relation helpers | `apps/backend/src/modules/projects/projects.service.ts` |
| 3D canvas entry | `apps/frontend/src/features/scene/components/ExperienceCanvas.tsx` |
| Camera transitions | `apps/frontend/src/features/scene/hooks/useCinematicCamera.ts` |
| Scene error boundary | `apps/frontend/src/features/scene/components/SceneErrorBoundary.tsx` |
| Docker networks | `docker-compose.yml` |
| Shared types | `packages/types/index.ts` |
| Changelog | `CHANGELOG.md` |
