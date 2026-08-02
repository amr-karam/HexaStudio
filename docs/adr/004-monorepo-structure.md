# ADR-004: Monorepo Structure with Shared Packages

## Status
Accepted

## Date
2025-01-15

## Context
The project contains three applications (frontend, backend, CMS) that share:
- TypeScript interfaces and DTOs
- Helper functions and utilities
- Environment variable schemas
- Validation logic

Without a monorepo, type mismatches and code duplication become chronic issues.

## Decision
We will use a **monorepo structure** with shared packages in `/packages`.

```
HexaStudio/
├── apps/
│   ├── frontend/    (Next.js)
│   ├── backend/     (NestJS)
│   └── cms/         (Strapi)
├── packages/
│   ├── types/       (Shared TypeScript interfaces)
│   └── utils/       (Shared helper functions)
├── docker/          (Infrastructure configs)
├── docs/            (Architecture documentation)
└── scripts/         (Deployment scripts)
```

## Alternatives Considered
| Alternative | Pros | Cons |
|-------------|------|------|
| Multi-repo | Independent deployments | Type duplication, cross-repo drift |
| Turborepo | Build caching, task orchestration | Added complexity, may be overkill |
| Nx | Excellent monorepo tooling | Steeper learning curve, larger footprint |
| Lerna (legacy) | Original monorepo tool | Deprecated, replaced by Nx |

## Rationale
1. **Type Safety**: Shared `/packages/types` ensures frontend and backend never disagree on data shapes.
2. **Code Reuse**: Utility functions (date formatting, validation) live in one place.
3. **Atomic Changes**: A breaking API change in the backend can be fixed in the same commit as the frontend update.
4. **Simplicity**: Plain monorepo without build orchestration — sufficient for our scale.

## Consequences
- Must maintain strict import boundaries (apps import from packages, never each other).
- Package changes require rebuilds of dependent apps.
- CI must test all affected packages on each PR.

## References
- [Monorepo by Example](https://monorepo.tools/)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
