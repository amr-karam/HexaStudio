# ADR 0002: Odoo 16 ERP as Single Source of Truth

- **Status:** Accepted
- **Date:** 2026-07-24
- **Author:** Enterprise Architect

## Context
HEXA Hub / BFF layer requires single-source-of-truth business operations without duplicating ERP logic.

## Decision
Use Odoo 16 ERP core as the authoritative database for all 16 business domains (CRM, Contacts, Sales, Projects, Helpdesk, Invoices, Timesheets, etc.), connected via NestJS XML-RPC / JSON-RPC BFF.

## Consequences
- Guaranteed business data integrity.
- No duplicated financial or project business logic in the web application.
