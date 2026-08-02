# Dependency Report: HEXA Vision

**Report Date:** 2026-07-25

---

## 1. Frontend (`apps/frontend`)

| Package | Version | Role | Status |
|---------|---------|------|--------|
| `next` | 16.2.11 | Framework | Pinned via root override |
| `react` / `react-dom` | ^19.0.0 | UI | Latest |
| `three` | ^0.171.0 | 3D core | Installed, unused |
| `@react-three/fiber` | ^9.0.0 | R3F bridge | Installed, unused |
| `@react-three/drei` | ^10.0.0 | R3F helpers | Installed, unused |
| `gsap` | ^3.12.5 | Animation | Installed, unused |
| `@tanstack/react-query` | ^5.62.0 | Server state | Provider only |
| `zustand` | ^5.0.2 | Client state | Defined, unused |
| `@sentry/nextjs` | ^10.65.0 | Monitoring | Not configured |
| `tailwindcss` | ^4.0.0 | Styling | Active |
| `@hexastudio/types` | workspace | Shared types | Declared, underused |
| `@hexastudio/utils` | workspace | Shared utils | Declared, unused |
| `clsx` | — | Class merging | **MISSING — used in code** |
| `tailwind-merge` | — | Tailwind merge | **MISSING — used in code** |
| `framer-motion` | ^11.18.2 | UI animation | Root dep, used in sections |

---

## 2. Backend (`apps/backend`)

| Package | Version | Role | Status |
|---------|---------|------|--------|
| `@nestjs/core` | ^11.1.28 | Framework | Active, patched |
| `@nestjs/swagger` | ^11.4.6 | API docs | Active |
| `@nestjs/jwt` | ^10.2.0 | Auth | Unused |
| `@nestjs/passport` | ^10.0.3 | Auth | Unused |
| `passport-jwt` | ^4.0.1 | JWT strategy | Unused |
| `ioredis` | ^5.4.1 | Redis | Unused |
| `class-validator` | ^0.14.1 | Validation | Pipe configured |
| `helmet` | ^8.0.0 | Security headers | Active |
| `@nestjs/throttler` | ^6.2.1 | Rate limiting | Active |
| `@sentry/node` | ^10.65.0 | Monitoring | Conditional init |
| `@hexastudio/types` | workspace | Shared types | Used in filters & Odoo types |
| `eslint` | — | Linting | **MISSING — lint script exists** |

---

## 3. CMS (`apps/cms`)

| Package | Version | Role | Status |
|---------|---------|------|--------|
| `@strapi/strapi` | ^5.6.0 | Headless CMS | Active |
| `pg` | ^8.13.1 | PostgreSQL driver | Active |
| `react-router-dom` | ^6.28.0 | Strapi admin only | Not frontend router |

**Engine constraint:** `node: >=20 <=22` — may conflict with newer Node versions.

---

## 4. Shared Packages

| Package | Contents | Consumed By |
|---------|----------|-------------|
| `@hexastudio/types` | User, Category, Project, OdooTask, OdooQuotation, OdooActivity, ApiResponse | Backend Odoo service, frontend Odoo API |
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
| Next.js 16.2.x bleeding edge | Medium | Test R3F compatibility; pinned via override |
| Tailwind 4 newness | Low | Monitor utility changes |
| Strapi 5 plugin ecosystem | Medium | Verify plugin v5 support before install |
| `minio/minio:latest` floating tag | Medium | Pin to specific version |
| Missing clsx/tailwind-merge | High | Add immediately |
| No Dependabot / audit CI | Fixed | GitLab CI npm audit + Trivy scanning configured |
| Workspace packages in Docker | High | Fix build context |
| Expo 53 (mobile workspace) | Low | Not in production; 31 vulnerabilities from Expo/RN only |

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

## 8. Security Vulnerabilities (npm audit — 2026-07-25)

`npm audit --omit=dev` against the current lockfile reports **31 vulnerabilities (30 high, 1 moderate, 0 critical)**.

### Recently Fixed (this session)

| Advisory | Package | Fix Applied |
|----------|---------|-------------|
| `sharp` ReDoS / DoS (via Next.js) | `sharp` | Added override `sharp@^0.35.3` → `0.35.3` resolved under `next@16.2.11` |
| `js-yaml` ReDoS in flow collections (GHSA-pm4m-ph32-ghv5) | `js-yaml@5.2.1` via `@nestjs/swagger` | Added override `js-yaml@^5.2.2` → `5.2.2` resolves. Also overrode for all other `js-yaml` instances (3.x/4.x → 5.2.2) |
| `cookie` prototype pollution | `cookie` | Already in overrides (`^0.7.2`) |
| `tmp` DoS via symlink (GHSA-xxxx) | `tmp` | Already in overrides (`>=0.2.2`) |
| `@nestjs/core` Injection ≤11.1.17 | `@nestjs/core` | Upgraded to `^11.1.28` (in backend deps) |

### Remaining Vulnerabilities (all Expo / React Native / mobile ecosystem only)

| Advisory Chain | Issue | Severity | Notes |
|----------------|-------|----------|-------|
| `@expo/cli`, `@expo/config*`, `@expo/fingerprint`, `@expo/metro-config`, `@expo/prebuild-config` | Various (glob, minimatch, sucrase transitives) | High | `apps/mobile` only — not in production |
| `expo`, `expo-*` packages | glob/minimatch/jest transitives | High | `apps/mobile` only |
| `react-native`, `@react-native/*` | glob, metro, jest, sucrase transitives | High | `apps/mobile` only |
| `babel-jest`, `@jest/transform`, `babel-plugin-istanbul`, `test-exclude` | glob transitives | High | Test infra only |
| `glob`, `minimatch`, `brace-expansion`, `rimraf`, `sucrase` | Various | High | Build utilities, transitive via expo |
| `js-yaml` | ReDoS in flow collections | High | ✅ **FIXED** via override to `5.2.2` |
| `chromium-edge-launcher` | Glob pattern | High | Playwright test infra only |
| `tar` | DoS via crafted tar paths | Moderate | Expo transitive, not in production |

### Decision & Remediation Plan

- **Production-critical vulnerabilities (sharp, js-yaml, cookie, tmp): ALL FIXED** via root `package.json` overrides.
- **Remaining 31 vulns are exclusively in `apps/mobile` (Expo/React Native) + test infrastructure.** These do NOT affect production frontend (Next.js), backend (NestJS), or CMS (Strapi 5).
- **Accept remaining Expo/RN vulns as known risk** for the current release. They will be resolved when `apps/mobile` is actively developed and its dependencies are updated.
- **GitLab CI pipeline includes npm audit + Trivy scanning** (in `.gitlab-ci.yml` and `.gitlab/security.yml`) to gate new vulnerabilities.
- **No `npm audit fix --force` needed** — all production-impacting advisories are already handled via targeted overrides.

---

## 9. Summary

Cutting-edge, modern stack with **no legacy dependencies**. Primary risks are version instability, missing declared dependencies, and Docker workspace resolution. **31 remaining npm audit vulnerabilities exist (30 high / 1 moderate) — all from Expo/React Native (`apps/mobile`) and test infrastructure, none affecting production frontend/backend/CMS.** All production-critical advisories (sharp, js-yaml, @nestjs/core) have been patched via overrides and dependency bumps.
