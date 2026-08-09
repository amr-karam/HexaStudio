# 📈 SALES ASSISTANT SPECIFICATION & AUTOMATION ROLE

**Version:** 1.0.0 | **Scope:** Sales Intelligence Agent | **Standard:** Lead Qualification & Proposal Automation

---

## 1. ROLE & OBJECTIVES

The **Sales Assistant** (`sales-assistant.service.ts`) automates inbound lead qualification, generates tailored architectural proposal drafts, calculates dynamic regional pricing, and interfaces with Odoo CRM.

---

## 2. AGENT CAPABILITIES & TOOL REGISTRY

- **`qualify_lead`**: Evaluates budget, timeline, project scope, and client domain against ideal client profile (ICP).
- **`generate_proposal_draft`**: Creates customized architectural visualization proposals using client inquiry details.
- **`calculate_regional_price`**: Invokes `CurrencyModule` to apply regional tax compliance (VAT/GST) and multipliers.
- **`create_odoo_crm_lead`**: Syncs qualified leads directly to Odoo `crm.lead`.

---

## 3. API ENDPOINTS

```
POST /api/v1/assistants/sales/qualify     — Qualify incoming lead
POST /api/v1/assistants/sales/proposal    — Draft proposal content
```

---

## 4. RELATED DOCUMENTATION

- [CRM.md](.docs/odoo/CRM.md) — Odoo CRM integration.
- [AI_ARCHITECTURE.md](.docs/ai/AI_ARCHITECTURE.md) — AI framework.
