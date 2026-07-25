# PROJECT STATUS: THE REAL-TIME PULSE

**Version:** 1.7.0 | **Last Updated:** 2026-07-25 | **Status:** PRODUCTION — v1.6.0 IN PROGRESS

## 1. EXECUTIVE SUMMARY
HEXA Studio is fully deployed and operational on production infrastructure. **Sprint 17 (Client Portal v3.0) completed on 2026-07-25** with Digital HQ, AI Copilot, Approval Center, Document Center, Finance Center, and 100% quality gates (285/285 backend tests, 176/176 frontend tests, 0 lint, 0 typecheck). **Sprint 18 (Production Readiness & Mobile Foundation) is in progress** — GitLab CE migration code is complete awaiting server deployment, API hardening audit passed, dependency vulnerabilities resolved to 0 production-critical, and the Expo mobile app scaffold is the next major milestone.

---

## 2. CURRENT HEALTH METRICS

| Dimension | Status | Health | Note |
|-----------|--------|---------|------|
| **Frontend** | 🟢 | Live | 18+ pages deployed at hexastudio.net |
| **Backend** | 🟢 | Live | NestJS API at api.hexastudio.net (285 tests) |
| **CMS** | 🟢 | Live | Strapi 5 at cms.hexastudio.net |
| **ERP** | 🟢 | Live | Odoo 17 at odoo.hexastudio.net |
| **Database** | 🟢 | Healthy | PostgreSQL 16 + Redis 7 |
| **Monitoring** | 🟢 | Active | Prometheus + Grafana |
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
| Dashboards | Grafana | 3001 | ✅ Running |
| Source Control | GitLab CE | — | 🟡 Deploy pending |

**Server:** 19.16.1.100 (Ubuntu 24.04)

---

## 4. RECENT ACHIEVEMENTS (S-017 + S-018)

- **Client Portal v3.0** — 5-Second Executive Clarity Grid, AI Copilot drawer, Approval Center with audit trail, Presigned S3 Document Center, multi-currency Finance Center, Project Workspace with Kanban
- **Odoo Business APIs (S-017)** — Tasks, Quotations, Activities, Projects, Contacts full CRUD with bidirectional Strapi-Odoo sync (ADR-009)
- **Digital Artisan** — SilkShader background, LiquidGlassCard with spring physics, ArchitecturalDataViz live KPI dashboard across 5 sections
- **GitLab CE Migration** — `.gitlab-ci.yml` (5 stages, 15 jobs), security scanning (Trivy + npm audit), deploy scripts, Docker Compose configs. GitHub Actions removed.
- **SSR Optimizations** — Font CSS async, hero woff2 preloads, `onIdle()` GSAP deferral, inline CSS, CSP hardening. Lighthouse: FCP 1.1s (-27%), LCP 1.95s (-11%)
- **Scroll Cinema Initiative** — 7 motion primitives (scroll velocity, chapter markers, progress rail, contact ribbon), FractureRing 3D hero, ReadingProgress hairline, project/blog scroll cinema
- **Dependency Hardening** — Overrides for `sharp@0.35.3`, `js-yaml@5.2.2`, `next@16.2.11`. **0 production-critical vulnerabilities** (was 4 high). `npm audit` reduced 35→31 (all Expo/RN only)
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

## 6. CURRENT SPRINT — S-018: PRODUCTION READINESS & MOBILE FOUNDATION

- [ ] GitLab Go-Live — server deploy, runner registration, repo migration, CI validation
- [ ] Mobile App Foundation — Expo scaffold, API client, auth flow, project dashboard
- [ ] Performance — Fix Windows EBUSY build, Lighthouse 95+, TBT <100ms, bundle budgets
- [ ] Quality — E2E smoke tests, playbook docs sync, security scanning verification

---

## 7. v1.6.0 RELEASE STATUS

**Status:** 🔄 IN PROGRESS — Sprint 18

**Shipped this release cycle:**
- ✅ Client Portal v3.0 (S-017) — Digital HQ, AI Copilot, Approvals, Documents, Finance
- ✅ Odoo Business APIs — Tasks, Quotations, Activities full CRUD + Strapi sync
- ✅ Digital Artisan — SilkShader, LiquidGlassCard, ArchitecturalDataViz
- ✅ GitLab CI/CD — Pipeline, security scanning, deploy scripts (code complete)
- ✅ Dependency Hardening — 0 production vulns (sharp, js-yaml, cookie, tmp fixed)
- ✅ API Hardening — Versioning, pagination, JWT, refresh rotation all audited/completed
- ✅ 285/285 backend tests, 176/176 frontend tests, 0 lint, 0 typecheck

**Pending for v1.7.0:**
- GitLab server deployment
- Mobile app scaffold (Expo)
- Performance budgets + Lighthouse 95+
- E2E smoke tests

**Next Step:** Sprint 19: Mobile & Web Performance — see NEXT_SPRINT.md
