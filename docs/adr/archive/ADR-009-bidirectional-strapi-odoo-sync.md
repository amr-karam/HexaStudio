# ADR-009: Bidirectional Strapi ↔ Odoo Project Sync

**Status:** Accepted
**Date:** 2026-07-24
**Deciders:** Chief Architect, Backend Lead

---

## Context

The platform maintains portfolio projects in two separate systems:
1. **Strapi** — the headless CMS that serves the public-facing website
2. **Odoo** — the ERP that manages project lifecycle, milestones, invoicing, and client portal

Previously, these systems had no automatic synchronization. Portfolio data was manually entered in Strapi for the website, and separately in Odoo for ERP workflows. This led to:
- Stale or missing data on the public site when Odoo status changed
- Double data entry for admin staff
- No unified view of project status across systems
- Client portal showing outdated information

We needed a robust, bidirectional sync mechanism that:
- Handles creation in either system and propagates to the other
- Updates status changes bidirectionally
- Prevents infinite webhook loops (Odoo→Strapi→Odoo ping-pong)
- Resolves conflicts deterministically (last-write-wins)
- Provides real-time push to connected clients
- Caches resolved mappings for fast local queries

## Decision

Build a **bidirectional sync layer** in the NestJS backend with the following architecture:

```
┌──────────┐     Webhook      ┌──────────────────┐     Webhook      ┌──────────┐
│          │ ◄────────────── │                  │ ──────────────► │          │
│  Strapi  │                  │  NestJS Backend   │                  │  Odoo   │
│          │ ──────────────► │                  │ ◄────────────── │          │
└──────────┘     API calls    └──────────────────┘     API calls    └──────────┘
                                  │           │
                                  │           └──► Redis (mapping cache)
                                  │
                                  └──► Socket.IO (real-time push)
```

### Core Components

#### 1. `StrapiProjectSyncService`
The orchestrator that handles all sync operations:

| Method | Direction | Trigger |
|--------|-----------|---------|
| `syncPortfolioToOdoo(slug)` | Strapi → Odoo | Strapi webhook (`entry.create`/`entry.update` on `portfolio`) |
| `syncOdooProjectToStrapi(id)` | Odoo → Strapi | Odoo webhook (`project.project` create/update) |
| `backfill()` | Strapi → Odoo (all) | On module init + manual |
| `reconcile()` | Bidirectional | Cron `*/10 * * * *` |

#### 2. Webhook Controllers

- **`StrapiWebhookController`** — `POST /api/v1/strapi/webhook` — HMAC-SHA256 signed, handles `portfolio` lifecycle events
- **`OdooSyncService`** (enhanced) — existing Odoo webhook handler that now triggers Strapi sync for `project.project`

#### 3. New API Endpoints

- **`POST /api/projects`** — Creates a project in Strapi + syncs to Odoo (Gap 8)
- **`PATCH /api/projects/:slug/status`** — Writes back project status to Odoo (Gap 10)

### Loop Prevention

To prevent infinite Odoo→Strapi→Odoo ping-pong:

1. When NestJS creates/updates a record in System A, it stores a Redis skip key: `sync:skip:{domain}:{id}` with 30-second TTL
2. When the webhook from System A arrives, the service checks the skip key first
3. If the key exists, it skips processing (this was our own write propagating back)
4. The webhook is acknowledged (200) but no reverse sync occurs

### Conflict Resolution

The `reconcile()` cron job uses **last-write-wins**:

1. Compare `updatedAt` (Strapi) vs `date`/`date_start` (Odoo)
2. The side with the newer timestamp becomes the source of truth
3. Write the winning version to the losing system
4. Log and emit a `conflict-resolved` event via Socket.IO

### Slug↔ID Mapping (Redis)

A Redis hash `odoo:project:mapping` stores the bidirectional key associations:

```json
{
  "seaside-villa": {
    "slug": "seaside-villa",
    "strapiId": 42,
    "odooId": 100,
    "lastSyncedAt": 1721796800000,
    "syncedFrom": "strapi"
  }
}
```

This enables:
- Fast slug-to-ID resolution without hitting Strapi/Odoo APIs
- Admin visibility into sync status
- Recovery after cache flush

### Real-Time Push

After every successful sync, the service emits a `project:sync` event via the existing `RealtimeGateway` (Socket.IO) to the `project:{slug}` room:

```json
{
  "action": "created" | "updated" | "conflict-resolved",
  "slug": "seaside-villa",
  "timestamp": "2026-07-24T04:30:00.000Z",
  "data": { /* merged project data */ }
}
```

## Alternatives Considered

### Single Source of Truth (Strapi Master)
- **Rejected:** Odoo has richer workflow capabilities (stages, milestones, invoicing) that can't be replicated in Strapi's content model.

### Single Source of Truth (Odoo Master)
- **Rejected:** Strapi powers the public website with content modeling and localization that Odoo can't match.

### Third-party Integration Platform (Zapier, Make)
- **Rejected:** Too slow, expensive at scale, no real-time push, no conflict resolution.

## Consequences

### Positive
- ✅ Portfolio data is always consistent between CMS and ERP
- ✅ Status changes propagate in real-time to the public site and client portal
- ✅ Loop prevention prevents runaway sync cycles
- ✅ Conflict resolution ensures deterministic behavior on concurrent edits
- ✅ Redis mapping provides fast lookups without hitting external APIs
- ✅ All quality gates pass (266 tests, 0 type errors)

### Negative
- ❗ Redis dependency — if Redis is down, loop prevention and mapping cache degrade (sync still works, but with increased risk of loops)
- ❗ Odoo field `x_slug` must exist on `project.project` — requires the `hexa_studio` Odoo module
- ❗ Webhook secret must be configured (`STRAPI_WEBHOOK_SECRET` env var) for security

### Risks
- High-latency networks could cause webhook timeouts — mitigated by 10-min reconciliation as backup
- Concurrent edits in both systems within 30 seconds could bypass loop prevention — extremely unlikely in practice

## Implementation

### Key Files

| File | Purpose |
|------|---------|
| `apps/backend/src/modules/odoo/strapi-project-sync.service.ts` | Orchestrator — mapping, caching, conflict resolution, real-time emit |
| `apps/backend/src/modules/odoo/strapi-webhook.controller.ts` | Strapi webhook receiver (HMAC-validated) |
| `apps/backend/src/modules/odoo/odoo-sync.service.ts` | Enhanced Odoo webhook handler (triggers Strapi sync) |
| `apps/backend/src/modules/projects/projects.controller.ts` | POST + PATCH endpoints |
| `apps/backend/src/modules/realtime/realtime.gateway.ts` | `emitToRoom()` method for real-time push |
| `apps/backend/src/modules/storage/redis.service.ts` | `hget()` method for hash field retrieval |
| `apps/backend/src/config/env.ts` | `STRAPI_WEBHOOK_SECRET` env var |
| `apps/frontend/src/features/projects/api.ts` | Frontend API client |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRAPI_WEBHOOK_SECRET` | Optional (min 32 chars) | HMAC key for Strapi webhook validation |

### Quality Gates

| Gate | Result |
|------|--------|
| TypeScript | 0 errors |
| Tests | 266 passed (18 new gap tests + 248 existing) |
| Lint | 0 errors |
