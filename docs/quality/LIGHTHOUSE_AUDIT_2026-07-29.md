# 🔬 Lighthouse Performance Audit — Phase 1 Implementation

**Date:** 2026-07-29  
**Commit:** `HEAD` (current working tree)  
**Toolchain:** Next.js 16.2.11 (Turbopack), Node 20  
**Chrome:** 150.0.787  
**Audit Mode:** Desktop (headless blocked on local Windows — production verification pending)

---

## 1. Phase 1 Changes Implemented

### Change 1 — HomeHero LCP Decoupling (+1.2pt estimated)
**File:** `apps/frontend/src/features/portfolio/components/HomeHero.tsx`

**Before:** `framer-motion`'s `useScroll()` + `useTransform()` created a reactive `MotionValue` binding that re-rendered on every scroll frame. The `motion.div` had `style={{ opacity, scale }}` where both were `MotionValue<number>` instances.

```tsx
// BEFORE
import { motion, useScroll, useTransform } from 'framer-motion';
const { scrollYProgress } = useScroll();
const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);
// ...
<motion.div ref={contentRef} style={{ opacity, scale }}>
```

**After:** A `passive` scroll event listener directly sets `el.style.opacity` and `el.style.transform` via the existing `contentRef` — zero React re-renders, zero framer-motion overhead on scroll.

```tsx
// AFTER
useEffect(() => {
  const el = contentRef.current;
  if (!el) return;
  const onScroll = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const progress = Math.min(scrollY / (windowHeight * 0.1), 1);
    el.style.opacity = String(1 - progress);
    el.style.transform = `scale(${1 - progress * 0.1})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

**Impact:** Eliminates framer-motion `MotionValue` binding overhead on every scroll frame. The `passive` flag lets the browser optimise scroll handling. Estimated LCP improvement: **+1.2pt**.

### Change 2 — Dynamic Lenis Import (+0.5pt estimated)
**File:** `apps/frontend/src/components/SmoothScroll.tsx`

**Before:** `import Lenis from 'lenis'` was a top-level static import, forcing the ~8KB (compressed) Lenis library into the critical JS bundle on all pages.

**After:** `await import('lenis')` inside the `useEffect` — Lenis loads asynchronously after the component mounts, keeping it off the critical path.

```tsx
// BEFORE
import Lenis from 'lenis';
const lenis = new Lenis({...});

// AFTER
const initLenis = async () => {
  const { default: LenisConstructor } = await import('lenis');
  const lenis = new LenisConstructor({...});
};
void initLenis();
```

**Impact:** ~8KB compressed JS removed from the critical path. Smooth scroll initializes off the main thread waterfall. Estimated TBT improvement: **+0.5pt**.

### Change 3 — FractureRingHero Idle Timeout (pacing improvement)
**File:** `apps/frontend/src/features/experience/components/FractureRingHero.tsx`

**Before:** `requestIdleCallback(trigger, { timeout: 2000 })` — the WebGL scene started loading after 2s of idle, competing with other critical resources.

**After:** `timeout: 4000` — gives the main thread 4 seconds of breathing room before initializing the WebGL Fracture Ring scene.

**Impact:** More deterministic resource priority. Main content renders fully before the 3D scene starts loading. Estimated LCP improvement: **+0.3pt**.

---

## 2. Estimated Phase 1 Score Delta

| Metric | Before (S-019) | Estimated After | Delta |
|--------|----------------|-----------------|-------|
| **LCP** | ~1.6s | ~1.5s | −100ms |
| **TBT** | ~60ms | ~60ms | No change (already low) |
| **FCP** | ~1.2s | ~1.2s | No change |
| **CLS** | ~0.003 | ~0.003 | No change |
| **Lighthouse Perf** | 92 | 93-94 | +1-2pt |

> ⚠️ **Note:** Full Lighthouse verification requires a production deployment and an environment with a real browser. Headless Chrome on Windows is blocked by CHROME_INTERSTITIAL_ERROR on localhost (Chrome 150+ security policy). Run `lighthouse https://hexastudio.net --preset=desktop --only-categories=performance` from a production host for the final score.

---

## 3. Quality Gates

| Gate | Status |
|------|--------|
| Typecheck (`apps/frontend`) | ✅ 0 errors |
| Lint (`apps/frontend`) | ✅ 0 errors, 0 warnings |
| Tests (`apps/frontend`) | ✅ 32/32 files, 179/179 passing |
| Tests (`apps/backend`) | ✅ 285/285 passing |
| Tests (`apps/mobile`) | ✅ 6 suites passing |
| Production build | ✅ Compiled (Turbopack, 40 routes) |

---

## 4. Next Steps

### Phase 2 Recommendations (deferred)
1. **Image optimization audit** — Convert remaining `<img>` tags to `next/image` where possible (ProgressiveReveal has 3 stacked copies — legitimate exception).
2. **Font-subsetting audit** — Google Fonts already serves subsetted variable fonts; confirm with production Lighthouse.
3. **Bundle size analysis** — Run `ANALYZE=true npm run build --workspace=apps/frontend` with webpack fallback (`--webpack`) on a production-like environment.
4. **Forced reflow elimination** — Profile with `lighthouse` in production; forced-reflow insights require real browser.

### Phase 3 (network)
1. **Preload critical JS chunks** — Consider `<link rel="preload" as="script">` for the main layout chunk.
2. **Optimize third-party scripts** — Sentry, PostHog, and GTM are already deferred to idle. Verify with network waterfall.

### Blocker for production verification
- GitLab server `19.16.1.100` unreachable — needs VPN/local network access.
- Chrome headless on Windows blocks localhost due to security interstitials.
