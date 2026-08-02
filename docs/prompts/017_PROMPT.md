# Prompt 017: Signature Scroll Experience — "Scroll Cinema Initiative"

**Role:** Elite Multidisciplinary Motion Team (Creative Director + Motion Designer + WebGL Engineer + Interaction Architect)
**Objective:** Transplant the *decoded techniques* of 30 award-winning reference sites into HEXA Vision, elevating every scroll into a cinematic, chaptered narrative — while staying 100% compliant with the Motion Policy layer, performance budgets, and accessibility contract.
**Standard:** ≥ 9.5/10 Luxury & Performance. Anything "average" is redesigned, not shipped.

---

## 1. System Context

You operate in **Creative Excellence Mode** on the HEXA Vision frontend (`apps/frontend`, Next.js 15, TailwindCSS 4, GSAP + ScrollTrigger, Lenis, Framer Motion, React Three Fiber).

**Infrastructure that ALREADY exists — reuse it, never duplicate it:**

| Asset | Location | Notes |
|-------|----------|-------|
| Lenis smooth scroll | `src/components/SmoothScroll.tsx` (`window.__lenis`) | Destroyed under reduced-motion/pause. All scroll features must work with AND without it. |
| GSAP + ScrollTrigger loader | `src/lib/gsap.ts` | Async-registers ScrollTrigger and syncs it with Lenis. Always import from here. |
| Motion policy | `MotionPolicyProvider`, `useMotionPolicy`, `useFinePointer`, `useReducedMotion`, `PauseAnimationsButton` | Every effect must consult policy before animating. |
| Motion tokens | `src/lib/motion.ts`, `useHEXAMotion.ts` | Custom cubic-beziers (Entrance/Interaction/Transition/Sharp). No ad-hoc easings. |
| Existing motion components | `CinematicText`, `FloatingCardsHero`, `AnimatedCounter`, `ScrollFadeIn`, `ProgressiveReveal`, `MarqueeBar` | Extend, don't reinvent. |
| 3D quality tiers | `QualityProvider` (low/medium/high, DPR caps, offscreen pause) | All WebGL work is tier-gated. |

**Binding documents (read before writing code):**
`07-DESIGN/FRONTEND_EXCELLENCE.md` (binding contract) · `06-STANDARDS/MOTION_SYSTEM.md` · `07-DESIGN/DESIGN_SYSTEM.md` · `06-STANDARDS/THREEJS_GUIDE.md` · `06-STANDARDS/GSAP_GUIDE.md` · `15-QUALITY/QUALITY_GATES.md`

**Target surfaces (real routes):**

| Surface | Route(s) |
|---------|----------|
| Homepage | `/` (`HomeHero → MarqueeBar → FeaturedWork → ProcessSection → AchievementsSection → ProjectGrid → TestimonialsSection → CTASection → NewsletterSection`) |
| Projects index | `/portfolio` |
| Project detail ("each Projects page") | `/portfolio/[slug]` |
| Blog | `/blog`, `/blog/[slug]` |
| Global | Layout shell, navigation, cursor, page transitions |

---

## 2. Inspiration Decode Matrix

Do not clone these sites. **Decode the technique, re-express it in HEXA's architectural-luxury language** (precision grids, light/shadow, dark + gold restraint).

### 2.1 Mapped by the Creative Director (binding placement)

| # | Reference | Decoded Signature Technique | Apply To |
|---|-----------|------------------------------|----------|
| 1 | `raven-trading.com` | **Numbered chapter scroll** — full-viewport sections (01–05) with side pagination dots, scroll-scrubbed WebGL hero object that morphs between chapters, "Scroll to learn more" affordance | `/portfolio/[slug]` — every project detail becomes a chaptered case study |
| 2 | `pasqua.it` | **"House of the Unconventional" chapter storytelling** — (CH. I), (CH. II) markers, serif-italic editorial type mixed with grotesque, image-crossfade scenes driven by scroll | `/` homepage narrative spine |
| 3 | `noomoagency.com` | **3D storytelling flow** — hero statement typography that scrolls into immersive 3D scene; awards/marquee rows with hover previews | `/` homepage |
| 4 | `activetheory.net` | **Portal transition** — particle/dissolve warp between views; content feels like traveling through a portal, not loading a page | Page transitions: `/` ↔ `/portfolio/[slug]` ↔ `/blog` |
| 5 | `animation-addons.com` | **Scroll-scrubbed component reveals** — pinned panels where UI elements assemble as you scrub | `/` homepage (ProcessSection) |
| 6 | `resn.co.nz` | **Liquid/goo WebGL veil** — organic shader wipe used as section divider | `/` homepage section transitions |
| 7 | `cuberto.com` | **The Cuberto DNA (whole-site layer):** blob mouse-follower cursor, magnetic buttons, video-in-text hover fills, marquee contact ribbon, inertia scroll feel | **Entire website** |
| 8 | `burocratik.com` | **Typographic monument scroll** — oversized kinetic headlines, image blocks that unmask with parallax depth on entry | `/` homepage (FeaturedWork + TestimonialsSection) |
| 9 | `cosmos.studio` | **Film-grade scene cuts** — scroll sections behave like film cuts: hold → scrub → hard cut, with grain/vignette continuity | `/` homepage pacing model |
| 10 | `animejs.com` | **Timeline stagger orchestration** — grids/numbers/type animate in precisely staggered timelines; playful kinetic counters | `/portfolio/[slug]` (specs/stats blocks) + `/portfolio` grid |
| 11 | `agencidev.com` | **Sticky-stack section transitions** — sections stack/peel over each other with scale+fade (cards-over-cards) | `/` homepage section handoffs |
| 12 | `bdsn.club` | **Editorial case-study scroll** — alternating text/media rhythm, oversized indexes ("01 / 05"), whitespace pacing | `/portfolio/[slug]` layout rhythm |
| 13 | `webflow.com/made-in-webflow/animation` | Micro-interaction candy: hover states, loaders, toggles | Global micro-interaction pass |
| 14 | `awwwards.com/websites/3d` | Benchmark pool for 3D fidelity | 3D quality bar |

### 2.2 General inspiration pool (use where they fit best)

| Reference | Decoded Technique | Best Fit |
|-----------|-------------------|----------|
| `igloo.inc` | Scroll = **camera dolly** through a continuous 3D environment; scroll progress drives camera path, not DOM | Homepage hero → FeaturedWork handoff; XR viewer entry |
| `theirisk.com` | Dark cinematic product scroll: single object, dramatic lighting shifts per chapter | `/portfolio/[slug]` hero model treatment |
| `demilie.ru` | Distortion-on-velocity: images shear/ripple proportional to scroll velocity | `/portfolio` grid + `/blog` cards |
| `staratlas.com` | Deep-space parallax layers + HUD-style chapter navigation | Project detail side navigation styling |
| `chrometattooparis.com` | Liquid-chrome shader material as brand surface | Accent 3D material (gold-chrome) for hero objects |
| `scoutmotors.com` | **Pinned scrub product reveal** — object rotates/explodes through a pinned viewport as user scrubs | `/portfolio/[slug]` 3D model chapter |
| `iyo.ai` | Product rotation tied to scroll with soft studio lighting | Featured project 3D cards |
| `robinpayot.com` | Playful WebGL micro-scenes rewarding exploration | Easter-egg polish, 404, footer |
| `harmony.now` | Gradient-field ambience that responds to scroll depth | Ambient background continuity between homepage chapters |
| `eszterbial.com`, `poly.app`, `uncommondesign.group`, `mimcocapital.com`, `vibor.it`, `bruut.media`, `qrefinish.com/en-de` | Luxury-minimal pacing, refined type scales, restrained color, confident whitespace | Homepage + services typographic tuning |

---

## 3. Feature Specifications

### F1 — Global "Cuberto DNA" Layer (whole website) — `cuberto.com`
1. **Blob cursor follower** (`src/components/ui/CursorFollower.tsx`): smooth-lerped blob that scales on interactive targets, morphs to "view" label over project cards, inverts over media. Fine-pointer only (`useFinePointer`); disabled under reduced motion; zero layout cost (fixed, `transform` only, single RAF — cancelled on unmount).
2. **Magnetic buttons**: extend the primary Button/CTA with magnetic pull (translate ≤ 12px, Interaction easing) + label skew on exit. Fine-pointer only.
3. **Marquee contact ribbon**: `contact—contact—contact` style infinite ribbon above footer, `transform: translateX` only, pause-able, static under reduced motion (extend existing `MarqueeBar` engine).
4. **Video/image-in-text hover** on nav or section headlines: text acts as mask revealing media on hover (CSS `background-clip: text` / SVG mask, no canvas needed).

### F2 — Homepage "Scroll Cinema" (`/`) — pasqua + noomo + cosmos + resn + burocratik + agencidev + animation-addons
Recompose the homepage as **five chapters** with a persistent narrative spine. No content is removed — sections are re-choreographed:

| Chapter | Sections | Choreography |
|---------|----------|--------------|
| CH. I — VISION | `HomeHero` | Noomo-style statement typography; hero 3D drifts on a scroll-scrubbed dolly (igloo-style, subtle: camera z + fov only). Chapter marker `(CH. I) — VISION` fades in at top-left, Pasqua-style serif-italic accent. |
| CH. II — CRAFT | `MarqueeBar` + `FeaturedWork` | Burocratik monument type: oversized headline unmasks line-by-line; featured image unmasks with 1.15→1.0 scale parallax. Resn-style liquid veil (shader div, tier-gated; clip-path fallback on low tier) wipes between I→II. |
| CH. III — METHOD | `ProcessSection` + `AchievementsSection` | animation-addons pinned scrub: process steps assemble while pinned (max 1.5 viewport heights); counters use existing `AnimatedCounter`. |
| CH. IV — PROOF | `ProjectGrid` + `TestimonialsSection` | agencidev sticky-stack: cards peel over previous section (scale 0.95 + fade underneath). Testimonials cross-fade film cuts (cosmos pacing: hold → scrub → cut). |
| CH. V — CONTACT | `CTASection` + `NewsletterSection` | Cuberto ribbon + magnetic CTA finale. |

Plus:
- **`ChapterMarker` component** — `(CH. N) — TITLE` with mask-reveal; doubles as `aria-hidden` decorative layer over real `<h2>` semantics.
- **`ChapterProgress` rail** (right edge, desktop): five dots + thin progress line, click-to-scroll (Lenis `scrollTo`, native `scrollIntoView` fallback). Keyboard reachable, `aria-label="Page chapters"`.
- **Pacing law (cosmos):** every chapter = hold (static beauty) → scrub (30–60% scroll-linked) → cut (fast, Sharp easing). Never a constant-speed animation soup.
- **Pasqua's preloader is explicitly NOT copied** — fake preloaders were removed in S-013 and remain forbidden. Decode the *chapter feeling*, not the loading screen.

### F3 — Projects Index "Gallery Flow" (`/portfolio`) — animejs + demilie + cuberto
1. Grid entrance: anime.js-style orchestrated stagger (60ms cascade, Entrance easing) via ScrollTrigger `batch`.
2. **Velocity shear** (demilie): cards skew/shear up to 3° proportional to Lenis scroll velocity, lerped back to 0 at rest. Fine-pointer + full-motion only.
3. Cursor morphs to "View project →" over cards (F1 integration).
4. Filter changes animate via FLIP (GSAP Flip plugin), not re-mount jumps.

### F4 — Project Detail "Chaptered Case Study" (`/portfolio/[slug]`) — raven + bdsn + scoutmotors + theirisk + animejs
The signature deliverable. Every project page becomes a numbered cinematic dossier:

1. **Chapter structure** (raven): `01 HERO → 02 BRIEF → 03 EXPERIENCE (3D) → 04 DETAILS → 05 NEXT`. Full-viewport sections with **side pagination dots (01–05)** — active state syncs via ScrollTrigger; click scrolls; visible focus rings; `<nav aria-label="Case study chapters">`.
2. **Gentle snap, never scroll-jack:** CSS `scroll-snap-type: y proximity` (not `mandatory`), Lenis-compatible; disabled entirely under reduced motion. The user always wins the fight for the wheel.
3. **02 BRIEF** (bdsn): editorial rhythm — oversized index numerals, alternating text/media, generous whitespace; metadata rows rise with 80ms stagger.
4. **03 EXPERIENCE** (scoutmotors + theirisk): pinned viewport where the project's 3D model (or cover-image parallax fallback per existing WebGL fallback policy) is scrubbed through 2–3 camera states with per-chapter lighting shifts (theirisk). Delta-based motion, GLTF from cache, offscreen paused, tier-gated.
5. **04 DETAILS** (animejs): specs/stats grid with orchestrated timeline stagger + `AnimatedCounter`.
6. **05 NEXT** (raven): next-project footer — hovering charges a progress ring; click portals to the next case study (F6 transition).

### F5 — Blog "Portal Editorial" (`/blog`, `/blog/[slug]`) — activetheory + demilie
1. Index cards: mask-reveal images, velocity shear (shared F3 utility), cursor "Read →" morph.
2. Article hero: title mask-reveal + reading-progress hairline (top edge, `transform: scaleX`).
3. Entering an article uses the F6 portal transition at its lightest setting.

### F6 — Portal Page Transitions (global) — activetheory + resn
1. **`PageTransitionProvider`** wrapping route content: exit = content scales to 0.98 + luminance dissolve; enter = portal bloom from the clicked element's position (View Transitions API where supported; Framer Motion `AnimatePresence` fallback).
2. Duration ≤ 900ms total (Page transition band, Transition easing). Route focus management preserved (focus moves to `main` — already implemented in S-013, do not regress).
3. Reduced motion: instant swap with 0.2s opacity crossfade only.
4. Optional tier-gated particle dissolve (activetheory) on `high` quality only, budgeted ≤ 4ms/frame.

---

## 4. Hard Constraints (Non-Negotiable)

1. **Motion Policy supremacy** — every effect consults `useMotionPolicy()`; full compliance with the Reduced-Motion and Coarse-Pointer behavior matrices in `MOTION_SYSTEM.md` (parallax/cursor/magnetic/shear/snap OFF where mandated; chapters render as clean static sections).
2. **GSAP contract** — all tweens inside `gsap.context()` + `ctx.revert()` on unmount; every RAF cancelled; ScrollTriggers killed on route change; no module-scope timelines.
3. **Performance budget** — LCP < 1.2s, CLS < 0.1, stable 60fps (p95 frame < 16.7ms), initial JS < 200KB. All scroll-cinema code below the fold is `dynamic()`-imported; shaders/particles lazy + tier-gated; only `transform`/`opacity` animate; **never `transition-all`**.
4. **No fake preloaders. No scroll-jacking.** Proximity snap only; wheel/keyboard/touch always responsive.
5. **Accessibility** — WCAG 2.1 AA: chapter navs are real `<nav>`, dots are buttons with labels, content order logical without JS, all media has alt, keyboard path for every pointer interaction, focus management preserved.
6. **i18n/RTL** — chapter rails, marquees, and directional reveals mirror correctly for `ar` locale; markers use localizable strings.
7. **SSR safety** — zero `window` access during render; scroll features initialize in effects; graceful no-JS content.
8. **Type safety** — strict TS, no `any`, shared types where applicable; easings/durations imported from `src/lib/motion.ts` tokens only.
9. **Architecture** — new primitives live in `src/components/animation/` or `src/components/ui/`; feature-specific choreography lives in the owning feature folder; document any architectural addition in the Playbook.

---

## 5. Execution Plan

| Phase | Scope | Exit Criteria |
|-------|-------|---------------|
| **P0 — Foundation** | Audit `motion.ts` tokens; add `useScrollVelocity`, `ChapterMarker`, `ChapterProgress`, `CursorFollower`, magnetic button primitives | Primitives unit-tested; policy-compliant; zero regressions in existing 112+ tests |
| **P1 — Global DNA (F1, F6)** | Cursor, magnetic CTAs, ribbon, portal transitions | Route transitions < 900ms; focus management verified; reduced-motion instant swap |
| **P2 — Homepage Scroll Cinema (F2)** | Five-chapter choreography, liquid veil, sticky-stack, chapter rail | Lighthouse ≥ 95 all categories; 60fps scrub on mid-tier hardware |
| **P3 — Projects (F3, F4)** | Gallery flow + chaptered case study with pinned 3D scrub | Snap is proximity-gentle; 3D honors quality tiers + WebGL fallback |
| **P4 — Blog (F5) + polish** | Portal editorial, micro-interaction pass (webflow pool) | Cursor morphs, progress hairline, velocity shear shared util |
| **P5 — Creative Excellence Report** | Full QA: `npm run lint` → `npm run typecheck` → `npm run test`; Lighthouse; real-device sweep; a11y regression; luxury scoring | Every surface scored ≥ 9.5/10 with per-feature rubric; report filed in `15-QUALITY/` |

Work one phase per PR. Never merge a phase that degrades an existing gate.

---

## 6. Output Format (per phase)

1. **Design intent** — 3–5 sentences: the feeling, the reference decoded, the HEXA re-expression.
2. **Implementation** — strict-TS code following `CODING_STANDARDS.md`, using existing primitives/tokens.
3. **Policy matrix proof** — table showing the feature's behavior under: full motion / reduced motion / paused / coarse pointer / low quality tier / no JS.
4. **Verification evidence** — gate results (lint, typecheck, test), fps/LCP numbers, a11y notes.
5. **Luxury score** — self-scored rubric (below) with justification; anything < 9.5 iterates before review.

## 7. Quality Gate — Definition of Done

- [ ] All six feature layers behave per spec on desktop fine-pointer, touch, reduced-motion, paused, and low-tier GPU.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test` — zero errors; no existing test regressions.
- [ ] Lighthouse ≥ 95 (Performance / A11y / Best Practices / SEO) on `/`, `/portfolio`, `/portfolio/[slug]`, `/blog`.
- [ ] LCP < 1.2s · CLS < 0.1 · 60fps scrub · initial JS < 200KB · zero console errors · zero leaked RAF/ScrollTrigger/Lenis handlers after route change.
- [ ] RTL (`ar`) mirror verified for rails, marquees, directional reveals.
- [ ] Luxury rubric ≥ 9.5/10 per surface: *Craft* (easing/stagger precision), *Narrative* (chapter pacing), *Restraint* (no animation soup), *Cohesion* (one visual language), *Delight* (signature moments).
- [ ] Playbook updated: `MOTION_SYSTEM.md` (new patterns), `COMPONENT_GUIDE.md` (new primitives), `CURRENT_SPRINT.md` (deliverables).

---

*"Scroll is not navigation. Scroll is the camera, and every page is a film."*
