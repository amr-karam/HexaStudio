# 💎 TOKENS: THE DESIGN ATOMS

**Version:** 1.0 | **Scope:** Design $\rightarrow$ Frontend | **Standard:** Scalable / Systematic

## 1. THE TOKEN PHILOSOPHY
Tokens are the "single source of truth" for all design values. We do not use hard-coded values (e.g., `padding: 20px`) in the code. We use tokens (e.g., `padding: var(--spacing-md)`). This allows us to change the entire "feel" of the lauch by updating a single file.

---

## 2. SPACING SYSTEM (The Grid)
Based on a **4px base unit**. All spacing must be a multiple of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-xs` | 4px | Tight elements, small gaps |
| `--spacing-sm` | 8px | Component internal padding |
| `--spacing-md` | 16px | Standard gutter, element spacing |
| `--spacing-lg` | 32px | Section padding, large gaps |
| `--spacing-xl` | 64px | Major section separation |
| `--spacing-2xl` | 128px | Hero section padding |

---

## 3. BORDER & RADIUS (The Edge)
We use a "Sharp-Modern" aesthetic. We avoid large, bubbly rounded corners in favor of precision.

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0px | Architectural, hard edges |
| `--radius-sm` | 2px | Tiny buttons, checkboxes |
| `--radius-md` | 4px | Standard cards, inputs |
| `--radius-lg` | 8px | Modals, large containers |

---

## 4. ELEVATION & BLUR (The Depth)
Since we are building a "Void" experience, we use depth to create hierarchy.

### I. Box Shadows (The Glow)
- **Level 1 (Soft):** `0 4px 12px rgba(0,0,0,0.5)` - Subtle lift.
- **Level 2 (Medium):** `0 12px 24px rgba(0,0,0,0.7)` - Defined surface.
- **Level 3 (Accent):** `0 0 20px rgba(212, 175, 55, 0.3)` - The Gold Glow.

### II. Backdrop Blur (The Glass)
- **Glass-Light:** `blur(8px) saturate(180%)` - For overlays.
- **Glass-Heavy:** `blur(20px) saturate(150%)` - For modals and navigation.

---

## 5. IMPLEMENTATION STRATEGY
All tokens must be defined in the `tailwind.config.js` or a global `tokens.css` file.

**Example Tailwind Mapping:**
```javascript
theme: {
  extend: {
    colors: {
      'hexa-gold': 'var(--color-accent)',
      'void-black': 'var(--color-bg-primary)',
    },
    spacing: {
      'hexa-md': 'var(--spacing-md)',
    },
    borderRadius: {
      'hexa-sm': 'var(--radius-sm)',
    }
  }
}
```

---

## 6. ARTISAN GLASS TOKENS (v1.3.0)

A premium glass-morphism system defined in `artisan-tokens.css`.

| Token | Value | Usage |
|-------|-------|-------|
| `--artisan-glass-bg` | `rgba(18, 18, 20, 0.55)` | Default glass background |
| `--artisan-glass-bg-hover` | `rgba(26, 26, 30, 0.70)` | Glass hover state |
| `--artisan-glass-border` | `rgba(255, 255, 255, 0.08)` | Default glass border |
| `--artisan-glass-border-hover` | `rgba(212, 175, 55, 0.35)` | Gold border on hover |
| `--artisan-glass-blur` | `24px` | Frosted glass blur radius |
| `--artisan-glass-saturate` | `200%` | Color saturation multiplier |

### CSS Classes
- **`.artisan-glass`**: Full glass background with `backdrop-filter: blur(24px) saturate(200%)`. Transition to gold border on hover.
- **`.artisan-glass-gold`**: Same as above with `saturate(220%)`, used for accent/CTA sections.
- **`.artisan-specular-top`**: A `50px` top-edge hairline highlight for specular reflection effect.

### LiquidGlassCard Component
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `goldAccent` | `boolean` | `false` | Enables gold-tinted glass variant |
| `glow` | `boolean` | `true` | Enables mouse-reactive radial highlight |
| `className` | `string` | `''` | Additional classes |

---

## 7. SPRING MOTION TOKENS (v1.3.0)

Spring physics parameters for Framer Motion animations, complementing the cubic-bezier system.

| Context | `stiffness` | `damping` | `delay` Formula |
|---------|-------------|-----------|-----------------|
| Micro-interaction | 300 | 25 | 0 |
| Group reveal | 200 | 22 | `index * 0.05` |
| Heading entrance | 180 | 22 | `0 + index * 0.1` |
| Paragraph entrance | 150 | 20 | `0.2` |
| CTA group | 140 | 18 | `0.3` |
| Utility/text | 100 | 20 | `0.6` |

**Pattern**: Natural cascade uses decreasing `stiffness` (200→100) paired with increasing `delay` to create a flowing reveal sequence. All spring transitions respect `prefers-reduced-motion` via `useReducedMotion()` hook.

---

## 8. SILK SHADER TOKENS (v1.3.0)

| Token | Value | Description |
|-------|-------|-------------|
| Default speed | `0.4` | Animation speed multiplier |
| Default opacity | `0.15` | Canvas opacity |
| Default palette | Gold (#D4AF37), Champagne (#E5C76B), Obsidian (#050508), Ivory | Iridescent silk wave colors |
| Bundled size | ~3KB gzipped | WebGL raw canvas, no Three.js |

---

## 9. QUALITY GATE: TOKEN AUDIT
A component is "Token-Done" only when:
- [ ] Zero hard-coded pixels/colors are used in the CSS/JSX.
- [ ] All spacing is a multiple of 4px.
- [ ] The radius adheres to the "Sharp-Modern" scale.
- [ ] The elevation/blur provides clear visual hierarchy.

*“Consistency is the foundation of luxury. Tokens are the blueprint of consistency.”*
