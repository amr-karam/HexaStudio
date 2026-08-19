# HEXA Hub Smoke Tests

## Scope
Smoke tests verify that the HEXA Hub stack boots and that key
integration surfaces work end-to-end:
- API health
- Web home + portal pages
- Seeded login for `SUPER_ADMIN`, `EMPLOYEE`, `CLIENT`
- RBAC boundaries (`CLIENT` mutation denial)
- AI Agents code surface and required env vars

## Scripts

### `hexa-hub/tests/smoke/smoke.sh`
Bash smoke test for local Docker Compose environments.

### `hexa-hub/tests/smoke/smoke.mjs`
Node.js smoke test for local Docker Compose environments.

## Usage

```bash
cd hexa-hub
docker compose up -d
node tests/smoke/smoke.mjs
```

### With explicit seed password
```bash
set HEXA_HUB_SEED_PASSWORD=***
node tests/smoke/smoke.mjs
```

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `HEXA_HUB_API_URL` | `http://localhost:3000/api` | API base URL |
| `HEXA_HUB_WEB_URL` | `http://localhost:3001` | Web base URL |
| `HEXA_HUB_SEED_PASSWORD` | `Test!2345` | Seed user password |

## Playwright

```bash
cd hexa-hub/e2e
npx playwright install chromium
npx playwright test smoke.spec.ts --browser=chromium --reporter=list
npx playwright test auth-smoke.spec.ts --browser=chromium --reporter=list
```

## Notes
- These tests assume `docker compose up -d` has completed and health
  checks are passing.
- `apps/backend/tests/session` was intentionally not included because
  `apps/backend/src/bridge.ts` is absent in the current tree.
