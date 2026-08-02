# Performance Governance - HEXA STUDIO

## Targets
```text
LCP (Largest Contentful Paint) < 2.5s
INP (Interaction to Next Paint) < 200ms
CLS (Cumulative Layout Shift) < 0.1
```

## Performance Principles
- **Server-First Rendering:** Use React Server Components to minimize client-side hydration.
- **Lazy Loading:** 3D assets, heavy components, and off-screen images MUST be lazy-loaded.
- **Resource Optimization:** All images/videos must be optimized and served in appropriate formats (WebP/AVIF).
- **Bundle Budgeting:** Enforce strict limits on JavaScript bundle sizes (enforced via CI/CD `bundle-analysis` stage).
- **Reduced Motion:** Respect user preferences (`prefers-reduced-motion`) to minimize unnecessary GPU/CPU workload.

## Audit Strategy
- **Automated:** Lighthouse CI (in GitLab CI/CD `validate` stage).
- **Automated:** Bundle analysis (in GitLab CI/CD `validate` stage).
- **Manual:** Periodic auditing of Three.js scenes for memory leaks and render loops.
- **Manual:** Monitor Web Vitals via real-user monitoring (Sentry).

## Technical Optimization Guidelines
- **Three.js:** Implement LOD (Level of Detail), texture compression, and instance meshes.
- **Next.js:** Optimize `next/image` and `next/font`.
- **Assets:** MinIO-based delivery with caching headers configured in Traefik.
