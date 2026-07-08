# Performance Checklist

**Budget:** LCP < 1.2s, FID < 100ms, CLS < 0.1, 60 FPS in 3D

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

### CSS
- [ ] No custom CSS files (TailwindCSS only)
- [ ] Critical CSS inlined
- [ ] No `@import` in CSS
- [ ] Minimal specificity

## 3D Performance

- [ ] Models are Draco-compressed (GLB)
- [ ] Max file size < 5MB
- [ ] Max poly count < 500K
- [ ] InstancedMesh for repeated objects
- [ ] LOD implemented for distant objects
- [ ] Baked lighting for static scenes
- [ ] Textures ≤ 2048x2048
- [ ] Geometries and materials disposed on unmount
- [ ] Draw calls < 100 per frame
- [ ] 60 FPS maintained

## Caching

- [ ] ISR configured with appropriate intervals
- [ ] Redis cache TTLs configured
- [ ] TanStack Query stale times configured
- [ ] CDN cache headers set for static assets
- [ ] Service worker (if applicable) configured

## Lighthouse

- [ ] Performance ≥ 95
- [ ] Accessibility ≥ 95
- [ ] Best Practices ≥ 95
- [ ] SEO ≥ 95

## Bundle

- [ ] Initial JS < 200KB (gzipped)
- [ ] Initial CSS < 50KB (gzipped)
- [ ] Total page weight < 1MB
- [ ] No duplicate dependencies
