# 🏢 ODOO INTEGRATION: THE BUSINESS ENGINE (ODOO-FIRST ARCHITECTURE)

**Version:** 2.0 | **Scope:** Backend BFF $\rightarrow$ Odoo ERP | **Standard:** Synchronized / Automated / Non-Duplicated

## 1. THE ODOO-FIRST PHILOSOPHY
HEXA Hub is **NOT** an ERP. Odoo is the **Single Source of Truth (SOT)** for all business operations.
HEXA Hub serves as the premium experience layer built on top of Odoo. Every business entity originates from or synchronizes with Odoo.

- **Extend, Never Duplicate:** Never duplicate ERP business logic in the Hub.
- **BFF Aggregation:** Aggregate information from multiple modules into high-performance payloads.
- **Resilience:** Handle synchronization failures with circuit breakers, exponential retries, structured logging, and fallback caches.

---

## 2. INTEGRATION MATRIX (16 MODULES)

| Module | Odoo Model | BFF Service Method | REST Endpoint |
|--------|------------|---------------------|---------------|
| **CRM** | `crm.lead` | `getCrmPipeline()`, `getLeads()` | `GET /api/v1/odoo/crm/pipeline`, `GET /api/v1/odoo/crm/leads` |
| **Contacts** | `res.partner` | `getContacts()`, `getContactDetail()` | `GET /api/v1/odoo/contacts` |
| **Companies** | `res.company` | `getCompanySettings()` | `GET /api/v1/odoo/company/settings` |
| **Sales** | `sale.order` | `getSalesOrders()` | `GET /api/v1/odoo/sales/orders` |
| **Quotations** | `sale.order` | `getQuotations()`, `createQuotation()` | `GET /api/v1/odoo/quotations` |
| **Projects** | `project.project` | `getProjects()`, `getProjectDetail()` | `GET /api/v1/odoo/projects` |
| **Tasks** | `project.task` | `getTasks()`, `getTaskDetail()` | `GET /api/v1/odoo/tasks` |
| **Helpdesk** | `helpdesk.ticket` | `getHelpdeskTickets()`, `createHelpdeskTicket()` | `GET /api/v1/odoo/helpdesk/tickets` |
| **Calendar** | `calendar.event` | `getCalendarEvents()`, `createCalendarEvent()` | `GET /api/v1/odoo/calendar/events` |
| **Employees** | `hr.employee` | `getEmployees()`, `getEmployeeDetail()` | `GET /api/v1/odoo/employees` |
| **Documents** | `ir.attachment` | `getDocuments()` | `GET /api/v1/odoo/documents` |
| **Accounting** | `account.move` | `getInvoices()` | `GET /api/v1/odoo/invoices` (read-only) |
| **Timesheets** | `account.analytic.line` | `getTimesheets()`, `createTimesheet()` | `GET /api/v1/odoo/timesheets` |
| **Knowledge** | `knowledge.article` | `getKnowledgeArticles()` | `GET /api/v1/odoo/knowledge/articles` |
| **Activities** | `mail.activity` | `getActivities()`, `completeActivity()` | `GET /api/v1/odoo/activities` |
| **Email / Mail** | `mail.message` | `getMailMessages()`, `postMailMessage()` | `GET /api/v1/odoo/messages` |

---

## 3. EXECUTIVE HUB DASHBOARD AGGREGATOR
The `GET /api/v1/odoo/dashboard/executive` endpoint aggregates metrics from CRM, Projects, Finance (Invoices), Helpdesk, and Timesheets into a unified real-time dashboard payload:

```json
{
  "crm": { "totalLeads": 42, "expectedRevenue": 850000, "pipelineStagesCount": 5 },
  "projects": { "activeProjectsCount": 12, "totalProjectsCount": 28 },
  "finance": { "unpaidInvoicesCount": 3, "totalUnpaidAmount": 45000 },
  "helpdesk": { "openTicketsCount": 4 },
  "timesheets": { "totalHoursLoggedThisMonth": 640 },
  "timestamp": "2026-07-24T18:15:00.000Z"
}
```

---

## 5. TROUBLESHOOTING XML-RPC PERMISSIONS & PROJECT CREATION ERRORS

### Symptom
When the backend attempts to create a project (`project.project`), lead (`crm.lead`), or contact (`res.partner`) via XML-RPC, Odoo may return an Access Error:
`Access Error: You are not allowed to create "Project" records.` (or similar XML-RPC Fault).

### Root Cause
By default in Odoo, external API users configured via `ODOO_USER` and `ODOO_PASSWORD` are standard internal users and do not possess creation or write rights on core business models such as `project.project` unless explicitly assigned to the appropriate security groups.

### Required Odoo Security Groups for API User (`ODOO_USER`)
To grant the API user the necessary permissions in Odoo:
1. Navigate to **Settings** → **Users & Companies** → **Users** in Odoo.
2. Select the user configured in `ODOO_USER` (e.g. `admin` or API service account).
3. Under **Access Rights** / **Technical Settings**, assign the user to:
   - **Project / Administrator** (`project.group_project_manager`) or **Project / User** (`project.group_project_user`) — required for `project.project` and `project.milestone` creation/management.
   - **Sales / User: All Documents** or **Administrator** — required for `sale.order` and quotations.
   - **CRM / User** — required for `crm.lead` pipeline creation.

### Backend Graceful Fallback & Resilience
The NestJS backend includes built-in protection against XML-RPC permission failures:
- **Error Detection:** `OdooService` inspects XML-RPC faults for permission/access denial keywords (`not allowed`, `access error`, `missing access right`) and logs clear actionable instructions pointing to Odoo security group configuration.
- **Redis Caching Fallback:** When project synchronization or backfill encounters a permission or connectivity failure, `StrapiProjectSyncService` catches the error gracefully, caches the project payload in Redis (`odoo:project-cache:*`), and records the error state in sync status without crashing module initialization or endpoint requests.

*“The ERP is the brain; the API is the nervous system. Both must be perfectly synchronized for the body to move.”*
