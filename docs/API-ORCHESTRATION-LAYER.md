# HEXA Hub — API Orchestration Layer Specification

**Reference:** ADR-0006: Odoo-First Architecture Mandate

---

## 1. Overview

The API Orchestration Layer provides a unified interface for HEXA Hub to interact with multiple Odoo modules. It aggregates data from different modules, handles cross-module workflows, and provides a clean API surface for the frontend.

---

## 2. Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                   API ORCHESTRATION LAYER                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Unified API Gateway                  │   │
│  │  - Authentication & Authorization                   │   │
│  │  - Request validation                               │   │
│  │  - Response transformation                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌───────────────────────┼───────────────────────┐         │
│  │                       │                       │         │
│  ▼                       ▼                       ▼         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Module   │    │ Cross-   │    │ Workflow │             │
│  │ APIs     │    │ Module   │    │ Engine   │             │
│  │          │    │ Aggregator│    │          │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│       │               │               │                     │
│       └───────────────┼───────────────┘                     │
│                       ▼                                     │
│              ┌──────────────┐                              │
│              │   Sync       │                              │
│              │   Engine     │                              │
│              └──────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Components

### 3.1 Unified API Gateway

**Purpose:** Single entry point for all HEXA Hub API requests.

**Responsibilities:**
- JWT authentication
- Role-based access control (RBAC)
- Request validation
- Rate limiting
- Response transformation

**Interface:**
```typescript
interface ApiGateway {
  // Process incoming request
  handleRequest(request: ApiRequest): Promise<ApiResponse>;
  
  // Validate request against schema
  validateRequest(request: ApiRequest): Promise<ValidationResult>;
  
  // Check authorization
  authorize(request: ApiRequest, user: User): Promise<boolean>;
  
  // Transform response for client
  transformResponse(response: OdooResponse, format: ResponseFormat): Promise<ApiResponse>;
}
```

### 3.2 Module APIs

**Purpose:** Provide CRUD operations for individual Odoo modules.

**Available APIs:**

| API | Module | Operations |
|-----|--------|------------|
| `/api/v1/crm/*` | CRM | CRUD for leads, pipeline |
| `/api/v1/contacts/*` | Contacts | CRUD for partners |
| `/api/v1/projects/*` | Projects | CRUD for projects, tasks, milestones |
| `/api/v1/sales/*` | Sales | CRUD for quotations, orders |
| `/api/v1/helpdesk/*` | Helpdesk | CRUD for tickets |
| `/api/v1/hr/*` | HR | Read for employees, timesheets |
| `/api/v1/finance/*` | Finance | Read for invoices, payments |
| `/api/v1/knowledge/*` | Knowledge | Read/Update for articles |
| `/api/v1/calendar/*` | Calendar | CRUD for events |
| `/api/v1/mail/*` | Mail | Read for messages, activities |

**Example API Definition:**
```typescript
// CRM Module API
interface CrmApi {
  // Get pipeline summary
  getPipeline(): Promise<PipelineSummary>;
  
  // Get leads with pagination
  getLeads(params: PaginationParams): Promise<Lead[]>;
  
  // Get lead detail
  getLeadDetail(id: number): Promise<Lead>;
  
  // Create lead
  createLead(data: CreateLeadDto): Promise<Lead>;
  
  // Update lead
  updateLead(id: number, data: UpdateLeadDto): Promise<Lead>;
  
  // Archive lead
  archiveLead(id: number): Promise<void>;
}
```

### 3.3 Cross-Module Aggregator

**Purpose:** Combine data from multiple modules into unified views.

**Use Cases:**
- Executive Dashboard (CRM + Projects + Finance + Helpdesk + Timesheets)
- Client Portal (Projects + Tasks + Invoices + Documents)
- Team Dashboard (Tasks + Timesheets + Activities)

**Interface:**
```typescript
interface CrossModuleAggregator {
  // Aggregate data from multiple modules
  aggregate(modules: OdooModule[], aggregationConfig: AggregationConfig): Promise<AggregatedData>;
  
  // Get executive dashboard
  getExecutiveDashboard(): Promise<ExecutiveDashboard>;
  
  // Get client portal view
  getClientPortalView(clientId: number): Promise<ClientPortalView>;
  
  // Get team dashboard
  getTeamDashboard(teamId: number): Promise<TeamDashboard>;
}
```

**Example Aggregation:**
```typescript
interface ExecutiveDashboard {
  crm: {
    totalLeads: number;
    expectedRevenue: number;
    pipelineStagesCount: number;
  };
  projects: {
    activeProjectsCount: number;
    totalProjectsCount: number;
    projectsAtRisk: number;
  };
  finance: {
    unpaidInvoicesCount: number;
    totalUnpaidAmount: number;
    revenueThisMonth: number;
  };
  helpdesk: {
    openTicketsCount: number;
    averageResolutionTime: number;
  };
  timesheets: {
    totalHoursLoggedThisMonth: number;
    utilizationRate: number;
  };
}
```

### 3.4 Workflow Engine

**Purpose:** Execute cross-module workflows and automation.

**Capabilities:**
- Trigger workflows on events (e.g., new lead → create project)
- Execute business rules
- Send notifications
- Update multiple modules atomically

**Interface:**
```typescript
interface WorkflowEngine {
  // Define a workflow
  defineWorkflow(workflow: WorkflowDefinition): Promise<void>;
  
  // Execute a workflow
  executeWorkflow(workflowId: string, context: WorkflowContext): Promise<WorkflowResult>;
  
  // Get workflow status
  getWorkflowStatus(workflowId: string): Promise<WorkflowStatus>;
  
  // List available workflows
  listWorkflows(): Promise<WorkflowDefinition[]>;
}
```

**Example Workflow:**
```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  trigger: {
    module: OdooModule;
    event: 'CREATE' | 'UPDATE' | 'DELETE';
  };
  steps: WorkflowStep[];
}

interface WorkflowStep {
  type: 'API_CALL' | 'TRANSFORM' | 'CONDITION' | 'NOTIFICATION';
  config: Record<string, any>;
}

// Example: New Lead → Create Project
const newLeadWorkflow: WorkflowDefinition = {
  id: 'new-lead-to-project',
  name: 'New Lead to Project',
  trigger: {
    module: 'CRM',
    event: 'CREATE',
  },
  steps: [
    {
      type: 'TRANSFORM',
      config: {
        mapping: {
          name: 'lead.name',
          client: 'lead.partner_name',
          budget: 'lead.x_hexa_budget',
        },
      },
    },
    {
      type: 'API_CALL',
      config: {
        module: 'PROJECTS',
        operation: 'CREATE',
      },
    },
    {
      type: 'NOTIFICATION',
      config: {
        channel: 'email',
        template: 'new-project-created',
      },
    },
  ],
};
```

---

## 4. API Endpoints

### 4.1 Dashboard APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/dashboard/executive` | GET | Executive dashboard data |
| `/api/v1/dashboard/client/:clientId` | GET | Client portal dashboard |
| `/api/v1/dashboard/team/:teamId` | GET | Team dashboard |
| `/api/v1/dashboard/project/:projectId` | GET | Project dashboard |

### 4.2 CRM APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/crm/pipeline` | GET | Pipeline summary |
| `/api/v1/crm/leads` | GET | List leads |
| `/api/v1/crm/leads/:id` | GET | Get lead detail |
| `/api/v1/crm/leads` | POST | Create lead |
| `/api/v1/crm/leads/:id` | PUT | Update lead |
| `/api/v1/crm/leads/:id` | DELETE | Archive lead |

### 4.3 Project APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/projects` | GET | List projects |
| `/api/v1/projects/:id` | GET | Get project detail |
| `/api/v1/projects` | POST | Create project |
| `/api/v1/projects/:id` | PUT | Update project |
| `/api/v1/projects/:id/tasks` | GET | List project tasks |
| `/api/v1/projects/:id/milestones` | GET | List project milestones |

### 4.4 Finance APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/finance/invoices` | GET | List invoices |
| `/api/v1/finance/invoices/:id` | GET | Get invoice detail |
| `/api/v1/finance/summary` | GET | Financial summary |

### 4.5 Helpdesk APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/helpdesk/tickets` | GET | List tickets |
| `/api/v1/helpdesk/tickets/:id` | GET | Get ticket detail |
| `/api/v1/helpdesk/tickets` | POST | Create ticket |
| `/api/v1/helpdesk/tickets/:id` | PUT | Update ticket |

### 4.6 Search APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/search` | GET | Global search across modules |
| `/api/v1/search/advanced` | POST | Advanced search with filters |

---

## 5. Data Transformation

### 5.1 Odoo → Hub Transformation

```typescript
// Example: Transform Odoo Lead to Hub Lead
function transformOdooLeadToHub(odooLead: OdooLead): HubLead {
  return {
    id: odooLead.id,
    name: odooLead.name,
    contactName: odooLead.contact_name,
    partnerName: odooLead.partner_name,
    email: odooLead.email_from,
    phone: odooLead.phone,
    stage: {
      id: odooLead.stage_id[0],
      name: odooLead.stage_id[1],
    },
    priority: odooLead.priority,
    expectedRevenue: odooLead.expected_revenue,
    source: odooLead.x_hexa_source,
    service: odooLead.x_hexa_service,
    budget: odooLead.x_hexa_budget,
    createdAt: new Date(odooLead.create_date),
  };
}
```

### 5.2 Hub → Odoo Transformation

```typescript
// Example: Transform Hub Lead to Odoo Lead
function transformHubLeadToOdoo(hubLead: HubLead): OdooLeadData {
  return {
    name: hubLead.name,
    contact_name: hubLead.contactName,
    partner_name: hubLead.partnerName,
    email_from: hubLead.email,
    phone: hubLead.phone,
    stage_id: hubLead.stage.id,
    priority: hubLead.priority,
    expected_revenue: hubLead.expectedRevenue,
    x_hexa_source: hubLead.source,
    x_hexa_service: hubLead.service,
    x_hexa_budget: hubLead.budget,
  };
}
```

---

## 6. Error Handling

### 6.1 Error Response Format

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  correlationId: string;
}
```

### 6.2 Error Codes

| Code | Description |
|------|-------------|
| `SYNC_FAILED` | Synchronization with Odoo failed |
| `CONFLICT_DETECTED` | Data conflict between Hub and Odoo |
| `MODULE_UNAVAILABLE` | Odoo module temporarily unavailable |
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMITED` | Too many requests |

---

## 7. Performance Considerations

### 7.1 Caching

- **Response Cache**: Cache API responses for 5 minutes
- **Aggregation Cache**: Cache aggregated data for 15 minutes
- **Invalidation**: Invalidate cache on write operations

### 7.2 Pagination

```typescript
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 7.3 Rate Limiting

- **Global**: 1000 requests per minute
- **Per User**: 100 requests per minute
- **Per Endpoint**: Configurable per endpoint

---

## 8. Security

### 8.1 Authentication

- JWT tokens with short expiry (15 minutes)
- Refresh tokens for long sessions
- Secure cookie storage

### 8.2 Authorization

- Role-based access control (RBAC)
- Module-level permissions
- Field-level permissions where needed

### 8.3 Data Protection

- TLS for all API calls
- Input validation and sanitization
- Output encoding
- Audit logging for sensitive operations

---

## 9. Monitoring

### 9.1 Metrics

- Request latency per endpoint
- Error rates
- Cache hit/miss rates
- Sync latency

### 9.2 Logging

- Structured logging (JSON)
- Correlation IDs for request tracing
- Error stack traces

### 9.3 Alerting

- High error rates
- Slow response times
- Sync failures
- Circuit breaker state changes

---

## 10. Implementation Phases

### Phase 1: Core APIs (Complete)
- [x] CRM APIs
- [x] Project APIs
- [x] Contact APIs
- [x] Invoice APIs (read-only)
- [x] Helpdesk APIs
- [x] Employee APIs (read-only)
- [x] Timesheet APIs

### Phase 2: Cross-Module Aggregation (In Progress)
- [ ] Executive Dashboard API
- [ ] Client Portal API
- [ ] Team Dashboard API
- [ ] Global Search API

### Phase 3: Workflow Engine (Complete)
- [x] Workflow definition
- [x] Workflow execution
- [x] Workflow monitoring
- [x] Custom workflows
- [x] Bootstrap service wiring (`WorkflowWiringService` registers `OdooApiService` under domain aliases)
- [x] Default workflow seeding (`WorkflowSeeder` — Lead→Project, Ticket Escalation, Overdue Reminder)

### Phase 4: Advanced Features (Pending)
- [ ] Real-time subscriptions
- [ ] Batch operations
- [ ] Webhook management
- [ ] API versioning

---

**Last Updated:** 2026-08-02
**Reference:** ADR-0006: Odoo-First Architecture Mandate
