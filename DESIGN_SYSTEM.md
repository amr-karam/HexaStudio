# 🎨 HEXA STUDIO — DESIGN SYSTEM & VISUAL GOVERNANCE

**Version:** 1.0.0  
**Authority Level:** 4  
**Scope:** Design Tokens, Color Palettes, Typography, Spacing Scale, & Motion System  

---

## 1. THE 60-30-10 COLOR RULE

HEXA STUDIO enforces a strict 60-30-10 architectural color balance across all web and mobile interfaces:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 60% — VOID BLACK (#050505 / #020203)                                        │
│ Primary background, negative space, atmospheric depth                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 30% — OBSIDIAN & SLATE (#0F0F10 / #161618 / #1A1A1A)                        │
│ Surface level cards, elevated panels, glassmorphism backdrops, dividers     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 10% — HEXA SIGNATURE GOLD (#D4AF37 / #E5C76B) & PURE WHITE                  │
│ Primary CTAs, active indicators, highlights, luxury typography accents      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DESIGN TOKENS MATRIX

### A. Color Palette
| Token Name | Hex Code | CSS Variable | Tailwind Utility | Purpose |
|------------|----------|--------------|------------------|---------|
| `void` | `#050505` | `--color-void` / `--color-background` | `bg-background` | Canvas background |
| `voidDeep` | `#020203` | `--color-void-deep` | `bg-void-deep` | Immersive 3D backdrop |
| `obsidian` | `#0F0F10` | `--color-obsidian` | `bg-obsidian` | Surface level 1 (Cards, Sidebar) |
| `obsidianRaised` | `#161618` | `--color-obsidian-raised` | `bg-obsidian-raised` | Surface level 2 (Hover cards, Modals) |
| `slate` | `#1A1A1A` | `--color-slate` / `--color-surface` | `bg-surface` | Standard border & divider |
| `gold` | `#D4AF37` | `--color-gold` / `--color-accent` | `bg-accent`, `text-accent` | HEXA Signature Gold CTA & Active Badges |
| `goldBright` | `#E5C76B` | `--color-gold-bright` / `--color-accent-light` | `text-accent-light` | Lighter gold accent / Shimmer |
| `goldDeep` | `#A8862E` | `--color-gold-deep` / `--color-accent-dark` | `bg-accent-dark` | Pressed button state |
| `textPrimary` | `#FFFFFF` | `--color-text-primary` / `--color-foreground` | `text-foreground` | Headings & high-contrast titles |
| `textSecondary` | `#A0A0A0` | `--color-text-secondary` | `text-text-secondary` | Body text & captions |
| `textMuted` | `#6A6A6E` | `--color-text-muted` | `text-text-muted` | Metadata, timestamps, & subtitled text |

> **Note**: Legacy aliases (`--color-background`, `--color-accent`, etc.) are preserved for backward compatibility. New work should prefer the canonical `DESIGN_SYSTEM.md` names (`--color-void`, `--color-gold`, etc.).

### B. Typography Scale (Google Fonts)
- **Headings**: `Playfair Display` (Serif, italic accents) → `--font-serif`
- **Body & UI**: `Inter` (Sans-serif, clean legibility) → `--font-sans`
- **Monospace & Metadata**: `JetBrains Mono` (Timestamps, code, IDs) → `--font-mono`

### C. Typography Scale & Editorial Tracking

**Font families** (Google Fonts):
- **Headings**: `Playfair Display` (Serif, italic accents) → `--font-serif`
- **Body & UI**: `Inter` (Sans-serif, clean legibility) → `--font-sans`
- **Monospace & Metadata**: `JetBrains Mono` (Timestamps, code, IDs) → `--font-mono`

**Tracking (letter-spacing) — editorial consistency rules:**

| Context | Token / Value | Usage |
|---------|--------------|-------|
| Serif display headings | `tracking-tighter` / `tracking-[-0.04em]` | Large serif titles (h1, h2) — tight, modern, dramatic |
| Mono labels (eyebrows, section markers) | `tracking-[0.4em]` / `tracking-[0.5em]` | `§ 01`, `01 — SERVICE`, nav items — wide, editorial, refined |
| Mono small labels (badges, pills) | `tracking-[0.2em]` / `tracking-[0.25em]` | Status chips, file-type plates, footer metadata |
| Mono medium labels (nav, sidebar) | `tracking-[0.3em]` / `tracking-[0.35em]` | Portal nav items, mobile overlay links |
| All-caps sans labels | `tracking-wider` | UI chrome, button labels, section overline text |
| Body text | Default (0) | Never apply manual tracking to body copy |

**Leading (line-height) — readability hierarchy:**

| Context | Value | Usage |
|---------|-------|-------|
| Serif display headings | `leading-[0.9]`–`leading-[1.05]` | Tight, poster-like impact (h1, h2) |
| Serif sub-headings | `leading-tight` / `leading-relaxed` | h3, editorial labels |
| Body copy (Inter) | `leading-relaxed` / `leading-[1.8]` | Long-form reading, storybook body |
| Mono metadata | `leading-normal` / default | Timestamps, IDs, inline labels |

> **Typography rule**: Headings use tight tracking/leading for dramatic poster-like presence; mono labels use wide tracking for editorial refinement; body copy never gets manual tracking. The tracking values documented above are the canonical editorial scale — deviate only with design justification.

### D. Motion Tokens (Easing & Duration)

Canonical easing curves (`:root` in `globals.css`, canonical source `src/lib/motion.ts`, compatibility re-export `src/lib/motion/tokens.ts`):

| Token | Curve | Purpose |
|-------|-------|---------|
| `--hexa-ease-entrance` | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth deceleration — entrances, reveals, staggers |
| `--hexa-ease-interaction` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy spring — button hover, tooltips, magnetic |
| `--hexa-ease-transition` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Balanced — modal opens, page slides |
| `--hexa-ease-sharp` | `cubic-bezier(0.4, 0, 0.6, 1)` | Fast, precise — error messages, toggles |
| `--hexa-ease-cinematic` | `cubic-bezier(0.76, 0, 0.24, 1)` | Symmetric cinematic — page transitions, preloader |

Durations (`:root`, canonical source `src/lib/motion.ts`, compatibility re-export `src/lib/motion/tokens.ts`):

| Token | Value | Purpose |
|-------|-------|---------|
| `--hexa-duration-micro` | `0.2s` | Hover states, cursor feedback |
| `--hexa-duration-component` | `0.4s` | UI chrome, curtain cover/reveal, magnetic settle |
| `--hexa-duration-scene` | `0.8s` | Scene-scale movement, hero imagery |
| `--hexa-duration-transition` | `0.7s` | Full page-transition envelope |
| `--hexa-duration-page` | `0.75s` | Page-level transitions |
| `--hexa-duration-camera` | `1.4s` | 3D camera moves |

> **Rule**: Never use raw `cubic-bezier(...)` or linear `ease` in components. The `check-design-tokens.mjs` gate enforces this (canonical sources exempt). Stagger intervals live in `src/lib/motion/tokens.ts` (`STAGGER_TOKENS.chars/cards/lines`) — no CSS mirror.

---

## 3. SPACING & LAYOUT SCALE

Spacing follows the 8px grid scale (now fully implemented in `@theme`):
- `xs`: 4px | `sm`: 8px | `md`: 12px | `lg`: 16px | `xl`: 24px | `2xl`: 32px | `3xl`: 48px | `4xl`: 64px | `5xl`: 96px | `6xl`: 128px | `7xl`: 192px | `8xl`: 256px | `9xl`: 320px

> **Implementation**: `--spacing-xs` through `--spacing-9xl` in `globals.css` `@theme`. Note: most components use Tailwind's default numeric scale (`p-4`, `gap-8`); the T-shirt scale is reserved for semantic spacing tokens.

---

## 4. DESIGN RULES & FORBIDDEN PATTERNS

- **No Generic Colors**: Plain red/blue/green are strictly forbidden. Use HSL/Hex tailored luxury tokens (`#D4AF37`, `#22C55E`, `#EF4444`).
- **No Ad-Hoc Utilities**: All component styles MUST use defined tokens.
- **Glassmorphism**: Backdrop blur MUST use `backdrop-blur-xl` combined with `border-white/10` or `border-gold/30`.

---

## 5. SINGLE SOURCE OF TRUTH (Aug 2026 — ADR-013)

The HEXA STUDIO design system has **one canonical implementation**: `apps/frontend/`.

- **Tokens**: `apps/frontend/src/app/globals.css` (`@theme` + `:root`), `apps/frontend/src/styles/artisan-tokens.css`, `apps/frontend/src/lib/motion/tokens.ts`
- **Primitives**: `apps/frontend/src/components/ui/`
- **Enforcement**: `scripts/check-design-tokens.mjs` (integrated into frontend lint via `--allow-inline-style-hex`)
- **Archived**: `packages/ui` (Navy/Indigo system) retired per [ADR-013](../docs/adr/013-retire-packages-ui.md) — moved to `docs/adr/archive/packages-ui-snapshot/`

All new design work targets the `apps/frontend` token namespace and component library.
