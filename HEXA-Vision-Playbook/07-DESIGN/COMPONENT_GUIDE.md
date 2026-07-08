# Component Guidelines

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Purpose

These guidelines ensure that all UI components in the HEXA Vision platform are consistent, accessible, and performant. We follow a "Primitive → Composite → Pattern" architecture.

## General Rules

1. **Atomic Design** — Build small, reusable primitives first.
2. **Prop-Driven** — Use props for variants, not separate components.
3. **Accessibility First** — Every component must be keyboard navigable and ARIA-compliant.
4. **Tailwind Only** — No custom CSS unless absolutely necessary.
5. **Type Safety** — Use strict TypeScript interfaces for all props.
6. **No Default Exports** — Always use named exports for better IDE support.

## Component Hierarchy

### 1. Primitives
The basic building blocks. No business logic.
- `Button`, `Input`, `Text`, `Icon`, `Badge`, `Divider`, `Spinner`

### 2. Composites
Groups of primitives. Low-level logic (e.g., state).
- `Modal`, `Dropdown`, `Card`, `Form`, `Tooltip`, `Tabs`

### 3. Patterns
Complex components with business logic.
- `ProjectCard`, `ContactForm`, `SceneViewer`, `NavBar`, `Footer`

## Documentation Requirements

Every new component must be documented in the codebase:
- **Interface:** Clear prop definitions.
- **Usage:** Examples of common configurations.
- **Edge Cases:** How it handles loading, errors, and empty states.
- **Accessibility:** Notes on keyboard interactions and ARIA roles.

## Related Docs

- `07-DESIGN\DESIGN_SYSTEM.md`
- `06-STANDARDS\CODING_STANDARDS.md`
- `06-STANDARDS\ACCESSIBILITY_GUIDE.md`
