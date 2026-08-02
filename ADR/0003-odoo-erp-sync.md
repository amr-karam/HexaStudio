# ADR 0003: Odoo 17 JSON-RPC BFF Integration Pattern

- **Status:** Accepted
- **Date:** 2026-07-20
- **Deciders:** Enterprise Architect, Lead Backend Engineer

---

## 1. CONTEXT
HEXA STUDIO manages client contracts, quotations, invoices (`account.move`), and tasks (`project.task`) within Odoo 17. We needed a secure, resilient integration pattern to present Odoo data to the Client Portal without exposing raw ERP endpoints or credentials.

---

## 2. DECISION
We implement an **Odoo-First BFF Pattern** inside `apps/backend/src/modules/odoo/`. The NestJS backend consumes Odoo 17 via authenticated JSON-RPC requests (`OdooApiService`), handles partner resolution, and exposes client-scoped endpoints (`/api/v1/portal/*`). Incoming contact leads fall back to Redis queueing (`odoo:pending-leads`) if Odoo is temporarily offline.

---

## 3. CONSEQUENCES
- **Positive:** Client data remains protected behind JWT authentication; zero data loss during ERP maintenance; multi-currency calculation isolated on BFF.
- **Trade-offs:** Requires Odoo JSON-RPC API credentials (`ODOO_HOST`, `ODOO_USER`, `ODOO_PASSWORD`).
