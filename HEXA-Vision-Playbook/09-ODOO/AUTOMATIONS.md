# ⚡ ODOO ERP AUTOMATED ACTIONS & SERVER ACTION SPECIFICATIONS

**Version:** 1.0.0 | **Scope:** Odoo ERP Automation | **Standard:** Event-Driven ERP Actions

---

## 1. OVERVIEW & AUTOMATIONS

Defines custom Odoo Automated Actions (`base.automation`) that trigger webhooks to the NestJS BFF during business lifecycle events.

---

## 2. CORE AUTOMATED ACTIONS

1. **Lead Stage Change**: When `crm.lead` stage changes to *Won* $\rightarrow$ Executes Server Action to auto-create `project.project` and notify NestJS `/api/v1/webhooks/odoo`.
2. **Milestone Completion**: When `project.task` completes $\rightarrow$ Recalculates parent project progress % and triggers WebSocket push to Client Portal.
3. **Invoice Payment**: When `account.move` status changes to *Paid* $\rightarrow$ Triggers receipt notification email and updates client access permissions.

---

## 3. RELATED DOCUMENTATION

- [ODOO_ARCHITECTURE.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/09-ODOO/ODOO_ARCHITECTURE.md) — Odoo architecture.
- [CRM.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/09-ODOO/CRM.md) — CRM integration.
