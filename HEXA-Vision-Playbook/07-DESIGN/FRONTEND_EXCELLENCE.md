# 🎬 FRONTEND EXCELLENCE HANDBOOK

**Version:** 1.0 | **Scope:** `apps/frontend` | **Standard:** HEXA Creative Excellence (9.5/10 Luxury)
**Authority:** Companion to `06-STANDARDS/MOTION_SYSTEM.md` and `07-DESIGN/UX_STRATEGY.md`.
This document is the **implementation contract** — how the design standards become code.

---

## 1. THE MOTION SYSTEM (SINGLE SOURCE OF TRUTH)

Every animation in the frontend MUST source its easing, duration, and stagger from
`src/lib/motion.ts`. **No inline cubic-bezier literals.** This guarantees a
handcrafted, consistent, cinematic feel across the entire experience.

```ts
import { EASE, DURATION, STAGGER, makeTransition, useHEXAMotion } from '@/lib/motion';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';
```

### I. Easing — Custom Cubic Beziers (the secret to luxury)

| Token | Curve | Feel | Use Case |
|-------|-------|------|----------|
| `EASE.entrance` | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth, decelerating | Page loads, hero entrance |
| `EASE.interaction` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy, playful | Button hover, tooltips |
| `EASE.transition` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Balanced | Modal opens, page slides |
| `EASE.sharp` | `cubic-bezier(0.4, 0, 0.6, 1)` | Fast, precise | Error messages, toggles |

### II. Duration & Stagger

```ts
DURATION.micro      // 0.2s  — micro-interactions
DURATION.component  // 0.4s  — component transitions
DURATION.page       // 0.75s — page transitions
DURATION.camera     // 1.4s  — 3D camera moves

STAGGER.micro       // 0ms
STAGGER.component   // 50ms
STAGGER.page        // 100ms
```

### III. Composable Transition

```ts
const transition = makeTransition('entrance', 'component', 0.1);
// → { ease: EASE.entrance, duration: 0.4, delay: 0.1 }
```

---

## 2. REDUCED MOTION — ACCESSIBILITY CONTRACT (MANDATORY)

Three layers enforce `prefers-reduced-motion: reduce`. **Do not bypass them.**

1. **Global (Framer Motion):** `AppProviders` wraps the tree in
   `<MotionConfig reducedMotion="user">`. Every Framer animation auto-collapses
   to opacity-only for users who request it.
2. **Hook level (`useHEXAMotion`):** For components that build custom variants,
   use `useHEXAMotion().transition(...)` / `.withReduced(variants)`. It returns a
   `reduced` flag and collapses transitions to `REDUCED_TRANSITION`.
3. **CSS level (`globals.css`):** A `prefers-reduced-motion` media query
   neutralizes all CSS `animation`/`transition`/`scroll-behavior`.

> Rule: If you add a NEW animation, source it through `useHEXAMotion` or rely on
> `MotionConfig`. Never hand-roll a `matchMedia` check inline.

---

## 3. 3D SCENE PERFORMANCE

- `ExperienceCanvas` (the live hero scene) consumes `useAdaptiveQuality()` and
  applies `settings.dpr` **and** `settings.shadows` to the `<Canvas>` and lights.
- Quality tiers (`low | medium | high`) gate post-processing (`PostProcessing.tsx`)
  and DPR. Never hardcode `shadows` or `dpr={[1, 2]}` in the live canvas.
- Camera behavior lives in `CameraController` → `useScrollCamera` (home) /
  `useCinematicCamera` (interior). Both respect reduced motion.
- **Dead code:** `src/components/three/Scene.tsx` is NOT imported anywhere
  (superseded by `features/scene`). Do not build on it; refactor or remove via
  architecture decision.

---

## 4. REFERENCE COMPONENTS

| Component | Role | Notes |
|-----------|------|-------|
| `src/lib/motion.ts` | Motion tokens + variants | Single source of truth |
| `src/hooks/useHEXAMotion.ts` | Reduced-motion-aware consumer | Use in all animated components |
| `src/components/ui/motion/FadeIn.tsx` | Fade + lift entrance | `FadeIn` (mount) / `FadeInView` (in-view) |
| `src/components/ui/TextReveal.tsx` | Masked text reveal | Signature hero entrance |
| `src/providers/app-providers.tsx` | `MotionConfig` root | Global reduced-motion gate |

---

## 5. DONE DEFINITION (FRONTEND)

A frontend task is "Done" only when:
- [ ] Animation easings/durations sourced from `src/lib/motion.ts` (no inline literals)
- [ ] Reduced motion handled via `MotionConfig` / `useHEXAMotion` (not ad-hoc)
- [ ] 3D canvas uses `useAdaptiveQuality` for `dpr` + `shadows`
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` all pass
- [ ] Production `npm run build` succeeds (set `SKIP_ENV_VALIDATION=true`)

*“Motion is Communication. Code is read far more often than it is written.”*
