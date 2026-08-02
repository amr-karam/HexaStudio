# ADR-001: Monorepo Structure

**Status:** Accepted
**Date:** 2026-07-08
**Deciders:** Chief Architect, DevOps Engineer

---

## Context

The HEXA Vision platform consists of multiple services (frontend, backend, CMS, Odoo) that share types and utilities. We need a repository structure that enables code sharing, atomic cross-cutting changes, and consistent CI/CD.

## Decision

Use a **monorepo** with npm workspaces.

### Structure

```
hexa-studio/
├── apps/
│   ├── frontend/    # Next.js
│   ├── backend/     # NestJS
│   └── cms/         # Strapi
├── packages/
│   ├── types/       # Shared TypeScript types
│   ├── ui/          # Shared UI components
│   └── utils/       # Shared utilities
├── docker/           # Infrastructure configs
├── scripts/          # Utility scripts
└── e2e/              # End-to-end tests
```

### Tooling

- **npm workspaces** for package resolution
- **TypeScript project references** for type checking
- **ESLint + Prettier** at root level for consistency

## Consequences

### Positive
- Single version control for all services
- Atomic commits for cross-cutting changes
- Consistent CI/CD across all services
- Shared types without publishing to npm
- Simplified dependency management

### Negative
- Larger clone size (mitigated with sparse checkout)
- CI must filter by path to avoid unnecessary runs
- Requires discipline to maintain boundaries

## Alternatives

| Alternative | Pros | Cons |
|-------------|------|------|
| Multi-repo | Independent versioning | Cross-repo changes require multiple PRs |
| Git submodules | Modular | Complex workflows, easy to break |
| Monorepo (Turborepo) | Build caching | Additional dependency |

## Compliance

- All code must be created within the monorepo structure
- No separate repositories for platform services
- Shared types must live in `packages/types/`
