# HEXA Studio — Authentication & Backend Modules Deep Dive

**Analysis Date:** 2026-07-12  
**Components:** Auth, Projects, Odoo, Storage, MinIO

---

## 1. Authentication System

### 1.1 Architecture

The auth system is a **proxy authentication pattern** — NestJS does not manage users itself. It delegates to Strapi's authentication endpoints and issues its own JWT tokens.

```
Client → NestJS /auth/login → Strapi /api/auth/local
    ↓
Strapi returns user + JWT
    ↓
NestJS creates its own JWT (RS256, 7d TTL)
    ↓
NestJS returns JWT + user to client
    ↓
Client stores JWT in HTTP-only cookie
```

### 1.2 AuthModule

**File:** `auth.module.ts` — 28 lines

**Dependencies:**
- `HttpModule` — for calling Strapi REST API
- `PassportModule` — JWT strategy registration
- `JwtModule` — JWT signing/verification with async config

**Exports:** `AuthService`, `JwtModule` (available to other modules)

### 1.3 AuthService

**File:** `auth.service.ts` — 97 lines

**Methods:**
| Method | Purpose | Strapi Endpoint |
|--------|---------|-----------------|
| `register()` | Create new user | `POST /api/auth/local/register` |
| `login()` | Authenticate user | `POST /api/auth/local` |
| `validateToken()` | Verify JWT + get user | `GET /api/users/me` |
| `refreshToken()` | Issue new JWT | `GET /api/users/:id` |

**User Mapping:**
```ts
private mapUser(data): User {
  return {
    id: String(data.id),
    email: data.email,
    username: data.username,
    role: data.role?.type === 'admin' ? 'admin' : 'user',  // Only 2 roles!
  };
}
```

**Issues Identified:**
1. **Role mapping is lossy** — Strapi's `editor` role maps to `user` in NestJS. The `User` type in `@hexastudio/types` defines `'admin' | 'editor' | 'user'`, but the service only distinguishes `admin` vs `user`.
2. **No password hashing in NestJS** — Passwords are sent to Strapi in plain text (over HTTPS). Strapi handles hashing, but this creates a tight coupling.
3. **validateToken on every request** — The JWT strategy calls `validateToken()` which hits Strapi's `/api/users/me` on every authenticated request. This adds latency and a dependency on Strapi availability for auth.

### 1.4 JwtStrategy

**File:** `jwt.strategy.ts` — 31 lines

**Token Extraction Order:**
1. `request.cookies.auth_token` (HTTP-only cookie)
2. `Authorization: Bearer <token>` header

**Validation:**
- Extracts `sub` (user ID) and `email` from payload
- Calls `authService.validateToken()` which proxies to Strapi
- Returns `User` object or throws `UnauthorizedException`

### 1.5 AuthController

**File:** `auth.controller.ts` — 107 lines

**Endpoints:**
| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/auth/register` | POST | No | Register new user |
| `/auth/login` | POST | No | Login, set cookie |
| `/auth/me` | GET | Yes | Get current user |
| `/auth/refresh` | POST | Yes | Refresh JWT |
| `/auth/logout` | POST | No | Clear cookie |

**Cookie Configuration:**
```ts
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
```

**Strengths:**
- HTTP-only cookies prevent XSS token theft
- `sameSite: 'lax'` provides CSRF protection
- `secure` flag enabled in production

**Concerns:**
1. **No CSRF token** — While `sameSite: 'lax'` helps, state-changing operations (login, logout, refresh) should have explicit CSRF protection
2. **Refresh endpoint requires current JWT** — If the access token expires, the user can't refresh without re-login. The security standards mention 15-minute access token TTL, but the code shows 7 days for both.

---

## 2. Projects Module

### 2.1 ProjectsService

**File:** `projects.service.ts` — 160 lines

**Responsibilities:**
- Fetch all published projects from Strapi
- Fetch single project by slug
- Enrich project data with Odoo status
- Map Strapi v4/v5 relation formats

**Strapi Compatibility Layer:**
```ts
function mapCategory(relation: StrapiRelation | undefined): Category | undefined {
  // Strapi v5: flat relation { id, name, slug }
  if (relation.id && relation.name) { ... }
  // Strapi v4: nested relation { data: { id, attributes: { name, slug } } }
  if (relation.data) { ... }
}
```

This dual-format mapping suggests the codebase is in transition from Strapi v4 to v5.

**Odoo Enrichment:**
- For each project, calls `OdooService.searchRead('project.project', [['x_slug', '=', slug]], ['stage_id'])`
- Updates `project.status` with Odoo stage name
- Errors are caught and logged but don't fail the request

**Issues:**
1. **N+1 query problem** — `getAllProjects()` enriches every project with a separate Odoo call. For 50 projects, this is 50 sequential XML-RPC calls.
2. **Odoo dependency in ProjectsService** — Tight coupling. If Odoo is down, project listing still works but without status.
3. **Hardcoded Strapi endpoint** — `/api/portfolios` is hardcoded. Should be configurable.

---

## 3. Odoo Integration

### 3.1 OdooService

**File:** `odoo.service.ts` — 201 lines

**Architecture:**
- XML-RPC client for Odoo 16+ compatibility
- Implements **Circuit Breaker pattern** for resilience
- Uses Redis for caching

**Circuit Breaker States:**
- **CLOSED:** Normal operation, all requests go through
- **OPEN:** Failure rate > 20%, rejects requests immediately, serves stale cache
- **HALF_OPEN:** After 30s timeout, allows one test request

**Key Methods:**
| Method | Purpose |
|--------|---------|
| `authenticate()` | Get Odoo UID via XML-RPC |
| `execute()` | Generic Odoo model method call |
| `searchRead()` | Search + read with Redis caching (15min TTL) |
| `create()` | Create Odoo record |
| `write()` | Update Odoo records |

**Caching Strategy:**
- Cache key: `odoo:{model}:{domain}:{fields}`
- TTL: 900 seconds (15 minutes)
- Fallback to stale cache on circuit open

**Issues:**
1. **New XML-RPC client per request** — `execute()` creates a new `xmlrpc.Client` for each call. Should reuse a single client.
2. **Circuit breaker threshold is low** — 20% failure rate opens circuit quickly. For a dependency that may have intermittent issues, this could cause unnecessary outages.
3. **No reconnection logic** — If Odoo restarts, the client doesn't reconnect automatically.
4. **Cache invalidation missing** — No way to invalidate stale cache when data changes.

---

## 4. Storage & MinIO

### 4.1 MinioService

**File:** `minio.service.ts` — 101 lines

**Security Features:**
- **Bucket allowlist:** Only `uploads`, `models`, `textures`, `videos`, `hdr`, `backups` allowed
- **Path traversal prevention:** Rejects paths with `..`, `//`, or leading `/`
- **Expiry bounds:** Min 60s, max 24hrs for presigned URLs

**Methods:**
| Method | Purpose |
|--------|---------|
| `getPresignedDownloadUrl()` | Generate temporary download URL |
| `getPresignedUploadUrl()` | Generate temporary upload URL |
| `uploadFile()` | Direct upload via buffer |
| `deleteFile()` | Remove object |
| `listFiles()` | List objects in bucket |

**Dynamic Import:**
```ts
const Minio = require('minio');
```
Used to avoid ESM/CJS issues in NestJS build. This is a pragmatic solution but bypasses TypeScript type checking.

**Issues:**
1. **`listFiles` returns only names** — No size, last modified, or content type. Consumer has no metadata.
2. **No content-type handling** — `uploadFile` doesn't set content-type metadata, which affects browser handling.
3. **No multipart upload** — Large files (>5MB) should use multipart upload for reliability.

---

## 5. Other Notable Modules

### 5.1 HealthController

**File:** `health.controller.ts` — 30 lines

- Returns API status + Odoo dependency status
- Calls `odooService.authenticate()` which is expensive for a health check
- Should use a lighter Odoo ping instead

### 5.2 RedisService

- Provides `get`, `set`, `del` wrappers around ioredis
- Used for Odoo caching and session storage
- Password-protected via `REDIS_URL` env var

---

## 6. Cross-Cutting Concerns

### 6.1 Error Handling

- **Global Exception Filter** — Consistent error response format
- **Custom exceptions** — `AssetNotFoundException`, etc. (referenced in standards but not fully implemented)
- **Structured logging** — Uses NestJS Logger with module names

### 6.2 Validation

- **Global ValidationPipe** — `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- **class-validator** decorators on DTOs
- **Swagger** documentation in development only

### 6.3 Rate Limiting

- **Global ThrottlerGuard** — 100 requests/minute default
- Configurable via `RATE_LIMIT_TTL` and `RATE_LIMIT_MAX` env vars

---

## 7. Technical Debt Identified

1. **Auth role mapping lossy** — `editor` → `user` mapping needs clarification
2. **N+1 Odoo queries** — Batch enrichment needed
3. **XML-RPC client recreation** — Should be singleton
4. **Strapi v4/v5 dual mapping** — Technical debt from migration
5. **Hardcoded endpoints** — Should be config-driven
6. **Health check calls authenticate()** — Too expensive
7. **No CSRF protection** — Relies on sameSite cookie only
8. **JWT TTL mismatch** — Security standards say 15min, code says 7d

---

*End of Auth & Backend Modules Deep Dive*
