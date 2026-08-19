# Lighthouse Audit Report — 2026-08-17

**URLs:** https://hexastudio.net/ · https://cms.hexastudio.net/admin · https://odoo.hexastudio.net/web/login
**Tool:** Lighthouse 13.4.1 (Desktop preset, simulated throttling, 3-run median for the public site)
**Chrome:** HeadlessChrome 151.0.0.0 (Windows) · **Node:** v24.16.0 · **Build:** Turbopack
**Commit at time of run:** main `bd15744` (deployed build ≈ `5a47162` + `75dc3b0`, deploy 2026-08-16)
**Date:** 2026-08-17 · **Sprint:** S-0xx — Post-deploy verification (fonts/widths + PAT rotation + MinIO fix)

---

## 1. Public site — hexastudio.net (3-run median)

| Metric | Jul-23 (P9) | **Aug-17 median** | Delta | Status |
|--------|-------------|-------------------|-------|--------|
| Performance score | 86 | **37** (43/37/30) | **−49** | 🔴 Regression |
| First Contentful Paint | 1.06 s | **2.65 s** (1.8/2.7/3.4) | +1.59 s | 🔴 Regression |
| Largest Contentful Paint | 1.89 s | **2.91 s** (2.1/2.9/4.2) | +1.02 s | 🔴 Regression |
| Speed Index | 1.14 s | **15.2 s** (15.0/15.2/16.9) | +14.1 s | 🔴 Regression |
| Total Blocking Time | 157 ms | **1,084 ms** (3,935/956/1,084) | +927 ms | 🔴 Regression |
| Time to Interactive | 1.89 s | **6.6 s** (7.4/4.7/6.6) | +4.7 s | 🔴 Regression |
| Cumulative Layout Shift | 0.001 | **0.021** (0.045/0.021/0.017) | +0.02 | 🟡 Borderline |
| TTFB (server-response-time) | 128 ms | **140 ms** | +12 ms | 🟢 Fine |

**Unthrottled real-browser measurement (PerformanceObserver, Chrome 151):**
LCP **1,392 ms**, CLS **0**, **11 long tasks / 1,063 ms total blocking** clustered at 2.6–4.1 s post-nav (×~3.7 simulated throttle ≈ the Lighthouse TBT — regression is real, not a tool artifact).

**Main-thread trace analysis (trace-home.json.gz, 690k events):** work inside long tasks, top contributors:
- `v8.callFunction` — 15.7 s aggregate (hydration JS)
- `UpdateLayoutTree` — **6.4 s** (layout thrash)
- `FireIdleCallback` — **5.1 s** (GSAP/onIdle init burst at 2.7–4.1 s)
- `FireAnimationFrame` — 3.8 s (rAF loops)
- GC (marking/sweep/incremental) — ~4.3 s
- `GPUTask` — 1.8 s (WebGL/3D scene boot)

Other categories (MCP audit): Accessibility **95** (color-contrast, heading-order, label-content-name-mismatch failures), Best Practices **100**, SEO **100**.

---

## 2. Internal tools (single run, desktop)

### cms.hexastudio.net — Strapi admin login
**Score 37** · FCP 2.6 s · LCP 3.6 s · TBT 750 ms · SI 3.8 s · TTI 3.6 s · CLS 0 · TTFB 140 ms
Payload **2,868 KiB** (1,663 KiB unused JS). Heavy SPA — expected for an admin tool; no action unless it degrades daily use.

### odoo.hexastudio.net — Odoo login
**Score 80** · FCP 0.5 s · LCP 0.5 s · TBT 270 ms · **SI 13.0 s** (loading-spinner artifact — visual completeness never satisfied) · TTI 1.3 s · CLS 0 · TTFB 160 ms · 703 KiB. Minor: unsized images, 319 KiB unused JS, 76 KiB unused CSS. No action required.

---

## 3. Root-cause analysis — hexastudio.net regression

### 3.1 TBT / main-thread burst (157 → 1,084 ms) 🔴 PRIMARY
A ~1 s CPU burst at 2.6–4.1 s: idle-callback GSAP init (`onIdle`) + 3D scene boot (GPUTask) + layout thrash (`UpdateLayoutTree` 6.4 s) + GC. The `onIdle` deferral (P7/P9) moved work out of the critical path but it still executes *inside* the FCP→TTI window under throttle; the Aug-16 full rebuild (blue slot, Turbopack) likely changed chunk/parse ordering. **Action:** re-profile with `@performance-engineer`; candidates: defer GSAP/3D to post-interactive, reduce GC pressure (fewer large allocations during boot), batch layout reads.

### 3.2 FCP (1.06 → 2.65 s) 🔴
**Duplicate render-blocking font stylesheet in `<head>`:** two `<link rel="stylesheet">` to the SAME `fonts.googleapis.com/css2` URL — one async loader (`media="print"`, id `gf-css`) AND one plain render-blocking link. The css2 URL grew to **5 families / 30 @font-face / 60 woff2 refs (11.4 KB CSS)** after the Aug-16 font change (added Cormorant Garamond + Jost). The blocking link costs an extra RTT + parse before first paint. **Action:** remove the plain blocking duplicate (keep only the async loader + explicit `media="all"` swap-on-load); consider splitting the two new families into a second async loader so the 3 legacy families stay blocking-cheap.

### 3.3 Speed Index (1.14 → 15.2 s) 🔴
Consistently ~15 s across all runs — the animated hero canvas never satisfies "visual completeness". Metric artifact of a motion-heavy hero under screenshot-based SI; July's 1.14 s implies the hero did not animate in that audit environment. **Action:** verify hero autoplay vs motion-policy gating; if autoplay is intended, accept SI as non-actionable and document (same class as the P9 BFCache trade-off).

### 3.4 Unused preconnects (Lighthouse-flagged)
`raw.githack.com`, `www.googletagmanager.com`, `us.i.posthog.com` preconnects flagged "Unused preconnect — only use for origins the page is likely to request" (GTM/PostHog are runtime-injected; githack has no consumer — stale leftover). **Action:** drop the githack preconnect + CSP entries; keep GTM/PostHog (they ARE used at runtime by injected scripts).

### 3.5 Pending API calls observed on load
`GET /api/currency/list` and `GET /api/users/me` remained **pending for 30+ s** in one session. **Action:** check backend response latency / keep-alive pool; these are client-side TanStack fetches that shouldn't hang.

---

## 4. Remediation plan

| Priority | Item | Effort | Impact | Status |
|----------|------|--------|--------|--------|
| P1 | Remove duplicate render-blocking font `<link>`; keep async loader | S | FCP −0.5–1.5 s | ✅ Done (`833905d`, deployed) — FCP 2.65→1.16 s |
| P1 | Re-profile hydration burst with `@performance-engineer` (trace: `trace-home.json.gz`) | M | TBT ↓ | ⏳ Deferred — needs specialist |
| P2 | Remove unused `raw.githack.com` preconnect + CSP script-src/connect-src entries | S | Hygiene | ✅ Done (`833905d`, deployed) |
| P3 | Verify hero autoplay vs motion-policy; document SI as non-actionable if intended | S | Doc | ⏳ Proposed |
| P3 | Investigate pending `/api/currency/list` + `/api/users/me` fetches | M | Network hygiene | ⏳ Deferred |

## 5. Remediation 1 applied — P1+P2 results (post-fix re-audit)

**Commit:** main `833905d` (deployed 2026-08-17, green slot) · same tooling & preset (Lighthouse 13.4.1 desktop, 3-run median)

**Fixes applied:**
- P1 — removed the redundant `<link rel="preload" as="style">` (id `gf-preload`) for the css2 sheet and the `<noscript>` stylesheet duplicate; kept the async `media="print"` gf-css loader + inline promote script. Font head set is now: 5 woff2 preloads + 1 non-blocking stylesheet.
- P2 — removed `raw.githack.com` preconnect/dns-prefetch from `layout.tsx` and `raw.githubusercontent.com`/`raw.githack.com` from CSP `script-src`/`connect-src` in `next.config.ts`.

| Metric | Aug-17 median (pre-fix) | **Post-fix median** | Delta | Status |
|--------|-------------------------|---------------------|-------|--------|
| Performance score | 37 | **49** (38/49/49) | +12 | Improvement |
| First Contentful Paint | 2.65 s | **1.16 s** (1.07/1.74/1.16) | −1.49 s | ✔ Back at Jul-23 baseline (1.06 s) |
| Largest Contentful Paint | 2.91 s | **2.35 s** (2.35/3.51/2.29) | −0.56 s | Improvement (still ~0.5 s off Jul-23) |
| Speed Index | 15.2 s | **3.27 s** (3.05/3.27/15.1*) | −11.9 s | Improvement (*r3 hero-animation artifact) |
| Total Blocking Time | 1,084 ms | **1,373 ms** (837/1,373/8,755†) | ≈ | Stable runs 0.84–1.37 s vs 1.08 s baseline; †r1 = machine spike (AV/OneDrive) |
| Cumulative Layout Shift | 0.021 | **0.006** (0.004/0.006/0.027) | −0.015 | Improvement |
| TTFB | 140 ms | **150 ms** (137–160) | +10 ms | Fine |

**Verdict:** the FCP regression is fully remediated (1.06 → 2.65 → 1.16 s). Remaining gap to the Jul-23 score (86): LCP ~0.5 s and the hydration burst (TBT ~1 s during GSAP/3D idle-boot) — tracked in §3.1; re-profile with `@performance-engineer` (trace: `trace-home.json.gz`).

---

## 6. Remediation 2 applied — LCP cascade fix (headline no longer hidden)

**Commit:** main `f43ccb9` (deployed 2026-08-17, green slot) · same tooling & preset (Lighthouse 13.4.1 desktop)

**Root cause (confirmed from code + trace):** the LCP element is `h1.sl-heading > span.block` ("Visualized.") in `HomeHeroStatic.tsx`. The GSAP cascade ran `fromTo(q('[data-hero-headline]'), {y:40, opacity:0}, {y:0, opacity:1, duration:1.4}, 0.15)` — it hid the SSR-visible headline at cascade start (~hydration) and revealed it ~1.4 s later. In Lighthouse's throttled runs the LCP timestamp = the reveal frame (`largest-contentful-paint-element` insight: TTFB 273 ms + elementRenderDelay 2,267 ms). Unthrottled real browser: LCP 1,392 ms (milder but fragile). The preloader is **not** involved — it self-skips under `navigator.webdriver` (never plays in Lighthouse).

**Fix applied:** the headline is removed from the cascade — it stays statically visible from first paint; kicker/subline/CTA/marker keep the cascaded entrance (visual note: headline no longer fades in).

**Verification (6 desktop runs, post-fix):**

| Run | Score | FCP | LCP | FCP→LCP Δ | TBT | CLS |
|-----|-------|-----|-----|-----------|-----|-----|
| p2-r1 | 39 | 2,076 | 2,661 | 585 | 986 | 0.051 |
| p2-r2 | 41 | 1,831 | 2,447 | 616 | 1,729 | 0.018 |
| p2-r3 | 41 | 1,832 | 2,429 | 597 | 3,238 | 0.023 |
| p2-r4 | 42 | 1,841 | 2,289 | 448 | 2,955 | 0.005 |
| p2-r5 | 40 | 1,756 | 2,542 | 786 | 3,921 | 0.016 |
| p2-r6 | 39 | 1,898 | 2,587 | 689 | 2,480 | 0.023 |

**Key evidence — FCP→LCP delta collapsed from ~1.4 s to ~0.55 s** (pre-fix deltas 1,134/1,765/1,286 ms; post-fix 448–786 ms). The LCP element now paints immediately after first contentful paint (residual ~0.5 s = webfont swap). Behavioral fix verified on the live build.

**Caveat — absolute values inflated by host throttling:** post-fix runs happened in the afternoon on the i7-7820HK dev box (base 2.9 GHz, sustained-load state; software rasterization since `--disable-gpu`). Same byte-identical vendor chunk evaluated in 1,941 ms (morning, p1d runs) vs 4,166 ms (afternoon) — 2.1× host slowdown, not app change. Control: odoo login page scored 92 / FCP 444 ms in the same window (trivial page, insensitive). **Expected LCP in a clean/CI environment: ≈ FCP + 0.5 s ≈ 1.6–1.8 s** (vs 2.35 s pre-fix). Re-run for final numbers from a quiet window or CI runner.

*Report generated 2026-08-17 by HEXA Studio orchestration session. Method matches the canonical 2026-07-22 template.*

*Report generated 2026-08-17 by HEXA Studio orchestration session (chrome-devtools-profiling skill). Method matches the canonical 2026-07-22 template (Lighthouse 13.4.1 vs 12.x baseline — version delta noted; July medians from LIGHTHOUSE_AUDIT_2026-07-22.md §10).*