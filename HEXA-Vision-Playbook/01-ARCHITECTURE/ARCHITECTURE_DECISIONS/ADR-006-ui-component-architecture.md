# ADR-006: UI Component Architecture

**Status:** Accepted
**Date:** 2026-07-08
**Deciders:** Frontend Lead, Creative Director

---

## Context

The frontend requires a consistent, reusable, and themed component system. Components are shared across routes (public site, admin panel, client portal) and must support the luxury design language (gold accents, dark backgrounds, serif typography).

## Decision

Use a **layered component architecture** with a dedicated `@hexastudio/ui` package.

### Layers

1. **@hexastudio/ui** (packages/ui): Core primitives
   - Button, Card, Input, Modal, NavBar
   - Shared utilities (cn, twMerge)
   - Framework-agnostic (React only)
   - Uses TailwindCSS 4 for styling

2. **@/components/ui** (apps/frontend): App-specific wrappers
   - Re-export from @hexastudio/ui
   - App-specific components (Footer, CTASection, TextReveal)
   - Animation wrappers (SmoothScrollWrapper, PageTransition)
   - Overlays (CinematicPreloader, CustomCursor, BackToTop)

3. **@/features/** : Feature-specific components
   - portfolio/: HomeHero, ProjectGrid, StudioSection, etc.
   - scene/: ExperienceCanvas, SceneContent, CameraController
   - Organized by domain, not by type

### Styling Approach

- TailwindCSS 4 for all styling
- CSS variables for theming (--background, --foreground, --accent, etc.)
- No CSS modules or styled-components
- Variant-based components (Button: primary/secondary/ghost/danger/outline)

## Consequences

### Positive
- Single source of truth for UI primitives
- Consistent look and feel across all routes
- Easy to theme via CSS variables
- TailwindCSS provides utility-first flexibility

### Negative
- Extra package to maintain and publish
- TailwindCSS class strings can be long
- Variant explosion if not disciplined

## Verification

- All pages use shared components from @hexastudio/ui or @/components/ui
- No inline TailwindCSS for layout-level styling
- Variants cover all use cases across admin, portal, and public routes
