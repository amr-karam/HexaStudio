# Odoo Integration Guide

This directory documents the Odoo ERP integration for the HEXA Vision platform.

## Overview

Odoo serves as the **business operations backbone** for HEXA Studio, managing CRM, Sales, Projects, Documents, and Invoicing.

## Contents

| File | Description |
|------|-------------|
| `architecture.md` | Odoo system architecture |
| `ODOO_ARCHITECTURE.md` | Integration philosophy & quality gate |
| `deployment.md` | Docker deployment (Odoo 18 + odoo_db) |
| `MODULES.md` | Standard + custom `hexa_studio` modules |
| `CRM.md` | CRM configuration & data flow |
| `SALES.md` | Sales orders & invoices |
| `PROJECTS.md` | Project lifecycle & milestones |
| `DOCUMENTS.md` | Document management (MinIO bridge) |
| `EMAIL.md` | Email integration |
| `USERS.md` | Roles & user sync |
| `HEXA_CMS.md` | Odoo ↔ Strapi relationship |
| `AUTOMATIONS.md` | Automated actions & cron |
| `data-models.md` | Custom data models |
| `troubleshooting.md` | Common issues and solutions |

## Implementation Status (2026-07-16)

| Layer | Status | Location |
|-------|--------|----------|
| Odoo 18 container + DB | ✅ `docker-compose.yml` (`odoo`, `odoo_db`) | `docker/odoo/odoo.conf` |
| Custom module `hexa_studio` | ✅ fields, webhooks, automations | `odoo/custom/hexa_studio/` |
| XML-RPC connector + circuit breaker | ✅ | `apps/backend/src/modules/odoo/odoo.service.ts` |
| Sync service (webhook + 10-min pull) | ✅ | `apps/backend/src/modules/odoo/odoo-sync.service.ts` |
| REST API (CRM/sales/projects/invoices) | ✅ | `apps/backend/src/modules/odoo/odoo-api.{controller,service}.ts` |
| Consumers (accounting/contact/projects/requests/portal) | ✅ | `apps/backend/src/modules/*` |
| Shared types | ✅ | `packages/types/odoo.ts` |
| Frontend dashboard | ✅ | `apps/frontend/src/app/dashboard/odoo/page.tsx` |

## Integration Architecture

```
NestJS BFF Layer
    │
    ├── XML-RPC (internal network)
    │       └── Odoo Server
    │              ├── CRM Module
    │              ├── Sales Module
    │              ├── Project Module
    │              ├── Documents Module
    │              └── Custom HEXA Modules
    │
    ├── Webhook Callbacks
    │       └── Odoo → NestJS
    │
    └── Media Bridge
            └── Odoo ↔ MinIO
```

## Key Principles

1. **Odoo is the source of truth** for all business data
2. **NestJS is the bridge** — never expose Odoo directly
3. **Data sync is eventual** — target latency < 30s
4. **Odoo models mirror application models** — via shared types

## Module Dependencies

| Odoo Module | HEXA Feature | Priority |
|-------------|-------------|----------|
| CRM | Lead capture, pipeline | Critical |
| Sales | Proposals, invoices | Critical |
| Project | Project lifecycle | Critical |
| Documents | File management | High |
| Contacts | Client management | High |
| HR | Team management | Medium |
