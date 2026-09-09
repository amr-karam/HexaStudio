# Core Web Vitals Baseline — HEXA STUDIO

Sprint: S-022 SEO
Date: 2026-09-10
Status: Foundation established; monitoring enabled via `WebVitals` component.

## Targets (from next.config.ts S-019 budgets)

| Metric | Target | Current Baseline | Status |
|--------|--------|------------------|--------|
| LCP (Largest Contentful Paint) | < 1.5s | TBD — capture after first production deploy | ⏳ |
| TBT (Total Blocking Time) | < 100ms | TBD — capture after first production deploy | ⏳ |
| CLS (Cumulative Layout Shift) | < 0.1 | TBD — capture after first production deploy | ⏳ |
| JS per-route budget | < 200 KB | Enforced via webpack `performance` hints | ✅ |
| Initial CSS | Inlined | `inlineCss: true` in Next.js config | ✅ |

## Monitoring Setup

- **Component:** `src/components/WebVitals.tsx`
- **Hook:** `useReportWebVitals` from `next/web-vitals`
- **Endpoint:** `NEXT_PUBLIC_VITALS_ENDPOINT` (set in production `.env`)
- **Dev behavior:** Suppressed in development to avoid noise
- **Production behavior:** Sends CLS/INP/LCP/FCP/ttfb via `sendBeacon` with fallback to `fetch`

## How to Capture Baseline

1. Deploy to production or use `next build && next start`
2. Open Chrome DevTools → Lighthouse → Performance
3. Or use PageSpeed Insights: `https://pagespeed.web.dev/report?url=https://hexastudio.net`
4. Record values in the table above

## Known Performance Optimizations Already In Place

- Font preloads for critical woff2 files
- Non-blocking Google Fonts CSS via print stylesheet promotion
- `next/dynamic` code-splitting for R3F hero and sections
- `Suspense` with `NewHomeHeroSkeleton` fallback
- `experimental.inlineCss: true` for FCP
- `optimizePackageImports` for Three.js, Framer Motion, etc.
- Webpack split chunks for `threejs` and `animations` vendor groups

## Next Steps

- [ ] Capture real-user metrics after production deploy
- [ ] Set up Sentry Performance if not already configured
- [ ] Consider `@next/bundle-analyzer` for route-level size audit
- [ ] Review `StructuredData` JSON-LD payload size impact
