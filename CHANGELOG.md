# Changelog: HEXA Vision

## [0.5.0] - 2026-07-04
### Fixed
- **Security Audit Hardening:**
    - SEC-01/02: Created `apps/backend/src/config/env.ts` — Zod schema validates all env vars at startup; removed hardcoded MinIO credentials and JWT secret fallbacks from `auth.service.ts`, `jwt.strategy.ts`, `auth.module.ts`.
    - SEC-03: Migrated JWT from localStorage to httpOnly cookies — backend sets `Set-Cookie` on login/register/logout, frontend uses `credentials: 'include'` on fetch; added `/api/auth/logout` endpoint.
    - SEC-04: Fixed Strapi v5 relation mapping — `projects.service.ts`, `articles.service.ts`, `services.service.ts` now handle both v4 `{ data: { id, attributes } }` and v5 `{ id, name, slug }` relation shapes; removed stale `ConfigService` imports.
    - SEC-05: Added bucket whitelist and path traversal protection to `StorageController` — separate `/download-url` and `/upload-url` endpoints with expiry bounds (60–86400s).
    - SEC-06: Segmented Docker networks — `hexa_web` (frontend, nginx, backend, cms), `hexa_data` (postgres, redis, minio — internal only), `hexa_monitoring` (prometheus, grafana).
    - SEC-07: Added Redis authentication — `requirepass` in Redis via `REDIS_PASSWORD` env var, backend `REDIS_URL` updated to include password.
    - SEC-08: Swagger disabled in production.

## [0.4.0] - 2026-07-04
### Fixed
- **3D Scene Critical Fixes (Sprint 3):**
    - Fixed `SceneCanvas.tsx` scaffolding — now delegates to `ExperienceCanvas`.
    - Fixed dual animation loop — migrated from raw `requestAnimationFrame` to R3F's `useFrame`.
    - Fixed camera control conflict — `OrbitControls` now disables rotation/zoom during GSAP transitions.
    - Added `SceneErrorBoundary` wrapping the R3F Canvas to prevent whole-page crashes.
    - Added `prefers-reduced-motion` integration — camera transitions skip animation when enabled.
    - Added geometry/material disposal on `ArchitecturalModel` unmount to prevent memory leaks.
    - Added loading fallback scene (wireframe box) during Suspense loading.
    - Added fog for depth cues and improved scene atmosphere.
    - Removed conflicting `BakeShadows` (kept `ContactShadows` only).
    - Parallax mouse tracking now uses R3F's render loop instead of external rAF.

## [0.3.0] - 2026-07-04
### Added
- **CMS Content Types (Sprint 2):**
    - Created Portfolio content type with title, slug, description, coverImage, gallery, category, modelUrl, hotspots, client, location, year, area, services fields.
    - Created Article (Blog) content type with title, slug, excerpt, content (blocks), coverImage, category, author, readTime, tags, SEO fields.
    - Created Service content type with title, slug, description, icon, features, order fields.
- **BFF Integration (Sprint 2):**
    - Updated `ProjectsService` to fetch from Strapi CMS instead of mock data.
    - Created `ArticlesModule` with controller, service for blog content.
    - Created `ServicesModule` with controller, service for services content.
    - Added Swagger decorators to all controllers.
- **JWT Authentication (Sprint 2):**
    - Created `AuthModule` with JWT strategy using Passport.
    - Implemented `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/refresh` endpoints.
    - Created `JwtAuthGuard` for protected routes.
    - Added `AuthProvider` to frontend with `useAuth` hook.
- **Storage Service (Sprint 2):**
    - Created `MinioService` for presigned URL generation and file operations.
    - Created `StorageController` with authenticated presigned URL endpoint.
    - Updated MinIO bucket initialization to use private buckets.
- **SSL/TLS Configuration (Sprint 2):**
    - Configured Traefik ACME with Let's Encrypt support.
    - Added Cloudflare DNS challenge option.
    - Updated `.env.example` with SSL and domain variables.
- **CI Quality Gates (Sprint 2):**
    - Created `.github/workflows/ci.yml` with lint, typecheck, build, and security audit jobs.
- **Sentry Integration (Sprint 2):**
    - Added Sentry configuration files for client, server, and edge.
- **Frontend Pages (Sprint 2):**
    - Created `/portfolio` page with project grid.
    - Created `/blog` page with article listing.
    - Added Portfolio and Blog links to Navbar.
- **Accessibility (Sprint 2):**
    - Added skip-to-content link.
    - Added focus-visible styles.
    - Added reduced-motion media query support.
- **Shared Types (Sprint 2):**
    - Added `Article`, `ArticleResponse`, `Service`, `ServiceResponse`, `AuthResponse` interfaces.

## [0.2.0] - 2026-07-02
### Added
- **3D Visual Core (Sprint 2):**
    - Implemented React Three Fiber (R3F) canvas with high-performance configuration.
    - Integrated Draco-compressed asset loader via CDN.
    - Developed Cinematic Camera system with GSAP transitions and `useCameraStore`.
    - Implemented Interactive Hotspots with 3D-to-HTML overlays.
    - Created Backend-for-Frontend (BFF) `ProjectsModule` in NestJS with mock data.
- **Premium UI/UX Strategy (Sprint 3):**
    - Generated `UI_REVIEW.md`, `UX_IMPROVEMENTS.md`, and `RESPONSIVE_REPORT.md`.
    - Defined luxury design system (asymmetric layouts, refined typography).
- **Cinematic Hero Section (Sprint 4):**
    - Implemented high-fidelity Post-Processing stack (Bloom, Depth of Field, Noise, Vignette).
    - Added mouse-driven camera parallax for an immersive "living" scene.
    - Developed an Adaptive Quality System (Low/Medium/High) based on GPU detection.
    - Integrated `THREEJS_GUIDE.md` and `PERFORMANCE_REPORT.md`.

## [0.1.0] - 2026-06-30
### Added
- **Architecture:** Implemented Feature-Based Architecture in Frontend and Backend.
- **Shared Packages:** Created `@hexastudio/types` and `@hexastudio/utils`.
- **Frontend UI:** Added Base UI components (`Button`), `GlobalErrorBoundary`, and `LoadingScreen`.
- **Backend Core:** Added `GlobalExceptionFilter` for standardized API error responses.
- **Documentation:** Added `AGENTS.md`, `FOLDER_STRUCTURE.md`, `REFACTOR_SUMMARY.md`, and updated `ARCHITECTURE.md`.

### Changed
- **Frontend:** Refactored `HomePage` into a feature component `HomeHero`.
- **Backend:** Moved `HealthModule` to `/src/modules/health`.
- **Monorepo:** Updated `package.json` workspaces to include shared packages.
