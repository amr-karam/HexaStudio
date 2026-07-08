# Design System: HEXA Vision

## 1. Philosophy
The HEXA Vision design system is built on the principles of **Hyper-Minimalism**, **Precision**, and **Immersion**. The goal is to remove all visual noise, allowing the 3D architectural visualizations to be the sole focus of the user's attention.

### Core Pillars
- **Whitespace as a Tool:** Large margins and generous padding are used to create a sense of luxury and breathability.
- **Precision Typography:** Use of high-contrast weight pairings (e.g., ExtraLight with Bold) and tight letter-spacing for headings.
- **Depth via Glassmorphism:** Instead of heavy shadows, we use translucent, blurred surfaces to create a sense of layered depth.
- **Intentional Motion:** Every transition must feel natural and purposeful, avoiding "bouncy" or "cheap" animations.

## 2. Color Strategy
The system defaults to a **Dark-First** approach to complement the high-fidelity lighting of 3D architectural renders.

- **Dark Mode (Default):** High-contrast black backgrounds with neutral gray accents.
- **Light Mode (Support):** Clean white backgrounds with deep charcoal text.
- **Accent:** A single high-visibility color (`--brand-accent`) used sparingly for calls-to-action and critical highlights.

## 3. Layout & Grid
- **Grid System:** 12-column fluid grid with a maximum width of `1440px`.
- **Breakpoints:**
    - Mobile: `320px` $\rightarrow$ `767px`
    - Tablet: `768px` $\rightarrow$ `1023px`
    - Desktop: `1024px` $\rightarrow$ `1439px`
    - Wide: `1440px+`

## 4. Interaction Model
- **Hover States:** Subtle shifts in opacity or scale (`scale-95` on click).
- **Feedback:** Every interaction triggers a transition of at least `150ms` to avoid jarring shifts.
- **Cursor:** Custom cursor implementation for 3D hotspots (planned).

## 5. Glassmorphism Standard
All glass surfaces must adhere to the following formula:
`background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border);`
