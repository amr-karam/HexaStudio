# HEXA Hub Architecture Blueprint

## 1. High-Level System Design

HEXA Hub is the premium experience layer built on top of Odoo 17 ERP.

**Core Principle:** HEXA Hub is NOT an ERP. Odoo remains the single source of truth for all business operations. HEXA Hub extends Odoo's capabilities with a modern luxury UI/UX, real-time collaboration, AI assistants, and cross-module workflows.

**Reference:** ADR-0006: Odoo-First Architecture Mandate

### 1.1 Core Components
- **Web Frontend (`apps/web`):** Next.js 14 App Router. Handles the user interface, client-side state, and real-time sockets.
- **API Gateway (`apps/api`):** NestJS. The central brain. Manages auth, Odoo integrations, and data persistence.
- **Realtime Server (`apps/realtime`):** Socket.IO + Redis. Handles instant messaging, presence, and live notifications.
- **Background Worker (`apps/worker`):** BullMQ + Redis. Handles long-running tasks (AI generation, email blasts, report generation).

### 1.2 Odoo Integration Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    HEXA HUB EXPERIENCE LAYER                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Modern UI/UX│ │ Real-time   │ │ AI          │          │
│  │             │ │ Collab      │ │ Assistants  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                         │                                   │
│              ┌──────────▼──────────┐                       │
│              │  API Orchestration  │                       │
│              │      Layer          │                       │
│              └──────────┬──────────┘                       │
│                         │                                   │
│  ┌──────────────────────┼──────────────────────┐          │
│  │         Sync Engine (Bidirectional)         │          │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │          │
│  │  │Conflict │ │ Retry   │ │ Delta   │       │          │
│  │  │Resolver │ │ Queue   │ │ Sync    │       │          │
│  │  └─────────┘ └─────────┘ └─────────┘       │          │
│  └──────────────────────┬──────────────────────┘          │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ Secure APIs / Webhooks
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                         │         ODOO 17 ERP               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   CRM    │ │ Projects │ │ Accounting│ │  Sales   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ └──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Helpdesk │ │ Calendar │ │   HR     │ │ Knowledge│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│              SINGLE SOURCE OF TRUTH                         │
└─────────────────────────────────────────────────────────────┘
```

## 2. Data Flow & Communication
### 2.1 Communication Patterns
- **Client → API:** REST / JSON over HTTPS.
- **Client → Realtime:** WebSockets (Socket.IO).
- **API → Realtime:** Redis Pub/Sub (to push events to specific users).
- **API → Worker:** Redis Queue (BullMQ).
- **External → API:** Webhooks (from Odoo, Website).

### 2.2 Odoo Integration Strategy

**Never duplicate ERP business logic.** Instead:
- Extend Odoo capabilities through the experience layer
- Improve user experience beyond native Odoo UI
- Aggregate information from multiple modules
- Synchronize through secure APIs and webhooks
- Preserve data integrity with conflict resolution
- Handle synchronization failures with retries, logging, and conflict resolution

**Sync Engine Requirements:**
1. **Bidirectional Sync**: Changes in HEXA Hub flow to Odoo and vice versa
2. **Conflict Resolution**: Last-write-wins with field-level merge when possible
3. **Delta Sync**: Only transfer changed records to minimize API calls
4. **Offline Queue**: Queue changes when Odoo is unavailable, sync when restored
5. **Retry Logic**: Exponential backoff with circuit breaker pattern
6. **Audit Log**: Track all sync operations for debugging and compliance

## 3. Database Schema Strategy
- **Primary DB:** PostgreSQL (Relational data: Users, Projects, Messages, Permissions).
- **Cache/Queue:** Redis (Session management, Real-time state, Job queues).
- **Object Storage:** MinIO (Files, Documents, Media).

## 4. Security Model
- **Authentication:** JWT (Access + Refresh tokens) with secure HTTP-only cookies.
- **Authorization:** Granular RBAC (Role-Based Access Control).
  - `SUPER_ADMIN`: Full system access.
  - `EMPLOYEE`: Workspace and department access.
  - `CLIENT`: Project-specific workspace access.
- **Network:** All internal traffic within a Docker bridge network. External access only via Nginx Reverse Proxy.

## 5. Module Roadmap

### Phase 1: Foundation (Complete)
- [x] Auth & RBAC
- [x] Basic Project Workspaces
- [x] Real-time Messaging
- [x] Core Odoo Integration (CRM, Projects, Tasks, Invoices, Contacts)

### Phase 2: Full Odoo Integration (In Progress)
- [ ] Bidirectional sync for all modules
- [ ] Conflict resolution engine
- [ ] Delta sync (only changed records)
- [ ] Offline queue with retry logic
- [ ] Sync status dashboard

### Phase 3: Experience Layer
- [ ] Executive dashboards with cross-module analytics
- [ ] Unified notifications
- [ ] Advanced search across all business data
- [ ] AI assistants with full business context
- [ ] Workflow automation

### Phase 4: Collaboration & Intelligence
- [ ] Client collaboration portals
- [ ] Team collaboration features
- [ ] Real-time collaboration
- [ ] API orchestration

**Reference:** ADR-0006: Odoo-First Architecture Mandate
