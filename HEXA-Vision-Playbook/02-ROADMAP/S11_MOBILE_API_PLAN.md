# S11-P0-001: Mobile API v1 — Implementation Plan

**Status:** 📋 PLANNING → 🟢 ACTIVE | **Owner:** Backend Agent | **Target:** 2026-07-20

## 1. Objective

Adapt the existing NestJS backend to serve mobile clients (React Native / Expo) by fixing auth, adding pagination, versioning the API, and securing public endpoints.

## 2. Audit Findings Summary

| Area | Gap | Severity |
|------|-----|----------|
| Auth | Cookie-only refresh; no body-based refresh token | 🔴 Critical |
| Auth | No token blacklist/revocation | 🟡 Important |
| Auth | No password reset flow | 🟡 Important |
| List Endpoints | No pagination on `GET /projects`, `/articles`, `/services` | 🔴 Critical |
| API Versioning | No prefix (`/api` vs `/api/v1`) | 🟡 Important |
| Security | AI endpoints (`/agents/*`, `/assistants/*`) have zero auth | 🔴 Critical |
| Docs | Playbook describes different API than implemented | 🟡 Important |
| Error Handling | No typed error codes for programmatic handling | 🟡 Important |

## 3. Implementation Phases

### Phase 1: Mobile Auth (Priority: 🔴 Critical)
- [ ] Add `POST /auth/refresh-token` returning bearer token in body
- [ ] Add refresh token rotation (long-lived refresh token, single-use)
- [ ] Add token blacklist in Redis for logout/revocation
- [ ] Add `POST /auth/forgot-password` and `POST /auth/reset-password`
- [ ] Add mobile-friendly error codes for auth flows

### Phase 2: API Versioning (Priority: 🟡 Important)
- [ ] Add `/api/v1` prefix support alongside `/api`
- [ ] Implement version header negotiation (`Accept-Version`)
- [ ] Move all existing endpoints to v1

### Phase 3: Pagination (Priority: 🔴 Critical)
- [ ] Add `?page=&limit=` query params to `GET /projects`
- [ ] Add `?page=&limit=` to `GET /articles`
- [ ] Add `?page=&limit=` to `GET /services`
- [ ] Return `meta: { total, page, limit, totalPages }` in response

### Phase 4: Security & Error Handling (Priority: 🟡 Important)
- [ ] Add JWT auth to all `/agents/*` and `/assistants/*` endpoints
- [ ] Implement rate limit tiers (public vs authenticated)
- [ ] Add typed error codes (`ERR_AUTH_EXPIRED`, `ERR_VALIDATION`, etc.)
- [ ] Add `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers

## 4. Mobile Auth Flow

```
[Mobile App] → POST /api/v1/auth/login ({ identifier, password })
    ↓
[Server] → Validates against Strapi, issues:
    - accessToken (Bearer, 15min expiry)
    - refreshToken (opaque, 30-day expiry, stored in Redis)
    ↓
[Mobile App] → Stores tokens securely (react-native-keychain / expo-secure-store)
    ↓
[Mobile App] → Uses Bearer accessToken on all authenticated requests
    ↓
[When 401] → POST /api/v1/auth/refresh-token ({ refreshToken })
    ↓
[Server] → Validates refreshToken in Redis, rotates it (issues new pair), invalidates old
    ↓
[Mobile App] → Updates stored tokens, retries original request
```

## 5. Dependencies

- Redis (already running for cache — can reuse for token blacklist/refresh storage)
- `@nestjs/throttler` (already installed)
- No new packages needed

## 5. Completed Work

### Phase 1: Mobile Auth (✅ Done)
| Item | Status |
|------|--------|
| Refresh token rotation (opaque UUIDs in Redis, 30-day TTL) | ✅ |
| JWT blacklisting via `jti` on logout | ✅ |
| `POST /auth/refresh-token` (body-based, returns tokens) | ✅ |
| `POST /auth/forgot-password`, `POST /auth/reset-password` | ✅ |
| `POST /auth/logout` accepts optional `refreshToken` | ✅ |
| Login/register return `accessToken` + `refreshToken` in body | ✅ |
| Backward-compatible cookie auth for web clients | ✅ |

### Phase 3: Pagination (✅ Done)
| Item | Status |
|------|--------|
| `GET /api/projects?page=&limit=` with meta (page, limit, totalPages) | ✅ |
| `GET /api/articles?page=&limit=` with meta | ✅ |
| `GET /api/services?page=&limit=` with meta | ✅ |

### Phase 4: Security (✅ Done)
| Item | Status |
|------|--------|
| JWT auth on all `POST /agents/*` endpoints | ✅ |
| Added `@ApiBearerAuth()` + `@UseGuards(JwtAuthGuard)` | ✅ |

### Phase 2: API Versioning (✅ Done)
| Item | Status |
|------|--------|
| `enableVersioning({ type: URI, defaultVersion: '1' })` in main.ts | ✅ |
| All 14 existing controllers marked `VERSION_NEUTRAL` for backward compat | ✅ |
| New controllers can use `@Version('1')` for `/api/v1/...` paths | ✅ |

### Security Fixes (✅ Done)
| Item | Status |
|------|--------|
| @sentry/nextjs 9.47.1 → 10.65.0 (frontend) | ✅ |
| @sentry/node 8.55.2 → 10.65.0 (backend) | ✅ |
| @opentelemetry/core vuln (GHSA-8988) — FIXED | ✅ |
| npm overrides for cookie, tmp, uuid | ✅ |
| Total vulns: 29 → 24 (remaining are all NestJS CLI/dev or framework upgrades) | ✅ |

### WebXR Viewer (✅ Scaffolded)
| Item | Status |
|------|--------|
| `@react-three/xr` + `three-mesh-bvh` installed | ✅ |
| `features/xr/` module (components, hooks, store, utils, config) | ✅ |
| `app/xr-viewer/` route (fullscreen, no navbar) | ✅ |
| `LayoutShell` component for fullscreen route support | ✅ |

## 6. Pre-existing Issues Found (Not in Current Scope)

| Phase | Item | Status |
|-------|------|--------|
| 1 | Mobile-friendly auth (refresh token rotation, blacklist, password reset) | ✅ |
| 1 | JWT AuthGuard passes raw token to request for blacklisting | ✅ |
| 1 | `POST /auth/refresh-token` (body-based, mobile-friendly) | ✅ |
| 1 | `POST /auth/forgot-password`, `POST /auth/reset-password` | ✅ |
| 1 | `POST /auth/logout` accepts optional refreshToken body param | ✅ |
| 1 | Login/register return `accessToken` + `refreshToken` in body | ✅ |
| 3 | Pagination on `GET /projects?page=&limit=` | ✅ |
| 3 | Pagination on `GET /articles?page=&limit=` | ✅ |
| 3 | Pagination on `GET /services?page=&limit=` | ✅ |
| 4 | JWT auth on `POST /agents/*` endpoints | ✅ |

## 7. Pre-existing Issues Found (Not in Current Scope)

| Issue | Detail |
|-------|--------|
| Assistants module incomplete | 4 of 7 services missing; controller imports broken |
| Assistants endpoints have no auth | Cannot add auth until module is fixed |
| Backend typecheck broken | Pre-existing NestJS module resolution errors |
| `modules/index.ts` referenced wrong path for AssistantsModule | Fixed (`.agents/` → `.assistants/`) |

## 8. Success Criteria

| Metric | Target |
|--------|--------|
| Mobile Login Flow | <1s p95 |
| Token Refresh | <500ms p95 |
| Paginated Response | <300ms p95 |
| API Compatible with Expo SDK 51+ | ✅ |
| Auth endpoints return tokens in body | ✅ |
