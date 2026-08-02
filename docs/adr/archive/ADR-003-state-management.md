# ADR-003: State Management Strategy

**Status:** Accepted
**Date:** 2026-07-08
**Deciders:** Chief Architect, Frontend Lead

---

## Context

The application has two distinct state domains: ephemeral client-side state (UI, camera, animations) and server-state (projects, blog posts, user data). We need a state management solution that handles both without duplication or complexity.

## Decision

Use a **dual approach**: Zustand for client state, TanStack Query for server state.

### Client State (Zustand)

- **cameraStore**: 3D camera transitions and animation state
- Lightweight, no boilerplate, TypeScript-first
- Persisted when needed via zustand/middleware

### Server State (TanStack Query)

- All API data fetching via `useQuery` / `useMutation`
- Automatic caching, refetching, and stale management
- Deduplication of requests across components

### Rationale

- Zustand avoids Redux boilerplate for UI state
- TanStack Query eliminates manual loading/error state management
- No single global store that grows unbounded
- Separation of concerns: server data lifecycle vs client UI state

## Consequences

### Positive
- Minimal boilerplate for simple stores
- Automatic cache invalidation for API data
- DevTools available for both
- Easy to test (stores are plain functions)

### Negative
- Two dependencies instead of one
- Learning curve for Zustand patterns
- Must be disciplined about which state goes where

## Verification

- API data refetches when stale without manual triggers
- Camera state persists across route changes where needed
- No duplicate API calls for the same data
