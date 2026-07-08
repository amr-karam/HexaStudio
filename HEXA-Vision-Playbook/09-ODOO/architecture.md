# Odoo Architecture

**Last Updated:** 2026-07-08

---

## Overview

Odoo 17 Community Edition serves as the **business operations backbone** for HEXA Studio. It manages CRM, Sales, Projects, Documents, and Invoicing.

## Deployment

```
┌────────────────────────────────────────────┐
│           Docker Network (Internal)         │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │         Odoo Server                │    │
│  │  Port: 8069 (internal only)       │    │
│  │  Modules: CRM, Sales, Project,    │    │
│  │           Documents, Contacts     │    │
│  │  Database: hexa_odoo              │    │
│  └────────────────────────────────────┘    │
│                    │                        │
│  ┌─────────────────▼──────────────────┐    │
│  │      PostgreSQL 16 (hexa_odoo)     │    │
│  │      Port: 5432 (internal only)    │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │         MinIO (Documents)          │    │
│  │  Port: 9000 (internal only)       │    │
│  └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

## Integration with NestJS

```
[NestJS BFF]
    │
    ├── XML-RPC (port 8069, internal network)
    │   └── odoo-rpc library
    │
    ├── JSON-RPC (port 8069, internal network)
    │
    └── Odoo Webhook Callbacks
        └── POST /webhooks/odoo (NestJS endpoint)
```

## Module Configuration

### Installed Modules

| Module | Purpose | Dependencies |
|--------|---------|--------------|
| **CRM** | Lead and opportunity management | Sales, Contacts |
| **Sales** | Quotations, orders, invoicing | CRM, Contacts |
| **Project** | Project lifecycle and tasks | Sales |
| **Documents** | File management (S3 integration) | — |
| **Contacts** | Contact and company management | — |
| **Invoicing** | Invoicing and payments | Sales, Account |
| **HEXA Custom** | Custom fields and workflows | All above |

## Custom HEXA Module

A custom Odoo module (`hexa_studio`) adds:

- **Project type** field (residential, commercial, interior)
- **Project status** tracking (inquiry → delivered)
- **Custom stages** for sales pipeline
- **Odoo ↔ MinIO** document bridge
- **Webhook triggers** for NestJS integration
- **Custom reports** (proposal, contract, invoice templates)

## Database Schema (Key Models)

```
res.partner (Contacts)
├── is_hexa_client: boolean
├── hexa_project_ids: one2many → project.project

crm.lead (Opportunities)
├── hexa_source: selection (website, referral, direct)
├── hexa_service: selection (residential, commercial, interior)
├── hexa_budget: selection (under 50k, 50k-100k, etc.)

project.project
├── hexa_type: selection (residential, commercial)
├── hexa_status: selection (inquiry, consultation, proposal, etc.)
├── hexa_milestone_ids: one2many → project.milestone

project.milestone
├── name: char
├── date: date
├── completed: boolean
├── hexa_client_viewable: boolean
```

## Data Sync Pipeline

```
Website Contact Form
    │
    ▼
NestJS: validate, transform
    │
    ├── POST /api/contacts
    └── XML-RPC → Odoo: create crm.lead
            │
            ▼
    Odoo: lead created
    │
    ├── Sales team notified
    ├── Lead appears in pipeline
    └── Webhook → NestJS (confirmation)
```
