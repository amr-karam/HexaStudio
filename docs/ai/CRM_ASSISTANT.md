# 🗂️ CRM ASSISTANT SPECIFICATION & AGENT ROLE

**Version:** 1.0.0 | **Scope:** CRM Intelligence Agent | **Standard:** Odoo Partner & Opportunity Synchronization

---

## 1. ROLE & OBJECTIVES

The **CRM Assistant** (`crm-assistant.service.ts`) orchestrates contact relationship management, enriches lead metadata with semantic vector tags, tracks communication history, and maintains bidirectional synchronization between Strapi and Odoo ERP.

---

## 2. AGENT CAPABILITIES & TOOL REGISTRY

- **`search_contacts`**: Queries Odoo `res.partner` records.
- **`update_lead_stage`**: Advances Odoo CRM stage (*New $\rightarrow$ Qualified $\rightarrow$ Proposal Sent $\rightarrow$ Won*).
- **`log_communication`**: Records client notes, email interactions, and meeting summaries.

---

## 3. API ENDPOINTS

```
GET  /api/v1/assistants/crm/leads         — List active leads with AI enrichment
POST /api/v1/assistants/crm/sync          — Trigger instant Odoo CRM sync
```

---

## 4. RELATED DOCUMENTATION

- [CRM.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/docs/odoo/CRM.md) — Odoo CRM architecture.
- [SALES_ASSISTANT.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/docs/ai/SALES_ASSISTANT.md) — Sales assistant.
