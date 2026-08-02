# ⚡ HEXA STUDIO — PERFORMANCE GOVERNANCE & BUDGETS

**Version:** 1.0.0  
**Authority Level:** 7  
**Scope:** Core Web Vitals, Performance Budgets, Asset Optimization, & WebGL Controls  

---

## 1. CORE WEB VITALS BUDGETS

Every page release MUST satisfy the following performance targets:

| Metric | Target Budget | Action Threshold |
|--------|---------------|------------------|
| **LCP (Largest Contentful Paint)** | `< 2.5s` | Audit image sizes, async font preloads |
| **INP (Interaction to Next Paint)** | `< 200ms` | Audit main-thread long tasks & hydration |
| **CLS (Cumulative Layout Shift)** | `< 0.1` | Fixed aspect ratios on 3D canvases & images |
| **TBT (Total Blocking Time)** | `< 200ms` | Lazy-load heavy WebGL & dynamic components |
| **TTFB (Time to First Byte)** | `< 800ms` | Edge caching & Redis SSR cache |

---

## 2. THREE.JS / WEBGL PERFORMANCE RULES

WebGL is a high-cost capability and MUST be managed carefully:
1. **Lazy Loading**: WebGL canvases MUST be dynamically imported with `ssr: false` in Client Components (`HomePageDynamic.tsx`).
2. **Render Loop Control**: Render loops MUST pause when the canvas scrolls out of viewport (`IntersectionObserver`).
3. **Particle Count Scaling**: 65K particles on High Tier, 16K on Medium Tier, static fallback on Low Tier / Reduced Motion.
4. **Asset Compression**: 3D GLTF models MUST be compressed using Draco compression.
