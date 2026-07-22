# Lighthouse Audit Report — 2026-07-22

**URL:** https://hexastudio.net  
**Tool:** Lighthouse 12.x (Desktop preset)  
**Date:** 2026-07-22  
**Sprint:** S-015 P5 — Creative Excellence Report

---

## 1. Core Web Vitals

| Metric | Score | Value | Target | Status |
|--------|-------|-------|--------|--------|
| First Contentful Paint (FCP) | 54 | 1.5 s | < 1.8 s | 🟡 Needs improvement |
| Largest Contentful Paint (LCP) | 56 | 2.2 s | < 2.5 s | 🟡 Needs improvement |
| Speed Index | 82 | 1.5 s | < 3.4 s | 🟢 Good |
| Total Blocking Time (TBT) | 73 | 230 ms | < 200 ms | 🟡 Needs improvement |
| Cumulative Layout Shift (CLS) | 100 | 0 | < 0.1 | 🟢 Perfect |
| Time to Interactive (TTI) | 91 | 2.3 s | < 3.8 s | 🟢 Good |

**Estimated Performance Score:** ~75/100 (weighted)

---

## 2. Accessibility

| Audit | Status | Notes |
|-------|--------|-------|
| Color Contrast | 🟢 Fixed | CinematicPreloader brand text contrast 4.21 → 7.5:1 (text-neutral-400) |
| ARIA Attributes | ✅ Pass | All ARIA roles, labels, and values correct |
| Heading Hierarchy | ✅ Pass | Sequential h1 → h2 → h3 |
| Landmark Regions | ✅ Pass | `<main>`, `<nav>`, skip link present |
| Focus Management | ✅ Pass | Tab order logical, focus traps in modals |
| Touch Targets | ✅ Pass | All interactive elements ≥ 44px |
| Image Alt Text | ✅ Pass | All images have descriptive alt attributes |
| Language Attribute | ✅ Pass | `<html lang="en">` present |

**Estimated Accessibility Score:** ~95/100

---

## 3. Best Practices

| Audit | Status | Notes |
|-------|--------|-------|
| HTTPS | ✅ Pass | All traffic encrypted |
| Console Errors | 🟡 Known | 401 from `/api/users/me` — expected for unauthenticated users |
| `document.write()` | ✅ Pass | Not used |
| Third-party Cookies | ✅ Pass | None detected |
| Deprecated APIs | ✅ Pass | None detected |
| CSP | ⚠️ Partial | Basic CSP in place; could add stricter directives |

**Estimated Best Practices Score:** ~85/100

---

## 4. SEO

| Audit | Status | Notes |
|-------|--------|-------|
| Meta Description | ✅ Pass | Present and descriptive |
| robots.txt | 🟡 Cloudflare | Cloudflare auto-injects `Content-Signal` directive (non-standard, not editable) |
| Valid `hreflang` | ✅ Pass | N/A (single locale) |
| Canonical URL | ✅ Pass | Present |
| Structured Data | ✅ Pass | JSON-LD Organization schema |
| Crawlable Links | ✅ Pass | All links use `<a href>` |
| Font Sizes | ✅ Pass | Legible at all breakpoints |
| HTTP Status | ✅ Pass | 200 OK |

**Estimated SEO Score:** ~92/100

---

## 5. Performance Opportunities

### 5.1 Preconnect Hints (FIXED)
- **Issue:** No preconnect to `fonts.gstatic.com` or `api.hexastudio.net`
- **Impact:** 230 ms potential LCP/FCP savings
- **Fix:** Added `<link rel="preconnect">` in `<head>` of `layout.tsx`

### 5.2 Static Asset Caching (FIXED)
- **Issue:** `_next/static/*` assets had short cache TTL
- **Impact:** Repeat visit performance degraded
- **Fix:** Added `Cache-Control: public, max-age=31536000, immutable` via `next.config.ts` headers()

### 5.3 Unused JavaScript (KNOWN — 163 KiB)
- **Issue:** 163 KiB of unused JS in route chunks
- **Source:** `35wt-8ind7z25.js` (85 KiB unused), `2axmdjglvrv5e.js` (78 KiB unused)
- **Root Cause:** 3D/R3F/GSAP libraries loaded eagerly in hero chunks; some code paths unreachable on initial load
- **Mitigation:** Already using `next/dynamic` for heavy components; full tree-shaking blocked by non-ESM packages
- **Impact:** 150 ms potential LCP savings
- **Recommendation:** Await tree-shakable ESM builds from Three.js/R3F; consider route-level code splitting fine-tuning

### 5.4 Back/Forward Cache (NOT ACTIONABLE)
- **Issue:** `cache-control: no-store` on main document
- **Root Cause:** Next.js standalone mode + Cloudflare edge
- **Impact:** Return navigations ~200 ms slower
- **Recommendation:** Accept; document as known trade-off

---

## 6. Non-Functional Findings

### 6.1 Robots.txt (NOT ACTIONABLE)
- Cloudflare automatically injects `Content-Signal` directives into `robots.txt`
- Lighthouse flags this as "Unknown directive" — search engines ignore unknown directives gracefully
- **Action:** None — Cloudflare-managed, not editable

### 6.2 Console 401 Error (EXPECTED)
- `GET /api/users/me` returns 401 for unauthenticated visitors
- This is correct behavior — the endpoint requires JWT auth
- **Action:** None — expected security behavior

---

## 7. Luxury Score (Creative Excellence)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Visual Polish | 9.5/10 | Cinematic preloader, serif logotype reveal, gold accent system |
| Typography | 9.5/10 | Inter + Playfair Display + JetBrains Mono, editorial hierarchy |
| Color System | 9.5/10 | Dark luxury palette (#050505), gold accent, zinc scale |
| Motion Design | 9.5/10 | GSAP ScrollTrigger, Framer Motion entrance, velocity-reactive elements |
| 3D Experience | 9.0/10 | R3F particle engine, fracture ring hero, WebGL fallbacks |
| Accessibility | 9.0/10 | Reduced motion, coarse pointer, focus management, ARIA |
| Performance | 8.5/10 | FCP/LCP need optimization; CLS perfect; TBT slightly over |
| Mobile Experience | 9.0/10 | Responsive, touch-optimized, reduced motion fallback |

**Overall Luxury Score: 9.3/10** (Target: 9.5/10)

### Gap Analysis (→ 9.5/10)
1. **FCP/LCP Optimization** (+0.2): Further reduce initial JS payload, optimize font loading with `font-display: swap` preload
2. **TBT Reduction** (+0.1): Defer non-critical GSAP animations to after interactive

---

## 8. Remediation Plan

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P1 | FCP/LCP — inline critical CSS, preload hero font weights | S | +0.2 perf |
| P1 | TBT — defer GSAP ScrollTrigger init to requestIdleCallback | S | +0.1 perf |
| P2 | CSP strict-dynamic for script loading | M | Security |
| P3 | Unused JS — await ESM builds from R3F ecosystem | L | Future |

---

*Report generated 2026-07-22 by HEXA Studio Quality Agent.*
