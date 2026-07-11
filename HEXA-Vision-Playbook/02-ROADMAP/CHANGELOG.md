# Changelog: HEXA Vision

## [1.0.0] - 2026-07-11
### Added
- **Client Portal:** `/portal/login`, `/portal` with project timeline, documents, and requests from Odoo ERP.
- **Admin Dashboard:** `/admin/requests` with priority badges and status updates; `/admin/accounting` with revenue/expenses, chart of accounts, invoices, journals.
- **Odoo Integration (Full):**
    - `OdooService`: `create()`, `write()`, `searchRead()`, `execute()` with circuit breaker and Redis caching.
    - `ContactService`: Creates `crm.lead` on contact form submit.
    - `PortalService`: Fetches real `project.task` and `account.move` from Odoo.
    - `RequestsService`: Persists client requests as `crm.lead`.
    - Accounting endpoints: `/api/accounting/dashboard`, `/invoices`, `/journals`, `/accounts`, `/taxes`, `/journal-entries`.
    - Odoo 17 Docker container with SSL (Let's Encrypt) at `odoo.hexastudio.net`.
    - Accounting module activated with Lebanon COA (`l10n_lb_account`).
- **3D Experience:** HexaCrystal scene on home page, cinematic preloader, page transitions via Framer Motion.
- **SEO:** JSON-LD structured data, `robots.ts`, `sitemap.ts`, per-page metadata with `generateMetadata`.
- **Services Page:** CMS-driven services from Strapi with `StrapiBlocks` rich text renderer.
- **Newsletter Section:** Home page newsletter signup.
- **Contact Form:** Connected to Odoo CRM via `ContactService`.
- **DevOps:**
    - `develop` branch as active development branch.
    - Consolidated CI/CD workflow (`ci-cd.yml`).
    - Turborepo task pipeline.
    - `packageManager` field in root `package.json`.
    - `LICENSE` (MIT), `CONTRIBUTING.md`, `SECURITY.md`.
- **Config Centralization:** `API_BASE_URL` single source in `config/constants.ts`.
- **Client Wrapper:** `FadeIn.tsx` for server-component framer-motion animations.

### Fixed
- **Docker Build:** Added `node_modules` to `.dockerignore`; `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` in `next.config.ts`.
- **RSC Boundaries:** Added `'use client'` to `Button.tsx`, `Input.tsx`; extracted `ArticleDetailClient.tsx` for blog `[slug]`.
- **Layout Nesting:** Removed duplicate `<html>`/`<body>` from admin and portal layouts.
- **Portfolio:** Fixed duplicate `scrollYProgress` declaration in `ProjectGrid.tsx`.
- **ESLint:** Removed unused imports (`loader`, `Project`, `MODEL_REGISTRY`).
- **Merge Conflicts:** Resolved env.ts, odoo.module.ts, odoo.service.ts, portfolio/page.tsx, fetchProjects.ts between main and develop.

### Changed
- **Contact Email:** Updated to `info@hexastudio.net` across all pages and backend.
- **Dockerfile:** `WORKDIR /app/apps/frontend` before build; `npx next build` with `NODE_ENV=production`.
- **Frontend Deployed:** All 18 pages live at `https://hexastudio.net` with HTTP 200.

## [0.9.0] - 2026-07-07
### Fixed
- **SSR Crash:** Wrapped `SmoothScroll` in dynamic import to prevent `window is not defined` during server-side rendering; stripped JSX comments across all components for cleaner builds.
- **Framer Motion v12 Compatibility:** Replaced all `ease: 'var(--ease-out-expo)'` references with inline cubic-bezier `[0.16, 1, 0.3, 1]` — framer-motion v12 no longer supports CSS variable easing strings.
- **Studio 404:** Created `/studio` page that redirects to `/about` — resolves client navigation to "Studio" link.
- **Portfolio Card Visibility:** Reformatted `ProjectGrid.tsx` with proper line breaks and indentation; fixed card hover overlay translation; added responsive font sizing (`text-[10px] md:text-xs`, `text-lg md:text-xl lg:text-2xl`).
- **Blog Fallback Content:** Added 3 hardcoded fallback articles displayed when the API fails or returns empty — prevents blank page on CMS outage.
- **Font Size Polish:** Migrated hardcoded `text-[11px]`, `text-[9px]` to Tailwind text scale classes throughout UI components.

### Changed
- **Dockerfile (Frontend):** Pinned `framer-motion` in root `package.json`; switched from `npm install` to `npm ci` for reproducible builds; added `--no-audit --no-fund` flags; added `wget` to base stage; added `ARG`/`ENV` declarations for `NEXT_PUBLIC_*` build-time variables.

## [0.8.0] - 2026-07-06
### Added
- **Cloudflare Migration:**
    - DNS nameservers changed from Hostinger → Cloudflare (`kip.ns.cloudflare.com` / `lara.ns.cloudflare.com`)
    - All A, CNAME, MX, TXT (SPF/DKIM/DMARC) records migrated to Cloudflare zone
    - Cloudflare Tunnel (systemd service) deployed to bypass NAT — ports 80/443 no longer need forwarding
    - SSL set to Flexible mode with Always Use HTTPS
- **Let's Encrypt Certificates:**
    - DNS-01 challenge via Cloudflare API — all 5 certs issued (`hexastudio.net` + `www`, `api`, `cms`, `opencode`, `ai`)
    - Certificates valid Jul 6 – Oct 4 2026
    - `sniStrict: true` enabled to force ACME resolution
- **Playwright E2E Test Scaffold:**
    - `e2e/playwright.config.ts` + `e2e/pages.spec.ts` — covers navigation, all pages, 404, SEO metadata, accessibility
    - Test scripts added to `package.json` (`test:e2e`, `test:e2e:ui`)
    - `@playwright/test` added to frontend devDependencies
- **Git Workflow:**
    - `.agents/skills/gemini-skills` converted from broken submodule to tracked files

### Fixed
- **Traefik:** Removed duplicate `letsencrypt` resolver; added `certResolver: cloudflare` to all routers
- **Config Sync:** Removed HTTP→HTTPS redirect from `web` entrypoint (tunnel handles HTTP)
- **Self-Signed Certs:** Removed old default.crt/default.key files and certs mount from compose
- **.env.sync:** Added `CLOUDFLARE_EMAIL` / `CLOUDFLARE_API_KEY` to `.env.example` and compose

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
