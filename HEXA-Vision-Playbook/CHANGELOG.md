# Playbook Changelog

**Version:** 1.0.4  
**Last Updated:** 2026-07-20

---

## [1.0.4] - 2026-07-20

### Frontend Creative Excellence Elevation — Phase 2

**Shared UI Package Luxury Elevation (`packages/ui`):**
- **Button** — Added `luxury` variant (glassmorphic + gold border + gold glow), premium shimmer light-sweep effect on primary/luxury variants, `motion.button` with `whileHover`/`whileTap` spring physics, refined all variant styles, thin gold ring loading spinner
- **Card** — Added `luxury` variant (frosted glass + gold border glow), refined `glass`/`featured` variants, added `hover` and `as` props, lazy image loading with `decoding="async"`
- **Modal** — Escape key handler, body scroll lock, focus trap (Tab cycling), `role="dialog"` + `aria-modal`, cinematic entrance animation, luxury SVG close button, glass morphism backdrop + panel

**Signature Interaction Elevation:**
- **CinematicPreloader** — Self-drawing hexagonal logo (SVG `pathLength` animation synced to progress), pulsing gold halo behind hexagon, gold gradient progress bar fill, shimmer sweep across bar, "Architecture Visualized" tagline
- **CustomCursor** — Context-aware "View"/"Drag"/"Explore" labels via `data-cursor` attribute, magnetic attraction to interactive elements, refined ring (h-10 w-10, thin border), gold glow on pointer state, window-leave hiding

**Page Elevation:**
- **About page** — Values section wrapped in `GlassCard` (subtle variant), `gradient-radial-gold` ambient overlays on hero/values/CTA sections, `makeTransition` for consistent motion timing
- **Services page** — Service cards wrapped in `GlassCard` (default variant), `gradient-radial-gold` ambient overlays, `makeTransition` for motion
- **Contact page** — Replaced grid.svg background with `gradient-radial-gold` cinematic overlay
- **HomeHero** — Added `data-cursor="explore"` to CTA buttons
- **ExperienceCanvas** — Added `data-cursor="drag"` to 3D canvas container

**Quality Gates:**
- TypeCheck: 0 errors
- Lint: 0 errors (max-warnings=0)
- Tests: 69 passing (14 test files)
- Build: Success (Next.js 16.2.10, 23 static pages)

---

## [1.0.3] - 2026-07-20

### ⚡ Backend AI Layer — Provider-Agnostic Chat Architecture

**Core:**
- Added `FREETHEAI_API_KEY`, `FREETHEAI_BASE_URL`, `FREETHEAI_MODEL`, `AI_CHAT_PROVIDER` to `config/env.ts`
- Created `modules/ai/llm.factory.ts` — standalone `createChatClient()` resolving `openai` vs `freetheai` based on `AI_CHAT_PROVIDER`
- Created `modules/ai/ai-chat.service.ts` — NestJS `@Injectable()` with `client`, `model`, `provider`, `isAvailable`; exported from `AIModule`

**8 services migrated from direct `new OpenAI()` to DI-injected `AiChatService`:**
- `auto-tag.service.ts` — project tag generation
- `summary.service.ts` — project summary copywriting
- `ceo-assistant.service.ts` — strategic summaries, risk alerts, board reports
- `sales-assistant.service.ts` — lead qualification, proposal generation
- `pm-assistant.service.ts` — sprint planning, risk prediction
- `lighting-designer.service.ts` — architectural lighting presets
- `material-recommender.service.ts` — PBR material recommendations
- `predictive-analytics.service.ts` — timeline/budget/resource forecasting

**Not changed:** `EmbeddingService` (no `/embeddings` on FreeTheAi gateway — stays on OpenAI); `GeminiService` (separate Google provider)

**Dev UX:**
- Updated `apps/backend/.env.example` with FreeTheAi vars and docs
- Updated `FREETHEAI_PROVIDER.md` with full backend integration section (5. Architecture diagram, file checklist, switching guide)
- Backend typecheck → 0 errors

---

## [1.0.2] - 2026-07-20

### Frontend Creative Excellence Elevation

**3D Scene Masterpiece:**
- Rewrote `ProceduralArchitecture` in `SceneContent.tsx` — cantilevered pavilion with RoundedBox beveled edges, PBR concrete/dark-metal/anodized-gold/glass materials, InstancedMesh for columns + glass panels + light spheres (3 draw calls)
- Refined `PostProcessing.tsx` — softer selective bloom (luminanceThreshold 0.85), removed ChromaticAberration, added SMAA anti-aliasing, reduced film grain, gentler vignette
- Studio-quality lighting in `ExperienceCanvas.tsx` — key light + gold fill + cool blue rim + overhead spotlight, warehouse HDRI, deeper fog, softer contact shadows
- Faceted crystal in `HexaCrystal.tsx` — octahedron with flat-shading PBR gold, scale "breathing" pulsation

**Design System Premium Components (NEW):**
- `GlassCard` — frosted glass card with default/elevated/subtle variants, hover lift + gold glow, reduced-motion safe
- `CinematicText` — letter-by-letter masked reveal with staggered delays, reduced-motion collapses to fade
- `ParallaxLayer` — scroll-driven depth wrapper with configurable speed/direction, reduced-motion safe
- `ShimmerSkeleton` — branded loading skeleton with text/circle/rect variants using CSS shimmer

**Premium CSS Utilities (globals.css):**
- `.glass` / `.glass-hover` — frosted glass morphism panels
- `.text-gradient-gold` — champagne gradient text fill
- `.gradient-radial-gold` — cinematic radial gold overlay (replaces RadialGlow component across sections)
- `.focus-luxury` — luxury a11y focus ring (gold outline + soft glow)
- `.shimmer` + `@keyframes shimmer` — branded loading sweep
- `.perspective-1000` — for 3D card tilts
- `.animate-slow-zoom` — premium scroll-driven scale

**HomeHero Elevation:**
- Mouse-follow ambient gold glow (GSAP-powered, disabled in reduced motion)
- Branded `ShimmerSkeleton` loading state (replaces basic pulse)
- Animated scroll indicator with gold line fill effect
- Gold gradient text on "Spaces." headline
- Ambient `gradient-radial-gold` overlay for cinematic depth

**Section Enhancements:**
- `AchievementsSection` — wrapped stats in `GlassCard` elevated variant, CSS gradient overlay
- `TestimonialsSection` — wrapped testimonials in `GlassCard` default variant, CSS gradient overlay
- `ProjectGrid` — replaced `RadialGlow` component with CSS `gradient-radial-gold` class
- `CTASection` — replaced `RadialGlow` component with CSS `gradient-radial-gold` class
- `NewsletterSection` — replaced `RadialGlow` component with CSS `gradient-radial-gold` class

**Quality Gates:**
- TypeCheck: 0 errors
- Lint: 0 errors (max-warnings=0)
- Tests: 69 passing (14 test files)
- Build: Success (Next.js 16.2.10, 23 static pages)

---

## [1.0.1] - 2026-07-20

### Mobile

- Added `apps/mobile/` Expo SDK 53 scaffold (React Native 0.77, React 19, TypeScript 5.8)
- Configured Expo Router with 6-tab navigation (Home, Projects, Invoices, Notifications, Profile, Login)
- Home dashboard wired to `GET /api/portal/me` with project card, milestone progress bar, and invoice summary
- Projects list fetches from `/api/portal/odoo/projects` with pull-to-refresh and milestone detail push
- Milestones detail view with completion indicators (accent/gray dots), status, and dates
- Invoices tab with formatted amounts, payment-state badges, pull-to-refresh
- Notifications preferences screen with 5 toggle switches wired to `GET/PUT /api/portal/notifications/preferences`
- Profile screen with sign-out (server-side token revocation) and sign-in routing
- Auth flow: `POST /api/auth/login` → SecureStore JWT storage → `GET /api/auth/me` session restore on launch
- Resolved monorepo React type conflict via root `@types/react` override (19.2.17)
- ESLint 9 flat config, Jest + React Native Testing Library, 10 tests across 5 suites
- Wired mobile dev scripts to root `package.json` and `turbo.json`

### Infrastructure

- Server root filesystem extended from 98 GB to 2.0 TB (LVM online resize)
- Pruned 35 GB Docker build cache and unused images
- Removed `hexastudio-dev` stack (dev postgres/redis/qdrant) from production; backup saved
- Production deploy via SSH + `deploy-zero-downtime.sh` confirmed healthy (green slot; blue removed)

### AI Tooling

- Added `10-AI/FREETHEAI_PROVIDER.md` — FreeTheAi provider setup guide, catalog of 41 models, and HEXA agent integration patterns
- FreeTheAi registered as custom provider in global OpenCode config (41 chat models, OpenAI-compatible gateway)
- Lovable MCP disabled in OpenCode config (OAuth restricted to approved clients; use VS Code/Cursor for Lovable tasks)

---

## [1.0.0] - 2026-07-12

### Sprint 6 — Enterprise Hardening (COMPLETE)

**Security Hardening:**
- CMS admin IP allowlist middleware (admin-ip-guard + CMS_ALLOWED_IPS)
- Traefik dashboard secured (api.insecure: false, IP allowlist, TLS-only)
- CSP headers via Traefik middleware
- JWT + Redis authentication hardened

**Performance Optimization:**
- Lazy loading for Three.js/R3F/GSAP (home 188 kB, all routes ≤ 200 kB)
- Bundle budget enforced (first-load JS ≤ 200 kB on all routes)
- Lighthouse CI configured (LHCI + CI job targeting score > 90)

**Quality & Testing:**
- Backend tests: 67 specs across 14 files (auth, accounting, portal, requests, users, email, odoo, redis, health)
- Frontend component tests: 53 specs (Vitest + RTL for UI components, hooks, lib)
- Playwright E2E scaffold: Navigation, pages, 404, SEO, a11y
- Database backup verification: verify-backup.sh + backup-verify Docker service

**Infrastructure & CI/CD:**
- CI pipeline: Typecheck, lint, test, build jobs for monorepo workspaces
- CD pipeline: GHCR image build + SSH deploy to production server
- E2E in CI: Playwright job integrated
- Docker build fix: Build args + monorepo workspace build in Dockerfile

**Release:**
- All package versions aligned to 1.0.0 (frontend, backend, cms)
- CHANGELOG complete with v1.0.0 entry
- Sprint 6 (Enterprise Hardening) complete
- v1.0.0 release ready for tag

---

## [1.0.0] - 2026-07-08

### Added
- Root-level governance documents (README, Vision, Roadmap, Tech Stack, Architecture)
- Process documents (Dev Workflow, Git Workflow, Coding Standards, Doc Standards)
- Quality & Compliance guides (Security, Performance, Accessibility, SEO)
- Deployment & Release processes (Deployment, Release, Quality Gates)
- AI Agent Guide and Business Workflows
- Complete directory structure for the Playbook
- 14 Architecture Decision Records (ADRs)
- 10 API specifications (Auth, Projects, Contacts, Content, Users, Webhooks, Portal)
- 8 Agent-specific guides (Architect, Frontend, Backend, Odoo, DevOps, QA, Security)
- 8 detailed Standards documents (Design System, 3D Modeling, Animation, Logging, Testing, Error Handling)
- 10 Verification Checklists (Pre-commit, Pre-PR, Pre-release, Accessibility, etc.)
- 8 Prompt templates for AI agents
- 8 Document templates (Feature, PR, Meeting, Incident, Bug, etc.)
- Detailed Odoo integration guides (CRM, Projects, Documents, Data Models)
- Detailed DevOps runbooks (Infrastructure, Monitoring, Backup, Incident Response)
- Detailed Architecture docs (Frontend, Backend, CMS, Auth, Data Flow, Network, 3D Pipeline)
- Sprint structure and backlog
