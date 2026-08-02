# ADR 0006: Odoo-First Architecture Mandate

- **Status:** Accepted
- **Date:** 2026-08-02
- **Deciders:** Enterprise Architect, Product Owner, Lead Backend Engineer

---

## 1. CONTEXT

HEXA Hub has evolved from a client portal into a comprehensive enterprise experience layer. The platform must integrate with all Odoo business modules while maintaining a clear separation of concerns:

- **Odoo 17 ERP**: The single source of truth for all business operations
- **HEXA Hub**: The premium experience layer providing modern UI/UX, real-time collaboration, AI assistants, and cross-module workflows

This ADR formalizes the architectural principle that HEXA Hub is NOT an ERP — it is an extension and enhancement of Odoo's capabilities.

---

## 2. PROBLEM STATEMENT

Without a clear architectural mandate, there is risk of:

1. **ERP Duplication**: Reimplementing business logic that Odoo already handles
2. **Data Divergence**: Creating parallel data stores that fall out of sync
3. **Integration Gaps**: Missing critical business modules from the integration matrix
4. **Experience Degradation**: Failing to provide the premium UX that differentiates HEXA Hub

---

## 3. DECISION

### 3.1 Core Principle

**HEXA Hub is the premium experience layer built on top of Odoo.**

Every business entity must originate from or synchronize with Odoo whenever appropriate. HEXA Hub must never duplicate ERP business logic.

### 3.2 Integration Mandate

HEXA Hub must integrate with the following Odoo modules:

| Category | Modules | Sync Direction |
|----------|---------|----------------|
| **Sales & CRM** | CRM, Contacts, Companies, Sales, Quotations | Bi-directional |
| **Project Delivery** | Projects, Tasks, Milestones | Bi-directional |
| **Customer Service** | Helpdesk | Bi-directional |
| **Operations** | Calendar, Employees, Timesheets | Bi-directional |
| **Finance** | Accounting (read-only), Invoices | Odoo → Hub |
| **Content** | Documents, Knowledge | Bi-directional |
| **Communication** | Activities, Email, Mail | Bi-directional |

### 3.3 HEXA Hub Must Provide

- Modern luxury UI/UX
- Real-time collaboration
- AI assistants with context from all modules
- Unified notifications
- Advanced search across all business data
- Executive dashboards with cross-module analytics
- Client collaboration portals
- Team collaboration features
- Cross-module workflows
- Workflow automation
- API orchestration

### 3.4 Integration Rules

1. **Never duplicate ERP business logic**
2. **Extend Odoo capabilities** through the experience layer
3. **Improve user experience** beyond what Odoo's native UI provides
4. **Aggregate information** from multiple modules into unified views
5. **Synchronize through secure APIs and webhooks**
6. **Preserve data integrity** with conflict resolution
7. **Handle synchronization failures** with retries, logging, and conflict resolution

### 3.5 Architectural Pattern

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

---

## 4. ALTERNATIVES CONSIDERED

### Option A: Full ERP Replacement
- **Pros**: Complete control over business logic
- **Cons**: Massive development effort, loss of Odoo's mature business processes, maintenance burden
- **Verdict**: Rejected — violates the "Never duplicate ERP business logic" principle

### Option B: Odoo as Black Box (Read-Only)
- **Pros**: Simpler integration, no sync complexity
- **Cons**: Users must switch between Odoo and HEXA Hub, no unified experience
- **Verdict**: Rejected — fails to provide the "modern enterprise operating system" experience

### Option C: Hybrid (Selected)
- **Pros**: Leverages Odoo's business logic while providing premium UX
- **Cons**: Requires robust sync engine, conflict resolution
- **Verdict**: Accepted — aligns with the mandate

---

## 5. CONSEQUENCES

### Positive:
- Single source of truth for all business data
- No duplicated business logic
- Premium UX layer on top of mature ERP
- Cross-module workflows and automation
- AI assistants with full business context

### Negative / Trade-offs:
- Complex bidirectional sync requirements
- Need for conflict resolution engine
- Dependency on Odoo API availability
- Performance considerations for real-time sync

---

## 6. IMPLEMENTATION REQUIREMENTS

### Phase 1: Core Integration (Complete)
- [x] CRM (leads, pipeline)
- [x] Contacts/Partners
- [x] Projects & Milestones
- [x] Tasks
- [x] Quotations/Sales Orders
- [x] Invoices (read-only)
- [x] Employees (read-only)
- [x] Timesheets
- [x] Helpdesk
- [x] Knowledge (read-only)
- [x] Calendar
- [x] Activities
- [x] Documents (metadata)
- [x] Mail Messages

### Phase 2: Enhanced Sync
- [ ] Bidirectional sync for all modules
- [ ] Conflict resolution engine
- [ ] Delta sync (only changed records)
- [ ] Offline queue with retry logic
- [ ] Sync status dashboard

### Phase 3: Experience Layer
- [ ] Executive dashboards
- [ ] Cross-module search
- [ ] Unified notifications
- [ ] AI assistants
- [ ] Workflow automation

### Phase 4: Advanced Features
- [ ] Client collaboration portals
- [ ] Team collaboration
- [ ] Real-time collaboration
- [ ] API orchestration

---

## 7. MIGRATION & ROLLBACK

### Migration Strategy
1. Existing integrations remain unchanged
2. New modules added incrementally
3. Sync engine built alongside existing webhook system

### Rollback Strategy
1. Disable new sync engines
2. Fall back to existing webhook-only mode
3. No data loss — all changes flow through Odoo

---

## 8. REFERENCES

- ADR 0002: Odoo 16 ERP as Single Source of Truth
- ADR 0003: Odoo 17 JSON-RPC BFF Integration Pattern
- Odoo 17 External API Documentation
- GOVERNANCE.md (Section 8: Backend Architecture)
- ARCHITECTURE.md (Section 3: Enterprise ERP Integration)
