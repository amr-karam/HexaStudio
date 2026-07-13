# HEXA Studio — Code Patterns Identified

**Analysis Date:** 2026-07-12  
**Scope:** Frontend + Backend + Shared Packages

---

## 1. Frontend Patterns

### 1.1 Feature-Based Organization

**Pattern:** `src/features/{feature-name}/` with subdirectories for `components/`, `hooks/`, `lib/`, `store/`, `config/`

**Examples:**
- `src/features/portfolio/` — Home page content
- `src/features/scene/` — 3D scene system
- `src/features/blog/` — Blog functionality
- `src/features/auth/` — Authentication state

**Benefits:**
- Colocates related code
- Easy to delete/refactor entire features
- Clear ownership boundaries

**Concerns:**
- Some features have only 1-2 files (e.g., `services/`, `auth/`)
- `components/` at root level duplicates the pattern for truly shared components

### 1.2 Store-Per-Feature (Zustand)

**Pattern:** Each feature domain has its own Zustand store in `store/` subdirectory.

**Examples:**
- `scene/store/asset-store.ts` — Loading progress
- `scene/store/camera-store.ts` — Camera state
- `stores/app-store.ts` — Global UI state

**Benefits:**
- Prevents global state pollution
- Easy to trace state dependencies
- Minimal re-renders

### 1.3 Hook-per-Concern

**Pattern:** Custom hooks encapsulate complex logic, keeping components declarative.

**Examples:**
- `useAssetLoader` — GLTF loading + progress tracking
- `useCinematicCamera` — Camera animation orchestration
- `useScrollCamera` — Scroll-linked camera path
- `useReducedMotion` — Accessibility preference
- `useAdaptiveQuality` — Performance scaling
- `useProjects`, `useArticles`, `useServices` — Data fetching

### 1.4 Lazy Loading Strategy

**Pattern:** Dynamic imports for heavy dependencies on non-home routes.

**Evidence:**
- `PostProcessing` lazy-loaded in `ExperienceCanvas`
- Next.js dynamic imports for Three.js/R3F/GSAP (per sprint notes)
- Bundle budget: ≤200KB first-load JS achieved

### 1.5 Error Boundary Pattern

**Pattern:** Class-based React error boundary wraps 3D scene.

**File:** `SceneErrorBoundary.tsx`

**Purpose:** Catch R3F/Three.js errors without crashing the entire app.

### 1.6 Provider Composition

**Pattern:** Multiple providers wrapped in `AppProviders` component.

**Evidence:** `app-providers.tsx` wraps:
- `QueryProvider` (TanStack Query)
- Other context providers

### 1.7 Dynamic Component Loading

**Pattern:** `dynamic-component.tsx` utility for SSR-safe dynamic imports.

**Purpose:** Prevents hydration mismatches for components that only work client-side.

---

## 2. Backend Patterns

### 2.1 Module-Per-Domain (NestJS)

**Pattern:** Each business domain is a NestJS module with controller, service, and optional DTOs.

**Modules:**
```
modules/
├── auth/         # Authentication
├── projects/     # Project CRUD
├── articles/     # Blog content
├── services/     # Service offerings
├── contact/      # Contact form
├── storage/      # MinIO + Redis
├── odoo/         # ERP integration
├── portal/       # Client portal
├── users/        # User management
├── email/        # Email sending
├── requests/     # Service requests
├── accounting/   # Financial data
└── health/       # Liveness probe
```

**Structure per module:**
```
module/
├── module.ts       # Module definition + imports
├── controller.ts   # Route handlers
├── service.ts      # Business logic
├── index.ts        # Barrel export
└── (optional) dto.ts, strategies/, guards/
```

### 2.2 BFF Data Transformation

**Pattern:** Backend transforms Strapi responses into optimized View Models.

**Evidence:**
- `ProjectsService.mapProject()` transforms Strapi v4/v5 formats
- `AuthService.mapUser()` normalizes Strapi user shape
- Enriches with Odoo data before returning to frontend

### 2.3 Circuit Breaker Pattern

**Pattern:** OdooService implements circuit breaker for external dependency resilience.

**States:** CLOSED → OPEN → HALF_OPEN → CLOSED

**Trigger:** 20% failure rate over rolling window

**Behavior:**
- OPEN: Reject requests, serve stale cache
- HALF_OPEN: Allow test request after 30s timeout
- CLOSED: Normal operation

### 2.4 Environment-Based Configuration

**Pattern:** `getEnv()` function provides typed access to environment variables.

**File:** `config/env.ts`

**Usage:**
```ts
const env = getEnv();
env.CMS_URL; // string
env.JWT_SECRET; // string
```

**Benefits:**
- Single point of env access
- Type-safe (no more `process.env.FOO!`)
- Centralized defaults

### 2.5 Global Cross-Cutting Concerns

**Pattern:** Applied at module level via NestJS decorators/providers.

| Concern | Implementation |
|---------|---------------|
| Validation | `app.useGlobalPipes(new ValidationPipe(...))` |
| Exceptions | `app.useGlobalFilters(new GlobalExceptionFilter())` |
| Rate Limiting | `APP_GUARD` provider with `ThrottlerGuard` |
| Security Headers | `app.use(helmet())` |
| CORS | `app.enableCors({ origin, credentials })` |
| Swagger | Conditional on `NODE_ENV === 'development'` |

---

## 3. Shared Package Patterns

### 3.1 Barrel Exports

**Pattern:** Each package exports from a central `index.ts`.

**Examples:**
- `packages/types/src/index.ts` — exports all interfaces
- `packages/ui/src/index.ts` — exports all components + utils
- `packages/utils/src/index.ts` — exports all functions

**Benefit:** Clean import paths for consumers.

### 3.2 Workspace Dependencies

**Pattern:** Internal packages referenced via `"*"` version in package.json.

**Evidence:**
```json
"dependencies": {
  "@hexastudio/types": "*",
  "@hexastudio/ui": "*",
  "@hexastudio/utils": "*"
}
```

**Mechanism:** npm workspaces resolve `*` to the local workspace version.

---

## 4. Testing Patterns

### 4.1 Frontend (Vitest)

**Configuration:**
- `jsdom` environment
- `@testing-library/react` for component tests
- `@testing-library/jest-dom` for assertions
- Global test setup in `test/setup.ts`

**Test Files Found:**
- `test/hooks/use-reduced-motion.test.ts`
- `test/hooks/useScrollProgress.test.ts`
- `test/hooks/use-media-query.test.ts`
- `test/lib/env.test.ts`
- `test/lib/utils.test.ts`
- `test/components/ui/Counter.test.tsx`
- `test/components/ui/TextReveal.test.tsx`
- `test/components/ui/NewsletterSection.test.tsx`
- `test/components/ui/StrapiBlocks.test.tsx`

**Pattern:** Hook tests use `renderHook` from Testing Library. Component tests use `render` + `screen`.

### 4.2 Backend (Vitest + Supertest)

**Configuration:** Uses `vite-tsconfig-paths` for path resolution.

**Test Files Found:**
- `test/auth.service.spec.ts`
- `test/projects.service.spec.ts`
- `test/articles.service.spec.ts`
- `test/services.service.spec.ts`
- `test/contact.service.spec.ts`
- `test/requests.service.spec.ts`
- `test/portal.service.spec.ts`
- `test/accounting.service.spec.ts`
- `test/email.service.spec.ts`
- `test/minio.service.spec.ts`
- `test/redis.service.spec.ts`
- `test/odoo.service.spec.ts`
- `test/users.service.spec.ts`
- `test/health.integration.spec.ts`
- `test/utils.spec.ts`

**Pattern:** Service unit tests mock dependencies (HttpService, Redis, etc.) and test business logic in isolation.

### 4.3 E2E (Playwright)

**Configuration:** `e2e/playwright.config.ts`

**Coverage:**
- Navigation tests
- Page rendering
- 404 handling
- SEO checks
- Accessibility scaffold

---

## 5. Anti-Patterns / Code Smells

### 5.1 Frontend

1. **Hardcoded values** — Draco URL, model paths, camera positions
2. **Inline event handlers in JSX** — `onClick`, `onPointerOver` directly in render
3. **Mixed component locations** — Some in `components/ui/`, others in `features/`
4. **No consistent loading strategy** — Some pages use Suspense, others don't

### 5.2 Backend

1. **Service constructor side effects** — `MinioService` creates client in constructor
2. **Magic numbers** — Circuit breaker thresholds, cache TTLs
3. **Empty catch blocks** — `catch {}` without logging in some places
4. **Duplicate URL parsing** — OdooService parses host URL in multiple methods

### 5.3 Cross-Cutting

1. **No consistent error format** — Frontend expects `ApiResponse<T>` but errors may not follow this shape
2. **Mixed validation strategies** — Backend uses class-validator, frontend uses Zod (in some places)
3. **Inconsistent naming** — `NavBar` vs `Navbar`, `use-reduced-motion.ts` (kebab-case file)

---

## 6. Naming Conventions

| Element | Convention | Adherence |
|---------|-----------|-----------|
| Components | PascalCase | ✅ Mostly |
| Functions/Variables | camelCase | ✅ |
| Constants | UPPER_SNAKE_CASE | ⚠️ Partial |
| Files | kebab-case | ⚠️ Mixed (some PascalCase) |
| Booleans | is/has/should/can prefix | ✅ |

**Violations:**
- `use-reduced-motion.ts` (kebab-case, should be `useReducedMotion.ts`)
- `SceneCanvas.tsx` re-exports without adding value
- Some constants not UPPER_SNAKE_CASE (e.g., `IDLE_RADIUS` in useCinematicCamera is, but others aren't)

---

*End of Code Patterns Identified*
