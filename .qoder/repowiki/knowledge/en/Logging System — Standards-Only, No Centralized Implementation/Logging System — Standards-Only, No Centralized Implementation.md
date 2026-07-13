---
kind: logging_system
name: Logging System — Standards-Only, No Centralized Implementation
category: logging_system
scope:
    - '**'
source_files:
    - HEXA-Vision-Playbook/06-STANDARDS/logging-standards.md
    - apps/backend/src/main.ts
    - apps/backend/src/modules/accounting/accounting.service.ts
    - apps/backend/src/modules/contact/contact.service.ts
    - apps/backend/src/modules/email/email.service.ts
    - apps/backend/src/modules/odoo/odoo.service.ts
    - apps/backend/src/config/env.ts
    - hexa-hub/apps/worker/src/index.ts
    - hexa-hub/apps/worker/src/processors/ai.processor.ts
    - hexa-hub/apps/realtime/src/index.ts
    - apps/frontend/src/app/error.tsx
    - apps/frontend/src/app/sitemap.ts
    - apps/frontend/src/features/portfolio/lib/fetchProjects.ts
    - docker/loki/loki-config.yml
    - docker/loki/promtail-config.yml
---

The repository defines a comprehensive logging strategy in documentation but has not yet implemented a centralized logging framework across the codebase.

**What system/approach is used**
- The official standard (HEXA-Vision-Playbook/06-STANDARDS/logging-standards.md) mandates structured JSON logs with fields `timestamp`, `level`, `service`, `message`, `context`, `requestId`, and optional `duration_ms` for Loki ingestion via Promtail.
- Backend services are expected to use NestJS's built-in `@nestjs/common` `Logger` class; frontend is expected to ship a small `lib/logger.ts` wrapper that pretty-prints in development and emits JSON in production.
- Log levels follow the standard five-tier scheme: `error`, `warn`, `info`, `debug`, `trace`.
- Service names are fixed per app (`frontend`, `backend`, `cms`, `odoo`, `postgres`, `redis`, `minio`).

**Key files and packages**
- `HEXA-Vision-Playbook/06-STANDARDS/logging-standards.md` — authoritative spec (format, levels, service naming, retention).
- `apps/backend/src/main.ts` — bootstraps NestJS `Logger('Bootstrap')`; individual services instantiate `new Logger(ServiceName)`.
- `apps/backend/src/modules/{accounting,contact,email,odoo,...}/*.service.ts` — all use NestJS `Logger` consistently.
- `apps/backend/src/config/env.ts` — uses bare `console.error` for startup validation (dev-only).
- `hexa-hub/apps/worker/src/index.ts`, `hexa-hub/apps/worker/src/processors/*.ts`, `hexa-hub/apps/realtime/src/index.ts` — still emit raw `console.log` / `console.error` calls.
- `apps/frontend/src/app/error.tsx`, `apps/frontend/src/app/sitemap.ts`, `apps/frontend/src/features/portfolio/lib/fetchProjects.ts` — use bare `console.error`.
- `docker/loki/loki-config.yml`, `docker/loki/promtail-config.yml` — Loki/Promtail sink configuration exists at infra level.

**Architecture and conventions**
- Structured JSON output targeting Loki (Promtail scrapes stdout/stderr).
- Per-service logger instances via `new Logger(ServiceName)` so the `service` field is auto-populated by NestJS.
- Request correlation via an injected `requestId` field (documented in error-handling standards).
- Retention policy: dev 7d console, staging 14d Loki, prod 30d Loki (+cold archive), audit 1y Loki + encrypted S3.
- Forbidden data: passwords, JWT secrets, full credit-card numbers, PII beyond necessity, file/binary contents.

**Rules developers should follow**
- Never use `console.log` / `console.error` directly in application code; use the NestJS `Logger` or the documented frontend `lib/logger` wrapper.
- Always include `context` as a flat object of scalar values (no nested objects, no large payloads).
- Attach `requestId` from the incoming request header to every log entry for cross-service tracing.
- Use `debug`/`trace` only in development; keep `info` for business events, `warn` for recoverable issues, `error` for failures needing attention.
- Follow the service-name table when creating custom loggers or external sinks.
- Quality gates and pre-commit checklists enforce "no `console.log`" and require structured logging.