# @hexastudio/ui — DEPRECATED

**This package has been retired and archived per [ADR-013](../013-retire-packages-ui.md).**

## Summary

- **Status:** Archived (not published, not built, not a workspace member)
- **Archived:** 2026-08-11
- **Reason:** 4% adoption (~3 of 70 exports used), broken build (`noEmit: true`), governance violation (Navy/Indigo palette contradicts `DESIGN_SYSTEM.md` Gold/Black mandate), primitive duplication with `apps/frontend`

## Canonical Design System

The single source of truth for the HEXA STUDIO design system is now **`apps/frontend`** exclusively.

- **Tokens:** `apps/frontend/src/app/globals.css` (`@theme` + `:root`), `apps/frontend/src/styles/artisan-tokens.css`, `apps/frontend/src/lib/motion/tokens.ts`
- **Primitives:** `apps/frontend/src/components/ui/`
- **Enforcement:** `scripts/check-design-tokens.mjs` (integrated into frontend lint)

## Archived Contents

This archive preserves the full `packages/ui` source tree as it existed at retirement, including:

- ~67 unused components (Dialog, Tooltip, Toast, Select, Progress, Spinner, Switch, Checkbox, Avatar, Badge, Hero*, Preloader, PremiumNavbar, etc.)
- Divergent Navy/Indigo/Teal token system (`src/styles/0-tokens.css`)
- Storybook configuration
- Broken build configuration (`tsconfig.json` with `noEmit: true`)

## Recovery

If a genuine cross-app need emerges (e.g., React Native mobile app requiring shared primitives), the canonical approach per ADR-013 is:

1. Build a **new** shared package on the **Gold/Black** token system
2. Or extract tokens to `packages/design-tokens` with a Style Dictionary pipeline
3. Do **not** revive this archived Navy/Indigo package

## References

- [ADR-013: Retire @hexastudio/ui Package and Unify Design System](../013-retire-packages-ui.md)
- `DESIGN_SYSTEM.md` (Authority Level 4)