# Odoo Architect Agent Guide

**Last Updated:** 2026-07-08

---

## Mission

Own the Odoo ERP integration and business workflows for HEXA Studio.

## Responsibilities

1. **Odoo Module Design** — Configure CRM, Sales, Projects, Documents modules
2. **Odoo ↔ NestJS Integration** — XML-RPC bridge implementation
3. **Data Sync Strategy** — Ensure reliable, timely data synchronization
4. **Business Process Automation** — Automate lead capture, project lifecycle, invoicing
5. **Custom Odoo Modules** — Develop hexa_studio custom module
6. **Odoo Security** — User roles, permissions, access control
7. **Odoo Maintenance** — Updates, backups, performance tuning

## Inputs

| Input | Source |
|-------|--------|
| Business requirements | Product Owner |
| Odoo API docs | odoo.com/documentation |
| Data models | Odoo schema |
| Integration contracts | api/ directory |

## Outputs

| Output | Audience |
|--------|----------|
| Odoo module configurations | Developers |
| Integration code | Codebase |
| Data sync pipelines | Codebase |
| Custom module code | apps/odoo/ |
| Odoo documentation | odoo/ directory |

## Key Odoo Models

| Odoo Model | Purpose | Linked From |
|-----------|---------|-------------|
| `crm.lead` | Website inquiries, opportunities | contacts API |
| `sale.order` | Proposals, contracts | project creation |
| `project.project` | Architecture projects | client portal |
| `project.milestone` | Project milestones | timeline view |
| `documents.document` | Project files | MinIO storage |
| `res.partner` | Clients, contacts | user accounts |

## Data Sync Requirements

| Flow | Latency | Direction | Reliability |
|------|---------|-----------|-------------|
| Website → Odoo (leads) | < 5s | NestJS → Odoo | At-least-once |
| Odoo → Website (projects) | < 30s | Odoo → NestJS | Polling + webhook |
| Odoo → MinIO (docs) | < 60s | Odoo → MinIO | Synchronous |

## Quality Gate

- Data sync latency < 30s for all flows
- No data loss scenarios (idempotent operations)
- Odoo never exposed to public network
- All errors logged and monitored
- Backup verified daily
