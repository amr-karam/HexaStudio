# Users

**Last Updated:** 2026-07-16

---

## Roles

| Role | Odoo Group | Access |
|------|-----------|--------|
| Admin | Settings / Administration | full |
| Project Manager | Project / Manager | projects, tasks, invoices |
| Sales | Sales / User | CRM, sales orders |
| Client | portal (no internal Odoo login) | client portal only |

## Synchronization

`res.partner.x_hexa_website_user_id` links an Odoo contact to the application
user. Clients authenticate through the NestJS `AuthModule` (JWT), not Odoo,
and are scoped to `portal` data via `x_hexa_client_portal_active` projects.

## User Type Mapping

```typescript
// packages/types/odoo.ts
export interface OdooUser {
  id: number;
  name: string;
  login: string;
  email: string;
  active: boolean;
}
```
