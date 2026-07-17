# Sales

**Last Updated:** 2026-07-16

---

## Scope

The Sales module covers quotations, sales orders, and customer invoices.

| Model | Endpoint |
|-------|----------|
| `sale.order` | `GET /api/odoo/sales/orders` |
| `account.move` (out_invoice) | `GET /api/odoo/invoices` |

## Project → Invoice Link

When a deal is won, the `project.project` record carries `x_hexa_budget_amount`
and `x_hexa_type`. Sales orders and invoices are linked to the customer via
`partner_id`. The client portal reads `account.move` rows to display invoice
status (`paid` / `not_paid` / `partial`).

## Frontend

- Sales orders + invoices tables on `/dashboard/odoo`.
- Invoice status flows through to the client portal billing view.
