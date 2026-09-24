# ADR-019: Server-Rendered Static Hero Poster for LCP + Visibility-Gated Canvas

## Status
Accepted

## Date
2026-09-23

## Context
Lighthouse audit of `https://hexastudio.net` (Lighthouse 12.1.0, headless Chrome) shows the homepage failing Core Web Vitals budgets (`PERFORMANCE.md` §1):

- LCP **11.3 s** (budget < 2.5 s) ❌
- TBT **1,670 ms** (budget < 200 ms) ❌
- FID 420 ms (budget < 200 ms) ❌
- TTFB 3.5 s (budget < 800 ms) ❌
- CLS 0.038 ✅, Performance score 0.36.

The hero is currently a Client Component (`NewHomeHero.tsx`, `'use client'`) that is code-split behind `dynamic({ ssr:false })` in `HomeClient.tsx`. As a result the entire type stack and the gold "Architectural Plate" canvas only render **after client hydration + bundle evaluation** — so FCP and LCP both ship late. Fonts and CSS are already preloaded (`layout.tsx`), confirming the delay is JavaScript-bound render timing, not resource discovery.

## Decision
1. Render a **server-side static hero** (`NewHomeHeroStatic.tsx`) that emits the headline, type stack, CTAs, and a lightweight inline-SVG monolith as the LCP element directly in the SSR HTML — zero JS required for first paint.
2. Make the real-time 2D canvas plate a **non-blocking, visibility-gated progressive enhancement** (`HeroPlate.client.tsx`) that:
   - mounts only when the user does **not** prefers-reduced-motion,
   - is lazy-loaded via `next/dynamic({ ssr:false })`,
   - pauses its `requestAnimationFrame` loop when off-screen (`IntersectionObserver`),
     tab-hidden (`visibilitychange`), or reduced-motion — satisfying `PERFORMANCE.md` §2 render-loop-control.
3. Remove the hero from the all-client `HomeClient.tsx`; the below-fold sections + chapter rail stay code-split behind `Suspense`.

## Alternatives Considered
| Alternative | Pros | Cons |
|-------------|------|------|
| Keep hero fully client, just pause rAF | Minimal change | LCP stays at TTFB; budgets not met |
| Static poster image (PNG/WebP) | Simple LCP | Adds a network request; loses vector crispness; needs `fetchpriority` coordination |
| Full Three.js hero with SSR `r3f` | Matches legacy spec | Heavy bundle; reintroduces the exact problem this ADR solves |

## Rationale
An inline SVG has zero network cost, scales crisply, and is immediately paintable in SSR HTML — the cheapest possible LCP element. Deferring the canvas keeps interactivity for capable browsers without ever blocking first paint, and the visibility/pause gating prevents the TBT regression source.

## Consequences
- LCP moves to server paint time (bounded by TTFB). Meeting the < 2.5 s LCP budget additionally requires the **edge-caching** task (see ADR-020 / DevOps) to bring TTFB from 3.5 s to < 800 ms.
- New files: `components/NewHomeHeroStatic.tsx`, `components/HeroPlate.client.tsx`. `NewHomeHero.tsx` is retained for Storybook parity and as the source of the canvas logic.
- Tests: no existing tests reference `NewHomeHero`/`HomeClient`, so risk is contained; new component added under coverage.
- ESLint/Tailwind: new classes reuse existing `--btn-primary-*` / `sl-*` tokens; `check-design-tokens` gate stays green (inline-style gold uses `allow-inline-style-hex`).

## References
- `PERFORMANCE.md` §1 (Core Web Vitals budgets) and §2 (WebGL/render-loop rules)
- `docs/adr/002-react-three-fiber.md` (3D rendering policy)
- Lighthouse report: `lighthouse-hexastudio.json` / `lighthouse-hexastudio.html` (repo root)
