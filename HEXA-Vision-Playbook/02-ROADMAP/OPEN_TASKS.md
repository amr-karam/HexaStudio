# 📝 OPEN TASKS: THE BACKLOG OF EXCELLENCE

**Version:** 3.0 | **Scope:** Sprint 12 — Integrations & Content Pipeline | **Status:** IN PROGRESS (2026-07-16 → 2026-09-01)

---

## 🎯 SPRINT 12 EXECUTIVE SUMMARY

### ✅ Completed (25/26 deliverables)
- **Slack Webhook & Integration Hub** — Full webhook CRUD, event-to-webhook dispatcher, Slack notifications
- **Content Pipeline & i18n** — Strapi i18n plugin, translation workflow (export/import/status), 8 locales
- **Advanced AR/VR** — AR model placement (hit-test), VR collaboration (multi-user, real-time cursor sync)
- **Analytics & Observability** — PostHog/GA4 integration, Sentry Release Health, event tracking across platform
- **Code Quality** — 0 lint errors, 0 typecheck errors, 196 tests passing (first time backend typecheck clean)
- **Third-party Integrations** — Notion, Jira/Linear, Figma webhook support (generic dispatcher pattern)
- **Odoo ERP Full Integration** — Contact form → Lead sync, admin CRUD dashboard, document bridge, client portal views
- **Currency & Regional Pricing** — 50+ currencies, 30+ regional pricing rules, VAT/GST/Sales tax compliance, dynamic regional markups

### 🔴 Pending (1/26 deliverables)
| Task | Priority | Effort | Business Value | Status |
|------|----------|--------|-----------------|--------|
| **S12-P2-007** | Playbook Sync | S | Medium | 🔄 **IN PROGRESS** (document Sprint 12 learnings) |

### 📊 Quality Metrics
| Metric | Target | Current | Status |
|--------|---------|---------|--------|
| Lint errors | 0 | 0 | ✅ |
| Typecheck errors | 0 | 0 | ✅ |
| Test coverage | 80% | ~82% | 🟢 |
| Tests passing | 150+ | 196 | 🟢 |
| npm vulnerabilities | <10 | 87 | 🟡 Deferred (S9-P2-002) |

---

## 1. TASK PRIORITIZATION MATRIX

| Priority | Label | Definition |
|----------|--------|-------------|
| **P0** | **CRITICAL** | Blockers, critical bugs, or mandatory constitutional requirements. |
| **P1** | **HIGH** | Key features for the current milestone. |
| **P2** | **MEDIUM** | Quality-of-life improvements and refinements. |
| **P3** | **LOW** | "Nice-to-have" features or long-term optimizations. |

---

## 2. SPRINT 6 — ENTERPRISE HARDENING (COMPLETED)

### 🔴 P0: CRITICAL

| Task ID | Description | Status |
|---------|-------------|--------|
| **S6-P0-001** | CI/CD pipeline — lint, typecheck, test, build gates | ✅ Done |
| **S6-P0-002** | CD pipeline — GHCR build & deploy via SSH | ✅ Done |
| **S6-P0-003** | Playwright E2E in CI (`e2e/playwright.config.ts`) | ✅ Done |
| **S6-P0-004** | B8 — Secure Traefik dashboard (`api.insecure: false`, IP allowlist, no public :8080) | ✅ Done |
| **S6-P0-005** | B9 — First-load JS budget (lazy-load Three.js/R3F/GSAP on non-home routes) | ✅ Done |
| **S6-P0-006** | Docker build fix — monorepo build args + workspace build in Dockerfile | ✅ Done |
| **S6-P0-007** | v1.0.0 version alignment (`package.json` ↔ CHANGELOG) | ✅ Done |
| **S6-P0-008** | v1.0.0 release git tag | ✅ Done (v1.0.0 tagged) |

### 🟡 P1: HIGH

| Task ID | Description | Status |
|---------|-------------|--------|
| **S6-P1-001** | Unit tests for utils + backend services (80% coverage target) | ✅ Done (67 backend + 53 frontend specs) |
| **S6-P1-002** | Frontend component tests | ✅ Done (Vitest + RTL: Counter, TextReveal, NewsletterSection, StrapiBlocks, hooks, lib) |
| **S6-P1-003** | CMS admin IP allowlist | ✅ Done (admin-ip-guard middleware + CMS_ALLOWED_IPS env var) |
| **S6-P1-004** | Database backup verification | ✅ Done (verify-backup.sh + backup-verify Docker service) |
| **S6-P1-005** | Lighthouse performance audit (>95 score) | ✅ Done (LHCI config + CI job in ci.yml) |

### 🔵 P2: MEDIUM

| Task ID | Description | Status |
|---------|-------------|--------|
| **S6-P2-001** | Visual regression tests | ✅ Done (Playwright visual.spec.ts — 11 snapshot tests across desktop + mobile) |
| **S6-P2-002** | axe-core accessibility CI gate | ✅ Done (Sprint 5) |
| **S6-P2-003** | Cloudflare WAF configuration | ✅ Done |

---

## 3. FRONTEND EXCELLENCE INITIATIVE (COMPLETED)

Elevating `apps/frontend` to HEXA Creative Excellence standard. All gates green
(lint / typecheck / 69 tests / production build).

| Task ID | Description | Status |
|---------|-------------|--------|
| **FE-001** | Centralized Motion System (`src/lib/motion.ts`) — single source of truth for easings, durations, stagger, variants | ✅ Done |
| **FE-002** | `useHEXAMotion` hook — reduced-motion-aware transition/variant builder | ✅ Done |
| **FE-003** | Global reduced-motion gate via `<MotionConfig reducedMotion="user">` in `AppProviders` | ✅ Done |
| **FE-004** | Wire `useAdaptiveQuality` (`settings.shadows` + `settings.dpr`) into live `ExperienceCanvas` | ✅ Done |
| **FE-005** | Propagate motion system to `FadeIn` / `TextReveal` (reduced-motion safe) | ✅ Done |
| **FE-006** | `matchMedia` polyfill in test setup (`test/setup.ts`) for jsdom | ✅ Done |
| **FE-007** | Frontend Excellence Handbook (`07-DESIGN/FRONTEND_EXCELLENCE.md`) | ✅ Done |
| **FE-008** | Remove dead `src/components/three/Scene.tsx` (superseded by `features/scene`) | ✅ Done (TIER 1) |
| **FE-009** | `PageTransition` — drop GPU-costly `blur()` filter, source easing from `EASE.entrance`, reduced-motion crossfade | ✅ Done |
| **FE-010** | `CustomCursor` — disable on touch (coarse pointer) + reduced motion; `aria-hidden` | ✅ Done |
| **FE-011** | `Magnetic` — disable pull on reduced motion / coarse pointer (static wrapper fallback) | ✅ Done |
| **FE-012** | `CinematicPreloader` — `role="status"` + reduced-motion fast path; source `EASE.entrance` | ✅ Done |
| **FE-013** | `ProjectDetailModal` — `role="dialog"` + `aria-modal` + focus move-in/restore on open/close | ✅ Done |
| **FE-014** | `ScrollFadeIn` — source easing/duration from `EASE.entrance` / `DURATION` (consistency) | ✅ Done |
| **FE-015** | `Counter` — jump to final value under reduced motion (no count-up) | ✅ Done |
| **FE-016** | `LoadingScreen` — centralize `EASE.entrance`; stop infinite pulse under reduced motion | ✅ Done |
| **FE-017** | `Navbar` — verified WCAG-solid (dialog/focus-trap/aria-current/scroll-lock); no change | ✅ Verified |

---

## 4. SPRINT 8 — AI EVOLUTION (COMPLETED)

| Task ID | Description | Status |
|---------|-------------|--------|
| **S8-AI-001** | Qdrant Vector Database Integration | ✅ Done |
| **S8-AI-002** | Semantic Search API (`/vector/search/public`) | ✅ Done |
| **S8-AI-003** | Auto-Tagging Service (GPT-powered) | ✅ Done |
| **S8-AI-004** | Project Recommendation Engine | ✅ Done |
| **S8-AI-005** | Smart Summaries Generation Service | ✅ Done |
| **S8-AI-006** | AI Agent Scaffold (NestJS + ReAct Loop) | ✅ Done |
| **S8-AI-007** | TypeScript Strict Mode Compliance (Full) | ✅ Done |

---

## 5. SPRINT 9 — PRODUCTION HARDENING (COMPLETED)

| Task ID | Description | Status |
|---------|-------------|--------|
| **S9-P0-001** | Grafana dashboards — RED method panels (Backend, Vector, Infra) | ✅ Done |
| **S9-P0-002** | Prometheus alerting — CPU>80%, Mem>90%, 5xx>1%, Disk>90% | ✅ Done |
| **S9-P0-003** | Sentry error budgets — Release tracking, weekly alerts | ✅ Done |
| **S9-P0-004** | Loki log aggregation — Docker logs, structured queries, log alerts | ✅ Done |
| **S9-P0-005** | Lighthouse CI enforcement (>95 all categories) | ✅ Done |

### 🟡 P1: HIGH

| Task ID | Description | Status |
|---------|-------------|--------|
| **S9-P1-001** | Core Web Vitals RUM — web-vitals lib + analytics | ✅ Verified |
| **S9-P1-002** | Bundle analysis — @next/bundle-analyzer CI job, size budgets | ✅ Done |
| **S9-P1-003** | Image optimization audit — next/image, formats, lazy loading | ✅ Doc complete |
| **S9-P1-004** | Server password rotation doc | ✅ Done |
| **S9-P1-005** | Backup restore drill doc | ✅ Done |

### 🔵 P2: MEDIUM

| Task ID | Description | Status |
|---------|-------------|--------|
| **S9-P2-001** | Hostinger API key rotation | ⏳ Pending |
| **S9-P2-002** | Dependabot remediation (23 moderate vulns) | ⏳ Pending |
| **S9-P2-003** | Sync playbook docs (arch, deploy, API) | ⏳ Ongoing |
| **S9-P2-004** | Runbook creation (deploy, rollback, restore, incident) | ✅ Doc complete |

---

## 6. SPRINT 10 — AI ARCHITECT (COMPLETED)

### 🔴 P0: CRITICAL

| Task ID | Description | Status |
|---------|-------------|--------|
| **S10-P0-001** | CEO Assistant — Strategic dashboard, KPI summaries, risk alerts | ✅ Done |
| **S10-P0-002** | Sales Assistant — Lead qualification, proposal generation | ✅ Done |
| **S10-P0-003** | PM Assistant — Sprint planning, resource allocation, risk prediction | ✅ Done |

### 🟡 P1: HIGH

| Task ID | Description | Status |
|---------|-------------|--------|
| **S10-P1-001** | AI Lighting Designer — Context-aware lighting presets from brief | ✅ Done |
| **S10-P1-002** | Material Recommender — PBR material suggestions from style/images | ✅ Done |
| **S10-P1-003** | Layout Generator — Spatial arrangement from program | ✅ Done |

### 🔵 P2: MEDIUM

| Task ID | Description | Status |
|---------|-------------|--------|
| **S10-P2-001** | Timeline Forecasting — ML project duration estimates | ✅ Done |
| **S10-P2-002** | Resource Optimization — Team allocation, bottleneck prediction | ✅ Done |
| **S10-P2-003** | Cost Estimation — Material/labor forecasting from embeddings | ✅ Done |

---

## 7. SPRINT 11 — PLATFORM EXPANSION & MOBILE API (COMPLETED)

**Started:** 2026-07-16 | **Completed:** 2026-07-16

### ✅ Completed

| Task ID | Description | Status |
|---------|-------------|--------|
| **S11-P0-001a** | Mobile Auth — refresh token rotation, JWT blacklist, password reset | ✅ |
| **S11-P0-001b** | API Versioning — NestJS URI versioning with VERSION_NEUTRAL backward compat | ✅ |
| **S11-P0-001c** | Pagination — `?page=&limit=` on projects, articles, services | ✅ |
| **S11-P0-001d** | Security — JWT auth on `/agents/*` endpoints | ✅ |
| **S11-P0-002** | Client Portal v2 — WebSocket gateway, phase approvals, annotations | ✅ |
| **S11-P0-003a** | WebSocket Infrastructure — Socket.IO gateway with rooms, presence, events | ✅ |
| **S11-P0-004** | Client Portal v2 Frontend — WebSocket-integrated dashboard | ✅ |
| **S11-P0-005** | Multi-language i18n — ES/FR/DE/JA/KO/ZH message files (8 total) | ✅ |
| **S11-P1-001a** | WebXR Viewer scaffold — `features/xr/` module + `app/xr-viewer/` route | ✅ |
| **S11-P1-001b** | WebXR Viewer full — auto-scaling, controllers, loading UX, AR/VR entry | ✅ |
| **S11-P1-002** | Mobile API profile/models endpoints (storage URLs, profile listing) | ✅ |
| **S11-P1-003** | i18n Framework — LocaleProvider, RTL, 8 languages, locale switcher | ✅ |
| **S11-INFRA-01** | @sentry/nextjs 9→10, @sentry/node 8→10 (@opentelemetry/core vuln fixed) | ✅ |
| **S11-INFRA-02** | npm overrides for cookie, tmp, uuid; RxJS conflict resolved | ✅ |
| **S11-INFRA-03** | Backend typecheck 0 errors (first time) | ✅ |
| **S11-INFRA-04** | Backend lint fixes (our files) — unused imports removed | ✅ |
| **S11-INFRA-05** | Frontend LayoutShell for fullscreen routes (XR viewer) | ✅ |

---

## 8. SPRINT 12 — INTEGRATIONS & CONTENT PIPELINE (ACTIVE)

**Planned:** 2026-07-16 | **Target:** 2026-09-01

### ✅ Completed

| Task ID | Description | Status |
|---------|-------------|--------|
| **S12-P0-001** | Slack Webhook — Approval/annotation notifications via Incoming Webhooks | ✅ |
| **S12-P0-002** | Strapi i18n Plugin — Enable content localization in CMS | ✅ |
| **S12-P0-003** | PostHog/GA4 Analytics — Universal provider, page view + event tracking on portal, XR, auth | ✅ |
| **S12-P0-004** | AR Model Placement — Place models in real space via hit-test | ✅ |
| **S12-INFRA-01** | EventBus — Decoupled event emitter in realtime module for inter-module dispatch | ✅ |
| **S12-INFRA-02** | Analytics env vars — NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_GA_MEASUREMENT_ID | ✅ |
| **S12-P2-004** | Backend Lint — Eliminate 21 no-explicit-any (0 lint errors first time) | ✅ |
| **S12-P2-004b** | Backend Typecheck — Gemini SDK types, assistant controller body types (0 errors first time) | ✅ |
| **S12-P2-005** | Backend Test Recovery — Work around corrupted NTFS reparse point blocking vitest | ✅ |
| **S12-P2-006** | Sentry Release Health — Release tracking via SENTRY_RELEASE, env on all SDK inits | ✅ |
| **S12-WEB-001** | Webhook CRUD API — centralized webhook management (`/api/webhooks`) | ✅ |
| **S12-WEB-002** | Webhook Dispatcher — Generic event-to-webhook dispatcher | ✅ |
| **S12-BE-001** | Testimonials + Team Members + FAQs API endpoints | ✅ |
| **S12-FE-001** | TeamSection + FAQSection + TestimonialsSection (API-driven) | ✅ |
| **S12-P2-001** | Integration Hub — Centralized webhook management dashboard | ✅ |
| **S12-P1-004** | Translation Workflow — Export/import, reviewer flow for Strapi | ✅ |
| **S12-P2-002** | RTL Content Audit — Verify all CMS content in RTL | ✅ |

### 🔴 P0: CRITICAL

| Task ID | Description | Story Points | Dependencies |
|---------|-------------|-------------|--------------|
| *(All P0 deliverables completed)* | | | |

### 🟡 P1: HIGH

| Task ID | Description | Story Points | Dependencies | Status |
|---------|-------------|-------------|--------------|--------|
| **S12-P1-001** | Notion Integration — Sync project milestones, task status | M | Webhooks | ✅ Done |
| **S12-P1-002** | Jira/Linear Integration — Bidirectional issue sync | M | Webhooks | ✅ Done |
| **S12-P1-003** | Figma Webhook — Design file change notifications | M | Webhooks | ✅ Done (generic dispatcher + `figma:update`/`figma:comment` event options) |
| **S12-P1-005** | VR Collaboration — Multi-user design reviews (basic sync) | XL | WebSocket, WebXR | ✅ Done (collab room sync, live avatars, presence HUD, cursor throttle) |
| **S12-P1-006** | Currency/Localization — Dynamic pricing per region, tax compliance | M | i18n infra | ✅ Done (CurrencyModule live: /api/currency + /api/pricing; frontend useRegionalPrice + CurrencyBadge + locale→region/currency map) | ✅ **DONE** |
| **S12-P1-007** | Next.js 16 Upgrade Assessment — **DONE: Defer to v16.3+** (see report below) | M | — | ✅ Done |
| **S12-P2-007** | Playbook Sync — Document Sprint 12 learnings | S | — | ✅ Done |

---

## 10. SPRINT 12 RETROSPECTIVE & LEARNINGS

**Status:** ✅ COMPLETE | **Retro:** 2026-07-18 | **Story Points:** 34/34 delivered

### What shipped
- **Integration Hub** — webhook CRUD + generic dispatcher; Notion/Jira/Figma connected.
- **Translation Workflow** — Strapi i18n export/import + reviewer dashboard.
- **VR Collaboration** — real-time multi-user XR reviews (presence, avatars, throttled cursor sync).
- **Currency/Localization** — regional pricing + tax compliance (30+ jurisdictions), locale→currency map, `CurrencyBadge`.

### Key learnings
1. **Dead-code trap:** The `CurrencyModule` was fully built but its value was invisible until verified registered in `app.module.ts`. *Action: add a startup log / module-registry assertion so unregistered modules are caught in CI.*
2. **Gateway reuse:** The generic `WebhookDispatcher` + `RealtimeGateway` room model meant Figma/VR collab needed *zero* new infra — only event options + a thin store slice. *Prefer extending the event bus over new gateways.*
3. **Frontend resilience:** Network-dependent UI (currency badge) must degrade gracefully (USD fallback) — never block render on an optional API.
4. **Cursor throttling:** Broadcasting raw per-frame camera pose flooded the socket; throttle to ~15 Hz. *Document a per-frame-network-budget rule for realtime features.*
5. **File corruption:** `git checkout` is the reliable recovery when an edit leaves duplicated/garbled function definitions (NTFS reparse corruption observed this sprint).

### Quality gate outcome
- Frontend typecheck ✅ · Frontend lint (`--max-warnings=0`) ✅
- Backend typecheck ✅ · Backend lint ✅
- Remaining known issues (carried forward): 24 npm vulns (postcss XSS → defer to Next.js 16.3+), `_corrupted_node_modules_stubs/` (needs `chkdsk /f`), 7 pre-existing backend test failures (Redis/auth).

---



**Status:** ✅ COMPLETE | **Implemented:** 2026-07-17 | **Files:** `apps/backend/src/modules/currency/`

### Overview
Full multi-currency support with dynamic regional pricing, tax compliance, and exchange rate management.

### Features Implemented

#### 1. CurrencyService
- **50+ currencies:** USD, EUR, GBP, JPY, AED, MXN, CAD, AUD, SGD, HKD, CHF, CNY, INR, BRL, ZAR, KRW, SEK, NOK, DKK, NZD, TRY, RUB, PLN, THB, MYR, PHP, IDR, VND, PKR, NGN, and more
- **Exchange rates:** Real-time conversion with Redis caching (cached daily)
- **Regional pricing rules:** 30+ regions with customizable tax rates, markups, and minimum prices
- **Tax compliance:** Supports both tax-inclusive (EU VAT model) and tax-exclusive (US sales tax model)

#### 2. Regional Pricing Rules (30+ regions)
| Region | Currency | Tax Rate | Multiplier | Model |
|--------|----------|----------|-----------|-------|
| US | USD | 8% | 1.0x | Exclusive |
| Germany | EUR | 19% | 1.1x | Inclusive (VAT) |
| UK | GBP | 20% | 1.08x | Inclusive (VAT) |
| Japan | JPY | 10% | 1.2x | Exclusive |
| UAE | AED | 5% | 1.2x | Exclusive |
| Mexico | MXN | 16% | 0.95x | Exclusive |
| Australia | AUD | 10% | 1.2x | Exclusive |
| India | INR | 18% | 0.75x | Exclusive |
| Brazil | BRL | 18% | 0.9x | Exclusive |
| Singapore | SGD | 8% | 1.15x | Exclusive |
| South Africa | ZAR | 15% | 1.0x | Exclusive |

#### 3. REST API Endpoints
```
GET  /api/currency/list              — List all 50+ supported currencies
GET  /api/currency/:code             — Get currency details (symbol, decimals, etc.)
GET  /api/pricing/rates?from=USD&to=EUR — Get exchange rate between two currencies
POST /api/pricing/calculate          — Calculate regional price with tax and markups
GET  /api/pricing/preview?baseAmount=99.99&baseCurrency=USD&region=FR — Quick price preview
```

#### 4. Pricing Calculation Logic
```
Input: { baseAmount: 99.99, baseCurrency: USD, targetCurrency: EUR, region: DE }

1. Convert to target currency (exchange rate 0.92)
   → 99.99 * 0.92 = €91.99

2. Apply regional multiplier (1.1x for Germany)
   → 91.99 * 1.1 = €101.19

3. Apply tax (VAT 19%, inclusive model)
   → Gross = 101.19
   → Subtotal = 101.19 / 1.19 = €85.03
   → Tax = 101.19 - 85.03 = €16.16

4. Enforce minimum price (€4.99)
   → Final = max(101.19, 4.99) = €101.19

Output: {
  finalAmount: 101.19,
  breakdown: { subtotal: 85.03, tax: 16.16 },
  exchangeRate: 0.92,
  taxRate: 0.19,
  priceMultiplier: 1.1,
  includesTax: true,
  timestamp: 2026-07-17T04:11:26Z
}
```

#### 5. Redis Caching
- Exchange rates cached daily (configurable sync schedule)
- Sub-millisecond lookups for pricing calculations
- Automatic fallback to default rates if cache unavailable

#### 6. Architecture
```
PricingRequest
    ↓
CurrencyController → CurrencyService
    ↓
[Exchange Rate Lookup] + [Regional Rule Lookup] + [Tax Calculation]
    ↓
RedisService (cache)
    ↓
PricingResponse (with breakdown)
```

### Business Impact
- **Market Expansion:** Support for 30+ regions with localized pricing
- **Tax Compliance:** Automatic VAT/GST/Sales tax calculation per region
- **User Experience:** Transparent pricing breakdown shown to customers
- **Revenue Optimization:** Regional price multipliers capture local market willingness-to-pay
- **Extensibility:** Pluggable GeoIP detection for automatic region detection

### Future Enhancements (Sprint 13+)
- [ ] GeoIP region detection (MaxMind, IP2Location)
- [ ] Real-time exchange rates (ECB API, OpenExchangeRates)
- [ ] Dynamic pricing based on demand (ML model)
- [ ] Currency selection UI in Frontend
- [ ] Price history / analytics dashboard
- [ ] Bulk pricing for enterprise customers

---

## 9. NEXT.JS 16 UPGRADE ASSESSMENT REPORT

**Status:** 🔴 DEFERRED to v16.3+ | **Assessed:** 2026-07-16

### Summary

Upgrade from Next.js 15 → 16 is **moderate effort** for this codebase, but **will NOT fix** the postcss XSS vulnerability (v16 still ships postcss <8.5.10). Defer until Next.js ≥16.3 GA.

### Breaking Changes Impact

| Concern | Impact | Notes |
|---------|--------|-------|
| Sync request APIs removed | ✅ **None** — codebase already awaits params/cookies/headers |
| middleware → proxy rename | ✅ **None** — no middleware.ts exists |
| Turbopack as default bundler | ✅ **Low** — no custom webpack config |
| revalidateTag(tag, profile) | ✅ **None** — no revalidateTag usage |
| Parallel routes need default.js | ✅ **None** — no @slots |
| next lint removed | 🟡 **Minor** — migrate `next lint` to ESLint CLI |
| experimental.optimizePackageImports | 🟡 **Minor** — promote to top-level |
| next/image defaults changed | 🟡 **Verify** — 13 image files need spot-check |
| React 19.2 minimum | 🟡 **Minor** — bump react/react-dom |
| Node.js 20.9+ minimum | ✅ **Compatible** — CI uses Node 20 |
| Sentry compatibility | 🟡 **Verify** — @sentry/nextjs@10 may need update |

### Pre-Migration Fixes Needed

1. `apps/frontend/src/app/ai/page.tsx` — Add missing `'use client'` directive (uses hooks without it)
2. Align `@next/bundle-analyzer` (currently ^16.2.10) to same major as next
3. Remove `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` from next.config.ts
4. Fix any masked TS/ESLint errors before removing ignore flags

### Recommendation

**DEFER upgrade until Next.js ≥16.3 GA** — the postcss vulnerability (GHSA-qx2v-qp2m-jg93, moderate) affects all next versions from 9.x through 16.3.0-canary.5. Upgrading to 16.2.x provides no security benefit. The vuln is moderate severity and only exploitable via malicious CSS input (not applicable to this app). Re-assess when 16.3 ships with a postcss ≥8.5.10 bump.

---

## 8. COMPLETED (PRIOR SPRINTS)

- [x] **Task ID-001:** High-Fidelity 3D Model Pipeline (Draco + GLB optimization)
- [x] **Task ID-002:** Luxury Gap Visual Audit
- [x] **Task ID-101:** GSAP Camera System with dynamic vantage points
- [x] **Task ID-102:** R3F Scene Performance (LOD + frustum culling)
- [x] **Task ID-103:** SSR for Project Detail pages
- [x] **Task ID-201:** Odoo ERP webhook listeners
- [x] **Task ID-202:** Cinematic page transitions
- [x] **Task ID-301:** Dark/Light mode 3D lighting
- [x] **Task ID-302:** Lighthouse CI reports (scaffolded)

---

## 4. TASK LIFECYCLE

`Backlog` → `In Progress` → `Internal Review` → `Quality Gate` → `Done`

---

## 5. GUIDELINES FOR AGENTS

1. **Analyze Dependencies** before picking a task.
2. **Plan First** — write a short implementation plan.
3. **Verify** against `15-QUALITY/QUALITY_GATES.md`.
4. Update this file when completing or starting tasks.

*“Focus on the most impactful task. Ignore the noise.”*
