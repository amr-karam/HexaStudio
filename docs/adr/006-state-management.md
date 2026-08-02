# ADR-006: Zustand + TanStack Query for State Management

## Status
Accepted

## Date
2025-01-15

## Context
The application requires two distinct types of state:
1. **Client State**: UI interactions (modal open/close, cursor mode, scene settings)
2. **Server State**: API data (projects, blog posts, services)

Using a single solution for both creates complexity and performance issues.

## Decision
We will use **Zustand** for client state and **TanStack Query** for server state.

## Alternatives Considered
| Alternative | Pros | Cons |
|-------------|------|------|
| Redux Toolkit | Battle-tested, large ecosystem | Boilerplate, overkill for client state |
| Jotai | Atomic model, fine-grained updates | Smaller ecosystem, less server state support |
| Recoil | Atomic, concurrent-safe | Deprecated, limited maintenance |
| SWR | Simple server state | Less cache control, no mutation helpers |

## Rationale
1. **Zustand**: Minimal API, no providers needed, perfect for UI state (cursor, modals, settings).
2. **TanStack Query**: Handles caching, refetching, and optimistic updates for API data.
3. **Separation**: Client state is ephemeral; server state is cached and synchronized. Mixing them causes bugs.
4. **Performance**: Zustand's selector pattern prevents unnecessary re-renders; TanStack Query deduplicates requests.

## Consequences
- Must clearly categorize state: "Is this UI state or API data?"
- Zustand stores must be small and focused (one store per concern).
- TanStack Query keys must be descriptive and hierarchical.

## References
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [TanStack Query Docs](https://tanstack.com/query/)
