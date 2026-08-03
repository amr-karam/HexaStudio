# ADR 0001: Monorepo Architecture with Turbo

- **Status:** Accepted
- **Date:** 2026-07-24
- **Author:** Lead Architect

## Context
HEXA Studio encompasses a Next.js 15 frontend, NestJS 10 backend, Strapi 5 CMS, and shared TypeScript type packages (`@hexastudio/types`, `@hexastudio/ui`, `@hexastudio/utils`).

## Decision
Adopt Turbo Monorepo (`turbo.json`) with pnpm/npm workspace linking.

## Consequences
- Shared TypeScript interfaces across frontend and backend.
- Incremental build caching for fast CI pipelines.
