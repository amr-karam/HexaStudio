# Dependency Audit — HEXA STUDIO

> Verified 2026-08-02 against `package.json` files. Findings are factual; remediation strategy lives in `docs/engineering/DEPENDENCY_MANAGEMENT.md`.

## Package Manager & Runtime

- **Package manager:** `npm@11.17.0` (workspaces monorepo; `pnpm-workspace.yaml` present but unused).
- **Node:** `>=20` (local v24.16.0).
- **Root tooling:** turbo.json, prettier, eslint per-workspace.

## Core Frameworks (verified)

| Package | Version |
|---------|---------|
| `next` | `16.2.11` |
| `react` | `^19.0.0` |
| `three` | `^0.171.0` |
| `tailwindcss` | `^4.0.0` |
| `@nestjs/core` | `^11.1.28` |
| `typescript` (frontend/backend) | `^5.7.0` |

## High-Impact Dependency Groups

- **3D/Visualization:** `three`, `@react-three/fiber`, `@react-three/drei`, postprocessing, XR.
- **State management:** `@reduxjs/toolkit` (root/CMS), `zustand` + `@tanstack/react-query` (apps) — split defined by ADR-006.
- **Styling/Animation:** `tailwindcss` 4, `framer-motion`, GSAP.
- **Observability:** `@sentry/nextjs`, `@opentelemetry/api`, `prom-client`, web-vitals.
- **API/Realtime:** socket.io, axios, swagger, class-validator, helmet, passport + JWT.

## Root `overrides` (verified — matches `docs/engineering/DEPENDENCY_MANAGEMENT.md`)

```json
"overrides": {
  "framer-motion": "^11.18.2",
  "cookie": "^0.7.2",
  "tmp": ">=0.2.2",
  "uuid": "^11.1.1",
  "postcss": "^8.5.10",
  "sharp": "^0.35.3",
  "@types/react": "19.2.17",
  "@xmldom/xmldom": ">=0.9.0",
  "js-yaml": "^5.2.2"
}
```

## Findings

1. **Overrides (medium):** 9 forced resolutions mask transitive conflicts; each must be justified and reduced one at a time (audit → upgrade upstream → remove override → verify build/tests).
2. **State fragmentation (medium):** Redux Toolkit, Zustand, and React Query coexist; ADR-006 defines the intended per-app split — enforce in reviews.
3. **Odoo integration (low):** custom Python (`odoo/`) talks JSON-RPC; keep as thin, versioned API surface.
4. **npm vs pnpm (low):** `pnpm-workspace.yaml` is a leftover; remove or adopt — do not maintain both.

## References
- `docs/engineering/DEPENDENCY_MANAGEMENT.md`, `docs/adr/006-state-management.md`, `package.json`, `apps/*/package.json`
