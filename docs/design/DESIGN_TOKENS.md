# Design Tokens: HEXA Vision

This document serves as the technical reference for the design tokens used across the HEXA Vision platform. All tokens are implemented as CSS variables in `apps/frontend/src/app/globals.css`.

## 1. Color Tokens

### Brand Palette
| Token | Value (Dark) | Value (Light) | Usage |
|--------|--------------|--------------|--------|
| `--brand-primary` | `#000000` | `#FFFFFF` | Primary brand identity, main actions |
| `--brand-secondary`| `#FFFFFF` | `#000000` | Secondary brand identity, high contrast |
| `--brand-accent` | `#6366f1` | `#6366f1` | Attention, highlights, interaction |

### Neutral Palette
| Token | Hex Value | Usage |
|--------|-----------|--------|
| `--neutral-white` | `#FFFFFF` | Absolute white |
| `--neutral-100` | `#F4F4F5` | Primary text (Light) / Background (Dark) |
| `--neutral-200` | `#E4E4E7` | Secondary text |
| `--neutral-300` | `#D4D4D8` | Tertiary text |
| `--neutral-400` | `#A1A1AA` | Muted text / Icons |
| `--neutral-500` | `#71717A` | Disabled state / Placeholders |
| `--neutral-600` | `#52525B` | Dark muted text |
| `--neutral-700` | `#3F3F46` | Dark secondary text |
| `--neutral-800` | `#27272A` | Dark tertiary text |
| `--neutral-900` | `#18181B` | Dark background surface |
| `--neutral-black` | `#000000` | Absolute black |

### Glassmorphism
| Token | Value | Usage |
|--------|------|--------|
| `--glass-bg` | `rgba(255, 255, 255, 0.03)` | Translucent surfaces |
| `--glass-border` | `rgba(255, 255, 255, 0.08)` | Subtle surface edges |
| `--glass-blur` | `blur(12px)` | Backdrop blur strength |

## 2. Typography Tokens

### Families
- **Sans:** `'Inter', system-ui, sans-serif` (UI, Body, Technical)
- **Display:** `'Outfit', system-ui, sans-serif` (Headings, Hero, Branding)

### Scale (CSS Logic)
- **H1:** `text-5xl` $\rightarrow$ `3rem` / `48px`
- **H2:** `text-3xl` $\rightarrow$ `1.875rem` / `30px`
- **H3:** `text-xl` $\rightarrow$ `1.25rem` / `20px`
- **Body:** `text-base` $\rightarrow$ `1rem` / `16px`
- **Small:** `text-xs` $\rightarrow$ `0.75rem` / `12px`

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

## 4. Elevation & Effects

### Shadows
| Token | Type | Value |
|-------|------|-------|
| `--shadow-sm` | Subtle | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--shadow-md` | Standard | `0 4px 6px -1px rgb(0 0 0 / 0.1)` |
| `--shadow-lg` | Deep | `0 10px 15px -3px rgb(0 0 0 / 0.1)` |
| `--shadow-glass` | Glass | `0 8px 32px 0 rgba(0, 0, 0, 0.37)` |

## 5. Animation Tokens
| Token | Duration | Easing | Use Case |
|-------|-----------|--------|-----------|
| `--anim-fast` | `150ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover, active states |
| `--anim-standard`| `300ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transitions, modals |
| `--anim-slow` | `500ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Page transitions |
| `--anim-cinematic`| `800ms` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Hero animations, camera |
