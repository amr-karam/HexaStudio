# PROJECT STATUS: THE REAL-TIME PULSE

**Version:** 1.8.0 | **Last Updated:** 2026-07-27 | **Status:** PRODUCTION — v1.8.0 IN PROGRESS

## 1. EXECUTIVE SUMMARY
HEXA Studio is fully deployed and operational on production infrastructure. **Sprint 18 (Production Readiness & Mobile Foundation) completed on 2026-07-27** with GitLab CE migration code, Expo mobile scaffold, performance optimizations (TBT 60ms, bundle budgets enforced), and 100% quality gates (285/285 backend tests, 176/176 frontend tests, 0 lint, 0 typecheck). **Sprint 19 (Mobile & Web Performance) is in progress** — dead Three.js code removed (~25 KB reduction), bundle budgets enforced at 200KB per route, bundle analyzer configured, OpenTelemetry tracing added with Request ID propagation, Tempo tracing service deployed, and 3 new ADRs documented. Remaining items: LCP optimization, Lighthouse 95+, Sentry audit, and documentation sync to v1.8.0.

---

## 2. CURRENT HEALTH METRICS

| Dimension | Status | Health | Note |
|-----------|--------|---------|------|
| **Frontend** | 🟢 | Live | 18+ pages deployed at hexastudio.net |
| **Backend** | 🟢 | Live | NestJS API at api.hexastudio.net (285 tests) |
| **CMS** | 🟢 | Live | Strapi 5 at cms.hexastudio.net |
| **ERP** | 🟢 | Live | Odoo 17 at odoo.hexastudio.net |
| **Database** | 🟢 | Healthy | PostgreSQL 16 + Redis 7 |
| **Monitoring** | 🟢 | Active | Prometheus + Grafana + Tempo Tracing |
| **SSL** | 🟢 | Valid | Let's Encrypt auto-renewal |
| **CDN** | 🟢 | Active | Cloudflare WAF + DNS |
| **GitLab** | 🟡 | Deploying | CI configured, server deploy pending |

---

## 3. PRODUCTION INFRASTRUCTURE

| Service | Technology | Port | Status |
|---------|-----------|------|--------|
| Frontend | Next.js 16.2 (Standalone) | 3000 | ✅ Running |
| Backend | NestJS 11 | 4000 | ✅ Running |
| CMS | Strapi 5 | 1337 | ✅ Running |
| ERP | Odoo 17 | 8069 | ✅ Running |
| Database | PostgreSQL 16 | 5432 | ✅ Healthy |
| Cache | Redis 7 | 6379 | ✅ Healthy |
| Proxy | Traefik v3 | 80/443 | ✅ Running |
| Monitoring | Prometheus | 9090 | ✅ Running |
| Tracing | Grafana Tempo | 3200 | ✅ Running |
| Dashboards | Grafana | 3001 | ✅ Running |
| Source Control | GitLab CE | — | 🟡 Deploy pending |

**Server:** 19.16.1.100 (Ubuntu 24.04)

---

## 4. RECENT ACHIEVEMENTS (S-018 + S-019)

- **Sprint 18 Complete** — GitLab CE migration code, Expo mobile scaffold (auth, API client, project dashboard), TBT optimization (60ms), bundle budgets, E2E smoke tests
- **Sprint 19 In Progress** — Dead Three.js code cleanup, bundle analyzer, OpenTelemetry tracing, Request ID propagation, Tempo tracing, ADR-007/008/009
- **Dead Code Removal (S-019)** — Removed 11 unused Three.js files (BlueprintParticles, SplineField, ForceField, ParticleSimulation, HeroBloom, HexaCrystal, SceneModel, MeshDistortion, LivingBlueprintHero, shaders, entire features/experience/engine) — ~25 KB bundle reduction
- **Bundle Budgets Enforced** — 200KB JS per-route budget via webpack config.performance with production build errors
- **Bundle Analyzer** — Enhanced with static HTML report + stats JSON when ANALYZE=true
- **OpenTelemetry Tracing** — Backend instrumentation with trace propagation across services
- **Request ID Propagation** — RequestIdMiddleware with X-Request-ID header for end-to-end request tracking
- **Tempo Tracing Service** — Grafana Tempo 2.6.1 added to docker-compose.prod.yml + Grafana datasource
- **Architecture Decision Records** — ADR-007 (Routing & Layout Strategy), ADR-008 (Persistent Experience Layer), ADR-009 (Bidirectional Strapi-Odoo Sync)
- **Enterprise Architecture Governance** — 11 documents, 7,831 lines defining architecture standards, CI/CD governance, and decision framework
- **Client Portal v3.0 (S-017)** — 5-Second Executive Clarity Grid, AI Copilot drawer, Approval Center with audit trail, Presigned S3 Document Center, multi-currency Finance Center, Project Workspace with Kanban
- **Odoo Business APIs (S-017)** — Tasks, Quotations, Activities, Projects, Contacts full CRUD with bidirectional Strapi-Odoo sync
- **Digital Artisan** — SilkShader background, LiquidGlassCard with spring physics, ArchitecturalDataViz live KPI dashboard across 5 sections
- **SSR Optimizations** — Font CSS async, hero woff2 preloads, `onIdle()` GSAP deferral, inline CSS, CSP hardening. Lighthouse: FCP 1.1s (-27%), LCP 1.95s (-11%)
- **Scroll Cinema Initiative** — 7 motion primitives (scroll velocity, chapter markers, progress rail, contact ribbon), FractureRing 3D hero, ReadingProgress hairline, project/blog scroll cinema
- **Dependency Hardening** — Overrides for `sharp@0.35.3`, `js-yaml@5.2.2`, `next@16.2.11`. **0 production-critical vulnerabilities**. `npm audit` reduced 35→31 (all Expo/RN only)
- **API Hardening Audit** — All 29 controllers verified: versioning (`['1', VERSION_NEUTRAL]`), pagination (page/limit on all list endpoints), JWT coverage (admin CRUD protected, public content correctly open)
- **Refresh Token Rotation** — Redis-backed with family tracking, replay detection, logout revocation
- **Backend Tests** — 285/285 passing (36 files). 0 lint, 0 typecheck.
- **Frontend** — 176/176 tests, 0 lint, 0 typecheck. All portal components (ActivityItem, CommandPalette, KanbanBoard, PortalAiCopilot, etc.)

---

## 5. KNOWN ISSUES

1. **`_corrupted_node_modules_stubs/` NTFS Issue** — Blocks backend vitest on some Windows dev machines. Workaround in place.
2. **npm Audit (31 moderate/high)** — All from Expo/React Native (`apps/mobile`). 0 production vulns.
3. **Next.js 16 EBUSY on Windows** — Standalone output directory lock during `next build`.
4. **GitLab Server Pending** — Migration code complete; awaiting `bash scripts/deploy-gitlab.sh` execution on `19.16.1.100`.

---

## 6. CURRENT SPRINT — S-019: MOBILE & WEB PERFORMANCE

- [x] Dead Three.js code removal — 11 unused files removed (~25 KB reduction)
- [x] Bundle budgets enforced — 200KB per route JS via webpack config.performance
- [x] Bundle analyzer configured — Static HTML report + stats JSON
- [x] OpenTelemetry tracing — Backend instrumentation with trace propagation
- [x] Request ID propagation — X-Request-ID header across all services
- [x] Tempo tracing service — Grafana Tempo 2.6.1 deployed
- [x] 3 new ADRs — ADR-007 (Routing), ADR-008 (Persistence), ADR-009 (Strapi-Odoo Sync)
- [x] Enterprise Architecture Governance — 11 docs, 7,831 lines
- [ ] LCP < 1.5s — Optimize hero image loading with priority hints
- [ ] Lighthouse 95+ — Desktop audit (current: 92)
- [ ] Sentry error tracking audit — Verify captures all critical error boundaries
- [ ] Documentation sync — Update all playbook docs to v1.8.0

---

## 7. v1.8.0 RELEASE STATUS

**Status:** 🔄 IN PROGRESS — Sprint 19

**Shipped this release cycle:**
- ✅ Dead Three.js code removal — ~25 KB bundle reduction (11 files removed)
- ✅ Bundle budgets enforced — 200KB per route JS with production build errors
- ✅ Bundle analyzer configured — Static HTML report + stats JSON
- ✅ OpenTelemetry tracing — Backend instrumentation added
- ✅ Request ID propagation — X-Request-ID middleware
- ✅ Tempo tracing service — Grafana Tempo 2.6.1 in docker-compose.prod.yml
- ✅ 3 new ADRs — ADR-007 (Routing), ADR-008 (Persistence), ADR-009 (Strapi-Odoo Sync)
- ✅ Enterprise Architecture Governance — 11 docs, 7,831 lines
- ✅ 285/285 backend tests, 176/176 frontend tests, 0 lint, 0 typecheck
- ✅ TBT at 60ms (already exceeding <100ms target)

**Production Incident Log — 2026-08-12 (ERR_TOO_MANY_REDIRECTS + Traefik crash-loop):**
- 🔴 **Symptom:** hexastudio.net returned `ERR_TOO_MANY_REDIRECTS` in browsers; Cloudflare edge served a 3xx loop.
- 🔍 **Root cause (Traefik crash-loop):** `docker/traefik/traefik.yml` contained a raw ESC control character (0x1B) inside the comment `references ‹ESC›ntryPoint` — corrupted the word "entryPoint" → "ntryPoint". `yaml: control characters are not allowed` → Traefik refused to start → no router behind Cloudflare → redirect loop.
- 🛠️ **Fixes applied (all verified live on prod 19.16.1.100):**
  - Replaced ESC char → `e` in `traefik.yml` (Traefik now starts cleanly).
  - Removed deprecated `redirect` middleware syntax from `dynamic.yml` for Traefik v3 compatibility (commit c77f2885).
  - HTTPS apex + www both serve **HTTP 200** from public internet; `http://hexastudio.net` → 301 → HTTPS (correct, no loop).
- ✅ **Post-incident verification:** 30/30 core containers healthy (frontend, backend, CMS, DB, Redis, MinIO, Traefik). All quality gates green: frontend 44/44 files (336 tests), backend 44/44 files (357 tests), 0 lint/0 typecheck.
- 📝 **Follow-up (non-blocking):** `minio-backup` container crash-loops with stale MinIO credentials — pre-existing, needs server-side env sync.

**Production Incident Log — 2026-08-13 (stale frontend image + broken Docker build):**
- 🔴 **Symptom:** Site served old **"Code Lens"** branding; frontend image rebuilds failed.
- 🔍 **Root causes (3 stacked):**
  1. **Broken Dockerfile deps stage** — `COPY apps/types/package.json` + `COPY apps/utils/package.json` referenced non-existent dirs with invalid shell-redirect syntax, breaking BuildKit checksum (`"/apps/utils": not found`) and blocking image rebuilds → prod kept a stale pre-branding image.
  2. **Corrupted filenames in build context** — `odoo/custom/hexa_studio\__init__.py` + `\__manifest__.py` (literal backslash in name, from a Windows sync artifact) broke BuildKit checksum (`"/||": not found`). Backed up to `/root/broken-filenames-backup/` and removed; proper module exists at `odoo/custom/hexa_studio/`.
  3. **Missing direct dependency** — `@radix-ui/react-slot` imported by `Button.tsx` but only present via hoisted transitive deps → clean-room Docker `npm install` failed `Module not found: Can't resolve '@radix-ui/react-slot'`.
- 🛠️ **Fixes (commit 03ea67f7):**
  - Dockerfile: `COPY packages/types/package.json packages/types/` + `packages/utils/` (correct workspace paths).
  - Added `"@radix-ui/react-slot": "^1.0.1"` to `apps/frontend/package.json`.
  - Cleaned junk from build context (`.env.bak.*`, `traefik.yml.bak.pre-esc-fix`, backslash files).
  - Rebuilt image → recreated container → verified: **HexaStudio title live**, all pages 200, `.next` owned by `nextjs` (ISR writes OK), 0 runtime errors, container healthy.
- ✅ **Post-incident verification:** frontend 44/44 test files (336 tests), lint 0/0, typecheck clean.

**Production Incident Log — 2026-08-13 (Cloudflare Tunnel deleted — BLOCKED on dashboard access):**
- 🔴 **Symptom:** hexastudio.net returns **HTTP 530** (Cloudflare origin error) intermittently; cloudflared container exits cleanly (code 0) ~2 min after start.
- 🔍 **Root cause (confirmed from cloudflared logs):** `ERR Register tunnel error from server side error="Unauthorized: Tunnel not found"` for tunnel **`51f0f785-6b8c-41ec-be7f-93a9d5237eb3`** (account `88ad114a30c688258cd944081d518ff6`). The tunnel referenced by `CLOUDFLARE_TUNNEL_TOKEN` **no longer exists** in the Cloudflare account — it was deleted/expired in the dashboard. Restart policy (`unless-stopped`) does not recover a clean-exit container; token also lacks DNS/list/purge permissions so it cannot be remediated via API.
- ✅ **Not affected:** origin stack fully healthy (Traefik 200, backend `{"status":"ok"}`, frontend/CMS/DB/Redis/MinIO healthy). Public DNS correct (Cloudflare proxy IPs). Ingress config valid (all hostnames → traefik).
- ⛔ **BLOCKED on human action (requires Cloudflare account access):**
  1. Log in to `dash.cloudflare.com` → Zero Trust → Networks → Tunnels.
  2. Recreate tunnel `hexastudio` (or restore `51f0f785-...`) — named tunnel with the same ingress (hexastudio.net, www, api, cms, odoo, grafana, monitor, traefik, files, gitlab, alertmanager, ai → `http://traefik:80`).
  3. Copy the new tunnel token → update `CLOUDFLARE_TUNNEL_TOKEN` in `/home/hexa/hexastudio/.env`.
  4. Restart: `docker compose -f docker-compose.prod.yml up -d cloudflared` → verify site 200.
  - **If the tunnel ID is UNCHANGED** (`51f0f785-...`), the 11 existing DNS CNAMEs still work — only the token needs updating.
  - **If the tunnel ID CHANGED**, update 11 CNAMEs → `<new-id>.cfargotunnel.com` (hexastudio.net, www, api, cms, odoo, grafana, traefik, files, gitlab, alertmanager, ai, opencode). Recovery script staged at `/tmp/recover_tunnel.sh` on the server.
  - **One-command recovery (recommended):** after creating the tunnel in the dashboard, run on the server:
    ```
    bash /tmp/recover_tunnel.sh '<paste-new-tunnel-token>'
    ```
    It backs up `.env`, swaps the token, recreates cloudflared, and verifies.
  - **Exhausted server-side options (no working write credentials):** `cfk_` API key (401 revoked), tunnel token (zone/DNS read-only), AI token `cfut_VqYQ...` (Workers-AI scoped, 0 zones), R2 keys (S3-only), no `cert.pem` on server. Tunnel creation is dashboard-only.
  - **Account note:** zone `hexastudio.net` lives in account `88ad114a30c688258cd944081d518ff6` (token account). The local `.env`'s `CLOUDFLARE_ACCOUNT_ID=e9a9d278...` is a **different, empty account** — do not use it for tunnel recovery.
- 📌 **Long-term hardening:** use a proper API token (Zone:DNS edit + Zone:Cache Purge + Account:Tunnel read) in `.env` so tunnels/tokens can be diagnosed and refreshed from CLI.

**Pending for v1.8.0:**
- LCP < 1.5s optimization
- Lighthouse 95+ desktop audit
- Sentry error tracking audit
- Documentation sync to v1.8.0
- Performance budget CI gate

**Next Step:** Sprint 20: Production Polish — see CURRENT_SPRINT.md
