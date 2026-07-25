# Lighthouse Audit — 2026-07-24

**URL:** https://hexastudio.net/
**Lighthouse Version:** 13.4.1
**Profile:** Desktop (--preset=desktop)
**Chrome:** --headless=new
**Commit:** `318a3521` (main)
**Date:** 2026-07-24T04:27

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
