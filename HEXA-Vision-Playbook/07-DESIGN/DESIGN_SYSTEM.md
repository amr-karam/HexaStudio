# 🎨 DESIGN SYSTEM: THE VISUAL DNA

**Version:** 1.0 | **Aesthetic:** Ultra-Luxury / Minimalist / Architectural | **Standard:** Awwwards-Level

## 1. THE VISUAL PHILOSOPHY
The HEXA Design System is built on the principle of **"Silent Luxury."** We do not use loud colors or aggressive patterns. We use whitespace, precision typography, and subtle motion to create a feeling of exclusivity and prestige.

---

## 2. THE CORE DESIGN TOKENS

### I. Color Palette (The "Quiet" Palette)
- **Primary Black (#0A0A0A):** The void. Used for deep backgrounds to make 3D models pop.
- **Pure White (#FFFFFF):** The light. Used for crisp typography and high-contrast elements.
- **Architectural Grey (#E5E5E5):** The structure. Used for borders, dividers, and secondary text.
- **Accent Gold/Champagne (#C5A059):** The luxury. Used sparingly for calls-to-action and highlights.

### II. Typography (The "Precision" Scale)
- **Headings:** *Inter Tight* or *Montserrat* (Bold, Wide tracking). Evokes stability and modernism.
- **Body:** *Inter* (Regular, optimized for readability).
- **Captions:** *JetBrains Mono* (for technical specs). Evokes architectural precision.
- **Golden Ratio:** We use a 1.618 spacing scale for all margins and padding.

### III. Motion & Interaction (The "Fluidity" Standard)
- **Easing:** No linear animations. We use `power3.out` or `expo.out` for a natural, "weighted" feel.
- **Timing:** 
  - Micro-interactions: 200ms - 400ms.
  - Page Transitions: 600ms - 1000ms.
  - 3D Camera Moves: 1200ms - 2000ms.
- **Blur & Depth:** Strategic use of `backdrop-filter: blur()` to create layered depth (Glassmorphism).

---

## 3. COMPONENT GUIDELINES

### I. The "Glass" Card
Components should feel like sheets of frosted glass floating in a 3D space.
- **Border:** 1px solid rgba(255, 255, 255, 0.1).
- **Background:** rgba(255, 255, 255, 0.05).
- **Blur:** 10px - 20px.

### II. Digital Artisan Glass (v1.3.0)
The artisan glass system elevates the base glass card with deeper, more luxurious material properties.

**Token Classes (defined in `artisan-tokens.css`):**
- **`.artisan-glass`**: `rgba(18, 18, 20, 0.55)` background, `24px` blur, `200%` saturate, `1px solid rgba(255, 255, 255, 0.08)` border. Hover darkens background and shifts border to `rgba(212, 175, 55, 0.35)`.
- **`.artisan-glass-gold`**: Same as `.artisan-glass` but with `220%` saturate and gold-tinted backdrop for emphasized sections (CTAs, featured cards).

**`LiquidGlassCard` Component:**
- Interactive glass card with mouse-reactive gold radial highlight.
- Props: `goldAccent` (enables gold variant), `glow` (enables liquid highlight), `className`.
- Transition: `whileHover={{ y: -4, scale: 1.01 }}` with spring physics `{ stiffness: 300, damping: 25 }`.

### III. SilkShader Background
A lightweight WebGL silk/iridescence shader (~3KB gzipped) for animated hero and section backgrounds.
- **Implementation**: Raw WebGL `<canvas>` — no Three.js dependency.
- **Props**: `speed` (default 0.4), `opacity` (default 0.15).
- **Performance**: Dynamic import (`next/dynamic` with `ssr: false`); pauses when tab hidden; respects `prefers-reduced-motion`.
- **Palette**: Champagne gold (`#E5C76B`), gold (`#D4AF37`), obsidian (`#050508`), ivory — producing an iridescent silk wave pattern.

### IV. Spring Motion Tokens (v1.3.0)
The animation system now supports Framer Motion spring physics alongside the existing cubic-bezier system (`MOTION_SYSTEM.md`).

**Spring Defaults by Use Case:**
| Context | stiffness | damping | Purpose |
|---------|-----------|---------|---------|
| Micro-interactions | 300 | 25 | Button hover, card lift (`LiquidGlassCard` default) |
| Group reveals | 200 | 22 | Newsletter child variants, link staggers |
| Heading entrance | 180 | 22 | Section headers, hero titles |
| Paragraph entrance | 150 | 20 | Supporting body text |
| CTA buttons | 140 | 18 | Call-to-action group reveals |
| Bottom/utility | 100 | 20 | Footer copyright, low-priority elements |

**Pattern**: Each in-view animation uses decreasing `stiffness` (200 → 140) combined with increasing `delay` (0 → 0.3) to create a natural cascade. All spring animations degrade gracefully under `prefers-reduced-motion` via `useReducedMotion()`.

### II. The "Invisible" Navigation
Navigation should be secondary to the experience. It should disappear during 3D exploration and reappear with a subtle fade on intent.

---

## 4. IMPLEMENTATION RULES (THE "Symmetry" Law)

1. **No Magic Numbers:** All spacing and colors must come from the `tailwind.config.ts`.
2. **Responsive-First:** Design for 1440px, then scale down to 320px.
3. **Consistency:** If a button has a 4px radius in one place, it has a 4px radius everywhere.

---

## 5. QUALITY GATE: VISUAL AUDIT
Before a UI component is merged, it must be reviewed for:
- [ ] **Balance:** Is the whitespace distributed according to the golden ratio?
- [ ] **Contrast:** Does it meet WCAG 2.1 AA standards?
- [ ] **Emotion:** Does it feel "Premium" or "Generic"?
- [ ] **Performance:** Does the animation maintain 60 FPS?

*“Design is not what it looks like. Design is how it works.”*
