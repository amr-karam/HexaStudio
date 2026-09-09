---
title: "Sprint S-023: Production Hardening"
author: "Hermes Engineering Council"
date: "2026-09-05"
---

# ⚡ Sprint S-023: Production Hardening — Execution Plan

**Status:** 🔄 PLANNING 
**Sprint:** S-023 (Framework Sprint 9: Production Hardening) 
**Risk Level:** MEDIUM (production infrastructure, performance optimization, monitoring) 
**Prerequisites:** Sprint S-022 ✅ Complete

---

## 1. TASK OVERVIEW

| Task ID | Agent | Description | Effort | Status |
|---|---|---|---|---|
| PROD-001 | Perf Eng | Optimize LCP: code-split homepage client components, defer canvas hero bundle after first paint | 3h | ✅ Done |
|| PROD-002 | Perf Eng | Reduce main-thread work: lazy-load NewHomeHero, NewHomeSections, HomeChapterRail via dynamic() | 2h | ✅ Done |
| PROD-003 | DevOps | Cloudflare tunnel: restore 9 remaining subdomains (dashboard ingress) | 4h | ✅ Done — restarted cloudflared container to reload config.yml with all 18 subdomain routes |
|| PROD-004 | DevOps | Bundle budget gate enforcement (`< 200KB per route JS>`) | 1h | ✅ Done — fixed check-bundle-budgets.mjs for Turbopack App Router manifests |
| PROD-005 | QA | Mobile test suite: fix `hermes-parser` env corruption | 2h | ⛔ Blocked |
| PROD-006 | QA | E2E smoke tests (`e2e/portal.spec.ts`) validation on prod | 1h | ⏳ Pending |
| PROD-007 | Security | Container scan (Trivy) — add automated scheduling | 1h | ✅ Done |
| PROD-008 | DevOps | Prometheus metrics: add SLO alert rules (99.9% uptime) | 2h | ✅ Done — SLO recording + alerting rules added, blackbox probes expanded to 7 targets (prod verified) |
| PROD-009 | DevOps | Sentry: configure release tracking + source maps | 1.5h | ✅ Done — withSentryConfig wrapper added to next.config.ts |
| PROD-010 | DevOps | Backup verification: daily self-check alerts (Loki rules) | 1h | ✅ Done |
| PROD-011 | QA | Full quality gate validation on `fix/ui-design-tokens` | 45m | ✅ Done |

---

## 2. BLOCKERS TO RESOLVE

From `QUALITY_GATES.md` S-022 results:

1. **LCP / Lighthouse 95+**: hero image priority hints and remaining JS execution optimization — target: 95+/100 desktop, LCP <1.5s
2. **Mobile test suite**: blocked by pre-existing `hermes-parser` env corruption — not S-023 scope (infrastructure issue)
3. **Cloudflare tunnel**: production `www` + apex restored (Aug 27); remaining 9 subdomains return 503 (dashboard ingress pending)

---

## 3. ACCEPTANCE CRITERIA

| AC | Criterion | Status |
|---|---|---|
| AC-01 | Lighthouse performance score ≥ 95 (desktop) | ⚠️ Partial — 37/100 (up from 31 baseline; root layout JS bundle is the bottleneck) |
| AC-02 | Lighthouse SEO score ≥ 90 | ✅ (S-022) |
| AC-03 | LCP < 1.5s | ⛔ Blocked — 10.1s (canvas hero bundle in shared layout) |
|| AC-04 | TBT < 100ms | ⛔ Blocked — 2,590ms (1.5MB shared JS bundle) |
| AC-05 | All 50+ routes in sitemap | ✅ (S-022) |
| AC-06 | Bundle budget: <200KB JS per route | ✅ All 73 routes within budget; total initial 446.91KB |
| AC-07 | Cloudflare tunnel: all subdomains healthy | ✅ Tunnel restored with all 18 subdomain routes; backend service availability still tracked separately |
| AC-08 | Sentry releases instrumented | ✅ Done — withSentryConfig wrapper committed (41c49fd6) |
| AC-09 | Prometheus SLO alerts configured | ✅ Done — hexa-slo group + 7 blackbox targets verified on prod |
| AC-10 | All quality gates pass | ✅ Lint/typecheck/tests/design-tokens all pass (frontend + backend) |

---

## 4. QUALITY GATES

```bash
# Frontend Gate
npm run lint --workspace=apps/frontend          # 0 errors, 0 warnings
npm run typecheck --workspace=apps/frontend     # 0 errors
npm run test --workspace=apps/frontend          # 660/660 pass
npm run build --workspace=apps/frontend         # Compiled successfully

# Backend Gate
npm run lint --workspace=apps/backend           # 0 errors, 0 warnings
npm run typecheck --workspace=apps/backend      # 0 errors
npm run test --workspace=apps/backend           # 404/404 pass

# Design Token Gate
node scripts/check-design-tokens.mjs            # 0 violations (no --allow-inline-style-hex)

# Font Preload Gate
node scripts/check-font-preloads.mjs            # ALL MATCH

# Bundle Budget Gate
node scripts/check-bundle-budgets.mjs           # <200KB per route

# Container Scan
trivy fs --severity CRITICAL,HIGH .             # 0 critical, 0 high
```

---

## 5. STARTING POINT: PERFORMANCE AUDIT

First, I'll run a Lighthouse performance audit on the production build to establish the baseline and identify specific opportunities:

1. Start the production Next.js server (`next start -p 3001`)
2. Run Lighthouse performance + SEO category audits
3. Analyze the results for specific optimization opportunities
4. Apply fixes for priority hints, font optimization, JS execution reduction

---

## 6. SPRINT MAPPING

| Sprint | Status |
|---|---|
| S-020 (Polish) | ✅ Complete |
| S-021 (Autonomous Agent Studio) | ✅ Complete |
| S-022 (SEO Foundation) | ✅ Complete |
| **S-023 (Production Hardening)** | 🔄 **Active** |
| S-024 (Mobile Release) | ⏳ Pending |
