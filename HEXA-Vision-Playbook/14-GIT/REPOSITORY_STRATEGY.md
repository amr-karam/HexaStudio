# Repository Strategy

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Strategy: Monorepo

We use a **monorepo** structure to manage all services in a single repository.

### Why Monorepo?

| Factor | Monorepo | Multi-repo |
|--------|----------|------------|
| Shared types | Single package | Duplication or npm publish |
| Cross-cutting changes | Single PR | Multiple PRs across repos |
| CI/CD consistency | Unified pipeline | Fragmented workflows |
| Dependency management | Single lock file | Multiple lock files |
| Atomic commits | Yes | No |
| Developer onboarding | One checkout | Multiple checkouts |

### Trade-offs

- **Larger clone size** — mitigated with `.gitignore` and sparse checkout
- **CI triggers on any change** — mitigated with path filters in GitHub Actions
- **Requires strict discipline** — mitigated with automated linting and path-based ownership

---

## Directory Structure

```
hexa-studio/
│
├── .github/
│   └── workflows/           # GitHub Actions pipelines
│
├── apps/
│   ├── frontend/            # Next.js application
│   ├── backend/             # NestJS API
│   └── cms/                 # Strapi CMS
│
├── packages/
│   ├── types/               # Shared TypeScript types & DTOs
│   ├── utils/               # Shared utility functions
│   └── ui/                  # Shared UI components (optional)
│
├── docker/
│   ├── traefik/             # Traefik configuration
│   ├── postgres/            # PostgreSQL init scripts
│   ├── redis/               # Redis configuration
│   ├── minio/               # MinIO configuration
│   └── monitoring/          # Prometheus/Grafana/Loki configs
│
├── docs/                    # High-level documentation
│
├── scripts/                 # Deployment and utility scripts
│
├── e2e/                     # Playwright end-to-end tests
│
├── docker-compose.yml       # Production compose
├── docker-compose.dev.yml   # Development compose
├── .env.example             # Environment variables template
├── package.json             # Root workspace config
├── tsconfig.json            # Root TypeScript config
├── .eslintrc.js             # Root ESLint config
├── .prettierrc              # Root Prettier config
│
└── AGENTS.md                # AI Agent operating manual
```

---

## Package Guidelines

### `/packages/types`

- All shared TypeScript interfaces, types, and DTOs
- No runtime dependencies
- Strict TypeScript mode
- Versioned independently via `package.json`

### `/packages/utils`

- Pure utility functions only
- No framework dependencies
- No side effects
- Fully unit tested

### `/packages/ui` (Optional)

- Shared UI primitives
- Uses TailwindCSS classes
- No business logic
- Re-exported for tree-shaking

---

## Dependency Management

### Rules

1. **Root `package.json`** — Dev dependencies and workspace scripts only
2. **App `package.json`** — Application-specific dependencies
3. **No duplicate dependencies** — Shared dependencies at root level
4. **Lock file** — `package-lock.json` committed to version control
5. **npm workspaces** — Used for cross-package resolution

### Dependency Audit

- Monthly `npm audit` review
- Renovate bot configured for automated dependency PRs
- Security vulnerabilities: Critical/High → fix within 48 hours
- Major version updates require manual review

---

## Path Conventions

| Pattern | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `ProjectGallery.tsx` |
| Hooks | camelCase | `useSceneControls.ts` |
| Utils | camelCase | `formatDate.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_SCENE_OBJECTS.ts` |
| Styles | kebab-case | `globals.css` |
| Config | kebab-case | `tailwind.config.ts` |
| Tests | `.test.ts` suffix | `formatDate.test.ts` |
| Types | PascalCase | `Project.ts` |

---

## File Organization Conventions

### Next.js (App Router)

```
apps/frontend/src/
├── app/                     # App Router pages
│   ├── (marketing)/         # Marketing pages (landing, about, services)
│   ├── (projects)/          # Project-related pages
│   ├── (blog)/              # Blog pages
│   ├── (dashboard)/         # Dashboard pages (auth required)
│   ├── api/                 # API routes (if needed)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── ui/                  # UI primitives (buttons, inputs, modals)
│   ├── layout/              # Layout components (header, footer, nav)
│   ├── shared/              # Shared feature components
│   ├── three/               # Three.js / R3F components
│   └── forms/               # Form components
├── lib/                     # Utility functions
├── hooks/                   # Custom React hooks
├── stores/                  # Zustand stores
├── queries/                 # TanStack Query definitions
├── types/                   # Local types (re-export from @hexa/types)
├── constants/               # Constants and configuration
└── styles/                  # Global styles
```

### NestJS

```
apps/backend/src/
├── modules/
│   ├── auth/                # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/      # Passport strategies
│   │   └── dto/             # Auth DTOs
│   ├── projects/            # Projects module
│   ├── contacts/            # Contacts module
│   └── cms/                 # CMS integration module
├── common/
│   ├── filters/             # Exception filters
│   ├── guards/              # Auth guards
│   ├── interceptors/        # Interceptors
│   ├── pipes/               # Validation pipes
│   └── decorators/          # Custom decorators
├── config/                  # Configuration
└── main.ts                  # Entry point
```

---

## Code Ownership

| Path | Owner |
|------|-------|
| `apps/frontend/` | Frontend Lead |
| `apps/backend/` | Backend Lead |
| `apps/cms/` | Backend Lead / CMS Specialist |
| `packages/types/` | Architect (shared ownership) |
| `packages/utils/` | Shared (anyone) |
| `docker/` | DevOps Engineer |
| `scripts/` | DevOps Engineer |
| `e2e/` | QA Lead |
| `HEXA-Vision-Playbook/` | Chief Architect |
