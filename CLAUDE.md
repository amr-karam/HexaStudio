# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Governance

Before performing any non-trivial task, read these files in order:
1. `GOVERNANCE.md` — Engineering OS (highest authority)
2. `ARCHITECTURE.md`
3. `ENGINEERING_STANDARDS.md`
4. `PROJECT_STATUS.md`

For specialized work, read the relevant agent definition in `.ai/agents/<role>.md` (architect, backend, frontend, cms, design, devops, performance, qa, security, seo, threejs).

---

## Commands

### Root (Turborepo)

```bash
npm run dev                   # start all dev servers
npm run dev:frontend          # Next.js only (port 3000)
npm run dev:backend           # NestJS only (port 4000)
npm run dev:cms               # Strapi only (port 1337)
npm run build                 # build all workspaces
npm run lint                  # lint all workspaces
npm run test                  # backend tests only
npm run test:apps             # backend + frontend + mobile tests
npm run fast:gate:all         # parallel typecheck + lint + test across all 3 workspaces (use this before declaring any task done)
```

### Per-workspace

All workspace scripts follow the `--workspace=apps/<name>` pattern:

```bash
# Frontend
npm run lint --workspace=apps/frontend
npm run typecheck --workspace=apps/frontend
npm run test --workspace=apps/frontend
npm run test:cov --workspace=apps/frontend   # with coverage
npm run test:e2e --workspace=apps/frontend   # Playwright
npm run analyze --workspace=apps/frontend    # bundle analysis

# Backend
npm run lint --workspace=apps/backend
npm run typecheck --workspace=apps/backend
npm run test --workspace=apps/backend

# Mobile
npm run lint --workspace=apps/mobile
npm run typecheck --workspace=apps/mobile
npm run test --workspace=apps/mobile         # Jest (react-native)
```

### CMS (standalone — not in root workspaces)

```bash
cd apps/cms && npm run develop   # dev server
cd apps/cms && npm run build
cd apps/cms && npm run typecheck
```

### Design token gate

```bash
node scripts/check-design-tokens.mjs --allow-inline-style-hex   # validate
node scripts/fix-design-tokens.mjs --dry-run                     # preview auto-fix
node scripts/fix-design-tokens.mjs --report                      # apply auto-fix
```

### Docker (local dev)

```bash
npm run docker:up       # docker compose up -d (14 services)
npm run docker:down
npm run docker:logs
```

### Git hooks

```bash
bash scripts/install-hooks.sh   # install pre-commit, commit-msg, post-checkout hooks
```

---

## Quality Gate — run before declaring any task done

All gates must pass with **0 errors, 0 warnings** (`--max-warnings=0`):

```bash
npm run fast:gate:all
```

This runs in parallel: typecheck + lint + test for frontend, backend, and mobile, plus the design token gate.

---

## Architecture

### Monorepo layout

```
apps/
  frontend/   Next.js 16 App Router — public website + client portal (port 3000)
  backend/    NestJS 11 BFF/API gateway (port 4000)
  cms/        Strapi 5 headless CMS (port 1337, standalone package-lock)
  mobile/     Expo SDK 53 / React Native companion app
packages/
  types/      @hexastudio/types — shared TS interfaces/DTOs
  utils/      @hexastudio/utils — shared utilities
e2e/          Playwright tests (runs against frontend)
scripts/      hexa-fast.mjs CLI, design-token checker, git hooks
docker/       Traefik, Postgres, Redis, MinIO, Odoo config
.ai/          AI governance: agents/, workflows/, checklists/, context/
```

Orchestrated by Turborepo (`turbo.json`). Package manager: npm 11. Node ≥ 20 required.

### Data flow

All client requests → **NestJS BFF** (`api.hexastudio.net`) → upstream services. The frontend never calls Strapi or Odoo directly. Odoo 18 is the **single source of truth for all business data** (CRM, invoices, projects, tasks, employees); the BFF aggregates via JSON-RPC (`xmlrpc` client) and never duplicates ERP business logic.

### Backend modules

`AppModule` registers 35+ domain modules including `OdooModule`, `AIModule`, `VectorModule`, `RealtimeModule`, `StorageModule`, `AuthModule`, `PortalModule`. API is versioned: `/api/v1/*` (versioned) and `/api/*` (VERSION_NEUTRAL). Swagger at `/api/docs` in dev only. Rate limit: 100 req/min via `ThrottlerGuard`.

### Frontend structure

```
src/
  app/          App Router pages (/, /about, /projects, /portal, /admin, /ai, /xr-viewer, …)
  components/   3d/, animation/, organisms/, ui/, scroll/, effects/
  features/     Domain modules: portal, auth, ai, blog, projects, services
  lib/          api.ts, api-client.ts, gsap.ts, motion/, sentry.ts, analytics/
  providers/    app-providers.tsx, motion-policy-provider.tsx, quality-provider.tsx
  stores/       app-store.ts (Zustand 5)
  config/       constants.ts (API_BASE_URL, CMS_BASE_URL, SITE_URL)
```

Key libraries: TailwindCSS 4 (CSS `@theme`), Three.js + React Three Fiber + @react-three/drei, GSAP 3, Framer Motion 11, Lenis 1.3, TanStack Query 5, next-intl 4, Socket.io-client, Radix UI.

### 3D / WebGL gating

All 3D scenes **must** be dynamically imported with `ssr: false` and gated behind `useMotionPolicy()` (respects `prefers-reduced-motion`) and `QualityProvider` (particle budgets: 65K high / 16K medium / static low). Never render WebGL unconditionally.

### Design system

Token source of truth: `apps/frontend/src/app/globals.css` (`@theme` + `:root`). Motion tokens: `apps/frontend/src/lib/motion/tokens.ts`. Never use raw hex values in Tailwind classes (`bg-[#D4AF37]`) — use semantic tokens (`bg-accent`, `text-accent`, etc.). `packages/ui` was retired (ADR-013); the design system lives exclusively in `apps/frontend/src/`.

Core palette (dark theme):
- Background: `bg-background` / `bg-void` (`#050505`)
- Surface L1: `bg-obsidian` (`#0F0F10`)
- Accent/CTA: `text-accent` / `bg-accent` (`#D4AF37` gold)
- Body text: `text-text-secondary` (`#A0A0A0`)

Fonts: `Playfair Display` (headings/serif), `Inter` (body/UI), `JetBrains Mono` (code).

### TypeScript constraints

- `strict: true` everywhere; zero `any` — use `unknown` + Zod/class-validator for untyped external data
- No `@ts-ignore` or `eslint-disable`
- Frontend path alias: `@/*` → `./src/*`
- Backend path aliases: `@/*` → `./src/*`, `@hexastudio/*` → `../../packages/*`
- Cross-package imports must use `@hexastudio/types` and `@hexastudio/utils` — never relative cross-package paths

### Testing

| App | Runner | Environment |
|---|---|---|
| frontend | Vitest 4 | jsdom |
| backend | Vitest 4 | node |
| mobile | Jest | react-native |
| e2e | Playwright 1.62 | Chromium |

E2E config (`e2e/playwright.config.ts`): baseURL `http://localhost:3000`, `reducedMotion: "reduce"`, retries=2 on CI.

### CI/CD

Primary pipeline: GitLab CI (`.gitlab-ci.yml`). The `.github/workflows/` folder is empty — GitHub Actions is not in use. Stages: quality → build → image → validate → mobile → publish → deploy. CMS typecheck runs standalone (`cd apps/cms && npm ci && npm run typecheck`) because `apps/cms` has its own `package-lock.json` and is excluded from root workspaces.

### Infrastructure

Local dev: 14 Docker services across 3 networks — `hexa_web` (frontend/backend/cms/nginx), `hexa_data` (internal — postgres/redis/odoo/minio/qdrant/meilisearch), `hexa_monitoring` (prometheus/grafana). Production: Traefik v3 + Cloudflared Tunnel (nginx is dev-only). Staging: `docker-compose.staging.yml`, Production: `docker-compose.prod.yml`.

### Commit convention

```
type(scope): description
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Enforced by the `commit-msg` git hook.

### Architectural change policy

Any architectural change requires a formal ADR in `docs/adr/` before implementation.
