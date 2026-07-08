# System Architecture

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Architecture Diagram

```
                         ┌─────────────┐
                         │  Cloudflare  │
                         │  CDN / WAF   │
                         └──────┬──────┘
                                │
                         ┌──────▼──────┐
                         │   Traefik   │
                         │  Reverse    │
                         │   Proxy     │
                         └───┬───┬────┘
                             │   │
              ┌──────────────┘   └──────────────┐
              │                                  │
     ┌────────▼────────┐              ┌─────────▼─────────┐
     │   Next.js App    │              │   NestJS API       │
     │   (Frontend)     │◄────────────►│   (BFF Layer)      │
     │   Port 3000      │   REST/WS   │   Port 4000        │
     └────────┬─────────┘              └──────┬────────────┘
              │                                │
              │                        ┌───────▼────────┐
              │                        │   Strapi CMS    │
              │                        │   Port 1337     │
              │                        └───────┬────────┘
              │                                │
              │                        ┌───────▼────────┐
              │                        │   Odoo ERP     │
              │                        │   Port 8069     │
              │                        └───────┬────────┘
              │                                │
              └──────────┬─────────────────────┘
                         │
              ┌──────────▼─────────────────────┐
              │        Internal Network         │
              │  ┌──────┐ ┌──────┐ ┌────────┐  │
              │  │ Redis│ │MinIO│ │Postgres│  │
              │  │ :6379│ │:9000│ │ :5432  │  │
              │  └──────┘ └──────┘ └────────┘  │
              └─────────────────────────────────┘
```

---

## Architectural Principles

### 1. Separation of Concerns

Each service has a single responsibility:

| Service | Responsibility |
|---------|---------------|
| Next.js | UI rendering, client-side interactions, 3D scenes |
| NestJS | Business logic, data aggregation, auth, BFF |
| Strapi | Content management (portfolio, blog, services) |
| Odoo | Business operations (CRM, sales, projects) |
| Redis | Caching, session storage, job queues |
| MinIO | File storage (media, documents) |
| PostgreSQL | Persistent data storage |

### 2. BFF Pattern (Backend-for-Frontend)

The NestJS API serves as a BFF layer:

```
[Client] → [Next.js] → [NestJS BFF] → [Strapi]
                                      → [Odoo]
                                      → [PostgreSQL]
```

- **Why:** The frontend should not know about Strapi or Odoo internals.
- **Benefit:** API contracts are defined once. Backend changes don't require frontend changes.
- **Trade-off:** Additional network hop adds ~5-10ms latency, which is acceptable for the architectural benefits.

### 3. Type-First Development

All shared types live in `/packages/types`:

- Frontend imports types from the types package
- Backend imports types from the types package
- API contracts are type-checked at compile time
- DTOs in NestJS use the same types

### 4. Data Flow

```
                ┌──────────────────────────────────┐
                │         Content Flow              │
                │                                    │
Strapi ──────► NestJS (transform) ──────► Next.js ──► Client
  (content)        (BFF)                  (SSR/SSG)

Odoo ────────► NestJS (aggregate) ──────► Next.js ──► Client
  (business)
```

### 5. Network Segmentation

```
┌────────────────────────────────────────────────┐
│                   PUBLIC NET                    │
│    Traefik (Port 80/443)                        │
│    Next.js (Port 3000)                          │
│    NestJS API (Port 4000) *if needed*           │
└────────────────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────┐
│                  INTERNAL NET                   │
│    PostgreSQL (5432) ── No public access        │
│    Redis (6379)      ── No public access        │
│    MinIO (9000)      ── No public access        │
│    Strapi (1337)     ── Via NestJS only         │
│    Odoo (8069)       ── Via NestJS only         │
└────────────────────────────────────────────────┘
```

---

## Service Details

### Next.js App (`apps/frontend`)

- **Port:** 3000
- **Rendering:** ISR for content pages, SSR for dynamic pages, SSG for static pages
- **3D:** React Three Fiber with drei helpers
- **State:** Zustand (client) + TanStack Query (server)
- **Error Boundary:** Dedicated boundary for 3D scene to prevent full-page crash

### NestJS API (`apps/backend`)

- **Port:** 4000
- **Architecture:** Modular (modules, controllers, services, repositories)
- **Auth:** JWT with Passport strategies
- **Validation:** class-validator + ValidationPipe
- **Error Handling:** Global ExceptionFilter with structured responses
- **API Docs:** Swagger at `/api/docs`

### Strapi CMS (`apps/cms`)

- **Port:** 1337 (internal only)
- **Content:** Portfolio, Blog, Services, Categories, SEO
- **Webhooks:** Trigger Next.js ISR on content changes
- **Media:** Stored in MinIO

### Odoo ERP (`apps/odoo`)

- **Port:** 8069 (internal only)
- **Modules:** CRM, Sales, Project, Documents, Contacts
- **Integration:** XML-RPC/JSON-RPC via NestJS
- **Auth:** Odoo users synced with JWT auth

### Databases

| Database | Service | Purpose |
|----------|---------|---------|
| PostgreSQL `hexa_frontend` | NestJS | User accounts, sessions, application data |
| PostgreSQL `hexa_cms` | Strapi | Content management |
| PostgreSQL `hexa_odoo` | Odoo | ERP data |
| Redis `hexa_cache` | All | Cache, sessions, queues |

---

## Communication Patterns

### Synchronous (REST)

- Next.js ↔ NestJS: REST API
- NestJS ↔ Strapi: REST API (internal)
- NestJS ↔ Odoo: XML-RPC/JSON-RPC (internal)

### Asynchronous (Events)

- Strapi → NestJS: Webhooks (content changes)
- NestJS → Next.js: Webhook trigger (ISR)
- Odoo → NestJS: Polling or webhooks (data changes)

### Data Sync Strategy

```
Website Contact Form
        │
        ▼
NestJS API
        │
        ├──► Save to PostgreSQL (application DB)
        ├──► Push to Odoo CRM (opportunity)
        └──► Send notification (email/Slack)
```

---

## Security Architecture

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ External │───►│ Traefik  │───►│ Service  │
│ Traffic  │    │          │    │          │
└──────────┘    │ - SSL    │    │ - JWT    │
                │ - WAF    │    │ - RBAC   │
                │ - Rate   │    │ - Valid. │
                │   Limit  │    └──────────┘
                └──────────┘
```

See `SECURITY_STANDARDS.md` for detailed security architecture.

---

## Performance Architecture

### Caching Layers

```
Layer 1: Cloudflare CDN (edge cache)
Layer 2: Next.js ISR (stale-while-revalidate)
Layer 3: Redis (API response cache)
Layer 4: TanStack Query (client cache)
```

### Asset Pipeline

```
3D Model (GLB) ──► Draco Compression ──► MinIO ──► Cloudflare ──► Client
Image (WebP/Avif) ──► Next/Image ──► Cloudflare ──► Client
Font (WOFF2) ──► CDN
```

---

## Disaster Recovery

See `devops/disaster-recovery.md` for the complete DR plan.

| Scenario | RTO | RPO | Action |
|----------|-----|-----|--------|
| App crash | < 5 min | — | Docker restart policy / health check |
| Server failure | < 30 min | — | Failover to replica |
| Database corruption | < 1 hr | < 15 min | Restore from WAL archive |
| Full region outage | < 4 hrs | < 1 hr | Deploy to secondary region |
