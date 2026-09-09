# Design Tokens: HEXA Vision

**Version:** 2.0.0  
**Last Updated:** 2026-09-04  
**Source of Truth:** `apps/frontend/src/styles/silent-luxury-tokens.css` + `apps/frontend/src/lib/color-tokens.ts`

All tokens are implemented as CSS variables in `apps/frontend/src/styles/silent-luxury-tokens.css` (Silent Luxury theme) with a TypeScript mirror at `src/lib/color-tokens.ts` for Three.js/WebGL contexts where CSS `var()` is unavailable.

---

## 1. Silent Luxury Color Tokens (`sl-*`)

### Core Palette

| Token | Value (Dark) | Usage |
|-------|-------------|-------|
| `--sl-void` | `#0A0A0B` | Primary background (deepest) |
| `--sl-obsidian` | `#121214` | Surface level / cards |
| `--sl-stone` | `#1C1C1F` | Secondary surface |
| `--sl-alabaster` | `#F5F4F2` | Primary text / headings |
| `--sl-silver` | `#A8A8A8` | Secondary text |
| `--sl-mist` | `#D4D4D4` | Body text / captions |
| `--sl-warm-neutral` | `#E8E6E3` | Subtle accents |

### Gold Accents

| Token | Value | Usage |
|-------|-------|-------|
| `--sl-gold-subtle` | `rgba(212, 175, 55, 0.15)` | Subtle gold background / understated highlights |
| `--sl-gold-hover` | `rgba(212, 175, 55, 0.3)` | Hover state gold border |
| `--sl-gold-rgb` | `212, 175, 55` | RGB variant for `rgba()` construction |

### TypeScript Mirror (`color-tokens.ts`)

For Three.js materials, shader uniforms, `PointsMaterial`, canvas `fillStyle`/`strokeStyle`, and any context where CSS `var()` is not supported:

| Export | Value | CSS Equivalent |
|--------|-------|----------------|
| `VOID` | `#0A0A0B` | `--sl-void` |
| `VOID_DEEP` | `#020203` | (deeper than `--sl-void`) |
| `OBSIDIAN` | `#0F0F10` | `--sl-obsidian` (slightly different: `#121214`) |
| `OBSIDIAN_RAISED` | `#161618` | `--sl-stone` |
| `SURFACE` | `#1A1A1A` | Surface level |
| `SURFACE_LIGHT` | `#262626` | Lighter surface |
| `SURFACE_DARK` | `#030303` | Darker surface |
| `FOREGROUND` | `#FFFFFF` | Text primary |
| `TEXT_PRIMARY` | `#FFFFFF` | Headings |
| `TEXT_SECONDARY` | `#A0A0A0` | Body text |
| `TEXT_MUTED` | `#6A6A6E` | Muted text |
| `GOLD` | `#D4AF37` | Canonical gold (primary CTA) |
| `GOLD_BRIGHT` | `#E5C76B` | Bright gold |
| `GOLD_DEEP` | `#A8862E` | Deep gold |
| `GOLD_RGB` | `212, 175, 55` | RGB variant |

> **Note:** The `color-tokens.ts` values are the canonical token values. The `sl-*` CSS tokens in `silent-luxury-tokens.css` use CSS `rgba()` or `var()` for gold accents. For UI components, use `sl-*` CSS classes. For 3D/WebGL shaders, import from `color-tokens.ts`.

---

## 2. Typography Tokens

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--sl-heading-font` | `'Bodoni Moda', 'Cormorant Garamond', Georgia, serif` | Headings (luxury editorial Didone with italic) |
| `--sl-body-font` | `'Inter', system-ui, sans-serif'` | Body, UI, technical text |

### Typography Classes

| Class | Font | Weight | Use |
|-------|------|--------|-----|
| `sl-heading` | `var(--sl-heading-font)` | 300 | All headings |
| `sl-heading-display` | — | — | `clamp(3rem, 7vw, 5.5rem)` |
| `sl-heading-lg` | — | — | `clamp(2rem, 4vw, 3.25rem)` |
| `sl-heading-md` | — | — | `clamp(1.25rem, 2.5vw, 1.75rem)` |
| `sl-body` | `var(--sl-body-font)` | 300 | Body text |
| `sl-body-muted` | — | — | Muted text (`var(--sl-silver)`) |
| `sl-kicker` | `var(--sl-body-font)` | 400 | Uppercase section kicker |

### Font Preloads

All 7 font files are preloaded via `<link rel="preload" as="font" type="font/woff2">`:
- Cormorant Garamond (normal + italic, 4 weight variants)
- Jost (4 weight variants)
- Inter (variable, preloaded via Google Fonts)

Verified via `scripts/check-font-preloads.mjs` — all 7 preloads match.

---

## 3. Spacing & Layout Tokens

### Spacing Scale

| Token | Value | Usage |
|-------|-------|--------|
| `--spacing-xs` | `0.25rem` | Tight groupings |
| `--spacing-sm` | `0.5rem` | Small gaps |
| `--spacing-md` | `1rem` | Standard padding/margin |
| `--spacing-lg` | `1.5rem` | Large gaps |
| `--spacing-xl` | `2rem` | Section spacing |

### Radius Scale

| Token | Value | Usage |
|-------|-------|--------|
| `--radius-sm` | `0.125rem` | Small inputs |
| `--radius-md` | `0.25rem` | Standard components |
| `--radius-lg` | `0.5rem` | Cards/Modals |
| `--radius-full` | `9999px` | Pill buttons/Avatars |

---

## 4. Elevation & Effects

### Shadows

| Token | Type | Value |
|-------|------|-------|
| `--shadow-sm` | Subtle | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--shadow-md` | Standard | `0 4px 6px -1px rgb(0 0 0 / 0.1)` |
| `--shadow-lg` | Deep | `0 10px 15px -3px rgb(0 0 0 / 0.1)` |
| `--shadow-glass` | Glass | `0 8px 32px 0 rgba(0, 0, 0, 0.37)` |

### Silent Luxury Glass Morphism

| Token | Value |
|-------|-------|
| `--sl-glass-bg` | `rgba(245, 244, 242, 0.02)` |
| `--sl-glass-border` | `rgba(245, 244, 242, 0.06)` |
| `--sl-glass-border-hover` | `rgba(212, 175, 55, 0.12)` |
| `--sl-glass-blur` | `32px` |
| `--sl-glass-shadow` | `0 0 0 1px rgba(245, 244, 242, 0.03), 0 12px 40px rgba(0, 0, 0, 0.3)` |

---

## 5. Animation & Motion Tokens

### Silent Luxury Easing

| Token | Value | Use Case |
|-------|-------|----------|
| `--sl-ease-entrance` | `cubic-bezier(0.22, 1, 0.36, 1)` | Page loads, hero entrance |
| `--sl-ease-interaction` | `cubic-bezier(0.32, 1.1, 0.64, 1)` | Button hover, tooltips |
| `--sl-ease-transition` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Modal opens, page slides |

### Silent Luxury Durations

| Token | Value | Use Case |
|-------|-------|----------|
| `--sl-duration-micro` | `0.3s` | Micro-interactions |
| `--sl-duration-ui` | `0.5s` | Component transitions |
| `--sl-duration-scene` | `1s` | Scene transitions |
| `--sl-duration-page` | `0.9s` | Page transitions |
| `--sl-duration-parallax` | `1.2s` | Parallax/scrim effects |

---

## 6. Token Validation

The design token gate (`scripts/check-design-tokens.mjs`) enforces that all UI-facing components use canonical tokens. The gate passes with **0 violations** without the `--allow-inline-style-hex` suppression flag.

### Allowlist for Non-Tokenable Contexts

The following file types are exempt from token enforcement (they use raw hex/GLSL values legitimately):
- GLSL shaders (`PremiumShaders.tsx`, `SilkShaderBackground.tsx`, `ShaderGradient.tsx`)
- HDR lighting presets (`lighting-presets.ts`)
- Material swatch palettes (`material-presets.ts`, `DesignerModeConfigurator.tsx`)
- Procedural canvas generators (`fracture-ring-texture.ts`, `ConfettiBurst.tsx`)
- Three.js cursor colors (`CollaboratorAvatar.tsx`, `SpatialCursors.tsx`)
- Token definition files (`color-tokens.ts`)
- Fracture ring lighting (`FractureRingScene.tsx`)
- Layer store palette (`layer-store.ts`)
- Storybook ornaments (`BookOrnaments.tsx`)

### Quality Gates

| Gate | Command | Status |
|------|---------|--------|
| Design Tokens | `node scripts/check-design-tokens.mjs` | ✅ 0 violations (no suppression flag) |
| Font Preloads | `node scripts/check-font-preloads.mjs` | ✅ All 7 match |
| ESLint | `npm run lint` | ✅ 0 errors, 0 warnings |
| Typecheck | `npm run typecheck` | ✅ 0 errors |
| Tests | `npm run test` | ✅ 643/643 passing |

---

## 7. 3D Scene Colors (Separate Rendering Domain)

Three.js / React Three Fiber material and lighting colors (e.g., scene presets, hotspot markers, shader uniforms, status lights) are a **separate rendering domain** from the UI palette. They are deliberately allowed to use physical lighting values (emissive tones, material albedo, fog color) that extend beyond the 2D UI tokens.

**Policy:**
- UI-facing classes/styles MUST use tokens (never `bg-[#hex]` arbitrary values).
- 3D material/lighting hex values in scene configs (`lighting-presets.ts`, `material-presets.ts`, Three.js `color` props) are exempt but SHOULD prefer the gold family (`#D4AF37` / `#E5C76B`) for accent/CTAs.
- Status semantics in 3D (e.g., `#7BA7FF` blue = in-review, `#9B8CFF` violet = early pipeline) are intentional and documented in the scene layer.

*Audit note (Aug 9 2026): UI-token compliance was enforced across all dashboard/portal/XR surfaces; 3D scene presets retain intentional lighting values by design.*
