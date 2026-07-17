# Projects

**Last Updated:** 2026-07-16

---

## Configuration

The `hexa_studio` module extends `project.project` and `project.milestone`:

| Field | Model | Purpose |
|-------|-------|---------|
| `x_slug` | project.project | links to website portfolio slug |
| `x_hexa_type` | project.project | residential / commercial / interior / urban |
| `x_hexa_status` | project.project | inquiry → completed → archived |
| `x_hexa_client_portal_active` | project.project | visibility in client portal |
| `x_hexa_budget_amount` | project.project | contracted budget |
| `x_hexa_client_viewable` | project.milestone | milestone visible to client |
| `x_hexa_description` | project.milestone | milestone detail |
| `x_hexa_order` | project.milestone | display order |

## Sync

```
Odoo project write → automated action → POST /api/odoo/webhook
    → OdooSyncService.handleWebhook('project.project')
    → Redis cache + EventBus('odoo:project')
    → (future) Strapi portfolio status update + ISR revalidation
```

Fallback: `OdooSyncService.pullAll()` runs every 10 minutes and on the
`ir_cron_hexa_sync` Odoo cron (15 min).

## Frontend

- Projects grid on `/dashboard/odoo`.
- Client portal reads `project.task` + `account.move` for timeline & billing.
