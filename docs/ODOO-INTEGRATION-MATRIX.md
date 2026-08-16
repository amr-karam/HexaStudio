# HEXA Hub — Odoo Integration Matrix

**Reference:** ADR-0006: Odoo-First Architecture Mandate

---

## 1. Integration Overview

HEXA Hub integrates with Odoo 17 ERP via JSON-RPC/XML-RPC APIs. All business data originates from or synchronizes with Odoo as the single source of truth.

### 1.1 Architecture Pattern

- **Sync Direction**: Bi-directional (unless specified as read-only)
- **Authentication**: XML-RPC API with service account
- **Caching**: Redis with 15-minute TTL
- **Circuit Breaker**: Automatic failover when Odoo is unavailable
- **Conflict Resolution**: Last-write-wins with field-level merge

---

## 2. Module Integration Matrix

### 2.1 Sales & CRM

| Odoo Model | HEXA Hub Feature | Sync Direction | Operations | Status |
|------------|------------------|----------------|------------|--------|
| `crm.lead` | Lead Management | Bi-directional | CRUD | ✅ Complete |
| `crm.lead` | Pipeline View | Bi-directional | Read, Update | ✅ Complete |
| `res.partner` | Contact Management | Bi-directional | CRUD | ✅ Complete |
| `res.company` | Company Settings | Read-only | Read | ✅ Complete |
| `sale.order` | Quotation Management | Bi-directional | CRUD | ✅ Complete |
| `sale.order.line` | Quotation Lines | Bi-directional | Read, Create | ✅ Complete |
| `sale.team` | Sales Teams | Read-only | Read | ✅ Complete |

### 2.2 Project Delivery

| Odoo Model | HEXA Hub Feature | Sync Direction | Operations | Status |
|------------|------------------|----------------|------------|--------|
| `project.project` | Project Management | Bi-directional | CRUD | ✅ Complete |
| `project.task` | Task Management | Bi-directional | CRUD | ✅ Complete |
| `project.milestone` | Milestone Tracking | Bi-directional | CRUD | ✅ Complete |
| `project.task.type` | Task Stages | Read-only | Read | ✅ Complete |

### 2.3 Customer Service

| Odoo Model | HEXA Hub Feature | Sync Direction | Operations | Status |
|------------|------------------|----------------|------------|--------|
| `helpdesk.ticket` | Ticket Management | Bi-directional | CRUD | ✅ Complete |
| `helpdesk.stage` | Ticket Stages | Read-only | Read | ✅ Complete |
| `helpdesk.team` | Support Teams | Read-only | Read | ✅ Complete |

### 2.4 Operations

| Odoo Model | HEXA Hub Feature | Sync Direction | Operations | Status |
|------------|------------------|----------------|------------|--------|
| `calendar.event` | Calendar Events | Bi-directional | CRUD | ✅ Complete |
| `hr.employee` | Employee Directory | Bi-directional | Read, Update | ✅ Complete |
| `hr.department` | Department Structure | Read-only | Read | ✅ Complete |
| `account.analytic.line` | Timesheets | Bi-directional | CRUD | ✅ Complete |

### 2.5 Finance

| Odoo Model | HEXA Hub Feature | Sync Direction | Operations | Status |
|------------|------------------|----------------|------------|--------|
| `account.move` | Invoices | Odoo → Hub | Read | ✅ Complete |
| `account.move.line` | Invoice Lines | Odoo → Hub | Read | ✅ Complete |
| `account.payment` | Payments | Odoo → Hub | Read | ✅ Complete |
| `account.journal` | Journals | Odoo → Hub | Read | ✅ Complete |
| `account.bank.statement` | Bank Statements | Odoo → Hub | Read | ✅ Complete |

### 2.6 Content & Knowledge

| Odoo Model | HEXA Hub Feature | Sync Direction | Operations | Status |
|------------|------------------|----------------|------------|--------|
| `ir.attachment` | Document Management | Bi-directional | Read, Download | ✅ Complete |
| `knowledge.article` | Knowledge Base | Bi-directional | Read, Update | ✅ Complete |
| `knowledge.category` | Categories | Read-only | Read | ✅ Complete |

### 2.7 Communication

| Odoo Model | HEXA Hub Feature | Sync Direction | Operations | Status |
|------------|------------------|----------------|------------|--------|
| `mail.activity` | Activities | Bi-directional | CRUD | ✅ Complete |
| `mail.message` | Messages | Bi-directional | Read, Create | ✅ Complete |
| `mail.thread` | Chatter | Bi-directional | Read, Create | ✅ Complete |
| `mail.mail` | Email | Bi-directional | Read, Send | ✅ Complete |
| `mail.notification` | Notifications | Bi-directional | Read | ✅ Complete |

---

## 3. Sync Engine Requirements

### 3.1 Bidirectional Sync

- Changes in HEXA Hub flow to Odoo
- Changes in Odoo flow to HEXA Hub
- Conflict detection at field level

### 3.2 Conflict Resolution

- **Last-Write-Wins (LWW)**: Default strategy for most fields
- **Field-Level Merge**: When possible, merge non-conflicting fields
- **Manual Resolution**: For critical conflicts, notify users for resolution
- **Audit Trail**: Log all conflicts and resolutions

### 3.3 Delta Sync

- Only transfer changed records
- Use `write_date` field for change detection
- Batch operations for efficiency

### 3.4 Offline Queue

- Queue changes when Odoo is unavailable
- Exponential backoff retry (1s, 2s, 4s, 8s, 16s, 32s max)
- Circuit breaker pattern (5 failures → open circuit for 30s)
- Priority queue for critical operations

### 3.5 Sync Status

- Real-time sync status dashboard
- Per-module sync health
- Error logging and alerting
- Performance metrics (latency, throughput)

---

## 4. API Orchestration Layer

### 4.1 Cross-Module Aggregation

```typescript
// Example: Executive Dashboard
interface ExecutiveDashboard {
  crm: {
    totalLeads: number;
    expectedRevenue: number;
    pipelineStagesCount: number;
  };
  projects: {
    activeProjectsCount: number;
    totalProjectsCount: number;
  };
  finance: {
    unpaidInvoicesCount: number;
    totalUnpaidAmount: number;
  };
  helpdesk: {
    openTicketsCount: number;
  };
  timesheets: {
    totalHoursLoggedThisMonth: number;
  };
}
```

### 4.2 Workflow Automation

- Cross-module triggers (e.g., new lead → create project)
- Automated notifications
- Business rule engine
- Custom workflow definitions

### 4.3 AI Assistants

- Context from all modules
- Natural language queries
- Automated insights
- Smart recommendations

---

## 5. Error Handling

### 5.1 Sync Failures

- Log error details (model, record ID, operation, timestamp)
- Queue for retry with exponential backoff
- Alert after 3 consecutive failures
- Manual retry option in admin dashboard

### 5.2 Data Conflicts

- Detect conflicts at sync time
- Log conflict details
- Apply resolution strategy
- Notify users if manual resolution needed

### 5.3 Network Issues

- Circuit breaker pattern
- Graceful degradation
- Cached data fallback
- User notification of degraded mode

---

## 6. Performance Considerations

### 6.1 Caching Strategy

- Redis cache with 15-minute TTL
- Cache invalidation on write
- Stale cache fallback during Odoo downtime

### 6.2 Batch Operations

- Batch API calls where possible
- Pagination for large datasets
- Background processing for heavy operations

### 6.3 Rate Limiting

- Respect Odoo API rate limits
- Queue excess requests
- Monitor API usage

---

## 7. Security Considerations

### 7.1 Authentication

- Service account with minimal required permissions
- Secure credential storage (environment variables)
- Regular credential rotation

### 7.2 Data Access

- Role-based access control (RBAC)
- Field-level permissions where needed
- Audit logging for sensitive operations

### 7.3 Network Security

- Internal network communication only
- TLS for all API calls
- IP whitelisting where possible

---

## 8. Monitoring & Observability

### 8.1 Metrics

- Sync latency per module
- Error rates
- Queue depth
- Circuit breaker state

### 8.2 Logging

- Structured logging (JSON)
- Correlation IDs for traceability
- Log aggregation (Loki/ELK)

### 8.3 Alerting

- Sync failure alerts
- Performance degradation alerts
- Circuit breaker state change alerts

---

## 9. Implementation Phases

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

### Phase 2: Enhanced Sync (In Progress)
- [ ] Bidirectional sync for all modules
- [ ] Conflict resolution engine
- [ ] Delta sync
- [ ] Offline queue
- [ ] Sync status dashboard

### Phase 3: Experience Layer (Pending)
- [ ] Executive dashboards
- [ ] Cross-module search
- [ ] Unified notifications
- [ ] AI assistants
- [ ] Workflow automation

### Phase 4: Advanced Features (Pending)
- [ ] Client collaboration portals
- [ ] Team collaboration
- [ ] Real-time collaboration
- [ ] API orchestration

---

**Last Updated:** 2026-08-02
**Reference:** ADR-0006: Odoo-First Architecture Mandate
