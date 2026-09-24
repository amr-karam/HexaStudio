# Story Scroll — Cinematic Scroll-Driven Experience

## Overview

The `StoryScroll` component implements a cinematic, scroll-driven narrative experience using GSAP and ScrollTrigger. It creates a 400vh vertical scroll container where four distinct "scenes" animate into view as the user scrolls, with parallax depth, opacity fades, and scale transitions choreographed through ScrollTrigger timelines.

## File Structure

```
src/app/story/
├── page.tsx          # Re-exports StoryScroll as the default export
├── scroll.tsx        # Actual implementation (exported as StoryScroll)
└── story-scroll.tsx  # Barrel re-export for backwards compatibility
```

**Entry point**: `src/app/story/page.tsx` — Next.js App Router page that renders `StoryScroll`.

**Core component**: `src/app/story/scroll.tsx` — `'use client'` React component containing the full GSAP/ScrollTrigger logic.

## Component API

### `StoryScroll` (`scroll.tsx`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| *(none)* | — | — | Component takes no props |

**Internal refs**:
- `containerRef` — The 400vh scrollable `<main>` container
- `sceneRef` — The horizontally-scrolling `<div>` that holds all four scene sections

### Scene Data

Four scenes are hardcoded in the component:

| ID | Title | Background | Z-depth |
|----|-------|------------|---------|
| 1 | `01 The Vision` | `COLOR_TOKENS.VOID` (#0A0A0B) | -1000px |
| 2 | `02 Materiality` | `COLOR_TOKENS.VOID_DEEP` (#020203) | -2000px |
| 3 | `03 The Process` | `COLOR_TOKENS.OBSIDIAN` (#0F0F10) | -3000px |
| 4 | `04 The Finality` | `COLOR_TOKENS.VOID_DEEP` (#020203) | -4000px |

## GSAP ScrollTrigger Behavior

### Initialization

```js
gsap.registerPlugin(ScrollTrigger);
```

The `gsap.ts` loader (`src/lib/gsap.ts`) handles dynamic import of both `gsap` and `gsap/ScrollTrigger`, registers the plugin, and caches the promise. This loader is side-effect free — it does NOT wire the Lenis ↔ ScrollTrigger bridge (that is handled by `SmoothScroll.tsx` in Phase 1).

### Timeline Architecture

**Root timeline** (horizontal pan):
- **Trigger**: `containerRef`
- **Start**: `top top`
- **End**: `bottom bottom`
- **Scrub**: `1.5` (smooth scrubbing)
- **Animation**: `sceneRef` translates X by `-(scrollWidth - innerWidth)`, creating horizontal scroll

**Per-scene timelines** (reveal animations):
Each scene gets a `gsap.fromTo()` with:
- **Start**: `top+=${i * (innerHeight * 0.8)} top`
- **End**: `start + innerHeight * 0.4`
- **Scrub**: `1.2`
- **Easing**: `power2.out`
- **Duration**: `0.8s`
- **From state**: `{ opacity: 0, y: 50, scale: 0.95 }`
- **To state**: `{ opacity: 1, y: 0, scale: 1 }`

### Cleanup

On unmount, `ctx.revert()` kills all GSAP contexts and ScrollTrigger instances. A pre-cleanup pass kills any existing ScrollTriggers targeting `containerRef` to prevent memory leaks on re-mount.

### 3D Perspective

The scene container uses `perspective: 2000` CSS and `transformStyle: 'preserve-3d'` on each scene section, with `translateZ(${scene.z}px)` creating layered depth between scenes.

## CSS Classes Used

- `bg-sl-void` — Background color token (#0A0A0B)
- `text-sl-alabaster` — Text color token (#F5F4F2)
- `text-sl-mist/60` — Muted text at 60% opacity
- `font-inter` — Body font stack

## Progress HUD

A fixed progress bar at the bottom of the viewport:
- Track: `h-1 bg-white/10`
- Fill: `h-full w-1/4 bg-sl-gold` (gold accent, 25% width indicator)

## Dependencies

- `gsap` — Animation engine
- `gsap/ScrollTrigger` — Scroll-driven plugin
- `@/lib/color-tokens` — `COLOR_TOKENS` for scene backgrounds
- `@/lib/gsap` — Optional GSAP loader (not directly used; inline registration in component)
