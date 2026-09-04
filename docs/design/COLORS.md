# 🎨 COLORS: THE LUXURY PALETTE

**Version:** 2.0.0  
**Last Updated:** 2026-09-04  
**Scope:** Design → Frontend  
**Standard:** High-Contrast / Premium

---

## 1. THE COLOR PHILOSOPHY

Our palette is designed to evoke **prestige, precision, and depth**. We avoid overly saturated colors in favor of a sophisticated, monochromatic base with surgical use of accent colors.

The current design system uses the **Silent Luxury** theme — understated elegance with a barely-there gold accent that reveals itself only on hover/focus and at key interaction moments.

---

## 2. THE CORE PALETTE

### I. The "Void" Base (Neutrals)

These colors provide the depth and structure of the launch.

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `--sl-void` | `#0A0A0B` | Primary background. Pure depth. |
| `--sl-obsidian` | `#121214` | Surface level / cards. |
| `--sl-stone` | `#1C1C1F` | Secondary surfaces. |
| `--sl-alabaster` | `#F5F4F2` | Primary headings and high-contrast elements. |
| `--sl-silver` | `#A8A8A8` | Secondary text and icons. |
| `--sl-mist` | `#D4D4D4` | Body text / captions. |
| `--sl-warm-neutral` | `#E8E6E3` | Subtle accents. |

### II. The "Precision" Accents

Used sparingly to guide the eye and highlight critical actions.

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `--sl-gold-subtle` | `rgba(212, 175, 55, 0.15)` | Subtle gold background (barely there). |
| `--sl-gold-hover` | `rgba(212, 175, 55, 0.3)` | Hover state gold border. |
| `--sl-gold-rgb` | `212, 175, 55` | RGB variant for `rgba()` construction. |

### III. Canonical Gold

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `GOLD` (TS) | `#D4AF37` | Canonical gold — primary CTA, 3D accents. Mirrors `--sl-gold-rgb`. |
| `GOLD_BRIGHT` (TS) | `#E5C76B` | Bright gold for highlights. |
| `GOLD_DEEP` (TS) | `#A8862E` | Deep gold for shadows/emphasis. |

### IV. Legacy References

| Color Name | Hex Value | Status |
|------------|-----------|--------|
| Hexa Gold | `#D4AF37` | ✅ Still canonical (`GOLD` constant mirrors this). |
| Electric Silver | `#C0C0C0` | ⚠️ Replaced by `--sl-silver` / `--sl-mist`. |
| Warning Crimson | `#B22222` | ✅ Retained for error states. |

---

## 3. TOKEN MAPPING (CSS / TypeScript)

### CSS Tokens (UI)

| Token Name | Color | Usage |
|------------|-------|-------|
| `--sl-void` | `#0A0A0B` | Main Background |
| `--sl-obsidian` | `#121214` | Cards / Modals |
| `--sl-stone` | `#1C1C1F` | Secondary surfaces |
| `--sl-alabaster` | `#F5F4F2` | Headings / Primary Text |
| `--sl-silver` | `#A8A8A8` | Body Text / Captions |
| `--sl-mist` | `#D4D4D4` | Secondary text |
| `--color-accent` | `#D4AF37` | Primary Buttons / Highlights |
| `--color-border` | `#333333` | Dividers / Outlines |

### TypeScript Tokens (3D / WebGL)

Defined in `src/lib/color-tokens.ts` — mirrors CSS variables for contexts where `var()` is unavailable (Three.js `Color`, shader uniforms, canvas rendering):

| Export | Hex Value | CSS Equivalent |
|--------|-----------|----------------|
| `VOID` | `#0A0A0B` | `--sl-void` |
| `VOID_DEEP` | `#020203` | (deeper than `--sl-void`) |
| `OBSIDIAN` | `#0F0F10` | `--sl-obsidian` |
| `OBSIDIAN_RAISED` | `#161618` | `--sl-stone` |
| `SURFACE` | `#1A1A1A` | Surface level |
| `SURFACE_LIGHT` | `#262626` | Lighter surface |
| `SURFACE_DARK` | `#030303` | Darker surface |
| `FOREGROUND` | `#FFFFFF` | Text primary |
| `GOLD` | `#D4AF37` | `--color-accent` |
| `GOLD_BRIGHT` | `#E5C76B` | Gold highlight |
| `GOLD_DEEP` | `#A8862E` | Gold shadow |

---

## 4. APPLICATION RULES

### I. The 60-30-10 Rule
- **60%** Void Black (`#0A0A0B`): Primary background and negative space.
- **30%** Obsidian/Stone (`#121214`/`#1C1C1F`): Secondary surfaces and structure.
- **10%** Gold/Alabaster: Accents, highlights, and typography.

### II. Contrast & Accessibility
- All text must meet **WCAG AA** contrast ratios against its background.
- The gold accent (`rgba(212, 175, 55)`) is used at low opacity for subtle effects and at full opacity (`#D4AF37`) for primary CTAs.
- `sl-warm-neutral` (`#E8E6E3`) is used on hover to provide a warm transition against the cool void base.

---

## 5. QUALITY GATE: COLOR AUDIT

A page is "Color-Done" only when:
- [ ] The 60-30-10 rule is respected.
- [ ] No "non-palette" colors are used (no random hex codes in CSS).
- [ ] Contrast ratios are verified for accessibility.
- [ ] The gold accent is used surgically, not excessively.
- [ ] `node scripts/check-design-tokens.mjs` passes with 0 violations (no `--allow-inline-style-hex` flag needed).

*“Luxury is the absence of noise. Use color to create silence, not clutter.”*

---

## 6. 3D SCENE COLORS (Separate Rendering Domain)

Three.js / React Three Fiber material and lighting colors (e.g., scene presets, hotspot markers, shader uniforms, status lights) are a **separate rendering domain** from the UI palette. They are deliberately allowed to use physical lighting values (emissive tones, material albedo, fog color) that extend beyond the 2D UI tokens.

**Policy:**
- UI-facing classes/styles MUST use tokens (never `bg-[#hex]` arbitrary values).
- 3D material/lighting hex values in scene configs (`lighting-presets.ts`, `material-presets.ts`, Three.js `color` props) are exempt but SHOULD prefer the gold family (`#D4AF37` / `#E5C76B`) for accent/CTAs.
- Status semantics in 3D (e.g., `#7BA7FF` blue = in-review, `#9B8CFF` violet = early pipeline) are intentional and documented in the scene layer.

*Audit note (Aug 9 2026): UI-token compliance was enforced across all dashboard/portal/XR surfaces; 3D scene presets retain intentional lighting values by design.*
