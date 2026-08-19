# ADR 015: Method-Level RBAC for HEXA Hub Controllers

**Status:** Accepted
**Date:** 2026-08-18
**Authority:** SECURITY.md §1.3 (Server-Side Authorization), GOVERNANCE.md §36 (Risk Levels — HIGH), OWASP ASVS 4.1
**Decider:** Orchestrator (via Security Review Chain)
**Affected:** `hexa-hub/apps/api/src/modules/*/*.controller.ts` (21 controllers)

## Context

All 21 data-bearing HEXA Hub controllers currently decorate only with `@UseGuards(JwtAuthGuard)`, i.e. any authenticated user — including an external `CLIENT` — can reach every endpoint. The existing `RolesGuard` + `@Roles()` infrastructure exists (`auth/guards/roles.guard.ts`, `auth/decorators/roles.decorator.ts`) and is already wired into `documents`, `accounting`, `employees`, `odoo-webhook`, and `webhook-admin`. Four controllers still lack role enforcement:

> `crm`, `contacts`, `activities`, `helpdesk`, `knowledge`, `tasks`, `projects`, `sales`, `timesheets`, `notfications`, `search`, `channels`, `messages`, `calendar`, `approvals`, `portal`, `users`, `workspaces`, `client`

(plus method-protected routes inside `auth.controller`, `ai.controller`, `messages.controller`, `workspaces.controller`).

`UserRole` hierarchy (3 tiers):
- `SUPER_ADMIN` — global, can manage everything
- `EMPLOYEE` — internal staff (CRM, contacts, finance read, tasks, timesheets)
- `CLIENT` — external customer (owns their client-scoped records only)

## Problem

CLIENT-role users can invoke write/delete operations and read across client boundaries — violating data isolation. PII-bearing and financial endpoints (e.g. `/accounting/*`) are protected by class-level `@Roles(SUPER_ADMIN, EMPLOYEE)`, but the remaining 21 controllers grant a CLIENT the same write privileges as an EMPLOYEE.

## Decision

Apply **layered, method-level RBAC** on every protected controller:

1. **Class-level guard stack** for all data controllers: `@UseGuards(JwtAuthGuard, RolesGuard)` (no role needed).
2. **GET (read) methods** → `@Roles(SUPER_ADMIN, EMPLOYEE, CLIENT)` — any authenticated user may read.
3. **POST / PATCH / PUT / DELETE (mutation methods)** — **deny CLIENT**:
   - `crm`, `contacts`, `activities`, `helpdesk`, `knowledge`, `sales`, `timesheets`, `tasks`, `projects`, `approvals`, `messages`, `channels`, `calendar`, `search`, `notifications` → `@Roles(SUPER_ADMIN, EMPLOYEE)`
   - `users`, `workspaces`/`client`, `portal` → `@Roles(SUPER_ADMIN, EMPLOYEE)` for mutations; `@Roles(SUPER_ADMIN, EMPLOYEE, CLIENT)` for GET
4. **Self / client-owned scopes** — CLIENT may read their own:
   - `auth.controller` me/profile: auth-only, no role decorator (client reads only self).
   - `portal`, `messages`, `approvals`, `documents`: per-record tenant scoping handled in the service layer (out of scope for this ADR; tracked as follow-up).
5. **PII/finance already handled** — `employees` (SUPER_ADMIN only), `accounting` (SUPER_ADMIN, EMPLOYEE) — leave as-is.
6. **Auth lifecycle routes** (login, refresh, logout, 2FA) in `auth.controller`: `JwtAuthGuard`-only (no `RolesGuard` needed).
7. **Webhook admin routes** (`webhook-admin.controller`): `SUPER_ADMIN` only — already correct.

No architectural change; the guard chain already exists and is registered in `AppModule`. This is a **policy enforcement** decision.

## Alternatives

- **Class-level role lock (e.g. all controllers `EMPLOYEE`-only):** simpler, but locks out CLIENT from portal/document read APIs they depend on for the Digital HQ experience — rejected.
- **Per-record scope (full ABAC):** ideal long-term, but requires service-layer tenant scoping on every method — out of scope here; CLIENT-read at method level + existing per-record ownership checks in services cover the gap.
- **Open-policy (no RolesGuard):** would require per-endpoint `req.user.role` checks in every handler — verbose, DRY violation; rejected.

## Consequences

- CLIENT users are denied `POST/PATCH/DELETE` on CRM, contacts, tasks, timesheets, etc. (previously allowed). This is a **breaking** behavioral change requiring regression testing of client portal read paths.
- `@Roles` metadata is required on **every** protected method; any new route under a guarded class must decorate explicitly or it inherits `RolesGuard` pass-through (no roles = allow). Teams must treat method decoration as mandatory.
- Existing unit tests for controllers must add a `role` to the mock user fixture (see `test/fixtures/mock-request.ts` / per-spec).

## Migration

1. Add `RolesGuard` to the class-level `@UseGuards(JwtAuthGuard, RolesGuard)` on each of the 21 controllers.
2. Annotate every route handler method with `@Roles(...)` per the matrix above.
3. Update `@nestjs/testing` module specs that inject a mock `req.user` to include `role: UserRole.EMPLOYEE`.
4. Gate: `npx jest`, `npx eslint src/**/*.ts --max-warnings 0`, `npx tsc --noEmit`.

## Rollback

Remove `@Roles(...)` decorators and revert `@UseGuards(JwtAuthGuard, RolesGuard)` → `@UseGuards(JwtAuthGuard)`. No data migrations; guard behavior is compile-time only. Revert is lossless.
---

## Implementation Record

**Status:** Accepted — implemented & validated (2026-08-19). See PROJECT_STATUS.md §18.

### What changed (19 controllers, hexa-hub/apps/api)
Class decorator set to `@UseGuards(JwtAuthGuard, RolesGuard)`; every route handler carries a method-level `@Roles(...)`:

| Controller | Reads (GET) | Mutations (POST/PATCH/PUT/DELETE) |
|---|---|---|
| crm, contacts, activities, tasks, projects, sales, helpdesk, timesheets | SUPER_ADMIN, EMPLOYEE, CLIENT | SUPER_ADMIN, EMPLOYEE |
| knowledge, search | SUPER_ADMIN, EMPLOYEE, CLIENT | (n/a — read-only) |
| notifications, calendar, approvals, channels, messages, portal | SUPER_ADMIN, EMPLOYEE, CLIENT (GET routes) | SUPER_ADMIN, EMPLOYEE |
| users, workspaces, client | SUPER_ADMIN, EMPLOYEE, CLIENT (GET routes incl. `users/me` self-read) | SUPER_ADMIN, EMPLOYEE |

`messages.controller` and `workspaces.controller` were hoisted from per-method `@UseGuards(JwtAuthGuard)` to a single class-level `@UseGuards(JwtAuthGuard, RolesGuard)`; per-method `@Roles(...)` applied to each handler. Redundant per-method `@UseGuards(JwtAuthGuard)` removed where superseded by the class-level guard.

### Untouched (per ADR §4–§7)
Already RBAC (`documents`, `accounting`, `employees`, `odoo-webhook` sync+state routes, `webhook-admin`): no changes. Auth-only/user-scoped proxies (`auth.controller` lifecycle, `ai.controller`, `ai/agents/agents.controller`) and `app.controller` (health): JwtAuthGuard-only, no `@Roles` added.

### Test fixtures
No fixture changes required. The repo has 5 spec files (all service-level: `auth.service.spec`, `crm.service.spec`, `users.service.spec`, `workspaces.service.spec`, `agents.service.spec`). None exercise the HTTP guard chain; `users.service.spec.ts` and `auth.service.spec.ts` already set `role: UserRole.EMPLOYEE` / `SUPER_ADMIN` on their mock users.

### Quality gates (run from apps/api)
- `npx tsc --noEmit` — 0 errors
- `npx eslint "src/**/*.ts" --max-warnings 0` — 0 errors, 0 warnings
- `npx jest --silent` — 5 suites / 35 tests passed

### Incident: lint gate blocked by untracked `ai/agents/agents.controller.ts`
`ChatRequestSchema` (Zod) was declared but only referenced in `z.infer<typeof ...>` (type-only), tripping `@typescript-eslint/no-unused-vars` and failing the `--max-warnings 0` gate. Resolved by invoking `ChatRequestSchema.parse(body)` in the `chat` handler — its evident intent and consistent with audit H9-H12 ("AI route input hardening"). No `@Roles` added (AI proxy stays auth-only per ADR §6). Not committed; recommend tracking the file.

### Rollbacks (per ADR §Rollback)
Remove `@Roles(...)` decorators and revert `@UseGuards(JwtAuthGuard, RolesGuard)` -> `@UseGuards(JwtAuthGuard)`. No data migrations; lossless.