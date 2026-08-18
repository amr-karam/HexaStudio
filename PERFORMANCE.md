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

---

## 3. SCROLL-PERFORMANCE GUIDANCE

### ReadingProgress (article reading bar)

The blog article reading bar (`apps/frontend/src/components/animation/ReadingProgress.tsx`) is
mounted only on article pages but must never cost main-thread time there. Its contract:

1. **No permanent rAF loop.** Updates are driven by a passive window `scroll` listener plus the
   Lenis `scroll` event (when `window.__lenis` exists); all sources coalesce into at most one rAF
   flush per frame. An idle page performs zero work.
2. **Never read layout in the per-frame path.** `document.documentElement.scrollHeight` is cached
   in a ref and recomputed only on a debounced resize. (The previous revision forced a measured
   60–98ms reflow on every frame under Lenis smooth scroll.)
3. **Zero React renders during scroll.** Progress is written directly to the DOM
   (`transform: scaleX(...)` via a ref); `aria-valuenow` is updated with `setAttribute` at most
   every 200ms. Static mode (reduced motion / pause) renders at 0 width with no listeners.
4. Any future scroll-driven UI in this codebase must follow the same pattern: cached layout
   reads, coalesced rAF, direct DOM writes — no per-frame `setState`.

### FPS monitoring loops

`OptimizedCanvas` in `apps/frontend/src/components/3d/deferred-scene-loader.tsx` gates its FPS
measurement loop with an `IntersectionObserver` + `visibilitychange`: the loop is paused while
the canvas is off-screen or the tab is hidden, and the measurement window resets on resume (a
paused loop must not skew the first FPS readout into a false performance alert).
