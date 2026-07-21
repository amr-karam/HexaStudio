# Performance Checklist

**Budget:** LCP < 1.2s, TBT < 200ms, CLS < 0.1, 60 FPS (p95 frame-time < 16.7ms)

---

## Core Web Vitals

- [ ] LCP < 1.2s (constitutional target)
- [ ] TBT < 200ms
- [ ] CLS < 0.1
- [ ] INP < 200ms

---

## Frontend

### Images
- [ ] All images use `next/image`
- [ ] WebP format used (AVIF for supported browsers)
- [ ] Lazy loading below the fold
- [ ] Explicit width and height on all images
- [ ] Responsive srcset with multiple breakpoints

### Fonts
- [ ] All fonts use `next/font`
- [ ] WOFF2 format
- [ ] Subsetting enabled
- [ ] `font-display: swap` configured
- [ ] Preconnect to font origin

### JavaScript
- [ ] Dynamic imports for code splitting
- [ ] No render-blocking scripts
- [ ] Third-party scripts loaded async/defer
- [ ] No large libraries imported unnecessarily
- [ ] Tree-shaking verified
- [ ] Initial JS < 200KB gzip (non-3D routes)
- [ ] 3D routes lazy-loaded (separate budget)

### CSS
- [ ] No custom CSS files (TailwindCSS only)
- [ ] Critical CSS inlined
- [ ] No `@import` in CSS
- [ ] Minimal specificity
- [ ] No `transition-all` usage

---

## Motion Performance

- [ ] All animations use `src/lib/motion.ts` tokens (no inline values)
- [ ] All RAF loops cancellable (ID stored, cancelled on cleanup)
- [ ] All GSAP tweens inside `gsap.context()` with revert on unmount
- [ ] No orphaned tweens or timeline references
- [ ] Frame-time budget: p95 < 16.7ms on supported hardware
- [ ] Single AA strategy (no overlapping anti-aliasing)

---

## 3D Performance

- [ ] Models are Draco-compressed (GLB)
- [ ] Max file size < 5MB
- [ ] Max poly count < 500K
- [ ] InstancedMesh for repeated objects
- [ ] LOD implemented for distant objects
- [ ] Baked lighting for static scenes
- [ ] Textures <= 2048x2048
- [ ] Geometries and materials disposed on unmount
- [ ] Draw calls < 100 per frame
- [ ] 60 FPS maintained
- [ ] GLTF assets cache-immutable (fetch once, reuse from cache)
- [ ] Delta-based motion (no per-frame allocations)
- [ ] Quality tier detection active (GPU probe + device memory + DPR + viewport + connection)
- [ ] No always-on WebGL on non-3D routes
- [ ] Offscreen scenes pause (IntersectionObserver)
- [ ] Tab-hidden scenes pause (visibilitychange)

---

## Adaptive Quality

- [ ] QualityProvider registered as single source of truth
- [ ] User override available (Auto / Performance / Quality)
- [ ] Low tier: DPR 1.0, no shadows, no post-processing
- [ ] Medium tier: DPR 1.5, basic shadows, bloom only
- [ ] High tier: DPR 2.0, full shadows, full post-processing

---

## WebGL Fallbacks

- [ ] WebGL unavailable: cover image + project metadata + navigation
- [ ] Context loss: fallback displayed, recovery attempted
- [ ] Model load failure: fallback with project info
- [ ] XR unsupported: descriptive fallback message

---

## Caching

- [ ] ISR configured with appropriate intervals
- [ ] Redis cache TTLs configured
- [ ] TanStack Query stale times configured
- [ ] CDN cache headers set for static assets

---

## Lighthouse

- [ ] Performance >= 95
- [ ] Accessibility >= 95
- [ ] Best Practices >= 95
- [ ] SEO >= 95

---

## Bundle

- [ ] Initial JS < 200KB gzipped (non-3D routes)
- [ ] Initial CSS < 50KB gzipped
- [ ] Total page weight < 1MB
- [ ] No duplicate dependencies
