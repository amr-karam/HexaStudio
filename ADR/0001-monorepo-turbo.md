# ADR 0001: Monorepo Architecture with Turborepo and NPM Workspaces

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Enterprise Architect, Lead Engineer

---

## 1. CONTEXT
HEXA STUDIO comprises multiple application layers (`apps/frontend`, `apps/backend`, `apps/cms`, `apps/mobile`) and shared code (`packages/types`, `packages/ui`, `packages/utils`). We required an orchestration framework to share types, enforce boundary isolation, and optimize task pipelines.

---

## 2. DECISION
We adopt **Turborepo** with **NPM Workspaces** (`package.json` workspaces parameter) as the official monorepo architecture. Shared types (`@hexastudio/types`) and utilities (`@hexastudio/utils`) are consumed as workspace packages across applications.

---

## 3. CONSEQUENCES
- **Positive:** Single repository source of truth; fast incremental builds via Turborepo caching; type-safety across frontend, backend, and mobile apps.
- **Trade-offs:** Requires strict workspace flags (`--workspace=apps/frontend`) when running single-package scripts.
