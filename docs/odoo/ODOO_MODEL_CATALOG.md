# HEXA Studio — ODOO MODEL CATALOG

> Version: 1.0 | Last Updated: 2026-07-26 | Authority: Odoo Agent

## Introduction

This document catalogs every Odoo model that synchronizes with or is accessed by the HEXA Studio platform. Odoo is the **Single Source of Truth (SOT)** for all business operations. The NestJS BFF reads from and writes to these models, caching results in Redis and PostgreSQL where appropriate.

### Integration Architecture

```
Odoo ERP ──XML-RPC──► NestJS BFF ──REST──► Frontend
   │                      │
   │                      ├── Redis Cache
   │                      ├── PostgreSQL Cache
   │                      └── EventBus (domain events)
   │
   └── Webhooks ──► NestJS Webhook Controller
```

---

## Sync Policy Summary

| Aspect | Policy |
|--------|--------|
| **Source of Truth** | Odoo for all business data |
| **Sync direction** | Primarily Odoo → API (cached read); bidirectional for CRM leads and activities |
| **Sync mechanism** | Webhooks (real-time) + Polling (every 10 min fallback) |
| **Circuit breaker** | Stop calling Odoo if failure rate > 20%; return cached payload |
| **Idempotency** | Webhook payloads have idempotency keys to prevent duplicates |
| **Retry** | Exponential backoff (1s, 2s, 4s, 8s, 16s, max 5 retries) |
| **Queue** | Failed syncs queued in Redis (`odoo:pending-*`) |
| **Conflict resolution** | Last-write-wins with timestamp comparison |
| **Full sync** | Triggerable via API or Odoo cron (every 15 min) |

---

## Model Catalog

### 1. `res.partner` — Contacts & Companies

| Attribute | Value |
|-----------|-------|
| **Purpose** | Store all contact and company records (clients, leads, vendors) |
| **Source of Truth** | Odoo |
| **Sync Direction** | Bidirectional (Odoo ↔ API) |
| **Dependencies** | None |
| **Business Rules** | `x_hexa_client` flag identifies HEXA clients; contacts with this flag are synced to application users |
| **Permissions** | Admin/Manager: full CRUD; Sales: create/read/update; Client: read own record only |
| **Events/Hooks** | `create` → webhook to NestJS → cache update + EventBus; `write` → same path |
| **Conflict Resolution** | Odoo wins for all fields except `x_hexa_website_user_id` (API wins) |
| **Retry Policy** | 5 retries, exponential backoff, dead-letter queue at 5 failures |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `name` | `name` | string | Bidirectional |
| `email` | `email` | string | Bidirectional |
| `phone` | `phone` | string | Bidirectional |
| `mobile` | `mobile` | string | Bidirectional |
| `street` | `address.street` | string | Bidirectional |
| `city` | `address.city` | string | Bidirectional |
| `state_id` | `address.state` | string | Bidirectional |
| `zip` | `address.zip` | string | Bidirectional |
| `country_id` | `address.country` | string | Bidirectional |
| `company_id` | `companyId` | integer | Odoo → API |
| `x_hexa_client` | `isClient` | boolean | Bidirectional |
| `x_hexa_source` | `source` | string | Bidirectional |
| `x_hexa_website_user_id` | `websiteUserId` | integer | API → Odoo |
| `create_date` | `createdAt` | datetime | Odoo → API |
| `write_date` | `updatedAt` | datetime | Odoo → API |

**API Endpoints**: `GET/POST/PATCH /api/odoo/contacts`, `GET /api/odoo/contacts/:id`

---

### 2. `crm.lead` — Leads & Opportunities

| Attribute | Value |
|-----------|-------|
| **Purpose** | Track sales leads from inquiry through to won/lost |
| **Source of Truth** | Odoo |
| **Sync Direction** | Bidirectional (Odoo ↔ API) |
| **Dependencies** | `res.partner` (lead can be linked to existing contact) |
| **Business Rules** | Website contact form creates lead in Odoo; stage transitions trigger automated actions; "Won" stage triggers project creation |
| **Permissions** | Admin/Sales: full CRUD; Client: read only |
| **Events/Hooks** | `create` (from website or admin) → webhook → EventBus; `write` (stage change) → webhook → auto-actions; stage → "Won" → auto-create project |
| **Conflict Resolution** | Odoo wins for stage fields; API wins for custom fields |
| **Retry Policy** | 5 retries, exponential backoff, queued in Redis on failure |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `name` | `name` | string | Bidirectional |
| `contact_name` | `contactName` | string | Bidirectional |
| `email_from` | `email` | string | Bidirectional |
| `phone` | `phone` | string | Bidirectional |
| `description` | `description` | text | Bidirectional |
| `partner_id` | `partnerId` | [integer, string] | Odoo → API |
| `stage_id` | `stageId` | [integer, string] | Bidirectional |
| `user_id` | `assignedTo` | [integer, string] | Bidirectional |
| `expected_revenue` | `expectedRevenue` | float | Bidirectional |
| `probability` | `probability` | float | Bidirectional |
| `x_hexa_source` | `source` | string | Bidirectional |
| `x_hexa_service` | `service` | string | Bidirectional |
| `x_hexa_budget` | `budget` | string | Bidirectional |
| `x_hexa_referral_code` | `referralCode` | string | Bidirectional |
| `x_hexa_website_contact_id` | `websiteContactId` | string | API → Odoo |
| `create_date` | `createdAt` | datetime | Odoo → API |

**API Endpoints**: `GET /api/odoo/crm/pipeline`, `GET/POST/PATCH/DELETE /api/odoo/crm/leads`

---

### 3. `project.project` — Projects

| Attribute | Value |
|-----------|-------|
| **Purpose** | Manage the full project lifecycle from inquiry to delivery |
| **Source of Truth** | Odoo |
| **Sync Direction** | Odoo → API (read-primary); API → Odoo (status updates) |
| **Dependencies** | `res.partner` (client), `crm.lead` (origin opportunity) |
| **Business Rules** | Auto-created when CRM lead moves to "Won" stage; `x_slug` links to Strapi portfolio; `x_hexa_client_portal_active` controls portal visibility |
| **Permissions** | Admin/PM: full CRUD; Client: read only if `x_hexa_client_portal_active=true` |
| **Events/Hooks** | `create` → webhook → cache; `write` (progress, milestone, status) → webhook → ISR revalidation + WebSocket push |
| **Conflict Resolution** | Odoo always wins (source of truth) |
| **Retry Policy** | Webhook: 3 retries; Polling: every 10 min fallback |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `name` | `name` | string | Odoo → API |
| `partner_id` | `client` | [integer, string] | Odoo → API |
| `user_id` | `projectManager` | [integer, string] | Odoo → API |
| `date_start` | `startDate` | date | Odoo → API |
| `date_deadline` | `deadline` | date | Odoo → API |
| `x_slug` | `slug` | string | Odoo → API |
| `x_hexa_type` | `type` | string | Bidirectional |
| `x_hexa_status` | `status` | string | Bidirectional |
| `x_hexa_client_portal_active` | `clientPortalActive` | boolean | Bidirectional |
| `x_hexa_budget_amount` | `budgetAmount` | float | Bidirectional |
| `x_hexa_milestone_ids` | `milestones` | [integer] | Odoo → API |
| `stage_id` | `stage` | [integer, string] | Odoo → API |
| `create_date` | `createdAt` | datetime | Odoo → API |

**API Endpoints**: `GET/PATCH /api/odoo/projects`, `GET /api/odoo/projects/:id`

---

### 4. `project.milestone` — Project Milestones

| Attribute | Value |
|-----------|-------|
| **Purpose** | Define and track key milestones within a project |
| **Source of Truth** | Odoo |
| **Sync Direction** | Bidirectional (Odoo ↔ API) |
| **Dependencies** | `project.project` (parent) |
| **Business Rules** | Default milestones created per project type; `x_hexa_client_viewable` controls portal visibility; `x_hexa_order` defines display sequence |
| **Permissions** | Admin/PM: full CRUD; Client: read only if `x_hexa_client_viewable=true` |
| **Events/Hooks** | `write` (completion) → recalculate project progress → WebSocket push to portal |
| **Conflict Resolution** | Odoo wins for name/date; API wins for description/order |
| **Retry Policy** | 3 retries, exponential backoff |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `name` | `name` | string | Bidirectional |
| `date` | `date` | date | Bidirectional |
| `completed` | `completed` | boolean | Bidirectional |
| `completed_date` | `completedDate` | date | Bidirectional |
| `project_id` | `projectId` | integer | Odoo → API |
| `x_hexa_client_viewable` | `clientViewable` | boolean | Bidirectional |
| `x_hexa_description` | `description` | text | Bidirectional |
| `x_hexa_order` | `order` | integer | Bidirectional |

**API Endpoints**: `GET/POST /api/odoo/projects/:id/milestones`, `PATCH /api/odoo/milestones/:id`

---

### 5. `project.task` — Project Tasks

| Attribute | Value |
|-----------|-------|
| **Purpose** | Track granular work items within a project |
| **Source of Truth** | Odoo |
| **Sync Direction** | Odoo → API (read-primary); API → Odoo (status updates) |
| **Dependencies** | `project.project` (parent project) |
| **Business Rules** | Task completion progresses parent project; assigned to specific team members |
| **Permissions** | Admin/PM: full CRUD; Employee: read/update assigned; Client: read only |
| **Events/Hooks** | `write` (completion) → recalculate project progress → WebSocket |
| **Conflict Resolution** | Odoo always wins |
| **Retry Policy** | 3 retries, exponential backoff |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `name` | `name` | string | Odoo → API |
| `project_id` | `projectId` | integer | Odoo → API |
| `user_ids` | `assignees` | [integer] | Odoo → API |
| `stage_id` | `stage` | [integer, string] | Bidirectional |
| `date_deadline` | `deadline` | date | Bidirectional |
| `description` | `description` | text | Odoo → API |
| `planned_hours` | `plannedHours` | float | Odoo → API |
| `create_date` | `createdAt` | datetime | Odoo → API |

**API Endpoints**: `GET/POST/PATCH /api/odoo/tasks`, `GET /api/odoo/tasks/:id`

---

### 6. `sale.order` — Sales Orders & Quotations

| Attribute | Value |
|-----------|-------|
| **Purpose** | Manage quotations and sales orders from proposal to booking |
| **Source of Truth** | Odoo |
| **Sync Direction** | Odoo → API (read-only from API) |
| **Dependencies** | `res.partner` (customer) |
| **Business Rules** | Quotations become sales orders on confirmation; linked to project via x_hexa fields |
| **Permissions** | Admin/Sales: read; API: read-only |
| **Events/Hooks** | `write` (confirmation) → webhook → EventBus |
| **Conflict Resolution** | N/A (API is read-only for this model) |
| **Retry Policy** | N/A (read-only) |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `name` | `orderNumber` | string | Odoo → API |
| `partner_id` | `customer` | [integer, string] | Odoo → API |
| `date_order` | `orderDate` | datetime | Odoo → API |
| `amount_total` | `totalAmount` | float | Odoo → API |
| `state` | `state` | string | Odoo → API |
| `order_line` | `lines` | [integer] | Odoo → API |
| `create_date` | `createdAt` | datetime | Odoo → API |

**API Endpoints**: `GET /api/odoo/sales/orders`, `GET /api/odoo/quotations`

---

### 7. `account.move` — Invoices

| Attribute | Value |
|-----------|-------|
| **Purpose** | Manage customer invoices and payment tracking |
| **Source of Truth** | Odoo |
| **Sync Direction** | Odoo → API (read-only) |
| **Dependencies** | `res.partner` (customer), `sale.order` (origin) |
| **Business Rules** | Only `out_invoice` type synced; payment status determines client portal access |
| **Permissions** | Admin/Sales: read; Client: read own invoices only; API: read-only |
| **Events/Hooks** | `write` (payment_status change) → webhook → client notification |
| **Conflict Resolution** | N/A (API is read-only) |
| **Retry Policy** | N/A (read-only) |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `name` | `invoiceNumber` | string | Odoo → API |
| `partner_id` | `customer` | [integer, string] | Odoo → API |
| `invoice_date` | `invoiceDate` | date | Odoo → API |
| `invoice_date_due` | `dueDate` | date | Odoo → API |
| `amount_total` | `totalAmount` | float | Odoo → API |
| `amount_residual` | `amountDue` | float | Odoo → API |
| `payment_state` | `paymentStatus` | string | Odoo → API |
| `state` | `state` | string | Odoo → API |
| `invoice_line_ids` | `lines` | [integer] | Odoo → API |

**API Endpoints**: `GET /api/odoo/invoices`

---

### 8. `hr.employee` — Employees

| Attribute | Value |
|-----------|-------|
| **Purpose** | Track employee information, roles, and assignments |
| **Source of Truth** | Odoo |
| **Sync Direction** | Odoo → API (read-only) |
| **Dependencies** | None |
| **Business Rules** | Employees matched to application users via email; used for project assignment and timesheets |
| **Permissions** | Admin/PM: read; API: read-only |
| **Events/Hooks** | `create`/`write` → webhook → cache update |
| **Conflict Resolution** | N/A (API is read-only) |
| **Retry Policy** | N/A (read-only) |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `name` | `name` | string | Odoo → API |
| `work_email` | `email` | string | Odoo → API |
| `job_id` | `jobTitle` | [integer, string] | Odoo → API |
| `department_id` | `department` | [integer, string] | Odoo → API |
| `user_id` | `userId` | [integer, string] | Odoo → API |
| `create_date` | `createdAt` | datetime | Odoo → API |

**API Endpoints**: `GET /api/odoo/employees`, `GET /api/odoo/employees/:id`

---

### 9. `calendar.event` — Calendar Events

| Attribute | Value |
|-----------|-------|
| **Purpose** | Manage meetings, consultations, and appointments |
| **Source of Truth** | Odoo |
| **Sync Direction** | Bidirectional (Odoo ↔ API) |
| **Dependencies** | `res.partner` (attendees) |
| **Business Rules** | Consultation stage triggers calendar event creation; events synced to client portal timeline |
| **Permissions** | Admin/PM/Sales: full CRUD; Client: read own events; API: full CRUD |
| **Events/Hooks** | `create`/`write`/`unlink` → webhook → cache + WebSocket |
| **Conflict Resolution** | Last-write-wins (timestamp-based) |
| **Retry Policy** | 3 retries, exponential backoff |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `name` | `title` | string | Bidirectional |
| `description` | `description` | text | Bidirectional |
| `start` | `startDate` | datetime | Bidirectional |
| `stop` | `endDate` | datetime | Bidirectional |
| `partner_ids` | `attendees` | [integer] | Bidirectional |
| `user_id` | `organizer` | [integer, string] | Odoo → API |
| `location` | `location` | string | Bidirectional |
| `create_date` | `createdAt` | datetime | Odoo → API |

**API Endpoints**: `GET/POST /api/odoo/calendar/events`, `PATCH/DELETE /api/odoo/calendar/events/:id`

---

### 10. `mail.message` — Messages & Notifications

| Attribute | Value |
|-----------|-------|
| **Purpose** | Internal messaging, notifications, and communication history |
| **Source of Truth** | Odoo |
| **Sync Direction** | Odoo → API (read-primary); API → Odoo (post messages) |
| **Dependencies** | `res.partner` (author/recipients), various models (via `res_id` + `model`) |
| **Business Rules** | Messages linked to specific records (project, lead, task); used for activity feed in client portal |
| **Permissions** | Admin/PM: read all; Client: read own related messages; API: read/post |
| **Events/Hooks** | `create` → webhook → WebSocket push |
| **Conflict Resolution** | Odoo wins (source of truth for communications) |
| **Retry Policy** | 3 retries, exponential backoff |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `subject` | `subject` | string | Odoo → API |
| `body` | `body` | text | Bidirectional |
| `author_id` | `author` | [integer, string] | Odoo → API |
| `partner_ids` | `recipients` | [integer] | Odoo → API |
| `model` | `relatedModel` | string | Odoo → API |
| `res_id` | `relatedId` | integer | Odoo → API |
| `message_type` | `type` | string | Odoo → API |
| `date` | `createdAt` | datetime | Odoo → API |

**API Endpoints**: `GET /api/odoo/messages`, `POST /api/odoo/messages`

---

### 11. `mail.activity` — Activities & To-dos

| Attribute | Value |
|-----------|-------|
| **Purpose** | Track scheduled activities, reminders, and follow-ups |
| **Source of Truth** | Odoo |
| **Sync Direction** | Bidirectional (Odoo ↔ API) |
| **Dependencies** | Various models (via `res_id` + `model`) |
| **Business Rules** | Activities created on lead stage changes; completion updates parent record |
| **Permissions** | Admin/PM/Sales: full CRUD; Client: read own activities |
| **Events/Hooks** | `create` → webhook; `write` (completion) → parent record update |
| **Conflict Resolution** | Odoo wins for all fields |
| **Retry Policy** | 3 retries, exponential backoff |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `activity_type_id` | `type` | [integer, string] | Bidirectional |
| `summary` | `summary` | string | Bidirectional |
| `note` | `note` | text | Bidirectional |
| `date_deadline` | `dueDate` | date | Bidirectional |
| `user_id` | `assignedTo` | [integer, string] | Bidirectional |
| `state` | `state` | string | Odoo → API |
| `res_model` | `relatedModel` | string | Odoo → API |
| `res_id` | `relatedId` | integer | Odoo → API |

**API Endpoints**: `GET/POST /api/odoo/activities`, `PATCH /api/odoo/activities/:id`, `POST /api/odoo/activities/:id/complete`

---

### 12. `helpdesk.ticket` — Helpdesk Tickets

| Attribute | Value |
|-----------|-------|
| **Purpose** | Manage support tickets and client inquiries |
| **Source of Truth** | Odoo |
| **Sync Direction** | Bidirectional (Odoo ↔ API) |
| **Dependencies** | `res.partner` (customer), `project.project` (related project) |
| **Business Rules** | Tickets can be created from client portal; linked to project for context |
| **Permissions** | Admin/PM: full CRUD; Client: create/read own tickets |
| **Events/Hooks** | `create` → webhook → notification; `write` (status change) → WebSocket push |
| **Conflict Resolution** | Odoo wins for all fields |
| **Retry Policy** | 3 retries, exponential backoff |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `name` | `subject` | string | Bidirectional |
| `partner_id` | `customer` | [integer, string] | Bidirectional |
| `user_id` | `assignedTo` | [integer, string] | Odoo → API |
| `project_id` | `projectId` | integer | Odoo → API |
| `stage_id` | `stage` | [integer, string] | Bidirectional |
| `priority` | `priority` | string | Bidirectional |
| `description` | `description` | text | Bidirectional |
| `create_date` | `createdAt` | datetime | Odoo → API |

**API Endpoints**: `GET /api/odoo/helpdesk/tickets`, `POST/PATCH /api/odoo/helpdesk/tickets/:id`

---

### 13. `account.analytic.line` — Timesheets

| Attribute | Value |
|-----------|-------|
| **Purpose** | Track employee time logged against projects and tasks |
| **Source of Truth** | Odoo |
| **Sync Direction** | Bidirectional (Odoo ↔ API) |
| **Dependencies** | `hr.employee` (user), `project.project`, `project.task` |
| **Business Rules** | Timesheet entries billable by default; linked to project budget |
| **Permissions** | Admin/PM: read all; Employee: create/read/update own; API: create/read |
| **Events/Hooks** | `create`/`write` → webhook → project budget update |
| **Conflict Resolution** | Last-write-wins |
| **Retry Policy** | 3 retries, exponential backoff |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `employee_id` | `employeeId` | integer | Bidirectional |
| `project_id` | `projectId` | integer | Bidirectional |
| `task_id` | `taskId` | integer | Bidirectional |
| `name` | `description` | string | Bidirectional |
| `unit_amount` | `hours` | float | Bidirectional |
| `date` | `date` | date | Bidirectional |
| `create_date` | `createdAt` | datetime | Odoo → API |

**API Endpoints**: `GET/POST /api/odoo/timesheets`

---

### 14. `documents.document` — Documents (Metadata)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Metadata and access control for files stored in MinIO |
| **Source of Truth** | Odoo (metadata), MinIO (file content) |
| **Sync Direction** | Odoo → API (read-primary); API → Odoo (create document with MinIO URL) |
| **Dependencies** | MinIO (file storage), `project.project` (linked project) |
| **Business Rules** | File upload creates MinIO object + Odoo metadata record; download uses MinIO signed URL (1h expiry) |
| **Permissions** | Admin/PM: read all; Client: read only if `x_hexa_client_accessible=true` |
| **Events/Hooks** | `create` → webhook → cache update |
| **Conflict Resolution** | N/A (split truth between Odoo + MinIO) |
| **Retry Policy** | 3 retries for Odoo metadata; file already in MinIO |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `name` | `fileName` | string | Bidirectional |
| `mimetype` | `mimeType` | string | Odoo → API |
| `file_size` | `fileSize` | integer | Odoo → API |
| `x_hexa_storage` | `storage` | string | Odoo → API |
| `x_hexa_storage_path` | `storagePath` | string | Odoo → API |
| `x_hexa_client_accessible` | `clientAccessible` | boolean | Bidirectional |
| `x_hexa_project_id` | `projectId` | integer | Bidirectional |
| `partner_id` | `owner` | [integer, string] | Bidirectional |
| `create_date` | `createdAt` | datetime | Odoo → API |

**API Endpoints**: `GET /api/odoo/documents/:projectId`, `GET /api/odoo/documents/download/:id`

---

### 15. `knowledge.article` — Knowledge Base Articles

| Attribute | Value |
|-----------|-------|
| **Purpose** | Store and serve knowledge base articles (help, guides, FAQs) |
| **Source of Truth** | Odoo |
| **Sync Direction** | Odoo → API (read-only) |
| **Dependencies** | None |
| **Business Rules** | Articles categorized for client portal help center |
| **Permissions** | Admin: full CRUD; Client: read published only; API: read-only |
| **Events/Hooks** | `create`/`write` → webhook → cache |
| **Conflict Resolution** | N/A (read-only) |
| **Retry Policy** | N/A (read-only) |

#### API Mapping

| Odoo Field | REST API Field | Type | Direction |
|------------|---------------|------|-----------|
| `id` | `id` | integer | Odoo → API |
| `title` | `title` | string | Odoo → API |
| `content` | `content` | text | Odoo → API |
| `category_id` | `category` | [integer, string] | Odoo → API |
| `published` | `published` | boolean | Odoo → API |
| `create_date` | `createdAt` | datetime | Odoo → API |

**API Endpoints**: `GET /api/odoo/knowledge/articles`

---

## Sync Health & Monitoring

| Metric | Description | Threshold | Alert |
|--------|-------------|-----------|-------|
| Sync lag | Time since last successful sync per model | > 15 min | Warning |
| Failure rate | Percentage of failed sync operations | > 5% | Warning |
| Queue depth | Number of pending items in Redis queue | > 100 | Warning |
| Circuit breaker state | Current state of sync circuit breaker | Open | Critical |

## Sync State Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/odoo/sync/state` | GET | Current sync status for all models |
| `/api/odoo/sync/trigger` | POST | Trigger full sync for all models |
| `/api/odoo/health` | GET | Odoo connectivity health check |

---

## Related Documents

- [ODOO_ARCHITECTURE.md](ODOO_ARCHITECTURE.md) — Architecture philosophy and BFF matrix
- [MODULES.md](MODULES.md) — Module inventory and webhook contract
- [data-models.md](data-models.md) — Custom field definitions
- [CRM.md](CRM.md) — CRM data flow and pipeline stages
- [PROJECTS.md](PROJECTS.md) — Project lifecycle and sync
- [SALES.md](SALES.md) — Sales order and invoice flows
- [DOCUMENTS.md](DOCUMENTS.md) — Document management architecture
- [AUTOMATIONS.md](AUTOMATIONS.md) — Automated actions and server actions
- [crm-integration.md](crm-integration.md) — CRM integration details
- [project-integration.md](project-integration.md) — Project integration details
- [document-integration.md](document-integration.md) — Document integration details
