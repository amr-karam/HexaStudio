# Frontend Excellence Contract

**Version:** 2.0 | **Scope:** `apps/frontend` | **Standard:** HEXA Creative Excellence (9.5/10 Luxury)
**Authority:** Binding frontend implementation contract. Hierarchy: Constitution > FRONTEND_EXCELLENCE.md > specialized standards.

---

## 1. Purpose and Authority

This document is the **single authoritative contract** for all frontend implementation decisions. Every frontend task, code review, and QA gate references this document first.

**Authority hierarchy:**
1. `00-GOVERNANCE/PROJECT_CONSTITUTION.md` (supreme)
2. `07-DESIGN/FRONTEND_EXCELLENCE.md` (this document)
3. Specialized standards (linked in References)

**Referenced standards (complementary, not redundant):**
- `06-STANDARDS/MOTION_SYSTEM.md` — motion tokens, patterns, guidelines
- `07-DESIGN/UX_STRATEGY.md` — UX principles and interaction design
- `06-STANDARDS/ACCESSIBILITY.md` — WCAG compliance and testing
- `15-QUALITY/PERFORMANCE_STANDARDS.md` — performance budgets and measurement

---

## 2. Experience Principles

1. **Clarity before spectacle.** Every element must communicate its purpose. If a user cannot understand what something does within 2 seconds, the design has failed.
2. **Subtle and purposeful motion.** Every animation must justify its existence. "Does this help the user understand something they could not without it?" If the answer is no, remove it.
3. **Performance is part of design.** A 60fps experience that loads in 1.2s is more luxurious than a 30fps experience with heavier effects. Frame drops break immersion.
4. **Progressive enhancement.** Core content and functionality work without JavaScript, without WebGL, without animation. Enhancements layer on top.
5. **Consistency across input modes.** Mouse, touch, keyboard, and screen reader users receive equivalent experiences. No feature is exclusive to one input method.

---

## 3. Motion Decision Framework

### Permitted Purposes

Animation must serve one of these roles:
- **State change** — element appears, disappears, or transforms
- **Hierarchy** — guide attention to the most important element
- **Continuity** — maintain spatial context during navigation
- **Causality** — show that action A caused result B
- **Feedback** — confirm that the system received input

### Motion Necessity Test

Before implementing any animation, answer: **"Does this animation help the user understand something they could not without it?"**

If the answer is no, the animation is decorative and must be removed.

### Prohibited Patterns

- Decorative-only animation (adds no informational value)
- More than 3 simultaneous animated elements
- Continuous motion without pause/stop controls
- Animation that delays access to content
- Flashing or strobing (absolutely prohibited per WCAG 2.3.1)

### Performance Budget for Effects

| Property Class | Status | Notes |
|----------------|--------|-------|
| `transform`, `opacity` | Permitted | GPU-composited, no layout/paint |
| `width`, `height`, `top`, `left`, `margin` | Prohibited | Triggers layout thrash |
| `filter`, `backdrop-filter` | Budgeted | Requires profiling; max 2 simultaneous |
| Large `box-shadow` | Budgeted | Profiling required; avoid spread + blur combos |

Paint-property exception process: if an effect absolutely requires a paint property, document the profiling results in the PR description and get reviewer approval.

---

## 4. Motion Implementation Contract

### Source of Truth

All animations MUST source easing, duration, stagger, and transitions from `src/lib/motion.ts`. No inline `cubic-bezier` literals, no hardcoded duration values.

```ts
import { EASE, DURATION, STAGGER, makeTransition } from '@/lib/motion';
import { useHEXAMotion } from '@/hooks/useHEXAMotion';
```

### Tokens

| Token | Value | Use Case |
|-------|-------|----------|
| `EASE.entrance` | `cubic-bezier(0.16, 1, 0.3, 1)` | Page loads, hero entrance |
| `EASE.interaction` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Button hover, tooltips |
| `EASE.transition` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Modal opens, page slides |
| `EASE.sharp` | `cubic-bezier(0.4, 0, 0.6, 1)` | Error messages, toggles |
| `DURATION.micro` | 0.2s | Micro-interactions |
| `DURATION.component` | 0.4s | Component transitions |
| `DURATION.page` | 0.75s | Page transitions |
| `DURATION.camera` | 1.4s | 3D camera moves |
| `STAGGER.micro` | 0ms | Instant |
| `STAGGER.component` | 50ms | Subtle cascade |
| `STAGGER.page` | 100ms | Page-level cascade |

### Composable Transitions

```ts
const transition = makeTransition('entrance', 'component', 0.1);
// -> { ease: EASE.entrance, duration: 0.4, delay: 0.1 }
```

### GSAP Policy

- Use `gsap.context()` for cleanup. Every GSAP instance must be scoped.
- Kill all tweens on component unmount.
- No orphaned tweens. No timeline references stored in module scope.
- All RAF loops must be cancellable. Store the RAF ID and cancel it on cleanup.

### Framer Motion Policy

- Use `useHEXAMotion` for reduced-motion-aware variants.
- Wrap components in `<MotionConfig reducedMotion="user">` at the root.
- Never hand-roll `matchMedia` checks for reduced motion.

### CSS Animation Policy

- Use custom properties derived from motion tokens.
- Never use `transition-all` (causes unintended property animations).
- Documented exceptions: `shimmer` and `marquee` effects (CSS-only, token-sourced).
- `prefers-reduced-motion` media query neutralizes all CSS animations.

### Ambient Linear Loop Exception

Seamless marquees may use a continuous linear CSS animation. This is the only permitted continuous motion pattern. It must:
- Be pause-able via the site-level pause control
- Respect reduced motion (static text fallback)
- Use only `transform: translateX()` (no layout properties)

---

## 5. Reduced Motion Contract

### Detection

- `useReducedMotion()` hook — component-level check
- `MotionPolicyProvider` — context-level policy state
- `MotionConfig reducedMotion="user"` — global Framer Motion enforcement

### Global Enforcement

`AppProviders` wraps the entire tree in `<MotionConfig reducedMotion="user">`. All Framer Motion animations auto-collapse to opacity-only for users who request reduced motion.

### Required Behavior Under Reduced Motion

| Effect | Behavior |
|--------|----------|
| Continuous motion (shaders, particles, rotation, float, parallax, camera orbit) | Disabled |
| Scroll-linked spatial movement | Disabled |
| Page transition wipes/curtains | Instant content swap |
| Loaders | Static text/icon, no pulse/spin/progress animation |
| Counters | Jump to final value |
| Cursor effects | Disabled |
| Smooth scroll | Disabled (`behavior: auto`) |
| Camera | Snap to stable target position |
| 3D scenes | Render at final state, no entrance animation |
| Marquee | Static text |

### Permitted Under Reduced Motion

Brief opacity crossfade only when it improves comprehension of a state change (e.g., replacing one content block with another). Duration: max 0.2s.

### Rule

Never delay access to content. Under reduced motion, all content is immediately visible and interactive.

---

## 6. Site-Level Pause Control

A persistent, keyboard-accessible toggle (using `aria-pressed`) controls all site-wide motion. The toggle is visible in the UI (not hidden in settings) and persists state in `localStorage`.

### When Activated

Overrides OS `prefers-reduced-motion` preference. Pauses:

| Effect | Fallback State |
|--------|---------------|
| Marquee | Static text |
| Ambient WebGL | Static scene |
| Particles | No particles rendered |
| Shader time | Frozen at t=0 |
| Model rotation | Static pose |
| Camera parallax | Fixed camera |
| Cursor trail | Disabled |

### Component

`PauseAnimationsButton` — accessible toggle, `aria-pressed` attribute, localStorage persistence, consumed by `MotionPolicyProvider`.

---

## 7. Responsive and Mobile Experience

### Mobile-First

Design for 320px, enhance upward. Content and functionality are complete at the smallest breakpoint.

### Coarse Pointer (Touch Devices)

Disable on touch devices:
- Mouse-follow effects
- Parallax on scroll
- Cursor trail / magnetic pull
- Hover-only interactions (provide tap alternatives)

Detection: `useFinePointer()` hook from the motion policy layer.

### Touch Targets

Minimum 44x44 CSS pixels for all interactive elements. No exceptions.

### Gesture Conflicts

Canvas gestures (orbit, pan, zoom in 3D scenes) must not conflict with page scroll. Use explicit gesture boundaries.

### Mobile Motion

- Simplified effects (fewer simultaneous animations)
- Shorter durations (reduce by 30-50% from desktop tokens)
- No parallax depth effects
- Camera: fixed or minimal movement

### Testing

Real-device test matrix required before any PR merge affecting layout or interaction.

---

## 8. Performance Budgets

### Constitutional Targets

| Metric | Target |
|--------|--------|
| LCP | < 1.2s |
| Frame rate | 60 FPS (p95 frame-time < 16.7ms) |
| TBT | < 200ms |
| CLS | < 0.1 |

### JS Budget

| Route Type | Budget |
|------------|--------|
| Non-3D routes | < 200KB gzip (initial JS) |
| 3D routes | Lazy-loaded, separate budget |
| CSS | < 50KB gzip |

### Runtime Constraints

- No always-on WebGL on non-3D routes.
- Offscreen scenes must pause (IntersectionObserver or visibility API).
- Tab-hidden scenes must pause (`document.visibilitychange`).
- Single AA strategy (no multiple overlapping anti-aliasing techniques).
- DPR capped per quality tier.

### Quality Tiers

QualityProvider is the single source of truth for adaptive quality:
- **Low:** DPR 1.0, no shadows, no post-processing, no particles
- **Medium:** DPR 1.5, basic shadows, bloom only, reduced particles
- **High:** DPR 2.0, full shadows, full post-processing, full particles

Detection: GPU probe + device memory + DPR + viewport size + connection speed.
User override: Auto / Performance / Quality.

---

## 9. Adaptive Quality and Fallbacks

### QualityProvider

Single source of truth. Consumed by ExperienceCanvas, 3D scenes, and ambient effects.

### Fallback States

| Failure | Behavior |
|---------|----------|
| WebGL unavailable | Cover image + project metadata + full navigation |
| WebGL context loss | Show fallback image, attempt context recovery |
| Model load failure | Show fallback with project info |
| No-JS | Server-rendered content visible and usable |
| XR unsupported | Descriptive fallback message with feature explanation |

### GLTF Assets

- Cache-immutable (fetch once, reuse from cache)
- Draco-compressed
- Delta-based motion (no per-frame allocations)

### 3D Scene Lifecycle

- Lazy-loaded per route
- Paused when offscreen or tab-hidden
- Entrance animation respects reduced motion (snap to final state)
- Camera: snap or lerp based on motion policy

---

## 10. Accessibility Contract

### Target

WCAG 2.2 Level AA.

### Keyboard

- All interactions keyboard-operable.
- Visible focus indicators on all interactive elements.
- Logical tab order matches visual order.
- No keyboard traps.

### Focus Management

- **Modals/menus:** Focus trap (Tab cycles within). `Escape` closes and restores focus.
- **Route changes:** Focus moves to new page heading or `<main>`.
- **Close/escape:** Focus returns to the trigger element.

### Screen Readers

| Element | ARIA |
|---------|------|
| Loaders (determinate) | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Loaders (indeterminate) | `role="status"` with descriptive text |
| Dialogs/modals | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Live regions | `aria-live="polite"` for non-urgent updates |
| 3D content | Semantic DOM alternative (SceneAccessibility component) |

### 3D Content

Every 3D scene has a corresponding semantic DOM layer:
- Visually hidden `<nav>` for scene navigation
- `<article>` per hotspot/model with descriptive text
- `role="img"` with `aria-label` for static 3D views

### Background Inert

When a modal or full-screen menu is open, background content uses `aria-hidden="true"` and `inert` attribute.

### Prohibited

- Flashing or strobing content (WCAG 2.3.1)
- Content that requires animation to be understood
- Auto-playing audio

---

## 11. Verification Matrix

### Automated

| Check | Tool | Gate |
|-------|------|------|
| Lint | ESLint | CI |
| Typecheck | tsc (strict) | CI |
| Unit tests | Vitest | CI |
| E2E | Playwright | CI |

### Playwright Projects

| Project | Purpose |
|---------|---------|
| chromium | Standard desktop |
| reduced-motion | Emulates `prefers-reduced-motion: reduce` |
| mobile | Touch viewport, coarse pointer |
| no-JS | JavaScript disabled |
| webgl-disabled | WebGL unavailable |

### Accessibility

- axe-core scans (automated, per page)
- Keyboard-only navigation (all interactive flows)
- Screen reader testing (VoiceOver / NVDA)

### Performance

- Lighthouse CI (target: 95+ all categories)
- Bundle analysis (budget check)
- Frame-time instrumentation (p95 < 16.7ms)

### Visual Regression

- Committed baselines in repository
- No auto-update in CI (manual approval required)

### Manual

- Real devices (iOS, Android, desktop)
- Real browsers (Chrome, Firefox, Safari, Edge)
- Toggle reduced motion mid-session
- Verify pause control behavior

---

## 12. Definition of Done

A frontend task is done **only when ALL** of the following are satisfied:

### Code Quality
- [ ] `npm run lint` passes (0 errors, 0 warnings)
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm run test` passes (all green)
- [ ] `npm run build` succeeds (`SKIP_ENV_VALIDATION=true`)

### Motion Compliance
- [ ] All animation values sourced from `src/lib/motion.ts` (no inline easing/duration)
- [ ] All RAF loops cancellable (ID stored, cancelled on cleanup)
- [ ] All GSAP tweens cleaned up (`gsap.context()`, kill on unmount)
- [ ] No orphaned tweens or timeline references

### Reduced Motion
- [ ] Verified via Playwright `reduced-motion` project
- [ ] No continuous motion under reduced motion
- [ ] Loaders are static under reduced motion
- [ ] Content accessible without animation

### Coarse Pointer
- [ ] Verified via Playwright `mobile` project
- [ ] No mouse-follow, parallax, or cursor effects on touch
- [ ] All touch targets >= 44x44px

### Focus Management
- [ ] Verified: modals trap focus, Escape restores focus
- [ ] Verified: route changes move focus to main content
- [ ] Verified: background inert during modals

### Fallbacks
- [ ] WebGL unavailable: cover image + metadata + navigation
- [ ] No-JS: server-rendered content visible and usable
- [ ] Model load failure: fallback with project info

### Performance
- [ ] LCP < 1.2s
- [ ] Initial JS < 200KB gzip (non-3D routes)
- [ ] 60 FPS on supported hardware (p95 frame-time < 16.7ms)
- [ ] Offscreen scenes pause
- [ ] Tab-hidden scenes pause

### Documentation
- [ ] Related playbook docs updated
- [ ] ADR written (if architectural change)

---

## 13. References

| Document | Path | Purpose |
|----------|------|---------|
| Motion System | `06-STANDARDS/MOTION_SYSTEM.md` | Tokens, patterns, implementation details |
| UX Strategy | `07-DESIGN/UX_STRATEGY.md` | UX principles and interaction design |
| Accessibility | `06-STANDARDS/ACCESSIBILITY.md` | WCAG compliance and testing procedures |
| Performance Standards | `15-QUALITY/PERFORMANCE_STANDARDS.md` | Performance budgets and measurement |
| Quality Gates | `15-QUALITY/QUALITY_GATES.md` | Release gate requirements |
| Performance Checklist | `17-CHECKLISTS/PERFORMANCE_CHECKLIST.md` | Pre-PR performance verification |
| Accessibility Checklist | `17-CHECKLISTS/accessibility-checklist.md` | Pre-PR a11y verification |

---

*"Motion is Communication. Performance is Luxury. Accessibility is Non-Negotiable."*
