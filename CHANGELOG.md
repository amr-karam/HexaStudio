# Changelog: HEXA Vision

## [0.7.0] - 2026-07-05
### Added
- **Brand Identity:**
    - Real logo (`logo.webp`) from client — replaces SVG approximation.
    - Favicon (`favicon.webp`) with updated references in all components.
    - Slogan "Living Spaces. Visualized." in Hero, meta tags, StructuredData.
- **Architecture Decision Records:**
    - Created `docs/ADR/001-006` covering tech stack, monorepo, scene architecture, visual fidelity, CMS/BFF pattern, 3D accessibility.
- **AGENTS.md Sections 41-45:**
    - ADR process, Visual Regression Checklist, Future-Proof Rule, AI Collaboration Rules, Sprint Exit Criteria.
- **Local MCP Dev Server:**
    - `scripts/mcp/server.js` + `package.json` — local MCP server for development.
    - `scripts/mcp/` directory with package-lock.json.
- **MCP Dockerfile:** `scripts/Dockerfile.mcp` for containerized MCP server.
- **OpenCode Server:**
    - Installed v1.17.13 on production server (systemd service, port 4096).
    - Traefik route configured for `opencode.hexastudio.net`.
    - Hostinger DNS A record: `opencode → 156.206.135.186`.
- **Server-Side Infrastructure:**
    - Production deployment: 14 Docker services running on 19.16.1.100.
    - Deploy script with Docker-based health checks (node fetch).
    - MinIO, Redis, backup, watchtower, CMS health check fixes.
    - Watchtower Docker API version compatibility fix.
- **Documentation:**
    - `AI_CONTEXT.md` — fully updated with Phase 5 progress.
    - `AI_HANDOFF.md` — rewritten with current server details and next steps.
    - `IMPLEMENTATION_ROADMAP.md` — Phase 5 items partially checked off.
    - `.env.example` — synced with production (all hostnames, monitoring, Sentry vars).

### Fixed
- **Logo References:** Updated `Navbar.tsx`, `Footer.tsx`, `LoadingScreen.tsx`, `layout.tsx`, `StructuredData.tsx` — all `logo.svg` → `logo.webp`, `favicon.svg` → `logo.webp`.
- **Deploy Script Health Checks:** Replaced `localhost` curl with `docker compose exec` using node fetch for Docker-network-aware health checks.
- **CMS Database Connection:** Added `DATABASE_URL` env var matching Strapi 5's `database.ts` config.
- **MinIO Health Check:** Container lacks `wget` — changed to `curl`.
- **PostgreSQL Volume:** Recreated to fix credential mismatch.
- **Nginx Conflict:** Stopped/disables nginx on production to free port 80 for Traefik.

### Changed
- **Logo:** SVG approximation replaced with real `logo.webp` from client.
- **Deploy Script:** Synced from server to local (health checks, .env sourcing).
- **Traefik Config:** Added opencode router with Let's Encrypt certificate resolver.

## [0.6.0] - 2026-07-04
### Added
- **AGENTS.md Sections 37-46:** UI Review, Brand Guardian, Continuous Improvement, Production Readiness, Critical Thinking Mode, Quality Gate Controller.
- **ESLint 9 Flat Config:** Created `eslint.config.mjs` for both frontend and backend.
- **Lint fixes:** Removed unused imports/vars, fixed `any` types, unused variables across scene components.
- **Typecheck passing:** `npm run typecheck` succeeds locally.
- **Dockerfile fixes:** Removed `COPY node_modules`, proper Docker practice with `npm install` inside containers.

### Fixed
- **3D Scene Critical Fixes:**
    - Fixed `SceneCanvas.tsx` — now delegates to `ExperienceCanvas`.
    - Fixed dual animation loop — migrated from `requestAnimationFrame` to R3F's `useFrame`.
    - Fixed camera control conflict — `OrbitControls` disabled during GSAP transitions.
    - Added `SceneErrorBoundary`, `prefers-reduced-motion`, geometry/material disposal, loading fallback, fog.

## [0.5.0] - 2026-07-04
### Fixed
- **Security Audit Hardening:**
    - SEC-01/02: Env validation via Zod schema; removed hardcoded secrets.
    - SEC-03: JWT migrated from localStorage to httpOnly cookies.
    - SEC-04: Strapi v5 relation mapping (handles v4 and v5 shapes).
    - SEC-05: Bucket whitelist + path traversal protection.
    - SEC-06: Segmented Docker networks.
    - SEC-07: Redis authentication via `REDIS_PASSWORD`.
    - SEC-08: Swagger disabled in production.

## [0.4.0] - 2026-07-04
### Fixed
- **3D Critical Fixes (Sprint 3):** SceneCanvas, dual animation loop, camera control conflict, SceneErrorBoundary, reduced-motion, geometry disposal, loading fallback, fog, BakeShadows removal, parallax mouse tracking.

## [0.3.0] - 2026-07-04
### Added
- Strapi CMS content types (Portfolio, Article, Service, Category).
- BFF integration (ProjectsModule, ArticlesModule, ServicesModule).
- JWT authentication (register/login/me/refresh).
- Storage service (MinIO presigned URLs).
- Traefik ACME/SSL configuration.
- GitHub Actions CI pipeline.
- Sentry integration (client/server/edge).
- Frontend pages (/portfolio, /blog).
- Accessibility (skip-to-content, focus-visible, reduced-motion).

## [0.2.0] - 2026-07-02
### Added
- React Three Fiber (R3F) canvas with high-performance config.
- Draco-compressed asset loader.
- Cinematic Camera system with GSAP transitions.
- Interactive Hotspots with 3D-to-HTML overlays.
- BFF ProjectsModule (NestJS, mock data).
- Post-Processing stack (Bloom, DOF, Noise, Vignette).
- Mouse-driven camera parallax.
- Adaptive Quality System (Low/Medium/High).

## [0.1.0] - 2026-06-30
### Added
- Feature-based architecture (frontend/backend).
- Shared packages (@hexastudio/types, @hexastudio/utils).
- Base UI components, GlobalErrorBoundary, LoadingScreen.
- Backend GlobalExceptionFilter.
- Documentation (AGENTS.md, FOLDER_STRUCTURE.md, REFACTOR_SUMMARY.md).
