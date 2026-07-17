# CRM

**Last Updated:** 2026-07-16

---

## Configuration

CRM pipeline stages are standard Odoo stages on `crm.stage`. The `hexa_studio`
module adds custom fields on `crm.lead`:

| Field | Type | Purpose |
|-------|------|---------|
| `x_hexa_source` | selection | website / referral / direct |
| `x_hexa_service` | selection | residential / commercial / interior |
| `x_hexa_budget` | selection | budget band |
| `x_hexa_referral_code` | char | referral tracking |
| `x_hexa_website_contact_id` | char | originating contact-form ID |

## Data Flow

### Contact Form → Odoo Lead (Write Path)
```
Website Contact Form → NestJS POST /v1/contacts
    → ContactService.sendMessage()
    → OdooService.create('crm.lead', {full payload with HEXA custom fields})
    → On failure: Redis queue (odoo:pending-leads) → async reconcile via flushPendingLeads()
    → Odoo automated action → POST /api/odoo/webhook
    → BFF cache + EventBus('odoo:lead')
```

### Admin CRUD (Dashboard)
```
Admin Dashboard (/dashboard/odoo) → React Query mutations
    → POST/PATCH/DELETE /api/odoo/crm/leads
    → OdooApiService → OdooService.execute('crm.lead', ...)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/odoo/crm/pipeline` | Pipeline summary by stage (lead count + weighted revenue) |
| GET | `/api/odoo/crm/leads?limit=&offset=` | List CRM leads |
| GET | `/api/odoo/crm/leads/:id` | Single lead detail with all HEXA fields |
| POST | `/api/odoo/crm/leads` | Create lead (all fields + HEXA customs) |
| PATCH | `/api/odoo/crm/leads/:id` | Update lead (stage, priority, notes) |
| DELETE | `/api/odoo/crm/leads/:id` | Archive lead (sets active=false) |

## Frontend

- Admin dashboard: `/dashboard/odoo` → CRM pipeline + leads with create/edit/archive.
- Contact form: `/contact` → Phone, service type, budget range fields → full lead payload.
- Redis fallback: When Odoo is down, leads are queued and auto-reconciled every 10 minutes.
