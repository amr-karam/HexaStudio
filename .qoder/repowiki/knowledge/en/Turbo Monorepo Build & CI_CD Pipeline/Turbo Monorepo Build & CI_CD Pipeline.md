---
kind: build_system
name: Turbo Monorepo Build & CI/CD Pipeline
category: build_system
scope:
    - '**'
source_files:
    - turbo.json
    - package.json
    - .github/workflows/ci.yml
    - .github/workflows/cd.yml
    - docker-compose.yml
    - apps/backend/Dockerfile
    - apps/frontend/Dockerfile
    - apps/backend/package.json
    - apps/frontend/package.json
    - apps/cms/package.json
---

## System Overview

HexaStudio uses a **Turborepo-managed npm workspaces monorepo** as its build system, orchestrating three independently built applications (NestJS backend, Strapi CMS, Next.js frontend) plus shared packages through a unified task graph with distributed caching.

## Core Build Orchestration

- **Root workspace** (`package.json`) declares `workspaces: [apps/frontend, apps/backend, apps/cms, packages/types, packages/ui, packages/utils]` and exposes top-level scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `docker:*`) that delegate to `turbo run ...`.
- **Task graph** is defined in `turbo.json`: tasks depend on their upstream dependencies via `dependsOn: ["^build"]`, cache outputs for `dist/**`, `.next/**`, and mark `dev` as persistent/non-cached. Global dependency tracking watches `**/.env.*local` files.
- Each app defines its own build script: NestJS uses `nest build`, Next.js uses `next build`, Strapi uses `strapi build`. Shared packages are built first due to the `^build` transitive dependency rule.

## Containerization Strategy

Each application ships a **multi-stage Dockerfile** under `apps/<app>/Dockerfile`:
- **Backend**: Node 22 Alpine base; stages for deps → builder (runs `npm run build --workspace=apps/backend`) → runner (copies only `dist/`, `node_modules`, and shared packages).
- **Frontend**: Node 20 Alpine base; leverages Next.js standalone output (`.next/standalone`); accepts `NEXT_PUBLIC_*` build args injected from `docker-compose.yml` or CD pipeline.
- **CMS**: Uses Strapi's official image pattern with custom config mounted at runtime.

`docker-compose.yml` wires all services together — Postgres, Redis, MinIO, the three apps, Nginx reverse proxy, Prometheus, and Grafana — with health checks and internal networking (`hexa_data`, `hexa_web`, `hexa_monitoring`).

## CI/CD Pipeline (GitHub Actions)

- **CI** (`.github/workflows/ci.yml`): runs on push to `main`/`stage` and PRs to `main`; parallel jobs for TypeScript typecheck (all workspaces), lint (backend + frontend), tests (backend + ui package), full build (types → utils → frontend → backend), and Playwright E2E against a built frontend.
- **CD** (`.github/workflows/cd.yml`): triggers on pushes to `main` (ignoring docs/playbook changes); builds and pushes images to GHCR tagged with both `latest` and commit SHA using `docker/build-push-action` with GHA cache; deploys via SSH to production host (`19.16.1.100`), pulls new images, restarts containers, runs health checks, and prunes unused images.

## Conventions & Rules

- **Node version**: pinned to `>=20` at root; CI uses `NODE_VERSION=20`.
- **Workspace-first builds**: always invoke commands via `--workspace=<name>` or rely on Turbo's task graph rather than running per-app scripts directly.
- **Environment variables**: app-specific env vars are passed as Docker build args (frontend) or compose environment (backend/cms); `SKIP_ENV_VALIDATION=true` is set in CI to bypass runtime env checks during build.
- **Dependency resolution**: `--legacy-peer-deps` is used consistently across CI and Dockerfiles to avoid peer-dependency conflicts between Next.js 15 and other packages.
- **Caching**: Turborepo caches build artifacts by default; Docker layers benefit from multi-stage builds that isolate dependency installation.