# Odoo Integration Guide

This directory documents the Odoo ERP integration for the HEXA Vision platform.

## Overview

Odoo serves as the **business operations backbone** for HEXA Studio, managing CRM, Sales, Projects, Documents, and Invoicing.

## Contents

| File | Description |
|------|-------------|
| `architecture.md` | Odoo system architecture |
| `module-configuration.md` | Odoo module setup |
| `custom-modules.md` | Custom HEXA Odoo modules |
| `crm-integration.md` | CRM data flow |
| `project-integration.md` | Project lifecycle |
| `document-integration.md` | Document management |
| `user-sync.md` | User synchronization |
| `data-models.md` | Custom data models |
| `api-endpoints.md` | Odoo API reference |
| `troubleshooting.md` | Common issues and solutions |

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
