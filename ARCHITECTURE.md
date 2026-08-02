# 🏛️ HEXA STUDIO — SYSTEM ARCHITECTURE

**Version:** 1.0.0  
**Authority Level:** 1 (Subordinate only to `GOVERNANCE.md`)  
**Scope:** Monorepo System Topology, Data Flow, Microservices, and Ingress  

---

## 1. MONOREPO TOPOLOGY & PACKAGES

HEXA STUDIO is organized as a Turborepo-managed monorepo:

```text
HEXA-Studio/
├── apps/
│   ├── frontend/         ← Next.js 16 App Router (Client Portal & Web Showcase)
│   ├── backend/          ← NestJS 11 BFF API Gateway & Microservices
│   ├── cms/              ← Strapi 5 Headless CMS Engine
│   └── mobile/           ← Expo / React Native Client Companion
├── packages/
│   ├── types/            ← Shared TypeScript Interfaces (@hexastudio/types)
│   ├── ui/               ← Shared Design System Components (@hexastudio/ui)
│   └── utils/            ← Shared Helper Utilities (@hexastudio/utils)
├── docker/               ← Traefik v3, Postgres, Redis, MinIO, Odoo configs
├── ADR/                  ← Architectural Decision Records
└── .ai/                  ← AI Agent Governance, Workflows, & Checklists
```

---

## 2. HIGH-LEVEL SYSTEM DATA FLOW

```text
                               ┌─────────────────────────────────┐
                               │   CLOUDFLARE WAF / TUNNEL EDGE  │
                               └────────────────┬────────────────┘
                                                │ (Cloudflared Ingress)
                               ┌────────────────▼────────────────┐
                               │       TRAEFIK v3 INGRESS        │
                               └────────┬───────────────┬────────┘
                                        │               │
                  ┌─────────────────────┴───────┐   ┌───┴────────────────────────┐
                  │ Host: hexastudio.net        │   │ Host: api.hexastudio.net   │
                  │ Router: frontend            │   │ Router: backend            │
                  └──────────────┬──────────────┘   └───────────┬────────────────┘
                                 │                              │
                        ┌────────▼────────┐            ┌────────▼────────┐
                        │ Next.js Frontend│            │   NestJS BFF    │
                        │     (:3000)     │            │     (:4000)     │
                        └────────┬────────┘            └────────┬────────┘
                                 │                              │
             ┌───────────────────┼──────────────────────────────┼───────────────────┐
             │                   │                              │                   │
    ┌────────▼────────┐ ┌────────▼────────┐            ┌────────▼────────┐ ┌────────▼────────┐
    │  Strapi 5 CMS   │ │   Odoo 17 ERP   │            │ PostgreSQL 16   │ │    Redis 7    │
    │     (:1337)     │ │     (:8069)     │            │  (Internal DB)  │ │ (Cache/PubSub)  │
    └─────────────────┘ └─────────────────┘            └─────────────────┘ └─────────────────┘
```

---

## 3. ODOO-FIRST ARCHITECTURE (MANDATORY)

**Authority Level:** 1 (Subordinate only to `GOVERNANCE.md`)

HEXA Hub is NOT an ERP. Odoo remains the single source of truth for all business operations. HEXA Hub is the premium experience layer built on top of Odoo.

Every business entity must originate from or synchronize with Odoo whenever appropriate.

### 3.1 Integration Mandate

HEXA Hub must integrate with:

| Category | Odoo Modules | Sync Direction |
|----------|--------------|----------------|
| **Sales & CRM** | CRM, Contacts, Companies, Sales, Quotations | Bi-directional |
| **Project Delivery** | Projects, Tasks, Milestones | Bi-directional |
| **Customer Service** | Helpdesk | Bi-directional |
| **Operations** | Calendar, Employees, Timesheets | Bi-directional |
| **Finance** | Accounting (read-only), Invoices | Odoo → Hub |
| **Content** | Documents, Knowledge | Bi-directional |
| **Communication** | Activities, Email, Mail | Bi-directional |

### 3.2 HEXA Hub Must Provide

- Modern luxury UI/UX
- Real-time collaboration
- AI assistants
- Unified notifications
- Advanced search
- Executive dashboards
- Client collaboration
- Team collaboration
- Cross-module workflows
- Workflow automation
- API orchestration

### 3.3 Architectural Rules

1. **Never duplicate ERP business logic** — extend, don't replace
2. **Extend Odoo capabilities** through the experience layer
3. **Improve user experience** beyond native Odoo UI
4. **Aggregate information** from multiple modules
5. **Synchronize through secure APIs and webhooks**
6. **Preserve data integrity** with conflict resolution
7. **Handle synchronization failures** with retries, logging, and conflict resolution

The Hub should feel like a modern enterprise operating system while Odoo continues to manage the underlying business processes.

**Reference:** ADR-0006: Odoo-First Architecture Mandate

---

## 4. CORE SUB-SYSTEM ARCHITECTURES

### 4.1 Frontend Architecture (`apps/frontend`)
- **Framework**: Next.js 16 (App Router), Turbopack build engine.
- **Client/Server Boundary**: Server Components by default for SEO & ISR; Client Components marked with `'use client'` for interactive UI & WebGL islands.
- **3D & Canvas Engine**: Three.js, React Three Fiber, `@react-three/drei`. Gated strictly by `useMotionPolicy` and `QualityProvider`.
- **State Management**: Zustand for client-side transient state (portal tabs, currency, motion policy); TanStack Query v5 for server state & caching.

### 4.2 Backend Architecture (`apps/backend`)
- **Framework**: NestJS 11 with modular microservice domain providers (`OdooModule`, `PortalModule`, `AiModule`, `ContactModule`, `StorageModule`, `VectorModule`).
- **BFF Pattern**: Aggregates internal data stores, Strapi CMS endpoints, and Odoo ERP JSON-RPC requests into clean REST & Swagger APIs.
- **Real-Time Sockets**: `ClientPortalGateway` using Socket.io for multiplayer rooms, live cursor tracking, and approval broadcasts.

### 4.3 Enterprise ERP Integration (`OdooModule`)
- **Engine**: Odoo 17 JSON-RPC via `OdooApiService`.
- **Models Integrated**: `crm.lead`, `account.move` (Invoices), `project.project`, `project.task`, `res.partner`, `product.product`.
- **Async Resilience**: When Odoo is unreachable, incoming leads are automatically queued in Redis (`odoo:pending-leads`) for zero-loss reconciliation.

### 4.4 Security & Ingress Architecture
- **Reverse Proxy**: **Traefik v3** with Cloudflared tunnel integration. Nginx is NOT used.
- **Database Privacy**: PostgreSQL, Redis, and Qdrant are bound strictly to internal Docker networks (`hexastudio_internal`) with 0 public port exposure.
- **Auth**: JWT bearer authentication with HttpOnly secure cookie fallbacks.

---

## 5. ARCHITECTURAL CONSTRAINTS & RULES

1. **Odoo-First Architecture**: HEXA Hub is an experience layer, not an ERP. Never duplicate business logic.
2. **No direct database access from Frontend**: All client requests MUST pass through NestJS BFF (`api.hexastudio.net`).
3. **Strict Workspace Imports**: Packages MUST be consumed via NPM workspaces (`@hexastudio/types`, `@hexastudio/utils`).
4. **Traefik Labels**: All service ingress routing must be defined dynamically via Traefik labels in `docker-compose.prod.yml`.
