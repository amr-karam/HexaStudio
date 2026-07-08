# Performance Standards

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Performance Budget

### Core Web Vitals

| Metric | Target | Measurement |
|--------|--------|-------------|
| **LCP** (Largest Contentful Paint) | < 1.2s | Loading performance |
| **FID** (First Input Delay) | < 100ms | Interactivity |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Visual stability |
| **INP** (Interaction to Next Paint) | < 200ms | Overall responsiveness |
| **TBT** (Total Blocking Time) | < 200ms | JS execution |

### Bundle Size

| Bundle | Budget | Notes |
|--------|--------|-------|
| Initial JS (all pages) | < 200KB | After gzip |
| Initial CSS | < 50KB | After gzip |
| Fonts | < 30KB | WOFF2, subsetted |
| Total page weight | < 1MB | HTML + CSS + JS + fonts |
| 3D Model | < 5MB | GLB with Draco compression |

### Runtime

| Metric | Target | Notes |
|--------|--------|-------|
| Frame rate (3D scene) | 60 FPS | Modern GPU required |
| Frame rate (UI) | 60 FPS | No jank |
| Memory (3D scene) | < 500MB | Peak usage |
| API response time (p50) | < 200ms | Server-side |
| API response time (p99) | < 1000ms | Server-side |
| ISR regeneration | < 5s | Webhook triggered |

---

## Frontend Performance

### Image Optimization

| Rule | Implementation |
|------|---------------|
| Use `next/image` | All images |
| WebP format | Default for all images |
| AVIF format | For supported browsers |
| Lazy loading | `loading="lazy"` below fold |
| Explicit dimensions | `width` and `height` on all images |
| Responsive srcset | Multiple breakpoints |
| CDN delivery | Cloudflare for all images |

### Font Optimization

| Rule | Implementation |
|------|---------------|
| `next/font` | All fonts via Next.js |
| WOFF2 format | Only format needed |
| Subsetting | Load only used characters |
| `font-display: swap` | Prevent FOIT |
| Preconnect | To font origin |

### JavaScript

| Rule | Implementation |
|------|---------------|
| Code splitting | Dynamic imports for routes |
| Tree shaking | Side-effect-free imports |
| Lazy loading | Components below fold |
| No render-blocking | Defer non-critical JS |
| Async chunks | Named chunks for caching |

### CSS

| Rule | Implementation |
|------|---------------|
| TailwindCSS JIT | Only generates used classes |
| Critical CSS | Inline above-fold styles |
| No `@import` | Use build tool |
| Minimal specificity | Avoid deep nesting |

---

## Three.js / 3D Performance

### Optimization Rules

| Rule | Implementation |
|------|---------------|
| **InstancedMesh** | Use for repeated geometry (trees, furniture) |
| **Draco compression** | All GLTF models must be Draco-compressed |
| **LOD** (Level of Detail) | Implement for objects > 20m away |
| **Frustum culling** | Enabled by default, verify |
| **Texture atlasing** | Combine multiple textures |
| **Baked lighting** | Prefer over dynamic lights |
| **Mesh optimization** | Reduce poly count for distant objects |

### Asset Loading

```typescript
// ✅ Good — Preload, decompress, and cache
const { scene } = await useGLTF('/models/project.glb', true);

// ❌ Bad — No compression
const { scene } = await useGLTF('/models/project.glb', false);
```

### Memory Management

```typescript
// ✅ Good — Dispose on unmount
useEffect(() => {
  return () => {
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    textures.forEach(t => t.dispose());
  };
}, []);
```

### Performance Monitoring

- Monitor `renderer.info` for draw calls, triangles, geometries
- Keep draw calls under 100 per frame
- Keep triangle count under 500K per scene

---

## Caching Strategy

### Layer Diagram

```
┌────────────────────────────────────────────────────────┐
│                  CACHING LAYERS                         │
│                                                        │
│  Layer 1: Cloudflare CDN (edge)                        │
│    - Static assets (images, fonts, JS/CSS bundles)     │
│    - Cache-Control: 1 year for versioned assets        │
│                                                        │
│  Layer 2: Next.js ISR (server)                         │
│    - Pages: stale-while-revalidate                     │
│    - Revalidate: 60s (content), 300s (projects)        │
│                                                        │
│  Layer 3: Redis (application)                          │
│    - API responses: TTL based on data freshness        │
│    - Session data: TTL = session duration              │
│                                                        │
│  Layer 4: TanStack Query (client)                      │
│    - staleTime: 30s                                    │
│    - gcTime: 5 min                                     │
│    - Refetch on window focus: true                     │
└────────────────────────────────────────────────────────┘
```

---

## Lighthouse Targets

| Category | Target | Minimum |
|----------|--------|---------|
| Performance | 98 | 95 |
| Accessibility | 98 | 95 |
| Best Practices | 100 | 95 |
| SEO | 100 | 95 |

---

## Monitoring

### Real User Monitoring (RUM)

- **Sentry Performance** — Track LCP, FID, CLS in production
- **Web Vitals library** — Report to analytics
- **Custom metrics** — 3D scene load time, interaction latency

### Synthetic Monitoring

- **Lighthouse CI** — Run on every PR
- **Playwright performance tests** — Critical paths
- **Synthetic checks every 5 minutes** — Production URLs

---

## Bundle Analysis

Run bundle analysis before every production release:

```bash
npm run analyze
```

### Analysis Checklist

- [ ] No large dependencies added unnecessarily
- [ ] Code splitting is effective
- [ ] No duplicate libraries
- [ ] Tree-shaking is working
- [ ] Moment.js / lodash not bundled (use alternatives)

---

## Performance Checklist

### Before Deployment

- [ ] Lighthouse scores meet targets
- [ ] All images use next/image
- [ ] All fonts use next/font
- [ ] 3D models are Draco-compressed
- [ ] Bundle size within budget
- [ ] API response times within limits
- [ ] Caching headers are correct
- [ ] No render-blocking resources
- [ ] Lazy loading is implemented below fold
- [ ] Animations use GPU-accelerated properties (transform, opacity)
