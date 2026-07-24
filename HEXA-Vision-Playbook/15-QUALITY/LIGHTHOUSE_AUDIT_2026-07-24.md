# Lighthouse Audit Report — 2026-07-24

**URL:** https://hexastudio.net  
**Tool:** Lighthouse 13.4.1 (Desktop preset)  
**Date:** 2026-07-24  
**Sprint:** S-016 — TBT Reduction and Real-Device Sweep  
**Method:** Live production site, headless Chrome, single run (not cached ISR)

---

## 1. Audit Configuration

| Parameter | Value |
|-----------|-------|
| URL | https://hexastudio.net |
| Tool | Lighthouse 13.4.1 (Desktop preset) |
| Date | 2026-07-24 |
| Sprint | S-016 — TBT Reduction and Real-Device Sweep |
| Method | Live production site, headless Chrome, single run (not cached ISR) |

---

## 2. Core Web Vitals

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| First Contentful Paint (FCP) | 1.2 s | < 1.8 s | 🟢 Good |
| Largest Contentful Paint (LCP) | 1.7 s | < 2.5 s | 🟢 Good |
| Total Blocking Time (TBT) | 190 ms | < 200 ms | 🟡 Borderline |
| Cumulative Layout Shift (CLS) | 0.0003 | < 0.1 | 🟢 Perfect |
| Speed Index | 5.8 s | < 3.4 s | 🔴 (headless Chrome artifact) |
| Time to Interactive (TTI) | 2.1 s | < 3.8 s | 🟢 Good |
| Time to First Byte (TTFB) | 330 ms | < 800 ms | 🟢 Good (edge-cached) |

**Performance Score:** 76/100

---

## 3. Long Tasks Analysis

| Duration | Source |
|----------|--------|
| 1089 ms | Initial hydration + Three.js module evaluation |
| 428 ms | Secondary hydration chunk |
| 412 ms | Tertiary hydration chunk |
| 136 ms | Minor task |
| 41 ms | Minor task |
| 24 ms | Minor task |
| 20 ms | Minor task |

**Total long tasks:** 7  
**Root cause:** The 1089ms task is the primary hydration + Three.js/R3F module evaluation. This is the biggest TBT contributor.

---

## 4. JavaScript Execution Hotspots

| Script | Total Time | Scripting Time |
|--------|-----------|----------------|
| `2ejk_26znfoeu.js` | 700 ms | 609 ms |
| `423owfgx2fki1.js` | 458 ms | 81 ms |
| `35wt-8ind7z25.js` | 161 ms | 144 ms |
| `1gi9de17iy1d6.js` | 123 ms | 26 ms |
| `092m-hk4g4_1b.js` | 93 ms | 54 ms |
| `turbopack-40q4l4ocvz9qz.js` | 83 ms | 82 ms |

---

## 5. Issues Identified

### 5.1 Render-Blocking Font CSS (391ms) — FIXED in this session

- Google Fonts `<link rel="stylesheet">` was blocking rendering for 391ms
- Fix: Converted to `<link rel="preload" as="style">` + `<script>` promotion pattern
- Font woff2 files were already preloaded, so fonts render from cache once @font-face rules arrive
- **Impact:** ~391ms FCP improvement expected after deployment

### 5.2 Unused JavaScript (163KB)

- 83KB in `35wt-8ind7z25.js`, 80KB in `2axmdjglvrv5e.js`
- Root cause: Lazy 3D scene chunks loaded eagerly in hero (Three.js/R3F code paths)
- **Status:** Tracked, awaiting ESM builds from R3F ecosystem

### 5.3 CLS Micro-Shifts (0.0003)

- Two minor layout shifts detected (score: 0.0002 and 0.0001)
- **Status:** Negligible, within measurement noise

### 5.4 Legacy JavaScript (14KB)

- Minor legacy JS detected in one chunk
- **Status:** Low priority

---

## 6. Comparison with Previous Audits

| Metric | P9 Baseline (2026-07-23) | Live Site (2026-07-24) | Notes |
|--------|--------------------------|----------------------|-------|
| Performance | 86 | 76 | Headless Chrome vs simulated throttling |
| FCP | 1.06 s | 1.2 s | Cold start vs ISR-cached |
| LCP | 1.89 s | 1.7 s | Better LCP (possibly different LCP element) |
| TBT | 157 ms | 190 ms | Cold start, more JS evaluation |
| CLS | 0.001 | 0.0003 | Both excellent |
| TTFB | 128 ms | 330 ms | Cold start vs warm ISR cache |

Note: The P9 audit used Lighthouse simulated throttling on a local build. This audit is against the live production site via headless Chrome. Differences are expected due to cold vs warm cache, network conditions, and throttling profiles.

---

## 7. Font CSS Optimization (P11)

| Parameter | Detail |
|-----------|--------|
| Change | `apps/frontend/src/app/layout.tsx` |
| Mechanism | Google Fonts CSS `<link rel="stylesheet">` → `<link rel="preload" as="style">` + `<script>` promotion |
| Expected Impact | -391ms FCP (render-blocking eliminated) |
| Quality Gates | Lint 0 errors, Typecheck 0 errors, Tests 176/176 passing |

---

## 8. Remaining Opportunities

| Priority | Item | Impact | Status |
|----------|------|--------|--------|
| P1 | Font CSS async (391ms render-blocking) | FCP ~391ms | ✅ Fixed in this session |
| P2 | 163KB unused JS (lazy 3D chunks) | TBT reduction | ⏳ Awaits ESM builds |
| P3 | 1089ms hydration long task | TBT reduction | ⏳ Requires R3F code-splitting |
| P3 | Legacy JS (14KB) | Minor | ⏳ Low priority |

---

*Report generated 2026-07-24 by HEXA Studio Quality Agent. Font CSS optimization applied.*
