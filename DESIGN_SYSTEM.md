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
| Token Name | Hex Code | Purpose |
|------------|----------|---------|
| `void` | `#050505` | Canvas background |
| `voidDeep` | `#020203` | Immersive 3D backdrop |
| `obsidian` | `#0F0F10` | Surface level 1 (Cards, Sidebar) |
| `obsidianRaised` | `#161618` | Surface level 2 (Hover cards, Modals) |
| `slate` | `#1A1A1A` | Standard border & divider |
| `gold` | `#D4AF37` | HEXA Signature Gold CTA & Active Badges |
| `goldBright` | `#E5C76B` | Lighter gold accent / Shimmer |
| `goldDeep` | `#A8862E` | Pressed button state |
| `textPrimary` | `#FFFFFF` | Headings & high-contrast titles |
| `textSecondary` | `#A0A0A0` | Body text & captions |
| `textMuted` | `#6A6A6E` | Metadata, timestamps, & subtitled text |

### B. Typography Scale (Google Fonts)
- **Headings**: `Playfair Display` (Serif, italic accents)
- **Body & UI**: `Inter` (Sans-serif, clean legibility)
- **Monospace & Metadata**: `JetBrains Mono` (Timestamps, code, IDs)

---

## 3. SPACING & LAYOUT SCALE

Spacing follows the **Golden Ratio (1.618)** and 8px grid scale:
- `xs`: 4px | `sm`: 8px | `md`: 12px | `lg`: 16px | `xl`: 24px | `2xl`: 32px | `3xl`: 48px | `4xl`: 64px

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
