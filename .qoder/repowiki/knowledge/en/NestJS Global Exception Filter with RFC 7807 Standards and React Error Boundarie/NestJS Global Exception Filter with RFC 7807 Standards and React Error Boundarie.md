---
kind: error_handling
name: NestJS Global Exception Filter with RFC 7807 Standards and React Error Boundaries
category: error_handling
scope:
    - '**'
source_files:
    - apps/backend/src/core/filters/global-exception.filter.ts
    - apps/backend/src/main.ts
    - apps/frontend/src/components/GlobalErrorBoundary.tsx
    - apps/frontend/src/app/error.tsx
    - HEXA-Vision-Playbook/06-STANDARDS/error-handling-standards.md
    - HEXA-Vision-Playbook/08-API/error-codes.md
---

The HexaStudio monorepo implements a layered error-handling strategy across its three applications (NestJS backend, Next.js frontend, Strapi CMS) guided by the project's authoritative standards document.

## Backend (NestJS) — Centralized Exception Filtering

A single `GlobalExceptionFilter` in `apps/backend/src/core/filters/global-exception.filter.ts` is registered globally via `app.useGlobalFilters(new GlobalExceptionFilter())` in `main.ts`. It normalizes every incoming exception into a uniform `ApiResponse<null>` envelope containing `data`, `status`, `message`, and an optional `error` field that is suppressed in production. The filter resolves HTTP status from `HttpException` instances or falls back to 500 for unknown errors, and strips stack traces when `NODE_ENV === 'production'`.

Complementing the filter, a global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`) rejects malformed payloads at the entry point before they reach controllers.

Business logic throws NestJS built-in exceptions consistently:
- `UnauthorizedException` / `ForbiddenException` for authz failures
- `NotFoundException` for missing resources
- `BadRequestException` for invalid input
- `InternalServerErrorException` for downstream failures (e.g., Odoo circuit open, Minio upload errors)

These are caught by the global filter; no module-level try/catch blocks rethrow custom types.

## Frontend (Next.js) — Component-Level Boundaries + App Router Error Page

Two complementary mechanisms protect the UI:
- `GlobalErrorBoundary` (`apps/frontend/src/components/GlobalErrorBoundary.tsx`) — a class-based React error boundary wrapping 3D scenes and other volatile components, falling back to a styled "Something went wrong" page with a reload button.
- `error.tsx` (`apps/frontend/src/app/error.tsx`) — the Next.js App Router catch-all error page, which logs the thrown error and offers a reset/retry action.

API calls use React Query with `retry: 3` and explicit `isLoading` / `error` branches per the playbook example, so network failures surface as user-facing retryable states rather than unhandled exceptions.

## Standards & Conventions (Playbook)

`HEXA-Vision-Playbook/06-STANDARDS/error-handling-standards.md` codifies:
- Every 3D scene must be wrapped in an Error Boundary.
- API responses follow RFC 7807 shape (`type`, `title`, `status`, `detail`, `instance`, `timestamp`, optional `errors[]`).
- A canonical `withRetry` helper provides exponential backoff with jitter for external calls.
- Sentry captures all exceptions on both sides; Prometheus/Loki monitor error rates and structured logs.

`HEXA-Vision-Playbook/08-API/error-codes.md` enumerates machine-readable error codes grouped by HTTP category (400/401/403/404/409/422/429/500/503), each with a stable `type` URL under `https://api.hexastudio.net/errors/{code}` and rules such as never leaking stack traces in production and always including a timestamp.

## Gaps Between Spec and Implementation

- The active `GlobalExceptionFilter` returns the internal `ApiResponse` envelope (`{ data, status, message, error }`) rather than the RFC 7807 `{ type, title, status, detail, instance, timestamp }` shape documented in the playbook.
- No custom domain error classes exist yet — modules rely on NestJS built-ins instead of a shared `AppException` hierarchy.
- The playbook's RFC 7807 response format and `withRetry` helper appear only as examples; they are not wired into the running codebase.

## Rules Developers Should Follow

1. Throw NestJS `*Exception` subclasses from services/controllers; do not return raw `Error` objects.
2. Wrap any component that renders Three.js scenes in `GlobalErrorBoundary` (or a local equivalent).
3. Handle React Query `error` state explicitly with a retry option; never swallow it silently.
4. When adding new business-domain failures, prefer creating a typed exception class and mapping it in `GlobalExceptionFilter` to the RFC 7807 envelope described in the playbook.
5. Never log or expose stack traces in production; rely on Sentry for diagnostics.