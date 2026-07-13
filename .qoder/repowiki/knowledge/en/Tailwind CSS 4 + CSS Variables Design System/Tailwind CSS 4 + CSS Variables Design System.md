---
kind: frontend_style
name: Tailwind CSS 4 + CSS Variables Design System
category: frontend_style
scope:
    - '**'
source_files:
    - apps/frontend/src/app/globals.css
    - apps/frontend/package.json
    - packages/ui/package.json
    - HEXA-Vision-Playbook/07-DESIGN/DESIGN_TOKENS.md
    - HEXA-Vision-Playbook/06-STANDARDS/UI_STANDARDS.md
    - HEXA-Vision-Playbook/07-DESIGN/COMPONENT_GUIDE.md
---

The HexaStudio frontend uses a Tailwind CSS 4-based styling system centered on CSS custom properties (design tokens) and a luxury-minimalist visual language. The approach is documented extensively in the HEXA Vision Playbook but only partially implemented in code.

**Core stack:** Next.js 15 with Tailwind CSS 4 (`@tailwindcss/postcss`), Framer Motion for animations, GSAP for complex sequences, Lenis for smooth scrolling, and Radix UI primitives via the shared `@hexastudio/ui` package. Three.js/React Three Fiber powers the 3D visualization layer.

**Design tokens as CSS variables:** All design tokens live in `apps/frontend/src/app/globals.css` under a `@theme` block — colors (`--color-background`, `--color-accent`, neutral scale), fonts (`--font-sans`, `--font-serif`, `--font-mono`), spacing (`--spacing-xs` through `--spacing-5xl`), and easing curves (`--ease-out-expo`, `--ease-luxury`). Glassmorphism tokens (`--glass-bg`, `--glass-border`) are defined in `:root`. This matches the token spec in `HEXA-Vision-Playbook/07-DESIGN/DESIGN_TOKENS.md`, though the document lists additional tokens (e.g., `--brand-primary`, `--shadow-*`, radius tokens) that are not yet present in the CSS file.

**Visual language & conventions:** The playbook's `UI_STANDARDS.md` defines a "Luxury-Minimalist" aesthetic: deep obsidian backgrounds, pure white text, gold/champagne accent (`#C5A059` vs. the `#D4AF1B` used in globals.css), serif display headings (Playfair Display) paired with Inter body text, generous whitespace, and glassmorphism overlays. Components follow an Atomic Design hierarchy (Primitive → Composite → Pattern) and must be built with Tailwind utilities only, no custom CSS unless absolutely necessary.

**Shared UI package:** `packages/ui` (`@hexastudio/ui`) is declared as a workspace dependency with `clsx`, `tailwind-merge`, `framer-motion`, `lucide-react`, and `@radix-ui/react-slot` as dependencies, intended to host primitive components (Button, Input, Text, Icon, Badge, Divider, Spinner). The package exists at the filesystem level but its source directory is currently empty/unreadable, so the component library is not yet populated.

**Accessibility & motion:** Global styles include `prefers-reduced-motion` media queries disabling all animations/transitions, a skip-link utility class, visible focus outlines using the accent color, and a `motion-reduce-hidden` class. The `use-reduced-motion` hook in `apps/frontend/src/hooks/` provides runtime detection.

**Gaps between docs and code:**
- The Tailwind config file referenced by the guide does not exist; Tailwind 4 uses CSS-first configuration via `@theme`.
- Several documented tokens (radius, shadow, brand palette variants) are missing from `globals.css`.
- The `@hexastudio/ui` package has no source files yet, so the Primitive/Composite/Pattern component hierarchy is not implemented.
- The `TAILWIND_GUIDE.md` and `REACT_GUIDE.md` are stubs with no content.