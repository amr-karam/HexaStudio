# Motion System

**Version:** 2.0.0  
**Last Updated:** 2026-07-20  
**Authority:** `07-DESIGN/FRONTEND_EXCELLENCE.md` is the binding contract. This document provides implementation details.

---

## Motion Philosophy

Motion is not "decoration"; it is **Communication**. Every animation must serve a purpose: guiding the eye, indicating state, or creating a feeling of luxury. See `FRONTEND_EXCELLENCE.md` Section 3 for the motion decision framework.

---

## Motion Policy Layer

The motion policy layer provides centralized control over animation behavior across the entire application. All animation code must respect these policies.

### Core Hooks and Providers

| Component | Location | Purpose |
|-----------|----------|---------|
| `MotionPolicyProvider` | `src/providers/motion-policy.tsx` | Context provider for global motion state |
| `useMotionPolicy` | `src/hooks/useMotionPolicy.ts` | Access current policy (reduced motion, fine pointer, pause state) |
| `useFinePointer` | `src/hooks/useFinePointer.ts` | Detect fine pointer (mouse) vs coarse pointer (touch) |
| `useReducedMotion` | `src/hooks/useReducedMotion.ts` | Detect OS prefers-reduced-motion preference |
| `PauseAnimationsButton` | `src/components/ui/PauseAnimationsButton.tsx` | Accessible toggle for site-wide motion pause |

### How It Works

1. `MotionPolicyProvider` wraps the app at the root level.
2. It reads OS `prefers-reduced-motion` via `useReducedMotion`.
3. It reads pointer type via `useFinePointer`.
4. It reads pause state from `localStorage`.
5. Child components consume policy via `useMotionPolicy()`.
6. `useHEXAMotion` (Framer Motion) and GSAP code check policy before animating.

### Override Hierarchy

```
OS prefers-reduced-motion
  ^-- Site pause control (localStorage) overrides OS when activated
      ^-- Per-component override (useMotionPolicy) respects both
```

---

## Easing (The Secret to Luxury)

We use **Custom Cubic Beziers** to create organic, high-end movement. All values sourced from `src/lib/motion.ts`.

| Type | Curve | Feel | Use Case |
|------|-------|------|-----------|
| **Entrance** | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth, decelerating | Page loads, Hero entrance |
| **Interaction** | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy, playful | Button hover, Tooltips |
| **Transition** | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Balanced | Modal opens, Page slides |
| **Sharp** | `cubic-bezier(0.4, 0, 0.6, 1)` | Fast, precise | Error messages, toggles |

---

## Timing and Duration

| Element | Duration | Stagger | Note |
|----------|----------|----------|------|
| Micro-interactions | 150ms - 300ms | 0ms | Must feel instant |
| Component transitions | 300ms - 500ms | 50ms | Smooth shift |
| Page transitions | 600ms - 900ms | 100ms | Cinematic feel |
| 3D Camera moves | 1s - 2s | 0ms | Avoid motion sickness |

### Reduced Motion Durations

When `reducedMotion` is true:
- All durations collapse to `REDUCED_TRANSITION` (0.2s opacity-only)
- Camera moves snap instantly (no lerp)
- Page transitions are instant content swaps

---

## Motion Patterns

### The "Cascading Reveal"

Elements should not appear all at once. Use a stagger effect:
- Element 1 (T=0)
- Element 2 (T=100ms)
- Element 3 (T=200ms)

### Parallax and Depth

Use subtle parallax to create a 3D feel on 2D pages:
- Background moves at 0.2x speed.
- Midground moves at 0.5x speed.
- Foreground moves at 1.0x speed.

**Coarse pointer:** Parallax disabled on touch devices.

### The "Surgical" Hover

Avoid jarring changes. Use transitions for:
- `opacity`
- `transform: scale()`
- `box-shadow`
- `border-color`

**Coarse pointer:** Hover effects replaced with tap feedback.

---

## 3D Motion Guidelines

1. **Damped Movement:** Use `lerp` or `damping` for camera movements to avoid robotic stops.
2. **Avoid "Jump Cuts":** Always animate the transition between two camera positions.
3. **Scale-in:** New 3D objects should scale from 0 to 1 with a spring effect.
4. **Rotation:** Use slow, constant rotation for showcase objects.

**Reduced motion:** Camera snaps to target. No entrance animation. Objects render at final state.

---

## Reduced Motion Behavior Matrix

Complete mapping of every effect to its behavior under `prefers-reduced-motion: reduce`:

| Effect | Reduced Motion Behavior |
|--------|------------------------|
| Shader time uniforms | Frozen at t=0 |
| Particle systems | Not rendered |
| 3D model rotation | Static pose |
| Camera orbit/parallax | Snap to stable position |
| Scroll-linked parallax | Disabled |
| Cursor trail | Disabled |
| Page transitions | Instant content swap |
| Loader spin/pulse | Static text/icon |
| Counter animations | Jump to final value |
| Smooth scroll | `behavior: auto` |
| Marquee | Static text |
| Text reveal | Instant (no mask animation) |
| Fade-in on mount | Instant opacity (no delay) |
| Hover effects | Instant state change |
| Focus ring animation | Instant appearance |
| Ambient scene route entrance | Render at final state |

**Permitted under reduced motion:** Brief opacity crossfade (max 0.2s) only when it aids comprehension of a state change (e.g., content replacement).

---

## Coarse Pointer Behavior Matrix

Complete mapping of every effect to its behavior on touch/coarse pointer devices:

| Effect | Coarse Pointer Behavior |
|--------|------------------------|
| Mouse-follow light/glow | Disabled |
| Scroll parallax | Disabled |
| Cursor trail | Disabled |
| Magnetic pull on buttons | Disabled |
| Hover card tilt | Disabled |
| 3D mouse orbit | Disabled (use touch gestures) |
| Hover-only tooltips | Tap to reveal instead |
| Hover card flip | Tap to flip instead |

Detection: `useFinePointer()` hook returns `false` on touch devices.

---

## GSAP Cleanup Policy

Every GSAP animation must follow this cleanup contract:

### Mandatory Pattern

```ts
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to(ref.current, { x: 100, duration: 0.4 });
  });

  return () => ctx.revert(); // Kills all tweens in this context
}, []);
```

### Rules

1. **Always use `gsap.context()`** — scope all animations to a context.
2. **Always revert on unmount** — `ctx.revert()` in the cleanup function.
3. **No orphaned tweens** — every tween must be inside a context.
4. **No module-scope timeline references** — timelines must be scoped to component lifecycle.
5. **RAF loops:** Store `requestAnimationFrame` ID. Cancel on cleanup: `cancelAnimationFrame(id)`.

### Verification

- Search codebase for `gsap.to`, `gsap.from`, `gsap.fromTo`, `gsap.timeline` — every instance must be inside a `gsap.context()`.
- Search for `requestAnimationFrame` — every call must have a corresponding `cancelAnimationFrame`.

---

## CSS Animation Policy

### Custom Properties from Tokens

```css
:root {
  --motion-ease-entrance: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-duration-micro: 200ms;
  --motion-duration-component: 400ms;
}
```

### Rules

1. **Never use `transition-all`** — causes unintended property animations and performance issues.
2. **Use custom properties** derived from motion tokens for all CSS transitions/animations.
3. **`prefers-reduced-motion` media query** neutralizes all CSS animations at the root level.

### Documented Exceptions

| Animation | Reason | Control |
|-----------|--------|---------|
| Shimmer loading effect | Visual feedback during data fetch | Pause-able, respects reduced motion |
| Marquee | Continuous brand messaging | Pause-able via site control, static text under reduced motion |

Both exceptions use `transform: translateX()` only (no layout properties) and are controlled by the motion policy layer.

---

## Performance and Accessibility

- **GPU Acceleration:** Only animate `transform` and `opacity`.
- **Reduced Motion:** Enforced via `MotionConfig`, `useHEXAMotion`, and CSS media query.
- **FPS Lock:** Ensure animations don't drop the frame rate below 60 FPS.
- **Frame Budget:** p95 frame-time < 16.7ms on supported hardware.
