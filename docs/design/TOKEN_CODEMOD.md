# 🏗️ TOKEN CODEMOD — Design-Token Enforcement Tooling

**Version:** 1.0 | **Scope:** Frontend Token Hygiene | **Tooling:** Node built-ins only (no npm deps)

Two companion scripts that keep the semantic design-token standard (`docs/design/TOKENS.md`, `docs/design/DESIGN_TOKENS.md`) enforced across `apps/frontend/src`:

| Script | Role |
|--------|------|
| `scripts/fix-design-tokens.mjs` | One-shot codemod — rewrites raw hex/easing violations into semantic tokens |
| `scripts/check-design-tokens.mjs` | Regression gate — exits 1 if raw hex/easing creeps back in |

Both follow the `scripts/check-bundle-budgets.mjs` conventions: `#!/usr/bin/env node`, JSDoc header, `--root <path>`, `--quiet`, colored output (respecting `NO_COLOR`/`CI`), and exit codes `0`/`1`.

---

## 1. Usage

```bash
# Preview every change without writing anything
node scripts/fix-design-tokens.mjs --dry-run --report

# Apply the codemod for real, print the per-file summary + git diff --stat
node scripts/fix-design-tokens.mjs --report

# Run the regression gate (default: flags inline-style hex too)
node scripts/check-design-tokens.mjs

# Run the gate, allowing intentional inline-style hex (e.g. in CI after review)
node scripts/check-design-tokens.mjs --allow-inline-style-hex
```

All commands run from the monorepo root. Pass `--root <path>` to target a different checkout.

---

## 2. Replacement Mapping

The codemod applies these ordered, **case-sensitive** rules (uppercase `#D4AF37` only — lowercase `#d4af37` is reported as a warning, never touched):

| # | Before | After | Rationale |
|---|--------|-------|-----------|
| 1 | `border-t-[#D4AF37]` | `border-t-accent` | Spinner/loader tops use the gold hairline |
| 2 | `focus:border-[#D4AF37]/50` | `focus:border-accent/50` | Focus ring alpha — works for any `/NN` alpha |
| 3 | `border-[#D4AF37]/40` | `border-accent/40` | Outlined buttons/badges — any `/NN` alpha |
| 4 | `border-[#D4AF37]` | `border-accent` | Bare gold border (also covers `focus:border-…` with no alpha) |
| 5 | `accent-[#D4AF37]` | `accent-accent` | HTML `accent-color` control highlight |
| 6 | `text-[#D4AF37]` | `text-accent` | Gold text |
| 7 | `bg-[#D4AF37]` | `bg-accent` | Gold fills |
| 8 | `bg-[#050505]` | `bg-obsidian` | App background — `obsidian` is the established name |
| 9 | `bg-[#0F0F10]` | `bg-surface` | Near-black panel |
| 10 | `bg-[#1A1A1A]` | `bg-surface` | Panel surface |
| 11 | `bg-[#0A0A0A]` | `bg-surface-dark` | Deepest layer |
| 12 | `cubic-bezier(0.16, 1, 0.3, 1)` | `var(--hexa-ease-entrance)` | Ease token (component CSS strings only) |
| 13 | `stroke-[#D4AF37]` | `stroke-accent` | SVG stroke color |

> **Rule 12 exception:** `apps/frontend/src/lib/motion/tokens.ts` is the canonical definition of the easing strings (`CSS_EASING`) and is **never** rewritten — it must stay raw. The gate exempts the same file.

---

## 3. Gate Categories

`check-design-tokens.mjs` fails on four categories:

| Category | Matches | Suppressible? |
|----------|---------|---------------|
| Arbitrary accent hex class | `[#d4af37]` (case-insensitive) | No |
| Stray dark surface class | `bg-[#050505]`, `bg-[#0F0F10]`, `bg-[#1A1A1A]`, `bg-[#0A0A0A]` | No |
| Raw easing | `cubic-bezier(` in components | No (easing source exempt) |
| Inline-style hex | raw `#hex` literals (style props, `color="…"`, `stopColor`, palettes, shaders) | `--allow-inline-style-hex` |

---

## 4. ALLOWLIST Rationale

Four files are hardcoded into the gate's ALLOWLIST and excluded from the *inline-style hex* category (the other categories still apply):

| File | Why the raw hex is legitimate |
|------|-------------------------------|
| `components/CustomCursor.tsx` | Procedural canvas cursor (`#fff` mixed at runtime) — not CSS-tokenable |
| `features/ai/components/MultimodalAnalyzer.tsx` | Dynamic analysis-strip colors computed at runtime |
| `features/portal/components/PortalThemeProvider.tsx` | Injects a runtime CSS variable palette (`#FAFAF9`…`#18181B`) the theme system consumes |
| `components/effects/AmbientScene.tsx` | WebGL shader vertex colors (`#0a0a1a`, `#050508`) fed to GPU buffers |

These colors are *dynamic values*, not static design decisions — replacing them with CSS tokens would be incorrect or impossible. Anything outside the list that uses raw inline hex is a genuine token violation and must be converted (or the allowlist extended via ADR/review).

---

## 5. Wiring Into CI

The gate is now **wired end-to-end** (not aspirational):

- **`npm run lint --workspace=apps/frontend`** — the frontend `lint` script in `apps/frontend/package.json` chains `node ../../scripts/check-design-tokens.mjs --allow-inline-style-hex`, so every agent/CI invocation of the lint gate also runs the design-token check.
- **`.gitlab-ci.yml`** — a `design-tokens` job in the `quality` stage (extends `.typecheck_base`) enforces the gate on every pipeline:

```yaml
# ----- Design Token Gate -----
design-tokens:
  extends: .typecheck_base
  script:
    - node scripts/check-design-tokens.mjs --allow-inline-style-hex
```

- **`.ai/agents/frontend.md`** — the Frontend Engineer role's Required Checks mandate running the gate before declaring a frontend task complete.
- **`AGENTS.md`** — the `# Frontend Gate` block of the Quality Gate Sequence lists `node scripts/check-design-tokens.mjs --allow-inline-style-hex`.
- **`scripts/git-hooks/pre-commit`** — a staged-frontend-files check runs the gate before any commit touches `apps/frontend/src` TS/TSX.

Manual usage (from the monorepo root):

```bash
node scripts/check-design-tokens.mjs --allow-inline-style-hex  # gate
node scripts/fix-design-tokens.mjs --dry-run --report          # preview fixes
node scripts/fix-design-tokens.mjs --report                    # apply fixes
```

If the gate fails with class/easing violations, the fix path is:
`node scripts/fix-design-tokens.mjs --dry-run --report` → review → `node scripts/fix-design-tokens.mjs --report` → re-run the gate.

---

## 6. Quality Bar

Per `docs/design/TOKENS.md` §9 — *a component is "Token-Done" only when there are zero hard-coded pixels/colors in the CSS/JSX.* These scripts operationalize that bar so it can be verified automatically, not by eyeball.

*“Consistency is the foundation of luxury. Tokens are the blueprint of consistency.”*
