# ADR-008: Persistent Experience Layer ("The Living Blueprint")

**Date:** 2026-07-24
**Status:** Proposed
**Deciders:** Product Owner (human), Chief Architect (agent), Frontend Lead (agent)

### 1. CONTEXT

The current frontend mounts an isolated R3F `<Canvas>` per route (`HomeHero` → `LazySceneCanvas`, `portfolio/[slug]` → `ExperienceCanvas`, plus route-gated `AmbientScene`). Each navigation unmounts the WebGL context, so the 3D layer restarts on every page. The reference experience we benchmark against (activetheory.net, analyzed 2026-07-24) achieves its "one continuous world" feel through a single persistent WebGL stage where navigation is a camera move, not a remount.

We want that continuity for HEXA's marketing surface — while keeping the constitutional constraints that Active Theory ignores: HTML remains the document (SEO/a11y), <200KB initial JS on non-3D routes, progressive enhancement, reduced-motion and coarse-pointer contracts, quality tiers.

**Scope decision (Product Owner, 2026-07-24):** the persistent world covers marketing routes only — `/`, `/portfolio`, `/portfolio/[slug]`, `/studio`, `/services`, `/contact`. Blog, dashboard, portal, admin, and xr-viewer keep the current lightweight per-route behavior.

### 2. CONSIDERED OPTIONS

- **Option A: Persistent canvas in a route-group layout** — Move a single `<Canvas>` into a `(experience)` route-group layout that wraps only marketing routes. Scenes are components inside one canvas; route changes drive GSAP camera/simulation transitions. Canvas never unmounts within the group.
- **Option B: Per-route canvases with crossfade handoff** — Keep current architecture; on navigation, screenshot the outgoing canvas, crossfade to the incoming one. Simpler, but the world visibly "reboots" (sim state, particle positions reset) and double-mounts GPU contexts during transition.
- **Option C: Full-app persistent canvas (Active Theory style)** — One canvas in the root layout, all routes rendered as GL or GL-composited content. Maximum continuity, but violates the 200KB budget on business routes, hurts blog SEO, and contradicts FRONTEND_EXCELLENCE.md §8 ("No always-on WebGL on non-3D routes").

### 3. TRADE-OFF ANALYSIS

| Option | Pros | Cons | Score (1-10) |
|---------|------|------|--------------|
| A | True continuity where it matters; business routes untouched; budgets intact; sim state survives navigation | Route-group restructure; camera choreography per route pair; canvas must self-degrade on scroll-heavy pages | 9 |
| B | Minimal restructure; low risk | No real continuity (sim resets); GPU double-mount spikes; transition is a trick, not a world | 5 |
| C | Maximum immersion everywhere | Violates constitution (budgets, progressive enhancement); blog/dashboard pay for atmosphere they don't need | 3 |

### 4. THE DECISION

**Chosen Option:** Option A — persistent canvas scoped to a `(experience)` route group.

**Justification:** It is the only option that delivers the actual differentiator (a world that never disappears, camera-driven navigation, simulation continuity) without breaching the constitution. The route-group boundary is also an honest architectural statement: marketing surface = immersive world; business surface = fast tools.

### 5. IMPACT & CONSEQUENCES

- **Positive:** Navigation within marketing routes becomes cinematic camera choreography; GPU particle simulation state persists; single WebGL context (no context-loss churn between routes); the experience layer becomes a first-class subsystem (`features/experience/`) with its own scene registry.
- **Negative:** Marketing routes share one canvas lifecycle — a leak in any scene affects all of them (mitigated by the existing disposal protocol and Sentry monitoring). The `PageTransition` curtain wipe must be bypassed inside the group (camera transition replaces it) while remaining for non-experience routes — two transition paths to maintain.
- **Dependencies:** `app/` restructure into `(experience)` route group; `PageTransition` gains an "experience-aware" mode; `QualityProvider` and `MotionPolicyProvider` consumed by the new layer (no changes needed); Lenis scroll instance exposed to the experience layer for scroll-driven choreography.

### 6. VERIFICATION PLAN

- 60 FPS (p95 frame-time < 16.7ms) sustained during route transitions on a mid-range device (M1 Air / mid-range Android), verified with the existing `usePerformanceMonitor`.
- No WebGL context creation on navigation within the group (assert single context in E2E).
- Non-experience routes (blog, dashboard, portal) show zero canvas mounts and unchanged bundle size (CI bundle budget check).
- Reduced motion: navigation inside the group falls back to instant content swap with static scene poses (behavior matrix in MOTION_SYSTEM.md).
- Memory: heap snapshot after 20 navigation cycles shows no growth trend.

---
**Sign-off:** *Pending Chief Architect review*
