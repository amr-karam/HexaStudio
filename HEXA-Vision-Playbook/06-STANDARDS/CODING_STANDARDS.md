# 🛠️ CODING STANDARDS: THE HEXA QUALITY BAR

**Version:** 1.0 | **Scope:** All Engineering | **Standard:** Production-Grade / Zero-Debt

## 1. THE PHILOSOPHY OF CODE
At HEXA Studio, we write code for the **next engineer**. We value **readability over cleverness** and **explicitly over implicitly**. Our code is our documentation.

---

## 2. TYPESCRIPT & LANGUAGE RIGOR

### I. Type Safety (The "No-Any" Law)
- **Forbidden:** The `any` type is strictly prohibited. Use `unknown` if the type is truly unknown, or define a proper `Interface`/`Type`.
- **Strict Mode:** `strict: true` must be enabled in `tsconfig.json`.
- **Shared Types:** All DTOs and entities must reside in `/packages/types` to ensure synchronization between Backend and Frontend.
- **Explicitness:** Always explicitly define return types for functions.

### II. Naming Conventions (The "Semantic" Law)
- **Components:** `PascalCase` (e.g., `ProjectViewer.tsx`).
- **Functions/Variables:** `camelCase` (e.g., `calculateLOD()`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_SESSIONS_LIMIT`).
- **Files:** `kebab-case` (e.g., `user-auth.service.ts`).
- **Booleans:** Prefix with `is`, `has`, `should`, or `can` (e.g., `isLoading`, `hasAccess`).

---

## 3. FRONTEND STANDARDS (Next.js & R3F)

### I. Component Architecture
- **Atomic Design:** Split components into Atoms, Molecules, and Organisms.
- **Pure Components:** Keep logic (hooks) separate from presentation (JSX).
- **Performance:** Use `React.memo`, `useMemo`, and `useCallback` for expensive 3D calculations to avoid unnecessary re-renders.

### II. 3D Scene Optimization
- **Disposal:** Every geometry and material created must be manually disposed of in `useEffect` cleanup.
- **Instancing:** Use `InstancedMesh` for any repetitive architectural elements (windows, columns).
- **LOD (Level of Detail):** Implement LOD strategies for complex models to maintain 60 FPS.

---

## 4. BACKEND STANDARDS (NestJS)

### I. Layered Architecture
- **Controllers:** Handle requests and responses ONLY. No business logic.
- **Services:** House the core business logic.
- **Repositories:** Handle raw data access and database queries.
- **DTOs:** All inputs must be validated using `class-validator`.

### II. Error Handling
- **Global Filter:** Use a global `ExceptionFilter` to ensure consistent error responses.
- **Custom Exceptions:** Define project-specific exceptions (e.g., `AssetNotFoundException`).
- **Logging:** Use a structured logger (Loki/Promtail) with clear levels (`info`, `warn`, `error`).

---

## 5. GIT & COLLABORATION

### I. Atomic Commits
Each commit must solve **exactly one** problem. No "mixed" commits (e.g., fixing a bug and changing a color in one commit).

### II. Conventional Commits
`type(scope): description`
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation update
- `style`: Formatting, missing semi-colons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding missing tests
- `chore`: Updating build tasks

---

## 6. QUALITY GATE: THE "DONE" DEFINITION
A task is not "Done" until:
- [ ] It passes all TypeScript checks (no errors).
- [ ] It is linted and formatted according to Prettier.
- [ ] It has been tested for performance (FPS/LCP).
- [ ] It is documented in the Playbook if a new pattern was introduced.
- [ ] It has been reviewed by a Senior Agent/Human.

*“Code is read far more often than it is written. Write for the reader.”*
