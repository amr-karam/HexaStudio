# 📚 Design References Library

**Version:** 1.0 | **Standard:** Creative Excellence Mode (9.5/10 Luxury)
**Purpose:** Curated index of internal design docs + vetted external resources for the HEXA stack. This is an **index**, not a restatement of the design system — read the canonical files for rules, definitions, and rationale.

---

## 1. Internal References Index

Authoritative table of topics → canonical files. Managed by `docs/design/README.md` (the manifest).

| Topic | Canonical File | Covers |
|-------|----------------|--------|
| Design manifest | `docs/design/README.md` | Authority over all files below |
| Design system | `docs/design/DESIGN_SYSTEM.md` | Design system authority (canonical entry) |
| Brand guidelines | `docs/design/BRAND_GUIDELINES.md` | Brand essence, logo, imagery, materiality |
| Colors | `docs/design/COLORS.md` | Luxury palette, 60-30-10 application rules |
| Design tokens (philosophy) | `docs/design/TOKENS.md` | Spacing, radius, elevation, glass, spring, silk tokens |
| Design tokens (technical) | `docs/design/DESIGN_TOKENS.md` | CSS-variable token reference for the frontend |
| Typography | `docs/design/TYPOGRAPHY.md` | Font stacks, "voice", letter-spacing rules |
| Component guide | `docs/design/COMPONENT_GUIDE.md` | Primitive → composite → pattern architecture |
| Component specs | `docs/design/component-*.md` | Per-component specs: 3d-canvas, button, card, input, modal, navbar |
| UX strategy | `docs/design/UX_STRATEGY.md` | Cinematic scroll, micro-interactions, navigation |
| Frontend excellence | `docs/design/FRONTEND_EXCELLENCE.md` | Binding 9.5/10 excellence contract |

---

## 2. External References Library

Three pillars of the Creative Excellence stack. Official docs first; at most 1–2 tutorials/community links per pillar. External links **supplement** — internal docs remain authoritative.

### 2.1 TailwindCSS 4

| Resource | URL | Why it matters (9.5/10 bar) |
|----------|-----|-----------------------------|
| Official docs | https://tailwindcss.com/docs | Source of truth for v4's native-CSS model (`@theme`, cascade layers) that our token→config mapping depends on. |
| Styling with utility classes | https://tailwindcss.com/docs/styling-with-utility-classes | The mental model that keeps handcrafted UI consistent — no one-off CSS, ever. |
| Colors | https://tailwindcss.com/docs/colors | Palette extension underpins the Void/Gold luxury palette in `COLORS.md`. |
| Theme variables (`@theme`) | https://tailwindcss.com/docs/theme | The bridge between our CSS custom properties and utility classes — critical for the token audit. |
| Typography plugin | https://tailwindcss.com/docs/typography-plugin | Clean prose rhythm that matches the Typography "voice" in `TYPOGRAPHY.md`. |
| v4 release notes | https://tailwindcss.com/blog/tailwindcss-v4 | Know what changed vs. v3 before touching any config. |
| shadcn/ui styling guide (community) | https://ui.shadcn.com/docs | Proven patterns for handcrafted, accessible components that match our "Sharp-Modern" craft. |

### 2.2 React Three Fiber / drei

| Resource | URL | Why it matters (9.5/10 bar) |
|----------|-----|-----------------------------|
| R3F docs | https://docs.pmnd.rs/react-three-fiber | The React renderer over Three.js — authoritative for the `ExperienceCanvas` architecture. |
| drei docs | https://drei.pmnd.rs | Production-ready helpers (`Environment`, `ContactShadows`…) that buy cinematic quality without reinventing wheels. |
| R3F GitHub | https://github.com/pmndrs/react-three-fiber | Source + examples; track breaking changes before upgrades. |
| Three.js docs | https://threejs.org/docs/ | The underlying engine — mandatory reading before custom shaders. |
| Three.js examples | https://threejs.org/examples/ | Reference for the silk-wave and glow effects defining the Void aesthetic. |
| R3F basics tutorial | https://docs.pmnd.rs/react-three-fiber/tutorials/basics | Canonical start for the "no state in canvas" performance rules. |
| gltfjsx (community) | https://github.com/pmndrs/gltfjsx | Turns architectural GLTF exports into declarative JSX — core to the ArchViz pipeline. |
| Three.js Journey (community) | https://threejs-journey.com/ | The industry's premium course; its production mindset matches the luxury bar. |

### 2.3 GSAP + Framer Motion

| Resource | URL | Why it matters (9.5/10 bar) |
|----------|-----|-----------------------------|
| GSAP docs | https://greensock.com/docs/ | Gold standard for scroll-driven timelines — pairs with the cinematic-scroll strategy in `UX_STRATEGY.md`. |
| GSAP getting started | https://greensock.com/get-started/ | Fast ramp on the exact GSAP 3/4 API surface we use. |
| GSAP ScrollTrigger | https://greensock.com/scrolltrigger/ | The engine behind scene-transition storytelling on scroll. |
| GSAP cheatsheet | https://greensock.com/cheatsheet/ | Quick lookup keeps motion consistent across the team. |
| Framer Motion docs | https://framer.com/motion | Declarative spring/physics API maps 1:1 to the spring tokens in `TOKENS.md`. |
| Motion (successor) React docs | https://motion.dev/docs/react | Framer Motion unified under Motion — new features land here first. |
| Motion examples gallery | https://motion.dev/examples | Copy-worthy micro-interaction patterns that reach the tactile 9.5/10 bar. |

---

## 3. Guidelines: Adding a Reference

### Internal references
1. **Verify before linking** — run Glob/`Test-Path` on every `docs/design/*.md` path; never invent file names.
2. **Manifest is authoritative** — if the topic map changes, update `docs/design/README.md` first, then mirror it here.
3. **Link, don't restate** — this file is an index; content belongs in the canonical docs.

### External references
1. **Vet every URL** — official docs preferred; allow at most 1–2 tutorials/community links per pillar.
2. **Confirm it resolves** and is stable (no version-anchored fragments that rot).
3. **Every link needs a "why it matters" note** tied to Creative Excellence (9.5/10) — the link must demonstrably raise craft.
4. **Keep 5–8 links per pillar** — prune instead of letting the list grow stale.

---

*This index is governed by `docs/design/README.md` (Design manifest).*
