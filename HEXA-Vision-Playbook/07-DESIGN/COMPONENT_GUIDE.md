# Component Guidelines

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Purpose

These guidelines ensure that all UI components in the HEXA Vision platform are consistent, accessible, and performant. We follow a "Primitive → Composite → Pattern" architecture.

## General Rules

1. **Atomic Design** — Build small, reusable primitives first.
2. **Prop-Driven** — Use props for variants, not separate components.
3. **Accessibility First** — Every component must be keyboard navigable and ARIA-compliant.
4. **Tailwind Only** — No custom CSS unless absolutely necessary.
5. **Type Safety** — Use strict TypeScript interfaces for all props.
6. **No Default Exports** — Always use named exports for better IDE support.

## Component Hierarchy

### 1. Primitives
The basic building blocks. No business logic.
- `Button`, `Input`, `Text`, `Icon`, `Badge`, `Divider`, `Spinner`

### 2. Composites
Groups of primitives. Low-level logic (e.g., state).
- `Modal`, `Dropdown`, `Card`, `Form`, `Tooltip`, `Tabs`

### 3. Patterns
Complex components with business logic.
- `ProjectCard`, `ContactForm`, `SceneViewer`, `NavBar`, `Footer`

---

## Scroll Cinema Primitives

Introduced by **Prompt 017 — Signature Scroll Experience**. These components decode award-winning scroll-driven sites into reusable HEXA primitives. All are policy-aware and follow `MOTION_SYSTEM.md`.

| Component | Location | Type | Purpose |
|-----------|----------|------|---------|
| `useScrollVelocity` | `src/hooks/useScrollVelocity.ts` | Hook | Normalized scroll velocity as a framer-motion `MotionValue` for velocity-shear, parallax, and drag effects. Static mode returns 0. |
| `ChapterMarker` | `src/components/animation/ChapterMarker.tsx` | Primitive | Decorative `(CH. N) — Title` label; `aria-hidden`, mask-revealed on scroll. |
| `ChapterProgress` | `src/components/animation/ChapterProgress.tsx` | Composite | Fixed right-edge chapter rail with numbered dots; uses `IntersectionObserver` and respects `finePointer`/`reducedMotion`. |
| `ContactRibbon` | `src/components/ui/ContactRibbon.tsx` | Composite | Full-width infinite marquee CTA above the footer; pauses on hover/focus; static under reduced motion / pause. |
| `FractureRingHero` | `src/features/experience/components/FractureRingHero.tsx` | Pattern | CH. I VISION WebGL hero orchestrator: lazy-loaded R3F scene with quality/load gates and static fallback. |
| `FractureRingScene` | `src/features/experience/components/FractureRingScene.tsx` | Pattern | The actual R3F canvas: barycentric wireframe torus core + fractured stone shell + bloom + scroll/mouse rotation. |
| `ReadingProgress` | `src/components/animation/ReadingProgress.tsx` | Primitive | Fixed top-edge hairline that fills as the user scrolls through an article. `scaleX`-only, RAF-driven, `role="progressbar"`. |
| `ProjectChapterRail` | `src/features/portfolio/components/ProjectChapterRail.tsx` | Composite | Thin wrapper around `ChapterProgress` for project detail pages (01–05: Hero/Brief/Experience/Details/Next). |
| `ProjectScrollCinema` | `src/features/portfolio/components/ProjectScrollCinema.tsx` | Pattern | 5-chapter orchestrator for project detail pages: Hero, Brief (editorial metadata), Experience (pinned 3D scrub), Details (counters), Next (progress ring). |

### Accessibility notes
- `ChapterMarker` is decorative; semantic headings remain in the section.
- `ChapterProgress` is a `<nav>` landmark; each dot is a labelled `<button>` with focus ring and `aria-current`.
- `ContactRibbon` is a single `<Link>` with `aria-label`; marquee copies are `aria-hidden`.
- `useScrollVelocity` attaches no listeners in static mode, ensuring reduced-motion users see a stable page.
- `ReadingProgress` uses `role="progressbar"` with `aria-valuenow` for screen readers; RAF-driven, zero layout cost.
- `ProjectScrollCinema` chapters use semantic `<section>` elements with real headings; `ChapterMarker` is `aria-hidden`.

## Documentation Requirements

Every new component must be documented in the codebase:
- **Interface:** Clear prop definitions.
- **Usage:** Examples of common configurations.
- **Edge Cases:** How it handles loading, errors, and empty states.
- **Accessibility:** Notes on keyboard interactions and ARIA roles.

## Related Docs

- `07-DESIGN\DESIGN_SYSTEM.md`
- `06-STANDARDS\CODING_STANDARDS.md`
- `06-STANDARDS\ACCESSIBILITY_GUIDE.md`
