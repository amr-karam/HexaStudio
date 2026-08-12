# ADR-013: Retire `@hexastudio/ui` Package and Unify Design System

## Status
Accepted

## Date
2026-08-11

## Context

The HEXA STUDIO monorepo contains two divergent design systems that have never been unified:

1. **Active Frontend System** (`apps/frontend/`) — "Silent Luxury" Gold/Black aesthetic aligned with the Authority-4 `DESIGN_SYSTEM.md` (60-30-10 Gold/Black rule, Playfair Display/Inter/JetBrains Mono typography, glassmorphism, `var(--hexa-ease-*)` motion tokens).

2. **Shared UI Package** (`packages/ui/`) — "Space Navy/Indigo/Teal" aesthetic defined in `packages/ui/src/styles/0-tokens.css`, contradicting the governance doc.

**Critical findings from research:**

| Metric | Value |
|---|---|
| Adoption of `@hexastudio/ui` | ~4% (3 of ~70 named exports used) |
| Consumers | Only `apps/frontend`; `apps/backend`, `apps/mobile` do not depend on it |
| Build status | **Broken** — `tsconfig.json` has `"noEmit": true`; `npm run build` emits zero artifacts |
| Token compatibility | `Button`/`Input` use frontend Gold/Black tokens; `Modal` references packages/ui-only tokens (`--color-primary-500`, `--color-text-muted`) |
| Primitive duplication | 6 primitives exist in both locations: 3 shim re-exports (Button, Input, Modal), 3 divergent reimplementations (Card, Skeleton, Navbar) |
| Governance violation | `packages/ui` palette directly contradicts `DESIGN_SYSTEM.md` Section 1 (60-30-10 Gold/Black mandate) |

The frontend already contains a complete, working, governance-aligned design system with its own primitives (`GlassCard`, `LiquidGlassCard`, `Magnetic`, `ParallaxLayer`, `CinematicText`, etc.). The shared package is effectively dead weight that introduces drift, duplication, and a governance violation.

## Decision

1. **Retire `@hexastudio/ui`** as a shared package.
2. **Inline the 3 consumed primitives** (`Button`, `Input`, `Modal`) from the package source into `apps/frontend/src/components/ui/`, replacing the 3-line shim re-exports with real implementations.
3. **Remap token references** in the inlined components to the frontend's canonical token namespace:
   - `Input`: `var(--color-primary)` → `var(--color-foreground)`; `var(--color-error)` → new `--color-error` token (or red utility)
   - `Modal`: `var(--color-primary-500)` → `var(--color-accent)`; `var(--color-text-muted)` → `var(--color-neutral-400)`
   - `Button`: **No changes needed** — already uses `bg-accent`, `text-background`, `ring-accent` which resolve correctly
   - All three: `cn` helper imported from `@/lib/utils` (frontend canonical)
4. **Remove workspace wiring**:
   - Remove `"packages/ui"` from root `package.json` `workspaces` array
   - Remove `"@hexastudio/ui": "*"` from `apps/frontend/package.json` dependencies
   - Run `npm install` to regenerate lockfile
5. **Archive the package source** via `git mv packages/ui docs/adr/archive/packages-ui-snapshot/` preserving history.
6. **Add deprecation marker** `docs/adr/archive/packages-ui-snapshot/DEPRECATED.md` linking to this ADR.
7. **Update documentation**: Note in `DESIGN_SYSTEM.md` and `PROJECT_STATUS.md` that `apps/frontend` is now the single canonical design system source.

## Alternatives Considered

| Alternative | Pros | Cons |
|---|---|---|
| Migrate frontend INTO `packages/ui` (make it the single source) | Centralized package story | Flips governance (would require DESIGN_SYSTEM.md overhaul); massive churn; `packages/ui` build is broken; frontend already complete |
| Keep both, fix tokens only | Minimal code change | Doesn't solve 4% adoption, duplicate primitives, or governance violation; drift continues |
| Rebuild `packages/ui` on Gold/Black with real build pipeline | Clean shared package for future consumers (mobile, marketing) | YAGNI — no second consumer exists today; frontend already *is* the system; months of work |
| Extract tokens only to `packages/design-tokens` (bridge) | Unifies token layer | Defers component duplication; still maintains two component layers |

## Rationale

- The frontend's design system is **already canonical in practice** — it's the only system with working build, governance alignment, complete primitive coverage, and active consumers.
- `packages/ui` at 4% adoption with a broken build is a **net liability** (governance violation, token drift, CI noise, confusion).
- Inlining 3 primitives is a **~30-line net change** with zero consumer impact (Button works; Input/Modal have 0 consumers).
- Archiving (not deleting) preserves history and the ~67 unused components (Dialog, Tooltip, Toast, Select, etc.) for potential future reference.

## Consequences

**Positive:**
- Single canonical design system (frontend Gold/Black) — no more divergence
- Removes Authority-4 governance violation
- Eliminates 6 primitive duplications (3 shims removed, 3 divergent local versions already canonical)
- Simplifies monorepo — one fewer workspace package, one fewer dependency
- Future shared components live in `apps/frontend` until a genuine cross-app need (mobile) emerges

**Negative/Neutral:**
- `apps/mobile` (React Native) has no design system — unchanged (was already true)
- Loss of `packages/ui` Storybook — frontend has no Storybook today; separate initiative if needed
- One-time migration effort (this ADR + ~6 file changes)

## References

- `DESIGN_SYSTEM.md` (Authority Level 4) — Sections 1 (60-30-10), 2 (Tokens), 4 (Forbidden Patterns)
- ADR-004: Monorepo Structure with Shared Packages
- ADR-005: TailwindCSS 4 for Styling
- ADR-010: AI-Agent Operating Model (Governance Hierarchy)
- Token Unification Audit Report (internal, Aug 2026) — 5 easing namespaces, 2 glass systems, T-shirt vs numeric spacing, internal aliases
- `scripts/check-design-tokens.mjs` — enforcement gate for the frontend token system
- `packages/ui/package.json` — `"noEmit": true` build configuration