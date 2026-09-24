# Design System Implementation Blueprint
*Derived from the Pajamas (GitLab) Design System Analysis*

This document serves as a technical blueprint for implementing high-quality, accessible, and scalable UI components.

## 1. Component Architecture

### Primitives (Atomic Components)
- **Variant-Driven Styling**: Use a combination of `variant` (e.g., `primary`, `secondary`) and `modifier` (e.g., `sm`, `block`) props.
- **Defensive Prop Defaults**: Every prop must have a strict type and a sensible default to prevent runtime crashes.
- **Dynamic Class Binding**: Compute classes based on prop state to keep SCSS selectors clean.

### Complex Components (Molecules/Organisms)
- **Disclosure Pattern**: For overlays (dropdowns, modals), implement a "disclosure" logic where the open/closed state is the single source of truth.
- **Guard Lifecycle**: Implement `onUnmounted` cleanup to force-close any active overlays to prevent "ghost" UI.
- **Focus Restoration**: Always store the `document.activeElement` before opening an overlay and return focus to it upon closing.

---

## 2. Design Token Strategy

### The "Token Bridge" Pattern
Avoid hard-coding values in components. Use a three-layer system:
1. **Global Tokens**: Base values (e.g., `blue-500: #3b82f6`).
2. **Alias Tokens (The Bridge)**: Semantic names (e.g., `--gl-button-primary-bg: var(--blue-500)`).
3. **Component Tokens**: Specific overrides (e.g., `border-radius: var(--gl-button-link-border-radius)`).

### Styling Implementation
- **Utility-First Base**: Use Tailwind `@apply` for layout and standard spacing.
- **Token-First Details**: Use CSS variables for colors, borders, and shadows to enable easy theming (e.g., Dark Mode).

---

## 3. Accessibility (a11y) Standards

### Interaction Patterns
- **Focus-Visible**: Use `:focus-visible` instead of `:focus` to provide indicators only for keyboard users.
- **Aria-Disabled**: Use `aria-disabled="true"` instead of the native `disabled` attribute for critical buttons to keep them discoverable by screen readers.
- **Relationship Mapping**: Link triggers to content using `aria-controls="ID"` and `aria-expanded="true/false"`.

### Visual Accessibility
- **Forced Colors Mode**: Implement `@media (forced-colors: active)` blocks to ensure compatibility with high-contrast OS settings.
- **Sizing**: Ensure minimum touch targets (e.g., `min-height: $gl-button-small-size`).

---

## 4. Implementation Checklist

| Feature | Requirement | Pattern |
| :--- | :--- | :--- |
| **Styling** | No hard-coded hex values | Use CSS Variables $\rightarrow$ Tailwind `@apply` |
| **Focus** | No "ugly" focus rings for mouse | Use `:focus-visible` |
| **Overlays** | No "stuck" menus | `onUnmounted` $\rightarrow$ Close All |
| **a11y** | Screen reader discoverability | `aria-disabled` over `disabled` |
| **Sizing** | Consistent spacing | Use design tokens for `min-width` / `min-height` |
