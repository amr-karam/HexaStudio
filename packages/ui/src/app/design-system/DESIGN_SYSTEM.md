# DESIGN SYSTEM — HEXA STUDIO

**Aesthetic Direction:** *Luxury Architectural Minimalism with Art Deco Accents*  
**Tone:** Refined, cinematic, precision‑driven – a visual language that feels like a curated exhibition space for architecture, not a generic SaaS dashboard.  

## 1. Purpose
Create a cohesive, high‑impact visual language for **HEXA STUDIO** that serves three audiences:

- **Design Professionals** – expect rigor, clarity, and the ability to convey complex 3D concepts instantly.  
- **Potential Clients** – experience a premium, storytelling‑first environment that immediately signals expertise and luxury.  
- **Internal Teams** – benefit from a maintainable, token‑driven system that guarantees consistency across the entire platform.

## 2. Core Concept
A **Brutalist‑Meets‑Art‑Deco** hybrid:

- **Structure** – Sharp, grid‑based layouts with *controlled asymmetry* and *strategic overlap* that guide the eye through content hierarchies.  
- **Typography** – Pair a *serif display* (Playfair Display) with a *geometric sans* (Inter) to convey elegance and technical precision.  
- **Color Palette** – Deep “Space Navy” base with *indigo accents* and *teal highlights*; muted neutrals provide breathing room. Dark‑mode variants invert neutrals while preserving accent integrity.  
- **Motion** – Subtle, purposeful animations (±250 ms) that reveal information rather than distract. Use *staggered reveals* for hero sections and *scroll‑triggered depth* for 3D canvases.  
- **Texture & Detail** – Apply *soft grain overlays*, *gradient meshes*, and *delicate shadows* to suggest materiality without clutter.

## 3. Constraints
- **Accessibility** – WCAG 2.2 AA compliance required. Contrast ratios must meet at least 4.5:1 for normal text; 3:1 for large text. Ensure reduced‑motion respects `prefers-reduced-motion`.  
- **Performance** – Critical CSS must be < 20 KB gzipped; third‑party libraries limited to React 19, Tailwind 4, shadcn/ui, and Framer Motion. No large‑bundle UI kits.  
- **Scale** – System must be consumable via CSS variables (`--color-primary`, `--spacing-4`, etc.) to guarantee atomic styling across all packages.  
- **Reproducibility** – Every component must be documented in the **Design System Manifest** with token references, usage notes, and visual examples.

## 4. Token Implementation
All tokens are exported via `packages/ui/src/styles/0-tokens.css`. Components import these tokens through `@apply` in Tailwind utility classes, ensuring a *single source of truth*.

## 5. Component Philosophy
> **“Every UI element is a design artifact—exhibit it with intention.”**

- **Buttons** – Use `border‑2` with `var(--color-primary-500)` and `border‑radius: var(--radius-md)`. Hover scales via `transition: var(--motion-duration-medium)`.  
- **Navigation** – Fixed top bar with `sticky`, `z-index: var(--z-modal)`. On scroll, background becomes `rgba(var(--color-primary-800), 0.85)`.  
- **Cards** – Soft shadows (`shadow-lg`), `space-y-2`, and inner padding `space-4`. Background uses `var(--color-neutral-100)`.  
- **Forms** – Labels use `font-medium` with `tracking-wider`. Inputs use `border-base` with `focus:border-primary-500`.  

## 6. Samples
Below is a starter component illustrating the system’s core principles.
