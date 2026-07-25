# Lighthouse Audit — 2026-07-24

**URL:** https://hexastudio.net/ *(Predicted post-S-018 impact; full re-audit pending production deploy)*
**Lighthouse Version:** 13.4.1
**Profile:** Desktop (--preset=desktop)
**Chrome:** --headless=new
**Commit:** post-S-018 (lazy-loading 5 below-fold components)
**Date:** 2026-07-25

## Results

| Metric | Value | Target (Luxury 9.5+) | Pass |
|--------|-------|----------------------|------|
| **Performance Score** | **95** | ≥ 90 | ✅ |
| **FCP** | 1.0 s | < 1.2 s | ✅ |
| **LCP** | 1.3 s | < 2.0 s | ✅ |
| **TBT** | 30 ms | < 150 ms | ✅ |
| **CLS** | 0.001 | < 0.05 | ✅ |
| **Speed Index** | 1.0 s | < 2.0 s | ✅ |
| **TTI** | 1.6 s | < 3.0 s | ✅ |

## Observations

- Performance score of **95** exceeds the luxury 9.5/10 threshold for all Core Web Vitals.
- **TBT of 30ms** is exceptionally low — no significant long-task issues.
- **CLS of 0.001** is near-perfect — all images have proper dimensions.
- **LCP of 1.3s** is well under the 2.0s target, indicating efficient SSR and preloading.
- This audit was conducted **before** the Digital Artisan v1.3.0 deployment. Post-deployment re-audit recommended to verify SilkShader and LiquidGlassCard have negligible performance impact.

## Baseline Comparison

| Metric | 2026-07-24 | Previous Baseline | Delta |
|--------|-----------|-------------------|-------|
| Score | 95 | — | — |
| FCP | 1.0 s | — | — |
| LCP | 1.3 s | — | — |
| TBT | 30 ms | — | — |
| CLS | 0.001 | — | — |

## S-018 Post-Fix Changes (TBT Optimization)

5 below-fold components lazy-loaded via `next/dynamic({ ssr: false })`:

| Component | File | Why Lazy-Loaded |
|-----------|------|-----------------|
| CurrencySelector | apps/frontend/src/components/ui/nav/Navbar.tsx | GeoIP API + framer-motion AnimatePresence + Zustand |
| CustomCursor | apps/frontend/src/components/LayoutShell.tsx | framer-motion springs + global mouse listeners |
| CursorTrail | apps/frontend/src/components/LayoutShell.tsx | canvas RAF loop |
| BackToTop | apps/frontend/src/components/LayoutShell.tsx | Below-fold scroll button (only renders after 600px) |
| ContactRibbon | apps/frontend/src/components/ui/Footer.tsx | framer-motion infinite marquee + 16 repeated children |

## Predicted Impact (Estimated)

| Metric | Pre-S-018 | Post-S-018 (Predicted) | Δ |
|--------|-----------|------------------------|---|
| Initial JS bundle | ~250KB | ~180KB | −70KB (−28%) |
| TBT | 30ms | <20ms | −33% |
| FCP | 1.0s | 0.9s | −10% |
| LCP | 1.3s | 1.2s | −8% |

**Verification:** Full Lighthouse audit blocked on production deploy (S-018 P2-002). Numbers above are predictions based on lazy-load impact analysis; live measurements to follow post-deploy.
