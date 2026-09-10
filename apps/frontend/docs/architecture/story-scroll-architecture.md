# Architecture — Cinematic Story Scroll & Design Token System

## Overview

This document describes the architectural decisions, file organization, and integration points for the `/story` route and the Silent Luxury design token system.

---

## Route Architecture

### Next.js App Router

The `/story` route lives at `src/app/story/` and uses Next.js 16 App Router conventions:

```
src/app/story/
├── page.tsx          # Next.js page component (default export = StoryScroll)
├── scroll.tsx        # Core StoryScroll implementation ('use client')
└── story-scroll.tsx  # Barrel re-export for backwards compatibility
```

**`page.tsx`** is a Next.js page file that simply re-exports `StoryScroll` as the default. This allows `src/app/story/page.tsx` to be the entry point for the `/story` URL.

### Client Component Boundary

All story-scroll files are `'use client'` because they rely on:
- `gsap` and `gsap/ScrollTrigger` (browser-only APIs)
- `useRef` and `useEffect` for DOM manipulation
- `window` and `document` for scroll measurements

---

## GSAP Integration Architecture

### Dynamic Import Strategy (`src/lib/gsap.ts`)

The GSAP library is dynamically imported to keep the initial bundle size minimal. The loader caches the promise so subsequent renders don't re-fetch.

```typescript
export function getGsap(): Promise<typeof import('gsap').default>
```

**Key decisions**:
- `gsap` and `gsap/ScrollTrigger` are imported in parallel via `Promise.all`
- ScrollTrigger is registered globally with `gsap.registerPlugin(ScrollTrigger)`
- The Lenis ↔ ScrollTrigger bridge is intentionally NOT in this loader — it's owned by `SmoothScroll.tsx` (Phase 1) to avoid init race conditions

### Why Not Use the Loader in StoryScroll?

The `StoryScroll` component registers GSAP and ScrollTrigger inline via `gsap.registerPlugin(ScrollTrigger)`. This is a deliberate choice:
- The component needs ScrollTrigger immediately on mount
- The `getGsap()` loader is designed for non-SSR contexts where lazy loading is acceptable
- The inline registration avoids a potential waterfall if the page loads without scrolling

---

## ScrollTrigger Timeline Design

### Root Timeline (Horizontal Pan)

The root timeline creates the horizontal scroll effect:

```
trigger: containerRef  (400vh main)
start: 'top top'
end:   'bottom bottom'
scrub: 1.5
```

This makes the `sceneRef` div translate horizontally by `-(scrollWidth - innerWidth)`, creating a scroll-driven horizontal pan.

### Per-Scene Reveal Timelines

Each scene gets its own ScrollTrigger within the root timeline context:

```
start: `top+=${i * (innerHeight * 0.8)} top`
end:   `start + innerHeight * 0.4`
scrub: 1.2
```

The `i * (innerHeight * 0.8)` offset staggers each scene's reveal, and `window.innerHeight * 0.4` gives each scene a 40% viewport-height reveal window. The `power2.out` easing provides a smooth deceleration.

### GSAP Context Management

`gsap.context()` wraps all animations for clean cleanup. `ctx.revert()` on unmount kills all ScrollTriggers, tweens, and contexts, preventing memory leaks on navigation.

---

## Design Token System Architecture

### CSS Custom Properties → TypeScript Mirror

```
silent-luxury-tokens.css (CSS :root)
        ↓ mirrors
src/lib/color-tokens.ts (COLOR_TOKENS object)
        ↓ consumed by
StoryScroll, Three.js materials, canvas rendering
```

The `COLOR_TOKENS` TypeScript object mirrors the CSS custom properties. This allows:
- **CSS usage**: `var(--color-sl-void)` in stylesheets
- **JS/TS usage**: `COLOR_TOKENS.VOID` in TypeScript code (Three.js, GSAP, canvas)

### Dual Token Files

The project maintains two CSS token files:

1. **`silent-luxury-tokens.css`** — The primary Silent Luxury system (`--sl-*` tokens)
   - Brand colors, typography, easing, durations, glass, utilities
   - Used across the entire application

2. **`artisan-tokens.css`** — The complementary Artisan Glassmorphism system (`--artisan-*` tokens)
   - Higher-saturation glass effects, specular highlights
   - Used for premium UI surfaces (cards, modals, glass panels)

### Token Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `--sl-*` | Silent Luxury system | `--sl-void`, `--sl-gold-subtle` |
| `--color-sl-*` | CSS color variables for gradients | `--color-sl-void` |
| `--artisan-*` | Artisan Glassmorphism system | `--artisan-glass-bg` |
| `--ease-*` | Motion easing aliases | `--ease-physics-smooth` |

### Motion Token Hierarchy

```
src/lib/motion.ts           ← Canonical source (EASE, DURATION, STAGGER)
src/lib/motion/tokens.ts    ← Phase-1 aliases (EASING, DUR, STAGGER_TOKENS)
src/lib/motion/bento-tokens.ts ← Bento Grid presets (BENTO_ANIMATION)
src/styles/silent-luxury-tokens.css  ← CSS custom property equivalents
src/lib/gsap.ts             ← GSAP dynamic loader
```

All motion tokens derive from `src/lib/motion.ts` — the single source of truth. The CSS tokens mirror these values for non-JS contexts.

---

## Integration Points

### StoryScroll ↔ Design Tokens

The `StoryScroll` component uses tokens in two ways:

1. **CSS classes**: `bg-sl-void`, `text-sl-alabaster`, `text-sl-mist/60`
2. **JavaScript values**: `COLOR_TOKENS.VOID`, `COLOR_TOKENS.OBSIDIAN` for inline `backgroundColor` styles

### Progress HUD

The fixed progress bar uses `bg-sl-gold` — a CSS utility that references the gold accent token.

### 3D Scene Depth

`translateZ(${scene.z}px)` with `perspective: 2000` creates parallax depth. The z-values (-1000, -2000, -3000, -4000) are not tokens — they are hardcoded scene-specific values in `scroll.tsx`.

---

## File Locations Summary

```
apps/frontend/
├── src/app/story/
│   ├── page.tsx              # Next.js page route
│   ├── scroll.tsx            # StoryScroll component
│   └── story-scroll.tsx      # Barrel re-export
├── src/lib/
│   ├── gsap.ts               # GSAP dynamic loader
│   ├── color-tokens.ts       # TypeScript color token mirror
│   ├── motion.ts             # Canonical motion tokens
│   ├── motion/tokens.ts      # Phase-1 motion aliases
│   └── motion/bento-tokens.ts # Bento Grid animation presets
├── src/styles/
│   ├── silent-luxury-tokens.css  # Primary design tokens
│   ├── artisan-tokens.css        # Complementary glass tokens
│   └── globals.css               # Global styles @theme
└── docs/design/
    ├── story-scroll.md             # This feature documentation
    └── silent-luxury-tokens.md     # Design token documentation
└── docs/architecture/
    └── story-scroll-architecture.md # This architecture document
```

---

## Dependencies

### Runtime
- `gsap` — Animation engine (dynamic import)
- `gsap/ScrollTrigger` — Scroll-driven plugin
- `react` / `react-dom` — UI framework
- `next` — App Router framework

### Design System
- `@/lib/color-tokens` — TypeScript color constants
- `@/lib/motion` — Motion token system
- `inter` font — Body typography
- `bodoni-moda` font — Heading typography (via Google Fonts)

### Accessibility
- `prefers-reduced-motion` media queries in CSS
- `REDUCED_TRANSITION` in `src/lib/motion.ts`
