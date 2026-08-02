# ADR-003: Circular Dependency Resolution — ProjectsModule / VectorModule / AIModule

**Date:** 2026-07-16
**Status:** Accepted
**Deciders:** Chief Architect, Backend Agent

---

## 1. CONTEXT

### Current Dependency Graph

The backend's module structure has a three-way circular dependency between `ProjectsModule`, `VectorModule`, and `AIModule`:

```
ProjectsModule ──► VectorModule (forwardRef)
VectorModule ────► AIModule (forwardRef), ProjectsModule (forwardRef)
AIModule ────────► VectorModule (forwardRef)
```

All three modules use `forwardRef()` to break the circular import cycle at the module level. While this works at runtime, it is a code smell that indicates insufficient separation of concerns.

### Service-Level Dependencies (the root cause)

The module-level imports are driven by these service-level cross-references:

| Dependent Service | Depends On |
|---|---|
| `ai/embedding.service.ts` | `VectorService` |
| `ai/lighting.service.ts` | `VectorService` |
| `vector/vector.service.ts` | `EmbeddingService` (from AI) |
| `vector/vector-sync.service.ts` | `EmbeddingService`, `ProjectsService` |
| `vector/recommendation.service.ts` | `EmbeddingService`, `ProjectsService` |
| `vector/vector.controller.ts` | `ProjectsService`, `AutoTagService`, `LightingService` |

### Global Module Status

| Module | `@Global()` | Notes |
|---|---|---|
| ProjectsModule | Yes | Exports `ProjectsService` globally |
| VectorModule | Yes | Exports all 3 services globally |
| AIModule | **No** | Must be explicitly imported by consumers |

Because **AIModule is not `@Global()`**, any module that needs AI services (EmbeddingService, AutoTagService, etc.) must import AIModule. This forces VectorModule to import AIModule even though VectorModule is itself global — creating the cycle.

### Why This Is a Problem

1. **Brittle initialization order** — NestJS's `forwardRef()` relies on lazy module reference resolution; complex graphs increase risk of `Cannot find module` or `undefined` provider errors at bootstrap.
2. **Reduced testability** — Mocking circular-dependent modules is cumbersome.
3. **Cognitive load** — Developers must understand the cycle before making changes, discouraging refactoring.
4. **Violates dependency inversion** — High-level modules (Projects) depend on low-level modules (Vector, AI) and vice versa.

---

## 2. CONSIDERED OPTIONS

### Option A: Extract Shared Module (Minimal Change)

Create a `SharedModule` with `@Global()` that re-exports the cross-cutting services. Both AI and Vector modules would import from SharedModule instead of each other.

- **Problem:** Does not resolve service-level circular dependency. `EmbeddingService` still imports `VectorService` and `VectorService` imports `EmbeddingService` at the class level. NestJS's DI container would still have a circular provider dependency.

### Option B: Interface-Based Inversion of Control (Recommended)

Extract interfaces for the circular-dependent services and use them across module boundaries. Register implementations as providers against their interfaces. This breaks the hard dependency at both the module and service levels.

- Create `IVectorService`, `IEmbeddingService`, `IProjectService` interfaces in a shared `packages/types` location or a new `shared/interfaces` directory.
- Services depend on interfaces, not concrete classes.
- Module imports become unidirectional.

### Option C: Merge AI + Vector Into a Single Module

The AI and Vector modules are architecturally related (both handle embedding/vector/search concerns). Merging them eliminates the circular dependency between them. ProjectsModule would only depend on the unified module.

- **Trade-off:** Creates a larger module; may blur distinct responsibilities (AI orchestration vs. vector storage).

### Option D: Keep `forwardRef()` + Document

Leave the code as-is and accept `forwardRef()` as a pragmatic solution. Document the pattern so future developers understand it.

- **Trade-off:** Does not address the underlying design issue; cycle remains.

---

## 3. TRADE-OFF ANALYSIS

| Option | Pros | Cons | Score (1-10) |
|--------|------|------|--------------|
| **A: Shared Module** | Low effort, no service refactor | Does not resolve service-level cycle; cosmetic only | 4 |
| **B: Interface IoC** | Clean separation; testable; follows SOLID | Moderate refactor effort; requires interface definitions | 9 |
| **C: Merge Modules** | Eliminates cycle cleanly | Larger module; conflates concerns | 6 |
| **D: Status Quo** | Zero effort | Tech debt; bootstrap fragility; poor DX | 3 |

---

## 4. THE DECISION

**Chosen Option:** **Option B: Interface-Based Inversion of Control** (phased), falling back to **Option D: Keep `forwardRef()` + Document** for the current sprint.

### Rationale

The full Option B refactor requires:
1. Defining interfaces in a shared location (`packages/types` or `apps/backend/src/shared/interfaces/`)
2. Refactoring all four circular-dependent services to use interface injection
3. Updating module metadata to use `provide`/`useClass` tokens
4. Updating tests

This is a medium-to-large refactor that must be done carefully to avoid regression. For the current sprint, we document the existing pattern with **Option D** and create a backlog item for the full **Option B** refactor.

### Resolution Plan (Phased)

**Phase 1 (Done — This ADR):**
- Document the circular dependency and this ADR.
- Ensure `forwardRef()` is correctly used in all three modules (verified — it is).

**Phase 2 (Next Sprint — Backlog Item):**
- Extract `IVectorService`, `IEmbeddingService`, `IVectorSyncService` interfaces into `apps/backend/src/modules/shared/interfaces/`.
- Refactor `VectorService` and `EmbeddingService` to implement those interfaces.
- Change injection tokens in dependent services to interfaces.
- Remove `forwardRef()` from `VectorModule` and `AIModule`.

**Phase 3 (Future):**
- Evaluate whether `AIModule` should be made `@Global()` (like ProjectsModule and VectorModule) to eliminate the final `forwardRef(() => VectorModule)` in AIModule.
- Consider merging `EmbeddingService` directly into `VectorModule` since embedding is intrinsically a vector concern.

---

## 5. IMPACT & CONSEQUENCES

### Positive
- Clearer module boundaries documented for future developers
- `forwardRef()` is correctly implemented and understood
- A concrete resolution plan exists and can be scheduled

### Negative
- `forwardRef()` remains in the codebase for at least one more sprint
- Developers must understand the cycle when working in these three modules

### Dependencies
- Backlog item must be created in `OPEN_TASKS.md` for Phase 2
- No changes to existing service behavior or API contracts

---

## 6. VERIFICATION PLAN

1. **Bootstrap test:** `npm run start:dev --workspace=apps/backend` must start without `Cannot find module` errors.
2. **No regression:** Existing tests must pass: `npm run test --workspace=apps/backend`.
3. **Phase 2 success criteria:** After refactor, `grep -r "forwardRef" apps/backend/src/modules/` returns zero results in ProjectsModule, VectorModule, and AIModule.

---

**Sign-off:** `Chief Architect Approved`
