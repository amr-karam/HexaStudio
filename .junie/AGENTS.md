# 🏛️ HEXA STUDIO — Agent Operating Guidelines & Project Overview

This document provides operational guidelines, architectural rules, workspace details, and engineering standards for AI agents (including Junie) working on the **HEXA STUDIO** platform.

---

## 1. Project Overview & Vision

**HEXA STUDIO** (`hexastudio.net`) is an enterprise-grade architectural visualization platform and client portal. It bridges technical architectural data with high-end visual storytelling and interactive 3D digital experiences.

### Core Value Pillars
- **Visual Fidelity**: Photorealistic 8K rendering, cinematic lighting, and physical material authenticity.
- **Immersive Motion**: GSAP and Three.js-driven storytelling, interactive WebGL viewports, and smooth camera transitions.
- **Engineering Excellence**: Zero-downtime microservices monorepo architecture, strict type safety, ERP-first synchronization, and robust observability.

---

## 2. Monorepo Architecture & Workspace Structure

The project is structured as a Turborepo-managed monorepo (`turbo.json`) running on **Node.js >= 20** and **npm 11**.

```text
hexastudio.net/
├── apps/
│   ├── frontend/         # Next.js 16 (App Router) — Public showcase & Client Portal (port 3000)
│   ├── backend/          # NestJS 11 BFF / API Gateway & Microservices (port 4000)
│   ├── cms/              # Strapi 5 Headless CMS (port 1337, standalone package-lock)
│   └── mobile/           # Expo SDK 53 / React Native companion app
├── packages/
│   ├── types/            # @hexastudio/types — Shared TypeScript interfaces and DTOs
│   ├── utils/            # @hexastudio/utils — Shared helper utilities
│   └── ui/               # Retired (ADR-013) — UI components live inside apps/frontend/src/
├── e2e/                  # Playwright end-to-end test suites
├── docker/               # Traefik v3, PostgreSQL 16, Redis 7, MinIO, Odoo 17 configs
├── scripts/              # Fast gate CLI (hexa-fast.mjs), design token checker, CI/CD utilities
└── docs/                 # Architecture Decision Records (ADRs), specs, and system guides
```

---

## 3. Technology Stack & Key Subsystems

| Layer | Technologies | Architectural Highlights |
|---|---|---|
| **Frontend** | Next.js 16.2 (App Router), React 19, TailwindCSS 4, TanStack Query v5, Zustand 5, next-intl | Server Components by default; client islands dynamically loaded |
| **3D & Motion** | Three.js, React Three Fiber (R3F), @react-three/drei, GSAP 3, Framer Motion 11, Lenis | Gated by `useMotionPolicy` & `QualityProvider` (particle budgets) |
| **Backend BFF** | NestJS 11, Express, REST/Swagger, Socket.io, Passport JWT | Backend-for-Frontend aggregating CMS, Odoo ERP, Redis, & AI modules |
| **CMS** | Strapi 5 (Headless), PostgreSQL, AWS S3 / MinIO provider | Webhook triggers for Next.js on-demand ISR revalidation |
| **ERP** | Odoo 17/18 (CRM, Sales, Projects, Invoicing, Partners) | Single source of truth for business logic; JSON-RPC client |
| **AI / Search** | Google GenAI, OpenAI, Qdrant Vector DB, Meilisearch | Vector embeddings, semantic search, AI assistant workflows |
| **Databases** | PostgreSQL 16, Redis 7 (Cache & Queues), MinIO (S3 storage) | Isolated in internal Docker networks (0 public port exposure) |
| **Ingress** | Traefik v3 Reverse Proxy + Cloudflare Tunnel | Handles SSL termination and domain routing; Nginx is dev-only |

---

## 4. Key Architectural Principles & Non-Negotiable Rules

1. **Odoo-First Architecture**:
   - Odoo is the **single source of truth** for all business data (CRM leads, quotes, projects, invoices, tasks, and contacts).
   - The NestJS BFF acts as an experience and aggregation layer. **Never duplicate ERP business logic** in the BFF or frontend.
   - Incoming leads queue in Redis (`odoo:pending-leads`) if Odoo is unreachable for zero data loss.

2. **Strict BFF Communication**:
   - The frontend **must never** access databases, Strapi, or Odoo directly.
   - All client communication flows through the NestJS BFF (`api.hexastudio.net`).

3. **3D / WebGL Performance Budgets**:
   - 3D scenes must be dynamically imported with `ssr: false`.
   - All 3D rendering is strictly gated behind `useMotionPolicy()` (respects `prefers-reduced-motion`) and `QualityProvider` (particle budgets: High = 65K, Medium = 16K, Low = static fallback cards).
   - Never render WebGL unconditionally.

4. **Strict TypeScript & Zero `any`**:
   - All workspaces operate with `strict: true`.
   - Zero `any` types permitted. Use `unknown` with Zod or `class-validator` validation.
   - Never suppress type errors with `@ts-ignore` or lint errors with `eslint-disable`.

5. **Design System & Token Discipline**:
   - Design tokens are defined in `apps/frontend/src/app/globals.css` (`@theme` and `:root`) and `src/lib/motion/tokens.ts`.
   - Never use arbitrary raw hex colors in Tailwind utility classes (e.g. `bg-[#D4AF37]`). Always use semantic tokens (`bg-accent`, `text-accent`, `bg-obsidian`, `text-text-secondary`).
   - Validate tokens using `node scripts/check-design-tokens.mjs --allow-inline-style-hex`.

6. **Workspace Imports**:
   - Shared packages must be imported using workspace aliases (`@hexastudio/types`, `@hexastudio/utils`).
   - Frontend path alias: `@/*` $\rightarrow$ `apps/frontend/src/*`.
   - Backend path alias: `@/*` $\rightarrow$ `apps/backend/src/*`.
   - No relative imports that cross workspace boundaries.

7. **Architectural Decisions (ADR)**:
   - Any modification to system topology, data flow, or package boundaries requires a formal ADR in `docs/adr/`.

---

## 5. Development, Testing & Quality Commands

### Monorepo Root Commands
```bash
# Start all dev servers via Turbo
npm run dev

# Targeted workspace dev servers
npm run dev:frontend          # Next.js (port 3000)
npm run dev:backend           # NestJS BFF (port 4000)
npm run dev:cms               # Strapi CMS (port 1337)
npm run dev:mobile            # Expo / React Native

# Build & Lint all workspaces
npm run build
npm run lint

# Run all test suites
npm run test:apps             # Backend + Frontend + Mobile tests

# Full Fast Quality Gate (run before declaring any task complete)
npm run fast:gate:all
```

### Workspace-Specific Commands
```bash
# Frontend (apps/frontend)
npm run lint --workspace=apps/frontend
npm run typecheck --workspace=apps/frontend
npm run test --workspace=apps/frontend            # Vitest (jsdom)
npm run test:cov --workspace=apps/frontend        # Vitest with coverage
npm run test:e2e --workspace=apps/frontend        # Playwright

# Backend (apps/backend)
npm run lint --workspace=apps/backend
npm run typecheck --workspace=apps/backend
npm run test --workspace=apps/backend            # Vitest (node)
npm run test:cov --workspace=apps/backend

# Mobile (apps/mobile)
npm run lint --workspace=apps/mobile
npm run typecheck --workspace=apps/mobile
npm run test --workspace=apps/mobile             # Jest (react-native)

# CMS (apps/cms — standalone workspace)
cd apps/cms && npm run develop
cd apps/cms && npm run build
cd apps/cms && npm run typecheck
```

### Design Token Validation
```bash
# Check design token compliance
node scripts/check-design-tokens.mjs --allow-inline-style-hex

# Preview or apply automatic token fixes
node scripts/fix-design-tokens.mjs --dry-run
node scripts/fix-design-tokens.mjs --report
```

### Local Docker Infrastructure
```bash
npm run docker:up             # Launch all 14 services via docker compose
npm run docker:down           # Stop container ecosystem
npm run docker:logs           # Tail container logs
```

---

## 6. Conventional Commit Format

When committing changes, adhere to the Conventional Commits standard:
```text
type(scope): description
```
- **Allowed Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Examples**:
  - `feat(portal): add invoice preview dialog with pdf download`
  - `fix(odoo): handle timeout on partner synchronization`
  - `refactor(3d): optimize particle geometry buffers for mobile`

---

## 7. Definition of Done (Quality Gate Checklist)

Before concluding any development task or submitting changes:
1. **Code Inspection**: Understand existing patterns and verify impact on upstream/downstream consumers.
2. **Type Safety**: `npm run typecheck --workspace=apps/<target>` passes with 0 errors.
3. **Linting**: `npm run lint --workspace=apps/<target>` passes with 0 errors and 0 warnings (`--max-warnings=0`).
4. **Unit / Integration Tests**: All affected tests pass without mocks masking broken logic.
5. **Design System Adherence**: For frontend changes, verify semantic tokens with `node scripts/check-design-tokens.mjs --allow-inline-style-hex`.
6. **Overall Gate Check**: Run `npm run fast:gate:all` to ensure no cross-package regressions.
7. **Documentation**: Update `PROJECT_STATUS.md`, README, or ADRs when new features, dependencies, or architectural alterations are introduced.
