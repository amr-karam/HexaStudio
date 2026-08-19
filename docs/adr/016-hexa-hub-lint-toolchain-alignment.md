# ADR-016: Align hexa-hub ESLint Toolchain to Flat Config (drop `eslint-plugin-react`)

## Status
Accepted

## Date
2026-08-18

## Context

`hexa-hub/apps/web` (the client-portal web app) carried a divergent, half-finished
ESLint setup that does not match the rest of the monorepo:

1. **Legacy `.eslintrc`-style toolchain** — `package.json` pinned `eslint@^8` +
   `eslint-config-next@^14` + `eslint-plugin-react@^7` + `eslint-plugin-react-hooks@^5`,
   and `eslint.config.mjs` (flat) imported `eslint-plugin-react`.
2. **Broken transitive dependency (pre-existing, not introduced here).**
   `eslint-plugin-react` → `es-abstract` → `string.prototype.utf16codepointat`, and that
   package **404s on the npm registry and is absent from the lockfile**. Any
   `npm install` that resolves `eslint-plugin-react` therefore cannot produce a
   working lint toolchain: ESLint crashes at load time (`Error: Cannot find module
   './UTF16SurrogatePairToCodePoint'` from `es-abstract`). The earlier green lint runs
   only worked because a stale cached copy of the package existed; once `npm install`
   evicted the cache, lint became unfixable via that path.
3. **Inconsistency with the canonical config.** `apps/frontend/eslint.config.mjs` (the
   reference the branch's `8b40caa` alignment established for hexa-hub) uses only
   `@eslint/js` + `typescript-eslint` + `@next/eslint-plugin-next` — it does **not**
   import `eslint-plugin-react`. So the two web apps in the monorepo were held to
   different lint standards.

The result: `hexa-hub/apps/web` could not pass `npm run lint` nor a clean `tsc`/`next
build` while the legacy plugin chain was in place, and the WIP UI-variant refactor
(see `PROJECT_STATUS.md`, 2026-08-18) compounded the failures.

## Decision

1. **Rewrite `hexa-hub/apps/web/eslint.config.mjs` to mirror `apps/frontend/eslint.config.mjs`**
   exactly — flat config with `@eslint/js`, `typescript-eslint`, and
   `@next/eslint-plugin-next` only. Do **not** import `eslint-plugin-react` or
   `eslint-plugin-react-hooks`.
2. **Drop the react-plugins from `hexa-hub/apps/web/package.json`**
   (`eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-config-next`) and
   bump `eslint` to `^9` (matching the root/frontend eslint 9 flat-config runtime).
3. **Keep the `no-useless-catch: off` allowance** with its documented rationale
   (browser-extension interception of `window.fetch` bypasses async/await), and keep
   `test/**` files exempt from `no-unused-vars` — both already present in the frontend
   reference config.
4. **Document the broken dependency** in `PROJECT_STATUS.md` (2026-08-18) as a carried
   forward known issue with an ADR reference, so a future `rm -rf node_modules &&
   npm install` does not silently re-break lint.

## Alternatives Considered

| Alternative | Pros | Cons |
|---|---|---|
| Restore `eslint-plugin-react` (fix the cache) | Keeps classic react ruleset | Impossible to make durable — the transitive `string.prototype.utf16codepointat` 404 means any clean install re-breaks it; band-aid only |
| Pin `es-abstract` to a version whose deps resolve | Would unblock `eslint-plugin-react` | The missing leaf package is unpublished/renamed; pinning `es-abstract` won't fix a non-existent transitive dep; fragile |
| Add `eslint-plugin-react` rules inline via `@typescript-eslint` | Retains react linting | Reintroduces the broken import chain; not worth the react-specific rules given the frontend reference doesn't use them |
| **Align to frontend flat config (chosen)** | Removes the broken dep entirely; one lint standard across web apps; durable on clean install | Loses `eslint-plugin-react` specific rules (`react-in-jsx-scope`, `react/display-name`, `react/no-unescaped-entities`) — acceptable because Next.js + TS already enforce the important ones and the reference frontend config proves green without them |

## Rationale

- The frontend reference config is the de-facto standard the branch already adopted
  (`8b40caa`); diverging hexa-hub served no purpose and introduced an unresolvable
  dependency.
- `eslint-plugin-react` is **not required** for a green gate — proven by `apps/frontend`
  (identical config, 0/0) and by hexa-hub after alignment (0/0).
- The broken transitive dep makes any `eslint-plugin-react`-dependent setup
  non-reproducible on a clean machine, which violates the "reproducible quality gates"
  expectation. Removing the dependency is the only durable fix.

## Consequences

**Positive:**
- hexa-hub lint is reproducible on a clean `npm install` (no 404/load-crash).
- Single ESLint standard across `apps/frontend` and `hexa-hub/apps/web`.
- `npm run lint` (0/0), `tsc --noEmit` both pass; `next build` passes (36/36 routes).

**Negative/Neutral:**
- `react/*` plugin rules are no longer enforced in hexa-hub (e.g. `react-in-jsx-scope`,
  `react/display-name`, `react/no-unescaped-entities`). Mitigated: Next.js + TypeScript
  cover the high-value cases, and the reference frontend config operates the same way.
- If a future feature genuinely needs `eslint-plugin-react` rules, this ADR must be
  revisited — but doing so requires first resolving the `string.prototype.utf16codepointat`
  404 (ADR candidate: replace/pin the broken transitive dep, or migrate the whole monorepo
  to a config that does not pull it).

## References
- `apps/frontend/eslint.config.mjs` — canonical reference config (no `eslint-plugin-react`)
- `hexa-hub/apps/web/eslint.config.mjs` — rewritten to match (commit `8e50347`)
- `PROJECT_STATUS.md` (2026-08-18) — "Pre-existing broken dependency" note
- ADR-004: Monorepo Structure with Shared Packages
- ADR-010: AI-Agent Operating Model (Governance Hierarchy)
