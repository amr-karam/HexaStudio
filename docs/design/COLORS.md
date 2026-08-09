# 🎨 COLORS: THE LUXURY PALETTE

**Version:** 1.0 | **Scope:** Design $\rightarrow$ Frontend | **Standard:** High-Contrast / Premium

## 1. THE COLOR PHILOSOPHY
Our palette is designed to evoke **prestige, precision, and depth**. We avoid overly saturated colors in favor of a sophisticated, monochromatic base with surgical use of accent colors.

---

## 2. THE CORE PALETTE

### I. The "Void" Base (Neutrals)
These colors provide the depth and structure of the lauch.
- **Void Black (`#050505`):** The primary background. Pure depth.
- **Obsidian (`#1A1A1A`):** For surface levels and cards.
- **Slate Gray (`#333333`):** For secondary text and borders.
- **Pure White (`#FFFFFF`):** For primary headings and high-contrast elements.

### II. The "Precision" Accents
Used sparingly to guide the eye and highlight critical actions.
- **Hexa Gold (`#D4AF37`):** The signature of luxury. Used for primary CTAs and highlights.
- **Electric Silver (`#C0C0C0`):** Used for technical details and secondary accents.
- **Warning Crimson (`#B22222`):** Used exclusively for critical errors.

---

## 3. APPLICATION RULES

### I. The 60-30-10 Rule
- **60% Void Black:** Primary background and negative space.
- **30% Obsidian/Slate:** Secondary surfaces and structure.
- **10% Hexa Gold/White:** Accents, highlights, and typography.

### II. Contrast & Accessibility
- All text must meet **WCAG AA** contrast ratios against its background.
- Never use Gold on White or White on Silver.

---

## 4. TOKEN MAPPING (CSS/Tailwind)
To ensure consistency, use the following token names in the lauch:

| Token Name | Color | Usage |
|------------|-------|-------|
| `--color-bg-primary` | `#050505` | Main Background |
| `--color-bg-secondary`| `#1A1A1A` | Cards / Modals |
| `--color-text-primary`| `#FFFFFF` | Headings / Primary Text |
| `--color-text-secondary`| `#A0A0A0` | Body Text / Captions |
| `--color-accent` | `#D4AF37` | Primary Buttons / Highlights |
| `--color-border` | `#333333` | Dividers / Outlines |

---

## 5. QUALITY GATE: COLOR AUDIT
A page is "Color-Done" only when:
- [ ] The 60-30-10 rule is respected.
- [ ] No "non-palette" colors are used (no random hex codes in CSS).
- [ ] Contrast ratios are verified for accessibility.
- [ ] The gold accent is used surgically, not excessively.

*“Luxury is the absence of noise. Use color to create silence, not clutter.”*


---

## 6. 3D SCENE COLORS (Separate Rendering Domain)

Three.js / React Three Fiber material and lighting colors (e.g., scene presets,
hotspot markers, shader uniforms, status lights) are a **separate rendering
domain** from the UI palette. They are deliberately allowed to use physical
lighting values (emissive tones, material albedo, fog color) that extend beyond
the 2D UI tokens.

**Policy:**
- UI-facing classes/styles MUST use tokens (never `bg-[#hex]` arbitrary values).
- 3D material/lighting hex values in scene configs (`lighting-presets.ts`,
  `material-presets.ts`, Three.js `color` props) are exempt but SHOULD prefer
  the gold family (`#D4AF37` / `#E5C76B`) for accent/CTAs.
- Status semantics in 3D (e.g., `#7BA7FF` blue = in-review, `#9B8CFF` violet =
  early pipeline) are intentional and documented in the scene layer.

*Audit note (Aug 9 2026): UI-token compliance was enforced across all
dashboard/portal/XR surfaces; 3D scene presets retain intentional lighting
values by design.*
