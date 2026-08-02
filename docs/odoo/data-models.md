# Odoo Data Models

**Last Updated:** 2026-07-08

---

## Custom Fields Added by `hexa_studio` Module

### res.partner (Contacts)

| Field | Type | Purpose |
|-------|------|---------|
| `x_hexa_client` | boolean | Is this a HEXA Studio client? |
| `x_hexa_source` | selection | Lead source (website, referral, direct) |
| `x_hexa_website_user_id` | many2one | Link to application user |
| `x_hexa_project_ids` | one2many | Projects this client has |

### crm.lead (Opportunities)

| Field | Type | Purpose |
|-------|------|---------|
| `x_hexa_source` | selection | Lead source |
| `x_hexa_service` | selection | Service type requested |
| `x_hexa_budget` | selection | Budget range |
| `x_hexa_referral_code` | char | Referral tracking |
| `x_hexa_website_contact_id` | char | Original contact form ID |

### project.project

| Field | Type | Purpose |
|-------|------|---------|
| `x_hexa_type` | selection | Project type (residential, commercial, interior) |
| `x_hexa_status` | selection | Project status (active, on_hold, completed, archived) |
| `x_hexa_client_portal_active` | boolean | Is project visible in client portal? |
| `x_hexa_budget_amount` | float | Project budget |
| `x_hexa_milestone_ids` | one2many | Project milestones |

### project.milestone

| Field | Type | Purpose |
|-------|------|---------|
| `name` | char | Milestone name |
| `date` | date | Milestone due date |
| `completed` | boolean | Is milestone complete? |
| `completed_date` | date | When milestone was completed |
| `x_hexa_client_viewable` | boolean | Visible in client portal |
| `x_hexa_description` | text | Milestone description |
| `x_hexa_order` | integer | Display order |

## Odoo → Application Type Mapping

```typescript
// packages/types/odoo.ts

export interface OdooLead {
  id: number;
  name: string;
  contact_name: string;
  email_from: string;
  phone?: string;
  description?: string;
  stage_id: [number, string]; // [id, name]
  x_hexa_source?: string;
  x_hexa_service?: string;
  x_hexa_budget?: string;
  create_date: string;
}

export interface OdooProject {
  id: number;
  name: string;
  partner_id: [number, string]; // [id, name]
  x_hexa_type?: string;
  x_hexa_status?: string;
  x_hexa_budget_amount?: number;
  x_hexa_milestone_ids?: number[];
  date_start?: string;
  date?: string;
}

export interface OdooMilestone {
  id: number;
  name: string;
  date: string;
  completed: boolean;
  completed_date?: string;
  x_hexa_client_viewable: boolean;
  x_hexa_description?: string;
  x_hexa_order: number;
}

export interface OdooUser {
  id: number;
  name: string;
  login: string;
  email: string;
  active: boolean;
}
```

## Migration Strategy

| Type | Responsibility | Frequency |
|------|---------------|-----------|
| Schema changes | Odoo admin UI + custom module updates | As needed |
| Data sync | NestJS polling + webhooks | Continuous |
| Full sync | Manual trigger via admin panel | On demand |
| Backup restore | `pg_restore` from WAL archive | Disaster recovery |

## Related Documents

- `odoo/architecture.md` — Odoo deployment and module configuration
- `odoo/crm-integration.md` — CRM data flow details
- `odoo/project-integration.md` — Project lifecycle details
- `odoo/document-integration.md` — Document management details
