---
kind: configuration_system
name: Environment-Based Configuration with Zod Validation
category: configuration_system
scope:
    - '**'
source_files:
    - apps/backend/src/config/env.ts
    - apps/backend/src/main.ts
    - apps/frontend/src/config/constants.ts
    - apps/frontend/src/lib/env.ts
    - apps/cms/config/server.ts
    - apps/cms/config/database.ts
    - hexa-hub/apps/api/.env.example
    - hexa-hub/apps/web/.env.example
    - hexa-hub/apps/worker/.env.example
    - docker-compose.yml
---

The HexaStudio monorepo uses a purely environment-variable-driven configuration system with per-app validation and no centralized config service. Each application owns its own .env/.env.example files, Docker Compose environment blocks, and runtime loaders.

### Backend (NestJS) — strict schema validation
apps/backend/src/config/env.ts defines a single Zod schema (envSchema) that declares every required/optional variable (JWT_SECRET, CMS_URL, MINIO_*, ODOO_*, REDIS_*, SENTRY_DSN, CORS_ORIGINS, NODE_ENV, PORT). getEnv() lazily parses process.env, prints a human-readable error listing missing fields, and calls process.exit(1) on failure. The validated object is memoized in a module-level _env so callers never re-parse. apps/backend/src/main.ts imports getEnv at bootstrap, initializes Sentry conditionally, derives CORS origins from the comma-separated string, and gates Swagger to development.

### Frontend (Next.js) — build-time constants + public env
apps/frontend/src/config/constants.ts exports API_BASE_URL, CMS_BASE_URL, SITE_URL backed by NEXT_PUBLIC_* variables with local defaults. apps/frontend/src/lib/env.ts re-exports these plus NEXT_PUBLIC_SENTRY_DSN as a frozen env object consumed across features. Build-time values are injected via Dockerfile ARGs and overridden at runtime through docker-compose.yml environment blocks.

### CMS (Strapi) — native config files
apps/cms/config/server.ts, database.ts, admin.ts, api.ts, plugins.ts, middlewares.ts follow Strapi's standard convention: each file exports a default function receiving { env } and returning a partial config object. Values are read via Strapi's built-in env("VAR", default) helpers.

### HEXA Hub sub-repo — scattered per-service .env
hexa-hub/apps/api/.env and hexa-hub/apps/api/.env.example define Postgres, Redis, JWT, Odoo, Minio settings for the API service. hexa-hub/apps/web/.env.local and hexa-hub/apps/web/.env.example expose NEXT_PUBLIC_API_URL / NEXT_PUBLIC_REALTIME_URL to the web client. hexa-hub/apps/worker/.env.example documents REDIS_URL, WORKER_CONCURRENCY, LOG_LEVEL. No shared config package exists between the two repos; each app manages its own env surface.

### Docker Compose as the single source of truth for compose environments
docker-compose.yml maps container names and ports, injects secrets via ${VAR} interpolation, and sets service-specific overrides (e.g., DATABASE_URL, REDIS_URL, CMS_URL for backend; NEXT_PUBLIC_* args for frontend). Health checks reference internal URLs confirming the composed network topology.

### Conventions developers should follow
1. Never read process.env directly outside the dedicated loader modules (apps/backend/src/config/env.ts, apps/frontend/src/config/constants.ts, Strapi config files).
2. Declare every variable in a .env.example alongside its default value so new contributors can run locally without guessing.
3. Use Zod schemas for server-side apps to fail fast at startup when required secrets are missing or malformed.
4. Keep NEXT_PUBLIC_* variables minimal — only what the browser bundle needs; keep secrets out of the frontend image.
5. Reference variables via ${VAR} in docker-compose.yml, not hardcoded strings, so secrets flow from the host .env into containers.
6. Do not commit .env files — they are gitignored; use .env.example as the canonical template.