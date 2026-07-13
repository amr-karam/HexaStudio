---
kind: dependency_management
name: NPM Workspaces + Turbo Monorepo Dependency Management
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - turbo.json
    - apps/backend/package.json
    - apps/frontend/package.json
    - apps/cms/package.json
    - packages/types/package.json
    - hexa-hub/package.json
---

The HexaStudio platform uses a dual-monorepo strategy built on npm workspaces and Turborepo to manage dependencies across multiple applications and shared packages. The root `package.json` declares the workspace structure, pinned package manager version, and cross-cutting dependency overrides, while each app maintains its own scoped dependencies.

**System overview**
- Package manager: npm (v11.17.0 enforced via `packageManager` field)
- Lockfile: `package-lock.json` at repository root (lockfileVersion 3) plus per-workspace lockfiles in sub-repos (`hexa-hub/package-lock.json`, `.kilo/package-lock.json`)
- Build orchestration: Turborepo (`turbo.json`) with task-level caching and inter-package build ordering
- Workspace layout: two independent monorepos — `apps/` + `packages/` for HexaStudio, and `hexa-hub/` for the internal collaboration platform

**Workspace composition**
- Root workspace (`hexastudio`): `apps/frontend`, `apps/backend`, `apps/cms`, `packages/types`, `packages/ui`, `packages/utils`
- Hub workspace (`hexa-hub`): `apps/web`, `apps/api`, `apps/realtime`, `apps/worker`, `packages/types`
- Each workspace is marked `"private": true` — no packages are published to npm registries; they resolve purely via local symlinked workspaces.

**Versioning conventions**
- Internal packages use the `@hexastudio/*` scope and reference each other with the wildcard `*` range (e.g., `"@hexastudio/types": "*"`), relying on workspace resolution rather than semantic versioning between apps.
- Third-party dependencies use caret ranges (`^x.y.z`) allowing patch/minor updates within major versions.
- Node engine is constrained to `>=20` at both root and app level (`engines.node`).

**Dependency hoisting & overrides**
- npm v9+ workspaces hoist dependencies into the top-level `node_modules`; transitive conflicts are resolved by the lockfile.
- A single `overrides` entry at the root pins `framer-motion` to `^11.18.2` to prevent version drift between frontend and backend consumers.
- No `resolutions` (pnpm) or `.npmrc` private registry configuration is present — all packages resolve from the public npm registry.

**Build-time dependency graph**
- `turbo.json` defines `dependsOn: ["^build"]` for `build`, `lint`, `typecheck`, and `test`, ensuring that when one workspace depends on another, the upstream package builds first before downstream tasks run.
- `globalDependencies` includes `**/.env.*local` so environment changes invalidate caches without triggering full rebuilds.
- Task outputs include `dist/**`, `.next/**`, and exclude `.next/cache` to keep cache artifacts deterministic.

**Key files**
- `package.json` — root workspace declaration, scripts, `overrides`, `engines`, `workspaces`
- `package-lock.json` — canonical lockfile for the root workspace
- `turbo.json` — task graph, caching, and inter-package build ordering
- `apps/*/package.json` — per-app dependency declarations (backend NestJS, frontend Next.js, CMS Strapi)
- `packages/*/package.json` — internal shared packages (`@hexastudio/types`, `ui`, `utils`)
- `hexa-hub/package.json` — second independent workspace with its own lockfile

**Rules developers should follow**
1. Add new dependencies to the specific app's `package.json`, not the root — only cross-cutting libraries belong at the root.
2. Reference internal packages using the `@hexastudio/*` scope with `"*"` range; do not publish them or set explicit semver ranges.
3. Keep third-party ranges as `^major.minor.patch` to allow safe minor/patch upgrades; pin only when a known conflict exists and add an `overrides` entry at the root.
4. Run `npm install` at the repo root after adding/removing dependencies so the lockfile stays consistent across workspaces.
5. Do not commit `node_modules/` directories — rely on the lockfile and workspace symlinks.
6. When introducing a new workspace, register it in the root `workspaces` array and mirror the standard scripts (`dev`, `build`, `lint`, `typecheck`, `test`) so Turborepo can discover it.