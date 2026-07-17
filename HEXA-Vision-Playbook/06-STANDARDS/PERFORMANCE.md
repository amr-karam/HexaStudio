# ⚡ Performance Standards

**Version:** 1.0 | **Last Updated:** 2026-07-16 | **Target:** Core Web Vitals Green

## Performance Targets

### Core Web Vitals (Lighthouse)
| Metric | Target | Priority |
|--------|--------|----------|
| Largest Contentful Paint (LCP) | < 2.5s | 🔴 Critical |
| First Input Delay (FID) | < 100ms | 🔴 Critical |
| Cumulative Layout Shift (CLS) | < 0.1 | 🟡 Important |
| First Contentful Paint (FCP) | < 1.8s | 🟡 Important |
| Time to Interactive (TTI) | < 3.8s | 🟡 Important |

### API Response Times
- **P50 (median):** < 100ms
- **P95 (95th percentile):** < 500ms
- **P99 (99th percentile):** < 1000ms

### 3D Rendering
- **Frame Rate:** 60 FPS minimum
- **Initial Load:** < 3 seconds
- **Model Swap:** < 1 second

---

## Frontend Optimization

### Bundle Size
- **Main bundle:** < 250KB gzip
- **Code splitting:** Max 50KB per route
- **Use `next/dynamic` for lazy loading**

### Image Optimization
- **Format:** WebP with JPEG fallback
- **Responsive:** Use `srcset` for multiple sizes
- **Lazy loading:** Use `loading="lazy"`
- **Blur placeholders:** LQIP strategy

### Caching Strategy
```
Static assets (js, css):  1 year cache-bust via hash
HTML:                     No-cache, must-revalidate
API responses:            Varies (see API caching)
Images:                   30 days
```

---

## Backend Optimization

### Database Queries
- Always use indices for WHERE/ORDER BY columns
- Implement query timeouts (< 1 second)
- Use pagination (max 100 items)
- Avoid N+1 queries

### Caching
- **Redis for session/temporary data**
- **CDN for static assets**
- **Page caching for high-traffic endpoints**

### Request/Response
- **Compression:** gzip for all responses
- **Minification:** All JS/CSS minified
- **Headers:** Remove unnecessary headers

---

## 3D Performance

### Geometry Optimization
- Use LOD (Level of Detail) for complex models
- Combine similar materials into atlases
- Remove invisible geometry
- Target: < 100k polygons for initial load

### Texture Optimization
- Use compressed textures (KTX2, UASTC)
- Implement mip-mapping for distant objects
- Use lower res for mobile (<1024px)

### Memory Management
- Dispose of geometries/materials when done
- Use Object pooling for frequent creates
- Monitor memory usage in DevTools

---

## Monitoring & Alerts

### Metrics to Track
- Page load time (via Lighthouse)
- API response times (via monitoring)
- 3D frame rate (via telemetry)
- Memory usage (via DevTools)

### Alerting Thresholds
- 🔴 Alert if LCP > 4s
- 🔴 Alert if API P95 > 1000ms
- 🟡 Alert if FID > 200ms
- 🟡 Alert if CLS > 0.25

---

## Testing

### Tools
- **Lighthouse:** Built into DevTools
- **WebPageTest:** In-depth analysis
- **Synthetic Monitoring:** Continuous performance checks

### Frequency
- Every code deployment
- Weekly regression testing
- Monthly deep-dive analysis

---

## Related Documentation

- [Performance Audit](../15-QUALITY/PERFORMANCE_AUDIT.md)
- [3D Rendering Pipeline](../01-ARCHITECTURE/3d-rendering-pipeline.md)
