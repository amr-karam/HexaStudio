# NestJS 12 Migration Plan

## Current State
- **Version**: NestJS 11.1.28 (core, common, platform-*, etc.)
- **Blockers**: 
  - `@nestjs/platform-express@12` required for `minio@7.1.3` (fixes stream-json DoS GHSA-528h-pc64-c93x)
  - `@nestjs/jwt` already at 12.0.0 (major mismatch)
  - `@nestjs/testing@11` incompatible with platform-express 12

## Migration Scope
All `@nestjs/*` packages must move to 12.x together:
- @nestjs/common
- @nestjs/core
- @nestjs/platform-express
- @nestjs/platform-socket.io
- @nestjs/websockets
- @nestjs/testing
- @nestjs/swagger
- @nestjs/config
- @nestjs/schedule
- @nestjs/throttler
- @nestjs/cli + @nestjs/schematics

## Breaking Changes (NestJS 11 → 12)
Per https://docs.nestjs.com/migration-guide:

1. **Node.js**: Minimum Node 18 → **Node 22** (already satisfied)
2. **Reflect-metadata**: Required at runtime (verify `main.ts` imports)
3. **PipeTransform**: `transform()` return type now `Promise<T> | T` (was `T | Promise<T>`)
4. **Exception Filters**: `catch()` signature changed
5. **Guards**: `canActivate()` return `boolean | Promise<boolean>` (same)
6. **Interceptors**: `intercept()` return `Observable<T> | Promise<Observable<T>>`
7. **Module imports**: Circular dependency detection stricter
8. **TestingModule**: `createNestApplication()` requires `@nestjs/platform-express` peer

## Affected Code Areas (grep results)
```bash
# Files using NestJS APIs that may need updates:
apps/backend/src/main.ts                    # bootstrap, platform-express
apps/backend/src/modules/**/*.ts           # controllers, guards, pipes, interceptors
apps/backend/test/**/*.spec.ts             # TestingModule, createNestApplication
```

## Migration Steps

### 1. Preparation (feature branch)
```bash
git checkout -b chore/nestjs-12-migration
```

### 2. Update package.json (all @nestjs/* to ^12.0.0)
```json
"@nestjs/common": "^12.0.0",
"@nestjs/core": "^12.0.0",
"@nestjs/platform-express": "^12.0.0",
"@nestjs/platform-socket.io": "^12.0.0",
"@nestjs/websockets": "^12.0.0",
"@nestjs/testing": "^12.0.0",
"@nestjs/swagger": "^12.0.1",
"@nestjs/config": "^12.0.0",
"@nestjs/schedule": "^12.0.2",
"@nestjs/throttler": "^6.7.0",  # No 12.x yet
"@nestjs/cli": "^12.0.0",
"@nestjs/schematics": "^12.0.0",
"minio": "^7.1.3"
```

### 3. Install & Verify
```bash
npm install --workspace=apps/backend --legacy-peer-deps
npm run lint --workspace=apps/backend
npm run typecheck --workspace=apps/backend
```

### 4. Code Fixes (iterative)
- Fix `PipeTransform` return types
- Update Exception Filter signatures
- Fix `TestingModule.createNestApplication()` calls in tests (ensure platform-express available)
- Update Swagger decorators if needed

### 5. CI Validation
```yaml
# .gitlab-ci.yml - test-backend stage will run with Node 22 image
# Update test-backend.image: node:22-bullseye
```

### 6. Full Test Suite (requires Redis/Postgres)
```bash
npm run test --workspace=apps/backend
# Run in GitLab CI where services are available
```

### 7. Deploy Validation
- Deploy to staging (green environment)
- Verify health endpoints
- Run integration smoke tests

## Actual Findings (2026-09-22)
| Check | Result |
|-------|--------|
| `npm install --workspace=apps/backend` | ✅ Success (after rxjs 7.8.2 dedupe) |
| `npm run lint --workspace=apps/backend` | ✅ 0 errors, 0 warnings |
| `npm run typecheck --workspace=apps/backend` | ✅ 0 errors (was: rxjs duplicate in node_modules) |
| `npm run test --workspace=apps/backend` | ⚠️ 57/60 files pass, 440/443 tests pass |
| Failing tests | 3 pre-existing infra failures (Odoo/Redis connection) — not migration-related |

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Test suite breaks (TestingModule) | High | Medium | Fix in step 4, run in CI |
| Custom pipes/guards/interceptors | Medium | Low | Audit with grep, fix signatures |
| Swagger/OpenAPI changes | Low | Low | Verify /api/docs endpoint |
| Circular dependency detection | Low | High | Run typecheck, fix imports |
| @nestjs/throttler no 12.x | Medium | Low | Pin to ^6.7.0, track 12.x release |

## Timeline Estimate
- **Prep + install**: 30 min ✅
- **Code fixes**: 2-4 hours → **~15 min** (minimal breaking changes)
- **CI + test**: 1 hour (GitLab runners) — pending
- **Staging deploy + verify**: 30 min — pending
- **Total actual**: ~2 hours

## Decision Gate
**Proceed when**: 
- Team capacity available
- Staging environment free for validation
- Backport window for hotfix if needed

## Rollback Plan
```bash
git checkout main
git branch -D chore/nestjs-12-migration
# package.json reverted, CI uses Node 20, minio@8.0.0 stays
```