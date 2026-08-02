# HEXA Hub v4.0 — Enterprise Unified Communication & Collaboration Platform

**Version:** 1.0 | **Status:** Active Development | **Start:** 2026-07-27 | **Target:** 2026-Q4

## 1. VISION

HEXA Hub is the single operating system for HEXA Studio — where every employee, client, AI agent, website, and Odoo service converges. It replaces fragmented tools with one unified workspace.

**NOT a chat app. NOT a CRM. NOT an ERP.**
**HEXA Hub = Central Operating Platform.**

---

## 2. PLATFORM IDENTITY

| Property | Value |
|----------|-------|
| Name | HEXA Hub |
| Primary Domain | https://hub.hexastudio.net |
| Brand | HEXA Studio |
| Status | Active Development |
| Monorepo Location | `hexa-hub/` (nested in hexa-platform) |

---

## 3. CURRENT STATE ASSESSMENT (2026-07-27)

### ✅ Implemented (hexa-hub/)
| Module | Files | Status |
|--------|-------|--------|
| **Auth (JWT + RBAC)** | auth.module.ts, auth.service.ts, jwt.strategy.ts, jwt-auth.guard.ts | ✅ Working |
| **Messages** | messages.module.ts, messages.service.ts, message.entity.ts | ✅ Basic messaging |
| **Workspaces** | workspaces.module.ts, workspaces.service.ts, workspace.entity.ts, task.entity.ts | ✅ Basic CRUD |
| **Projects** | projects.module.ts, projects.service.ts, project.entity.ts | ✅ Basic CRUD |
| **Users** | users.module.ts, users.service.ts, user.entity.ts, user-role.enum.ts | ✅ CRUD + RBAC |
| **Odoo Integration** | odoo.module.ts, odoo.service.ts | ✅ Scaffold |
| **AI** | ai.module.ts, ai.controller.ts, ai.service.ts | 🟡 Scaffold |
| **Realtime** | apps/realtime/ (Socket.IO) | ✅ Basic server |
| **Worker** | apps/worker/ (Bull queues) | ✅ Email/AI/notification processors |
| **Frontend** | apps/web/ (Next.js 14) | ✅ 8 routes scaffolded |
| **Types** | packages/types/ (auth, jobs, odoo, user) | ✅ Shared interfaces |

### 🔴 Missing (vs v4.0 vision)
| Module | Gap |
|--------|-----|
| **Unified Inbox** | No email/webhook/support/message aggregation |
| **Team Collaboration** | No channels, threads, mentions, presence, typing indicators |
| **Client Portal** | No portal integration (separate from web app) |
| **Notification Center** | No multi-channel (email/in-app/push) |
| **Knowledge Hub** | No wiki/SOP/documentation system |
| **Calendar** | No meeting/deadline/milestone calendar |
| **Document Management** | No MinIO integration for file storage |
| **Executive Dashboard** | No KPI/aggregation/analytics |
| **Global Search** | No search across all entities |
| **AI Workspace** | No per-user assistants with LLM integration |
| **Analytics** | No metrics/reporting/predictive |
| **Security Hardening** | No audit logs, MFA, SSO, rate limiting per endpoint |

---

## 4. BUILD PHASES

### Phase 1: Core Foundation (Weeks 1-3) — ⬅️ CURRENT
**Objective:** Solidify auth, database, realtime, and basic collaboration.

| Task | Priority | Owner | Estimate |
|------|----------|-------|----------|
| PostgreSQL schema for all entities | P0 | @backend-dev | 2d |
| TypeORM migrations + seed data | P0 | @backend-dev | 1d |
| Redis session + caching layer | P0 | @backend-dev | 1d |
| Socket.IO rooms + presence system | P0 | @3d-engineer | 2d |
| JWT refresh token rotation | P0 | @backend-dev | 1d |
| RBAC middleware (role-based guards) | P0 | @backend-dev | 1d |
| Frontend auth flow (login/register/dashboard) | P0 | @frontend-dev | 3d |
| Docker compose orchestration | P0 | @devops | 1d |

**Exit Criteria:** Auth works end-to-end, users can log in, realtime presence visible.

### Phase 2: Communication Layer (Weeks 4-6)
**Objective:** Build the unified inbox and team collaboration.

| Task | Priority | Owner | Estimate |
|------|----------|-------|----------|
| Channels (public/private/project rooms) | P0 | @backend-dev | 3d |
| Threaded messages | P0 | @backend-dev | 2d |
| @mentions + notifications | P1 | @backend-dev | 2d |
| Typing indicators + read receipts | P1 | @3d-engineer | 2d |
| Message search (full-text) | P1 | @backend-dev | 1d |
| Frontend chat UI (Slack-like) | P0 | @frontend-dev | 5d |
| File attachments (MinIO presigned URLs) | P1 | @backend-dev | 2d |

**Exit Criteria:** Teams can communicate in channels, send messages, see presence.

### Phase 3: Client & Project Integration (Weeks 7-9)
**Objective:** Connect clients and sync with Odoo.

| Task | Priority | Owner | Estimate |
|------|----------|-------|----------|
| Client portal (separate auth scope) | P0 | @frontend-dev | 3d |
| Odoo CRM sync (leads → projects) | P0 | @backend-dev | 3d |
| Odoo invoice sync | P1 | @backend-dev | 2d |
| Project workspace (kanban/tasks/milestones) | P0 | @frontend-dev | 4d |
| Document center (MinIO folders + permissions) | P1 | @backend-dev | 3d |
| Approval workflow (digital sign-off) | P1 | @backend-dev | 2d |
| Calendar integration (meetings/deadlines) | P2 | @backend-dev | 2d |

**Exit Criteria:** Clients can see projects, approve deliverables, view invoices.

### Phase 4: Intelligence (Weeks 10-12)
**Objective:** AI assistants and analytics.

| Task | Priority | Owner | Estimate |
|------|----------|-------|----------|
| Per-user AI assistant (LLM integration) | P0 | @ai-engineer | 5d |
| AI summarization (conversations/meetings) | P1 | @ai-engineer | 3d |
| AI document search (semantic) | P1 | @ai-engineer | 2d |
| Executive dashboard (KPIs/metrics) | P1 | @frontend-dev | 3d |
| Analytics pipeline (PostHog/custom) | P2 | @backend-dev | 2d |
| Knowledge hub (wiki/SOP) | P2 | @frontend-dev | 3d |

**Exit Criteria:** AI assists users, dashboard shows company health.

### Phase 5: Hardening & Launch (Weeks 13-15)
**Objective:** Security, performance, production readiness.

| Task | Priority | Owner | Estimate |
|------|----------|-------|----------|
| Audit logging (all CRUD operations) | P0 | @backend-dev | 2d |
| MFA (TOTP) | P1 | @backend-dev | 2d |
| Rate limiting (per-endpoint) | P0 | @backend-dev | 1d |
| E2E test suite (Playwright) | P0 | @qa | 3d |
| Performance optimization (CWV) | P1 | @performance-engineer | 2d |
| Security audit (OWASP Top 10) | P0 | @security-auditor | 2d |
| Docker production compose | P0 | @devops | 1d |
| Monitoring (Prometheus/Grafana) | P1 | @devops | 2d |
| Documentation (API + Admin) | P1 | @docs | 2d |

**Exit Criteria:** Production-ready, all gates green, zero critical vulns.

---

## 5. TECHNOSPHERE

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS |
| Backend | NestJS, TypeORM, PostgreSQL |
| Realtime | Socket.IO, Redis Pub/Sub |
| Background Jobs | Bull (Redis-backed queues) |
| Storage | MinIO (S3-compatible) |
| Auth | JWT + bcrypt + RBAC |
| AI | OpenAI / Gemini (pluggable) |
| Infra | Docker Compose, Traefik |
| Monitoring | Prometheus, Grafana, Loki |

---

## 6. INTEGRATION MAP

```
HEXA Hub
    │
    ├── Website (hexastudio.net)
    │   └── Contact forms → Hub → Odoo Lead
    │
    ├── Client Portal (portal.hexastudio.net)
    │   └── SSO → Hub → Project data
    │
    ├── Odoo ERP (odoo.hexastudio.net)
    │   └── Bidirectional sync (CRM, Projects, Invoices)
    │
    ├── API Gateway (api.hexastudio.net)
    │   └── REST → Hub → All services
    │
    ├── AI (ai.hexastudio.net)
    │   └── LLM → Hub → User assistants
    │
    ├── Files (files.hexastudio.net)
    │   └── MinIO → Hub → Document center
    │
    └── Analytics (analytics.hexastudio.net)
        └── PostHog → Hub → Dashboards
```

---

## 7. SUCCESS CRITERIA

A user should be able to:
- [ ] Log in with SSO
- [ ] See team presence (online/offline/busy)
- [ ] Send messages in channels and threads
- [ ] Mention colleagues and get notifications
- [ ] View project status (kanban/milestones)
- [ ] Approve deliverables (digital sign-off)
- [ ] View invoices synced from Odoo
- [ ] Search documents across all sources
- [ ] Ask AI assistant for status/summaries
- [ ] Access on mobile (iOS/Android)
- [ ] Use one unified workspace with premium UX

---

*"HEXA Hub: Everything connects here."*
