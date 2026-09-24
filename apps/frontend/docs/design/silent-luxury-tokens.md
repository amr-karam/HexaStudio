# Silent Luxury Design Token System

## Overview

The Silent Luxury design system (`silent-luxury-tokens.css`) is a refined, minimalist design token architecture built around the hexastudio.net brand identity. It draws from the HEXA Studio Void Black (#0A0A0B) and Gold (#D4AF37) palette with deliberate, unhurried motion and understated elegance.

**Philosophy**: Luxury is restraint. Every token serves a purpose — nothing is decorative for its own sake.

---

## Color Tokens

### Core Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--sl-void` | `#0A0A0B` | Primary background |
| `--sl-obsidian` | `#121214` | Secondary surface |
| `--sl-stone` | `#1C1C1F` | Card/terciary surface |
| `--sl-alabaster` | `#F5F4F2` | Primary text |
| `--sl-silver` | `#A8A8A8` | Secondary text, labels |
| `--sl-mist` | `#D4D4D4` | Muted text, body copy |
| `--sl-warm-neutral` | `#E8E6E3` | Hover/active text |

### Gold Accent (Subtle)

| Token | Value | Usage |
|-------|-------|-------|
| `--sl-gold-subtle` | `rgba(212, 175, 55, 0.15)` | Background hints |
| `--sl-gold-hover` | `rgba(212, 175, 55, 0.3)` | Hover borders/focus |
| `--sl-gold-rgb` | `212, 175, 55` | RGBA compositing |

---

## Typography Scale

**Heading font**: `'Bodoni Moda', 'Cormorant Garamond', Georgia, serif`
- Luxury editorial Didone with italic
- Weight: 300 (light)
- Letter-spacing: -0.02em

**Body font**: `'Inter', system-ui, sans-serif`
- Weight: 300 (light)

### Heading Sizes

| Class | Size |
|-------|------|
| `.sl-heading-display` | `clamp(3rem, 7vw, 5.5rem)` |
| `.sl-heading-lg` | `clamp(2rem, 4vw, 3.25rem)` |
| `.sl-heading-md` | `clamp(1.25rem, 2.5vw, 1.75rem)` |
| `.sl-heading` | Uses font-family, weight 300 |

### Body Sizes

| Class | Size |
|-------|------|
| `.sl-body` | `clamp(1rem, 1.5vw, 1.125rem)`, line-height 1.75 |
| `.sl-body-muted` | Same as `.sl-body` with `--sl-silver` color |

---

## Easing Tokens

| Token | Cubic Bezier | Purpose |
|-------|-------------|---------|
| `--sl-ease-entrance` | `cubic-bezier(0.22, 1, 0.36, 1)` | Page loads, hero entrance |
| `--sl-ease-interaction` | `cubic-bezier(0.32, 1.1, 0.64, 1)` | Button hover, tooltips |
| `--sl-ease-transition` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Modal opens, page slides |

---

## Duration Tokens

| Token | Value | Purpose |
|-------|-------|---------|
| `--sl-duration-micro` | `0.3s` | Micro-interactions |
| `--sl-duration-ui` | `0.5s` | Component transitions |
| `--sl-duration-scene` | `1s` | Scene-scale movement |
| `--sl-duration-page` | `0.9s` | Page transitions |
| `--sl-duration-parallax` | `1.2s` | Mouse-follow parallax |

---

## Glass Morphism Tokens

| Token | Value |
|-------|-------|
| `--sl-glass-bg` | `rgba(245, 244, 242, 0.02)` |
| `--sl-glass-border` | `rgba(245, 244, 242, 0.06)` |
| `--sl-glass-border-hover` | `rgba(212, 175, 55, 0.12)` |
| `--sl-glass-blur` | `32px` |
| `--sl-glass-shadow` | `0 0 0 1px rgba(245, 244, 242, 0.03), 0 12px 40px rgba(0, 0, 0, 0.3)` |

---

## Utility Classes

### Layout
- `.sl-container` — `max-width: 1200px`, responsive padding
- `.sl-section` — Vertical padding `clamp(80px, 12vw, 160px)`
- `.sl-section-alt` — Dark background variant

### Components
- `.sl-glass` — Ultra-minimal glass with backdrop-filter
- `.sl-btn` — Premium understated button with gold hover
- `.sl-card` — Visa-card style project card
- `.sl-nav` — Fixed navigation with gradient fade
- `.sl-accent-line` — Gold hairline reveal on hover

### Typography
- `.sl-heading` — Heading text with brand font
- `.sl-body` / `.sl-body-muted` — Body copy
- `.sl-kicker` — Uppercase label text
- `.sl-section` / `.sl-section-alt` — Section spacing

### Effects
- `.sl-reveal` — Scroll fade-up animation (`@keyframes sl-fade-up`)
- `.sl-shimmer` — Slow gold shimmer (`@keyframes sl-shimmer`, 8s)
- `.sl-parallax` — Mouse-follow parallax
- `.sl-vignette` — Cinematic vignette overlay
- `.sl-grain` — Film grain texture overlay
- `.sl-divider` — Hairline divider with centered lozenge

### Modifiers
- `.sl-divider-dots` — Dotted variant
- `.sl-hero-center` — Center-aligned hero content

---

## Accessibility: Reduced Motion

All `.sl-reveal` animations collapse to `opacity: 1` when `prefers-reduced-motion: reduce` is active. Glass transitions and shimmer effects are also neutralized via `@media` queries.

---

## Relationship to Other Token Systems

- **`--sl-*`** tokens are consumed by TypeScript via `COLOR_TOKENS` in `src/lib/color-tokens.ts`
- **`--color-sl-*`** CSS variables (e.g., `--color-sl-void`) mirror the `sl-*` tokens for use in `radial-gradient` and other CSS constructs
- The `src/lib/gsap.ts` loader also provides motion tokens for GSAP timelines
- See `src/lib/motion.ts` for the canonical EASE/DURATION/STAGGER system used by Framer Motion
- See `src/styles/artisan-tokens.css` for the complementary Artisan Glassmorphism system
