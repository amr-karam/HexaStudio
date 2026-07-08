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
|-------|-------| and |
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

## 6. QUALITY GATE: TOKEN AUDIT
A component is "Token-Done" only when:
- [ ] Zero hard-coded pixels/colors are used in the CSS/JSX.
- [ ] All spacing is a multiple of 4px.
- [ ] The radius adheres to the "Sharp-Modern" scale.
- [ ] The elevation/blur provides clear visual hierarchy.

*“Consistency is the foundation of luxury. Tokens are the blueprint of consistency.”*
