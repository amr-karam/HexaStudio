# Odoo Modules

**Last Updated:** 2026-07-24

---

## Installed Standard Modules

| Module | Purpose | Depends On |
|--------|---------|------------|
| **CRM** (`crm`) | Lead and opportunity pipeline | Sales, Contacts |
| **Sales** (`sale`) | Quotations, sales orders, invoicing | CRM, Contacts |
| **Project** (`project`) | Project lifecycle, tasks, milestones | Sales |
| **Invoicing** (`account`) | Customer invoices & payments | Sales, Account |
| **Documents** (`documents`) | File management | — |
| **Contacts** (`contacts`) | Contact & company management | — |
| **Discuss** (`mail`) | Internal messaging, activities | — |

## Custom Module: `hexa_studio`

Location: `odoo/custom/hexa_studio/`

Adds the HEXA-specific fields, webhook dispatcher, and automated actions that bridge Odoo 18 to the NestJS BFF.

| File | Responsibility |
|------|----------------|
| `__manifest__.py` | Module metadata, dependencies, data files |
| `models/res_partner.py` | `x_hexa_*` client fields on `res.partner` |
| `models/crm_lead.py` | `x_hexa_source`, `x_hexa_service`, `x_hexa_budget`, referral fields |
| `models/project_project.py` | `x_slug`, `x_hexa_type`, `x_hexa_status`, `x_hexa_client_portal_active`, budget |
| `models/project_milestone.py` | `x_hexa_client_viewable`, description, display order |
| `models/hexa_webhook.py` | Signed webhook dispatcher (`hexa.webhook.dispatch`) |
| `models/hexa_webhook_log.py` | Delivery audit log (`hexa.webhook.log`) |
| `data/automated_actions.xml` | Triggers dispatch on lead/project/invoice create+write |
| `data/ir_cron.xml` | Scheduled 15-min sync ping to the BFF |
| `data/webhook_config.xml` | Default BFF webhook endpoint + secret |

## Webhook Contract

Odoo posts a signed JSON payload to `POST /api/odoo/webhook`:

```json
{
  "model": "project.project",
  "id": 42,
  "action": "update",
  "data": { "...": "read values" }
}
```

Header: `X-Odoo-Signature: <hmac-sha256(secret, body)>`. The BFF verifies the
signature, writes to Redis cache, and emits a domain event on the EventBus.

## BFF API Endpoints (NestJS)

### CRM (Leads)
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/odoo/crm/pipeline` | JWT |
| GET | `/api/odoo/crm/leads` | JWT |
| GET | `/api/odoo/crm/leads/:id` | JWT |
| POST | `/api/odoo/crm/leads` | JWT |
| PATCH | `/api/odoo/crm/leads/:id` | JWT |
| DELETE | `/api/odoo/crm/leads/:id` | JWT |

### Contacts / Partners
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/odoo/contacts` | JWT |
| GET | `/api/odoo/contacts/:id` | JWT |
| POST | `/api/odoo/contacts` | JWT |
| PATCH | `/api/odoo/contacts/:id` | JWT |

### Projects & Milestones
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/odoo/projects` | JWT |
| GET | `/api/odoo/projects/:id` | JWT |
| PATCH | `/api/odoo/projects/:id` | JWT |
| GET | `/api/odoo/projects/:id/milestones` | JWT |
| POST | `/api/odoo/projects/:id/milestones` | JWT |
| PATCH | `/api/odoo/milestones/:id` | JWT |

### Documents (MinIO Bridge)
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/odoo/documents/:projectId` | JWT (multipart) |
| GET | `/api/odoo/documents/:projectId` | JWT |
| GET | `/api/odoo/documents/download/:id` | JWT |

### Sales & Invoices
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/odoo/sales/orders` | JWT |
| GET | `/api/odoo/invoices` | JWT |

### Tasks
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/odoo/tasks` | JWT |
| GET | `/api/odoo/tasks/:id` | JWT |
| POST | `/api/odoo/tasks` | JWT |
| PATCH | `/api/odoo/tasks/:id` | JWT |

### Quotations
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/odoo/quotations` | JWT |
| GET | `/api/odoo/quotations/:id` | JWT |
| GET | `/api/odoo/quotations/:id/lines` | JWT |
| POST | `/api/odoo/quotations` | JWT |
| PATCH | `/api/odoo/quotations/:id` | JWT |

### Activities (mail.activity)
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/odoo/activities` | JWT |
| POST | `/api/odoo/activities` | JWT |
| PATCH | `/api/odoo/activities/:id` | JWT |
| POST | `/api/odoo/activities/:id/complete` | JWT |

### Company Settings
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/odoo/company/settings` | JWT |

### Sync & Health
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/odoo/sync/state` | JWT |
| POST | `/api/odoo/sync/trigger` | JWT |
| GET | `/api/odoo/health` | JWT |

All `/api/odoo/*` endpoints are restricted to the `admin` role. Client access
uses the partner-scoped `/portal/odoo/*` endpoints instead.

### Client Portal (Partner-scoped)
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/portal/odoo/projects` | JWT (filtered by partner_id) |
| GET | `/portal/odoo/projects/:id/milestones` | JWT (client-viewable only) |
| GET | `/portal/odoo/invoices` | JWT (filtered by partner_id) |
