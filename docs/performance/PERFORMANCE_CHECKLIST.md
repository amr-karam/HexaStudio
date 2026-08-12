# Performance Checklist

**Version:** 1.0.0  
**Last Updated:** 2026-07-27  
**Scope:** S-019 Mobile & Web Performance targets and release gates

---

## Core Web Vitals

| Metric | Target | Evidence |
|--------|--------|----------|
| LCP (Largest Contentful Paint) | < 1.5s | Lighthouse live-site audit, Sentry Performance |
| FCP (First Contentful Paint) | < 1.8s | Lighthouse live-site audit |
| TBT (Total Blocking Time) | < 100ms | Current: 60ms — Sentry + Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse live-site audit |
| INP (Interaction to Next Paint) | < 200ms | Chrome UX Report / RUM |

---

## Bundle Budgets

| Budget | Limit | Enforcement |
|--------|-------|-------------|
| First-load JS per route | < 200 KB gzip | `apps/frontend/next.config.ts` `webpack.performance` |
| Total initial bundle | < 500 KB | `scripts/check-bundle-budgets.mjs` |
| Largest single chunk | < 500 KB | `scripts/check-bundle-budgets.mjs` |
| Initial CSS | < 50 KB gzip | `experimental.inlineCss: true` |
| Fonts | < 30 KB WOFF2 | Next.js font optimization |
| 3D model (GLB) | < 5 MB | Draco compression |

### CI Gate

- [ ] Run `npm run analyze --workspace=apps/frontend`
- [ ] Run `node scripts/check-bundle-budgets.mjs`
- [ ] Confirm `.gitlab-ci.yml` `bundle-analysis` job is present and passes

---

## Mobile App Performance

| Target | Limit | Notes |
|--------|-------|-------|
| Cold start | < 3 seconds | Measure on lowest supported device |
| UI frame rate | 60 FPS | Avoid JS-driven reanimated loops on low-end devices |
| Download size | < 200 MB | App store + OTA bundle size |
| Offline cache TTL | dashboard 30m, projects 60m, invoices 60m, project 60m | `apps/mobile/src/lib/cache.ts` |
| Push token registration | Retry on next mount if backend fails | `apps/mobile/src/hooks/useNotifications.ts` |

### Mobile Release Assets

- [ ] `apps/mobile/assets/icon.png` (1024×1024)
- [ ] `apps/mobile/assets/splash.png` (1242×2438)
- [ ] `apps/mobile/assets/adaptive-icon.png` (Android adaptive)
- [ ] `apps/mobile/assets/notification-icon.png` (Android)
- [ ] App store screenshots for iPhone + iPad + Android
- [ ] `expo-updates` installed and EAS Update channel configured

---

## Frontend Optimization Checklist

### Images

- [ ] Hero image uses `next/image` with `priority` and explicit `width`/`height`
- [ ] Below-fold images use lazy loading
- [ ] WebP / AVIF format served via Cloudflare

### Fonts

- [ ] Fonts loaded via `next/font` (Inter + Playfair Display)
- [ ] WOFF2 subsets preloaded in `<head>`
- [ ] `font-display: swap` configured

### JavaScript

- [ ] Three.js/R3F scene components dynamically imported per route
- [ ] Below-fold components lazy-loaded via `next/dynamic({ ssr: false })`
- [ ] Heavy animation libraries (GSAP, Framer Motion) not in initial non-3D route bundle
- [ ] Analytics scripts deferred via `onIdle()` (`lib/idle.ts`)
- [ ] Named imports for Three.js and Sentry to reduce barrel cost
- [ ] `optimizePackageImports` configured for heavy packages

### CSS

- [ ] `experimental.inlineCss: true` in production
- [ ] No `@import` in global CSS
- [ ] No `transition-all` in Tailwind classes
- [ ] Critical CSS inlined, non-critical deferred

---

## 3D / Motion Performance

- [ ] Models are Draco-compressed GLB
- [ ] InstancedMesh used for repeated geometry
- [ ] LOD implemented for distant objects
- [ ] Geometries/materials disposed on unmount
- [ ] QualityProvider active with low/medium/high tiers
- [ ] Offscreen scenes pause via IntersectionObserver
- [ ] Reduced-motion path disables continuous motion
- [ ] RAF loops store IDs and cancel on unmount
- [ ] GSAP tweens inside `gsap.context()` with `revert()` on cleanup

---

## Caching & Edge

- [ ] ISR pages serve `s-maxage=3600, stale-while-revalidate=86400`
- [ ] Static assets serve `Cache-Control: public, max-age=31536000, immutable`
- [ ] Cloudflare cache purge on deploy
- [ ] Redis cache TTLs configured for API responses
- [ ] TanStack Query `staleTime` / `gcTime` tuned

---

## Monitoring

- [ ] Sentry Performance tracks LCP, FCP, CLS, TBT
- [ ] Lighthouse CI runs on every PR
- [ ] Playwright performance / smoke tests pass
- [ ] Real-device mobile test performed
- [ ] `web-vitals` library reports RUM metrics

---

## Full Reference

For the complete base performance checklist, see [`docs/checklists/PERFORMANCE_CHECKLIST.md`](../../17-CHECKLISTS/PERFORMANCE_CHECKLIST.md).

For performance budgets and standards, see [`docs/performance/PERFORMANCE_STANDARDS.md`](PERFORMANCE_STANDARDS.md).
