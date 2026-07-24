# Dependency Report: HEXA Vision

**Report Date:** 2026-06-30

---

## 1. Frontend (`apps/frontend`)

| Package | Version | Role | Status |
|---------|---------|------|--------|
| `next` | ^15.1.0 | Framework | Latest |
| `react` / `react-dom` | ^19.0.0 | UI | Latest |
| `three` | ^0.171.0 | 3D core | Installed, unused |
| `@react-three/fiber` | ^9.0.0 | R3F bridge | Installed, unused |
| `@react-three/drei` | ^10.0.0 | R3F helpers | Installed, unused |
| `gsap` | ^3.12.5 | Animation | Installed, unused |
| `@tanstack/react-query` | ^5.62.0 | Server state | Provider only |
| `zustand` | ^5.0.2 | Client state | Defined, unused |
| `@sentry/nextjs` | ^8.45.0 | Monitoring | Not configured |
| `tailwindcss` | ^4.0.0 | Styling | Active |
| `@hexastudio/types` | workspace | Shared types | Declared, underused |
| `@hexastudio/utils` | workspace | Shared utils | Declared, unused |
| `clsx` | — | Class merging | **MISSING — used in code** |
| `tailwind-merge` | — | Tailwind merge | **MISSING — used in code** |
| `framer-motion` | — | UI animation | **Not installed** (docs only) |

---

## 2. Backend (`apps/backend`)

| Package | Version | Role | Status |
|---------|---------|------|--------|
| `@nestjs/core` | ^10.4.15 | Framework | Active |
| `@nestjs/jwt` | ^10.2.0 | Auth | Unused |
| `@nestjs/passport` | ^10.0.3 | Auth | Unused |
| `passport-jwt` | ^4.0.1 | JWT strategy | Unused |
| `ioredis` | ^5.4.1 | Redis | Unused |
| `class-validator` | ^0.14.1 | Validation | Pipe configured |
| `helmet` | ^8.0.0 | Security headers | Active |
| `@nestjs/throttler` | ^6.2.1 | Rate limiting | Active |
| `@sentry/node` | ^8.45.0 | Monitoring | Conditional init |
| `@hexastudio/types` | workspace | Shared types | Used in filter |
| `eslint` | — | Linting | **MISSING — lint script exists** |

---

## 3. CMS (`apps/cms`)

| Package | Version | Role | Status |
|---------|---------|------|--------|
| `@strapi/strapi` | ^5.6.0 | Headless CMS | Active |
| `pg` | ^8.13.1 | PostgreSQL driver | Active |
| `react-router-dom` | ^6.28.0 | Strapi admin only | Not frontend router |

**Engine constraint:** `node: >=20 <=22` — conflicts with local Node v24.

---

## 4. Shared Packages

| Package | Contents | Consumed By |
|---------|----------|-------------|
| `@hexastudio/types` | User, Category, Project, ApiResponse | Backend filter |
| `@hexastudio/utils` | formatDate, slugify, isValidEmail, clamp | None |

---

## 5. Infrastructure Images

| Service | Image | Version |
|---------|-------|---------|
| Traefik | `traefik:v3.3` | Latest stable |
| PostgreSQL | `postgres:16-alpine` | LTS |
| Redis | `redis:7-alpine` | Stable |
| MinIO | `minio/minio:latest` | Latest tag risk |
| Prometheus | `prom/prometheus:v2.54.1` | Pinned |
| Grafana | `grafana/grafana:11.3.0` | Pinned |
| Loki | `grafana/loki:3.2.1` | Pinned |

---

## 6. Risk Analysis

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Duplicate React versions** | Critical | Root `package.json` overrides force React 19 |
| React 19 / Next 15 bleeding edge | Medium | Pin minors; test R3F compatibility early |
| Tailwind 4 newness | Low | Monitor utility changes |
| Strapi 5 plugin ecosystem | Medium | Verify plugin v5 support before install |
| `minio/minio:latest` floating tag | Medium | Pin to specific version |
| Missing clsx/tailwind-merge | High | Add immediately |
| No Dependabot / audit CI | Medium | Add `npm audit` to CI |
| Workspace packages in Docker | High | Fix build context |

---

## 7. Recommended Additions

| Package | Target | Purpose |
|---------|--------|---------|
| `clsx`, `tailwind-merge` | frontend | Fix build |
| `eslint`, `@typescript-eslint/*` | backend | Enable lint |
| `vitest` + `@testing-library/react` | frontend | Unit tests |
| `playwright` | root | E2E (Phase 3) |
| `@radix-ui/react-slot` | frontend | Proper `asChild` (optional) |

---

## 8. Security Vulnerabilities (npm audit — 2026-07-15)

`npm audit --omit=dev` against the current lockfile reports **35 vulnerabilities (11 high, 18 moderate, 6 low)**, all surfaced by GitLab Dependency Scanning on `main`.

### Root Causes (all transitive / indirect)

| Advisory Chain | Issue | Severity | Fix Path |
|----------------|-------|----------|----------|
| `@ai-sdk/provider-utils` ≤3.0.97 (Uncontrolled Resource Consumption) → `ai`, `@ai-sdk/react`, `@ai-sdk/gateway` → **Strapi 5** (`@strapi/strapi`) | Resource exhaustion | High | `npm audit fix --force` → downgrades `@strapi/strapi` to `4.26.2` (**major breaking**) |
| `@nestjs/core` ≤11.1.17 (Injection) → `@nestjs/platform-express` | Injection | Moderate | `npm audit fix --force` → `@nestjs/core@11.1.28` (flagged breaking) |
| `express` / `body-parser` / `multer` / `vite` transitives (via Strapi & tooling) | Various | Moderate | Requires `--force` bump |

### Decision & Remediation Plan

- **Do NOT apply `npm audit fix --force` to the live production system.** Every available fix is a breaking change (notably a Strapi 5 → 4 downgrade and NestJS major bump) that would require a full rebuild + regression test of backend and CMS before any deploy. The production stack on `19.16.1.100` is currently healthy and must not be destabilized.
- **Accept as known risk** for the current release; track via GitLab Dependency Scanning on the `hexa/hexa-studio` project.
- **Schedule a Dependency Upgrade Sprint** (Phase: Maintenance) to:
  1. Upgrade Strapi 5 to the latest patched 5.x (avoid the 4.x downgrade) — addresses the `@ai-sdk/*` chain via Strapi's own bump.
  2. Bump `@nestjs/*` to the patched 11.1.x line with a backend test pass.
  3. Refresh `vite` / `express` transitives via a clean `npm install --legacy-peer-deps` + lockfile reconcile.
  4. Re-run `npm audit` and confirm 0 high/critical before promoting to production.
- Add `npm audit` as a CI gate (ref. Risk Analysis row "No Dependabot / audit CI").

---

## 9. Summary

Cutting-edge, modern stack with **no legacy dependencies**. Primary risks are version instability, missing declared dependencies, and Docker workspace resolution. **35 known npm audit vulnerabilities exist (11 high / 18 moderate / 6 low)** — all transitive and requiring breaking upgrades; accepted as known risk pending a scheduled Dependency Upgrade Sprint (see §8).
