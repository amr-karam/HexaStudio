# ADR-014: Centralized Optimized Resource Loading System

## Status
Proposed

## Context
The current resource loading (skills, tools, items, documentation, equipment) is fragmented and lacks a unified strategy for performance optimization. To meet the project's high-performance requirements, we need a centralized, optimized resource loading service.

## Decision
Implement a centralized `ResourceLoader` service that provides:
1. **Lazy Loading**: Load resources only when requested.
2. **Parallel Fetching**: Use `Promise.all` for concurrent resource requests.
3. **Caching**: Implement in-memory and persistent caching (e.g., Redis for backend, `localStorage`/`IndexedDB` for frontend).
4. **Compression**: Use Gzip/Brotli for resource payloads.

## Consequences
- Improved initial load times.
- Reduced latency for resource access.
- Consistent resource loading patterns across the application.
- Increased complexity in the initial implementation of the `ResourceLoader` service.
