# HEXA Studio — Shared Packages Review

**Analysis Date:** 2026-07-12  
**Components:** `packages/types`, `packages/ui`, `packages/utils`

---

## 1. packages/types

**File:** `src/index.ts` — 121 lines  
**Purpose:** Single source of truth for all TypeScript interfaces shared between frontend and backend

### 1.1 Interfaces Defined

| Interface | Fields | Used By |
|-----------|--------|---------|
| `Project` | 17 fields | Frontend portfolio, backend ProjectsService |
| `ProjectModel` | 4 fields | 3D scene system |
| `ProjectHotspot` | 5 fields | 3D scene, Strapi CMS |
| `Category` | 3 fields | Portfolio, blog |
| `ProjectResponse` | 2 fields | API pagination |
| `User` | 4 fields | Auth, frontend state |
| `Article` | 15 fields | Blog feature |
| `ArticleResponse` | 2 fields | API pagination |
| `Service` | 9 fields | Services page |
| `ServiceResponse` | 2 fields | API pagination |
| `ContactMessage` | 4 fields | Contact form |
| `AuthResponse` | 2 fields | Auth flow |
| `ApiResponse<T>` | Generic wrapper | All API responses |

### 1.2 Strengths

- **End-to-end type safety** — Both frontend and backend import from this package
- **Generic `ApiResponse<T>`** — Reusable wrapper for all endpoints
- **Clear domain modeling** — Projects, Articles, Services are well-defined

### 1.3 Issues & Gaps

1. **`Article.content: unknown[]`** — Too generic. Should be a specific RichText type or at least `Record<string, unknown>[]`. This loses type safety for CMS content blocks.

2. **Missing types:**
   - No `OdooProject` or `ProjectStatus` type despite Odoo integration
   - No `SceneConfig` or `CinematicPoint` type despite `model-registry.ts` defining these inline
   - No `MinioFile` or `UploadResult` type despite MinIO service
   - No `HealthCheck` type for health endpoint response
   - No `ErrorResponse` type matching the backend's error format

3. **`User.role` type mismatch:**
   - Defined as `'admin' | 'editor' | 'user'`
   - Backend `AuthService.mapUser()` only maps to `'admin' | 'user'`
   - This creates a type inconsistency

4. **No validation decorators** — The types are plain interfaces. Backend uses `class-validator` with DTO classes, but there's no shared validation schema (e.g., Zod or class-validator DTOs in the types package).

---

## 2. packages/ui

**File:** `src/index.ts` — 6 lines (exports)  
**Package:** `@hexastudio/ui` — 27 lines in package.json  
**Purpose:** Shared UI component library

### 2.1 Components Exported

| Component | File | Description |
|-----------|------|-------------|
| `Button` | `Button.tsx` | Action button |
| `Input` | `Input.tsx` | Text input field |
| `Card` | `Card.tsx` | Content container |
| `Modal` | `Modal.tsx` | Dialog overlay |
| `NavBar` | `NavBar.tsx` | Navigation bar |

### 2.2 Dependencies

- `clsx` — className utility
- `tailwind-merge` — Tailwind class merging
- `framer-motion` — Animations
- `lucide-react` — Icons
- `@radix-ui/react-slot` — Component composition

### 2.3 Issues

1. **Very small library** — Only 5 components. The frontend has many more UI components (`Footer`, `TextReveal`, `Counter`, `NewsletterSection`, `Magnetic`, `CTASection`, etc.) that are not shared.

2. **No consistent styling tokens** — Components don't reference a shared design token system. Colors are hardcoded (e.g., `#c9a96e` for gold accent).

3. **No Storybook or documentation** — No visual documentation for the component library.

4. **`NavBar` naming** — Inconsistent with React convention (`NavBar` vs `Navbar`). The frontend has both `NavBar` (in ui package) and `Navbar` (in components).

---

## 3. packages/utils

**File:** `src/index.ts` — 37 lines  
**Package:** `@hexastudio/utils` — 10 lines in package.json  
**Purpose:** Shared utility functions

### 3.1 Functions Exported

| Function | Purpose | Lines |
|----------|---------|-------|
| `formatDate(date)` | Intl.DateTimeFormat wrapper | 4 |
| `slugify(text)` | URL-friendly slug generation | 8 |
| `isValidEmail(email)` | Basic email regex validation | 4 |
| `clamp(val, min, max)` | Number clamping | 4 |

### 3.2 Issues

1. **Extremely minimal** — Only 4 utility functions. A production codebase typically needs many more (debounce, throttle, deep clone, format currency, etc.).

2. **`isValidEmail` regex is basic** — Doesn't cover all valid email formats per RFC 5322. Should use a library or more robust regex.

3. **No tree-shaking setup** — The package exports everything from `index.ts`, but there's no `sideEffects: false` in package.json for optimal bundling.

4. **No tests** — The utils package has no test file despite having a `test` script in package.json.

---

## 4. Cross-Package Issues

### 4.1 Version Synchronization

- `packages/ui` has `"version": "0.1.0"`
- `packages/types` has no version in package.json
- `packages/utils` has `"version": "0.1.0"`

The root `package.json` has `"version": "1.0.0"`, but workspace packages are at 0.1.0. This creates confusion about the actual version.

### 4.2 Build Configuration

- `packages/ui` has a `build` script that compiles TypeScript
- `packages/types` has no build script (just `typecheck`)
- `packages/utils` has no build script (just `typecheck`)

For a monorepo with shared packages, all packages should have consistent build outputs.

### 4.3 Type-Only Imports

The types package exports interfaces, which are erased at runtime. There's no need for a build step, but consumers need the TypeScript compiler to resolve the types. This works with npm workspaces but could cause issues with external consumers.

---

## 5. Recommendations

### 5.1 packages/types
1. Replace `unknown[]` with proper RichText types
2. Add missing domain types (Odoo, Scene, MinIO, Health)
3. Fix `User.role` type mismatch with backend
4. Consider adding Zod schemas for runtime validation
5. Add `ErrorResponse` type matching backend format

### 5.2 packages/ui
1. Expand component library to cover more UI patterns
2. Create design tokens file for colors, spacing, typography
3. Add Storybook for component documentation
4. Standardize naming convention (camelCase vs PascalCase)
5. Export types alongside components

### 5.3 packages/utils
1. Add more utility functions (debounce, throttle, format currency, etc.)
2. Replace basic email regex with robust validation
3. Add tests for all utilities
4. Add `sideEffects: false` to package.json
5. Consider using `libsodium-wrappers` for crypto utilities (already in root deps)

---

*End of Shared Packages Review*
