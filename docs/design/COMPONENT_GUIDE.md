# Component Guidelines

**Version:** 1.1.0  
**Last Updated:** 2026-09-04  

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

---

## Cinematic Story Scroll Component

Introduced in commit `5c947a3c` / `34cac7fd` — **Silent Luxury design token alignment** sprint.

| Component | Location | Type | Purpose |
|-----------|----------|------|---------|
| `StoryScroll` | `src/app/story/scroll.tsx` | Component | Horizontal z-axis cinematic walkthrough with GSAP ScrollTrigger. 4 narrative scenes with VOID/OBSIDIAN background colors, depth-of-field fog overlay, progress HUD, and UE5-style camera label. |
| `index.ts` | `src/app/story/index.ts` | Barrel | Re-exports `StoryScroll` as default + named export. |

### Implementation Notes
- **Route:** `/story` — entry point at `src/app/story/page.tsx`
- **Animation:** GSAP `ScrollTrigger` with `scrub: 1.5` (cinematic heavy-lerp), `invalidateOnRefresh` for HMR safe cleanup
- **4 Scenes:** Each at `translateZ(-1000px × index)` for z-axis parallax depth
- **Tokens:** Background colors from `COLOR_TOKENS` (`VOID`, `VOID_DEEP`, `OBSIDIAN`) in `src/lib/color-tokens.ts`; text/progress from `sl-*` CSS utility classes in `silent-luxury-tokens.css`
- **Motion Policy:** Uses `gsap.context()` for cleanup; all ScrollTriggers killed on unmount; respects `gsap.context().revert()`
- **Reduced Motion:** Fog overlay and parallax effects are static under reduced motion; content remains accessible
- **Fonts:** `font-inter` body text, `sl-heading` for titles (Cormorant Garamond/Bodoni Moda via `--sl-heading-font`)

### Route Boundary Pattern
The `/story` page was refactored from `StoryScrollCarousel` (in `story-scroll.tsx`) to `StoryScroll` (in `scroll.tsx`) to align with the Silent Luxury design token system. The old `story-scroll.tsx` component is retained for reference.

---

## Homepage Luxury Components (Silent Luxury Redesign)

| Component | Location | Type | Purpose |
|-----------|----------|------|---------|
| `NewHomeHero` | `src/features/portfolio/components/NewHomeHero.tsx` | Pattern | 4-scene "Architectural Plate" hero with canvas-based 3D, Cormorant Garamond headings, Jost body font. |
| `NewHomeSections` | `src/features/portfolio/components/NewHomeSections.tsx` | Composite | Section organizer for the luxury homepage flow. |
| `NewSelectedWork` | `src/features/portfolio/components/NewSelectedWork.tsx` | Pattern | Editorial 2×2 project grid with Silent Luxury tokens. |
| `NewStudioNote` | `src/features/portfolio/components/NewStudioNote.tsx` | Pattern | Studio note presentation with luxury typography and `sl-card` styling. |

### Silent Luxury Design Tokens
All new homepage components use the `sl-*` token system from `silent-luxury-tokens.css`:
- **Colors:** `sl-void` (`#0A0A0B`), `sl-obsidian` (`#121214`), `sl-stone` (`#1C1C1F`), `sl-alabaster` (`#F5F4F2`), `sl-silver` (`#A8A8A8`), `sl-mist` (`#D4D4D4`)
- **Gold accents:** `sl-gold-subtle` (`rgba(212, 175, 55, 0.15)`), `sl-gold-hover` (`rgba(212, 175, 55, 0.3)`)
- **Fonts:** `--sl-heading-font` (Bodoni Moda / Cormorant Garamond), `--sl-body-font` (Inter)
- **Easing:** `--sl-ease-entrance`, `--sl-ease-interaction`, `--sl-ease-transition`
- **Durations:** `--sl-duration-micro` (0.3s), `--sl-duration-ui` (0.5s), `--sl-duration-scene` (1s), `--sl-duration-page` (0.9s), `--sl-duration-parallax` (1.2s)

---

## Dynamic Route Error & Loading Boundaries

Added in commit `414bd14f` — **Error boundaries and loading states for dynamic routes**.

| Route Group | Error Boundary | Loading State | Special Behavior |
|-------------|----------------|---------------|-------------------|
| `/blog/[slug]` | `error.tsx` | `loading.tsx` | Sentry capture, retry link |
| `/projects/[slug]` | `error.tsx` | `loading.tsx` | Sentry capture, retry link |
| `/portal/projects/[id]` | `error.tsx` | `loading.tsx` | Sentry capture, retry link |
| `/portal/review/[id]` | `error.tsx` | `loading.tsx` | Sentry capture, retry link |
| `/admin/accounting` | `loading.tsx` | — | 6s `AbortController` timeout on API fetch |

All error boundaries use `use revalidatePath` (Next.js App Router) for retry and capture to Sentry via `captureException`.

---

## Documentation Requirements

Every new component must be documented in the codebase:
- **Interface:** Clear prop definitions.
- **Usage:** Examples of common configurations.
- **Edge Cases:** How it handles loading, errors, and empty states.
- **Accessibility:** Notes on keyboard interactions and ARIA roles.

---

## Related Docs

- `07-DESIGN\\DESIGN_SYSTEM.md`
- `engineering\\CODING_STANDARDS.md`
- `07-DESIGN\\FRONTEND_EXCELLENCE.md`
- `engineering\\MOTION_SYSTEM.md`
- `engineering\\GSAP_GUIDE.md`
- `engineering\\THREEJS_GUIDE.md`
