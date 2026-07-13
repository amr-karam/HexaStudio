# Sprint 6 — Enterprise Hardening Completion

## Summary

6 workstreams remain for v1.0.0 sign-off. The project is live in production; these are hardening/testing tasks. No architectural changes needed.

---

## 1. Frontend Unit Test Setup + Core Tests

**Goal:** Add Vitest + React Testing Library, write tests for shared UI components and utility hooks.

**Files to create/modify:**
- `apps/frontend/package.json` — add `test`, `test:watch`, `test:cov` scripts + devDeps: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `@vitejs/plugin-react`
- `apps/frontend/vitest.config.ts` — Vitest config with jsdom environment, setup files, CSS modules mock, path aliases matching `tsconfig.json`
- `apps/frontend/test/setup.ts` — import `@testing-library/jest-dom/vitest`
- `apps/frontend/test/components/ui/Counter.test.tsx`
- `apps/frontend/test/components/ui/TextReveal.test.tsx`
- `apps/frontend/test/components/ui/NewsletterSection.test.tsx`
- `apps/frontend/test/components/ui/StrapiBlocks.test.tsx`
- `apps/frontend/test/hooks/use-media-query.test.ts`
- `apps/frontend/test/hooks/use-reduced-motion.test.ts`
- `apps/frontend/test/hooks/useScrollProgress.test.ts`
- `apps/frontend/test/lib/utils.test.ts` — test `cn()` helper
- `apps/frontend/test/lib/env.test.ts` — test env validation

**Components to skip testing:** `Button.tsx`, `Footer.tsx` (3 lines each — trivial re-exports), `Magnetic.tsx` (heavy GSAP/mouse-event dependency), `TextSplit.tsx` (SplitText GSAP plugin).

**Integration:** Add `test` script to root `package.json` turbo pipeline if not already there. Update `turbo.json` cache config.

---

## 2. Backend Test Coverage Expansion

**Goal:** Cover the 6 untested services to approach 80% coverage.

**Untested services (need new spec files in `apps/backend/test/`):**
- `auth.service.spec.ts` — login, register, token refresh, password validation
- `accounting.service.spec.ts` — invoice listing, Odoo proxy calls, error handling
- `portal.service.spec.ts` — client login, timeline fetch, document access
- `requests.service.spec.ts` — CRUD for service requests
- `users.service.spec.ts` — user lookup, profile operations
- `email.service.spec.ts` — email sending (mock transport)

**Existing tests (8 files):** articles, contact, health, odoo, projects, redis, services, utils — these stay as-is.

**Also add:** `minio.service.spec.ts` — file upload/download with mocked MinIO client.

**Pattern:** Follow existing pattern from `articles.service.spec.ts` — use `@nestjs/testing` `Test.createTestingModule()`, mock external deps (HttpService, Redis, Odoo client).

---

## 3. CMS Admin IP Allowlist

**Goal:** Restrict Strapi admin panel access to trusted IPs via custom middleware.

**Files to modify:**
- `apps/cms/config/middlewares.ts` — replace default `"strapi::security"` with custom config object that adds IP filtering for `/admin` routes

**Approach:** Use Strapi 5's built-in middleware config to add an `ipFilter` or create a lightweight custom middleware file:
- `apps/cms/src/middlewares/admin-ip-guard.ts` — check `ctx.request.ip` against `CMS_ALLOWED_IPS` env var (comma-separated), return 403 if not in list
- Add env var `CMS_ALLOWED_IPS` to `.env.example`

**Note:** This only guards the admin panel routes, not the public API.

---

## 4. Lighthouse CI Setup

**Goal:** Automated Lighthouse audits targeting score > 95 in CI.

**Files to create/modify:**
- `.lighthouserc.cjs` (root) — LHCI config: target URLs (home, about, services, portfolio, contact), assertion thresholds (performance >= 0.95, accessibility >= 0.95, best-practices >= 0.90, seo >= 0.90), upload to `temporary-public-storage`
- `apps/frontend/package.json` — add `lighthouse` script: `lhci autorun`
- `.github/workflows/ci.yml` — add `lighthouse` job after `build` job, runs on the built standalone output
- Root `package.json` — add `@lhci/cli` as devDep

**Note:** Lighthouse needs a running server. Use `next start` on the built output, or use the `staticDistDir` option pointing to `.next/standalone`.

---

## 5. Database Backup Verification

**Goal:** Add a verification script that validates backup integrity.

**File to create:**
- `docker/backup/verify-backup.sh` — script that:
  1. Lists latest `.dump` files in `/backups`
  2. Runs `pg_restore --list` on each to verify they are valid dumps
  3. Optionally restores to a temp database and runs a `SELECT count(*)` sanity check
  4. Exits 0 on success, 1 on failure (for CI/monitoring integration)

**File to modify:**
- `docker-compose.prod.yml` — add `verify` profile/service or a one-off `docker compose run backup-verify` command

---

## 6. v1.0.0 Release Preparation

**Goal:** Ensure all version numbers align and prepare for the release tag.

**Verification checklist:**
- Confirm `apps/frontend/package.json`, `apps/backend/package.json`, `apps/cms/package.json`, root `package.json` all show `"version": "1.0.0"`
- Confirm `CHANGELOG.md` has v1.0.0 entry
- All P0 tasks marked Done in `OPEN_TASKS.md` and `CURRENT_SPRINT.md`
- The actual `git tag v1.0.0` will be done manually after QA sign-off (not automated)

---

## Execution Order

1. Frontend test setup (install deps, config, write tests) — most effort
2. Backend test expansion (7 new spec files)
3. CMS IP allowlist (quick config change)
4. Lighthouse CI setup (config + workflow)
5. Backup verification script
6. v1.0.0 version alignment check
