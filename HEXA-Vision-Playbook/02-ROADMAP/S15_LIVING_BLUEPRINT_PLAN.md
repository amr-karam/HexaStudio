# SPRINT PLAN: THE LIVING BLUEPRINT (S-015 → S-018)

**Version:** 1.0 | **Created:** 2026-07-24 | **Status:** PROPOSED
**Governing docs:** ADR-008 (Persistent Experience Layer), FRONTEND_EXCELLENCE.md, MOTION_SYSTEM.md
**Reference analysis:** activetheory.net teardown (2026-07-24) — Hydra engine, GPU spline particles, mouse-fluid pass, persistent stage

---

## 1. THE VISION

**"Buildings that assemble themselves from light."**

A persistent WebGL world spanning the marketing routes (`/`, `/portfolio`, `/portfolio/[slug]`, `/studio`, `/services`, `/contact`). Champagne-gold particle streams (#C5A059 on obsidian #0A0A0A) flow along spline paths and condense into architectural wireframes as the user scrolls. Navigation is a camera flight, not a page load. The cursor bends nearby particle streams. Every effect obeys the motion policy, quality tiers, and performance budgets.

**Differentiation thesis:** Active Theory renders everything in GL and pays for it in SEO/a11y. We keep HTML as the document and use GL as atmosphere + signature moments — their feel, our discipline, and a concept (architecture assembling from particles) that is literally our brand story: *"Where vision takes shape."*

---

## 2. PHASED DELIVERY

Each sprint ships independently valuable, constitution-compliant work. No sprint leaves the site in a degraded state.

### SPRINT 15 — "The Engine" (GPU Particle System + New Hero)

The particle engine is the core asset; everything else builds on it. Ship it first inside the *current* per-route architecture (no restructure risk yet), replacing the home hero scene.

| ID | Deliverable | Notes |
|----|-------------|-------|
| S15-FX-001 | `features/experience/engine/ParticleSimulation.ts` — FBO ping-pong GPGPU simulation (position + velocity textures) | Curl noise drift + spline attraction + cursor force field inputs. Pure Three.js, no per-frame allocations |
| S15-FX-002 | Simulation shaders (`simulation.frag`, `render.vert/frag`) — points rendered as soft additive sprites, gold gradient LUT | Sizes: 256² (65k) high / 128² (16k) medium / low tier + reduced motion: not rendered (static gradient poster) |
| S15-FX-003 | `SplineField.ts` — Catmull-Rom spline sets defining flow paths; authored as JSON (mirrors AT's `-SPLINES.json` pattern) | First set: "hero vortex" — streams orbiting the hero headline |
| S15-FX-004 | Cursor force field — pointer velocity injected as radial impulse into velocity texture | Fine pointer + medium/high tier only (`useFinePointer`, `useQualityTier`) |
| S15-FX-005 | New `HomeHero` scene: particles replace `ShaderGradient`/`ParticleDust`; text/CTAs remain HTML | Existing parallax, TextReveal, Magnetic untouched |
| S15-FX-006 | Bloom pass tuned for gold-on-obsidian (threshold ~0.7, existing `PostProcessing` path) | High tier only, per QualityProvider |
| S15-QA-001 | Perf validation: 60 FPS p95 on M1 Air + mid-range Android; heap stable over 5 min | `usePerformanceMonitor` + manual device matrix |
| S15-QA-002 | Policy validation: reduced-motion → static poster; pause control freezes sim; coarse pointer → no force field | Behavior matrices in MOTION_SYSTEM.md |

**Exit criteria:** New hero live behind all gates; Lighthouse ≥95 maintained; bundle delta on `/` ≤ +15KB initial (engine lazy-loaded).

### SPRINT 16 — "The World" (Persistent Layer + Camera Navigation)

Execute ADR-008: restructure marketing routes into the `(experience)` route group with one persistent canvas.

| ID | Deliverable | Notes |
|----|-------------|-------|
| S16-AR-001 | `app/(experience)/` route group — move `/`, `/portfolio`, `/portfolio/[slug]`, `/studio`, `/services`, `/contact` | Server components unchanged; SEO/ISR untouched |
| S16-AR-002 | `ExperienceStage` — single persistent canvas in group layout; scene registry maps route → scene component + camera pose | Replaces per-route `LazySceneCanvas`/`AmbientScene` on these routes |
| S16-AR-003 | Camera choreography: route change → GSAP timeline (`DURATION.camera`, `EASE.entrance`) flying camera between poses; particle field morphs spline sets in transit | `PageTransition` bypassed inside group (experience-aware mode); curtain wipe remains elsewhere |
| S16-AR-004 | Scroll binding: Lenis progress → per-scene camera rail + simulation parameters | Scroll-driven, scrubbed; `behavior: auto` + snap under reduced motion |
| S16-AR-005 | Degradation contract: offscreen/hidden pause (existing pattern), context-lost recovery, WebGL-absent → current HTML-only pages | Must pass with canvas fully disabled |
| S16-QA-001 | E2E: single WebGL context across 20 in-group navigations; zero canvas on blog/dashboard/portal; bundle budgets green | Playwright + CI bundle check |

**Exit criteria:** Navigation between marketing routes is a camera flight with live simulation continuity; all ADR-008 verification items pass.

### SPRINT 17 — "The Story" (Living Blueprint Choreography)

The signature content: architecture assembling from particles, scroll as storytelling.

| ID | Deliverable | Notes |
|----|-------------|-------|
| S17-CX-001 | Wireframe target system: sample vertices/edges from a hero architectural model (existing Draco GLB pipeline) into attraction targets | Blueprint → structure morph driven by scroll progress |
| S17-CX-002 | Home scroll narrative: hero vortex → blueprint grid → structure assembly → dissolve into FeaturedWork | Section-mapped; HTML sections remain the content |
| S17-CX-003 | Portfolio transitions: card click → structure dissolves → camera flies → project scene assembles | Ties into existing `ProjectSceneWrapper` |
| S17-CX-004 | Per-route scene identities: studio (constellation/team), services (process flow lines), contact (calm convergence) | Shared engine, distinct spline sets — cheap variety |
| S17-QA-001 | Full-journey device matrix + motion policy audit across all scenes | 9.5/10 gate per FRONTEND_REINVENTION_GUIDE.md |

### SPRINT 18 — "The Polish" (Signature Details)

| ID | Deliverable | Notes |
|----|-------------|-------|
| S18-PX-001 | WebGL hover distortion on portfolio images (curtains-style plane displacement) | Fine pointer + medium/high tier |
| S18-PX-002 | Cursor integration: `CustomCursor` states drive force-field radius/strength | Existing `data-cursor` attributes |
| S18-PX-003 | Transition micro-moments: particle burst on CTA, convergence on form submit | Motion necessity test applies — cut what doesn't communicate |
| S18-PX-004 | Optional ambient audio (user-initiated, off by default, respects pause control) | Decide at sprint start; lowest priority |
| S18-QA-001 | Awwwards-readiness audit: full 9.5/10 matrix, Lighthouse, real-device sweep, a11y regression | Creative Excellence Report per FRONTEND_REINVENTION_GUIDE.md |

---

## 3. TECHNICAL GUARDRAILS (ALL SPRINTS)

1. **Budgets:** ≤200KB initial JS on all routes (engine + Three.js lazy-loaded post-LCP); LCP <1.2s; CLS <0.1; 60 FPS p95.
2. **Policy compliance:** every effect maps to the MOTION_SYSTEM.md behavior matrices — reduced motion (sim not rendered, static poster, camera snap), coarse pointer (no force field, no hover distortion), pause control (sim frozen at current state).
3. **Memory:** FBO textures, geometries, materials disposed on stage unmount; heap-snapshot check in QA each sprint.
4. **Timing:** all durations/easings from `src/lib/motion.ts` — no literals.
5. **Fallback ladder:** no WebGL → current HTML pages (zero loss of content/function); low tier → static gradient + CSS-only polish.

## 4. RISKS

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| GPGPU perf on mid-range mobile | Medium | Tier-scaled sim size (16k medium); low tier renders nothing; kill-switch env flag |
| Route-group restructure breaks ISR/SEO | Low | Route group changes no URLs; verify metadata + sitemap in CI before merge |
| Scope creep toward "GL everything" | Medium | ADR-008 scope is contractual; blog/dashboard/portal explicitly out |
| Two transition systems (wipe vs camera) drift | Medium | Single `TransitionOrchestrator` owns both paths; E2E covers both |

## 5. SUCCESS METRICS

- Lighthouse ≥95 all categories on all marketing routes (unchanged from today).
- 60 FPS p95 during heaviest transition on device matrix.
- Session duration and portfolio click-through uplift measured via PostHog after S-016 and S-017 (baseline captured pre-S-015).
- 9.5/10 on the FRONTEND_REINVENTION_GUIDE.md matrix at S-018 close.

---

*"Do not stop when it works. Stop only when the experience feels exceptional."*
