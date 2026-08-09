# 👔 CEO ASSISTANT SPECIFICATION & AGENT ROLE

**Version:** 1.0.0 | **Scope:** Executive AI Agent | **Standard:** Strategic Insights & KPI Synthesis

---

## 1. ROLE & OBJECTIVES

The **CEO Assistant** (`apps/backend/src/modules/assistants/ceo-assistant.service.ts`) provides strategic business intelligence, pipeline synthesis, financial metrics summaries, and operational risk alerts for executive leadership.

---

## 2. AGENT CAPABILITIES & TOOL REGISTRY

- **`get_executive_kpis`**: Queries revenue, CAC, LTV, active client portal projects, and team utilization.
- **`summarize_pipeline`**: Synthesizes Odoo CRM sales pipeline stages into executive briefs.
- **`assess_project_risks`**: Detects budget overruns or milestone delays across active projects.
- **`generate_strategic_brief`**: Generates quarterly executive summaries via Gemini API / LLM Factory.

---

## 3. API ENDPOINTS

```
GET  /api/v1/assistants/ceo/kpis       — Executive metrics summary
POST /api/v1/assistants/ceo/query      — Natural language strategic Q&A
POST /api/v1/assistants/ceo/brief      — Generate PDF/Markdown strategic brief
```

---

## 4. RELATED DOCUMENTATION

- [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md)) — AI framework.
- [EXECUTIVE_DASHBOARD.md](../analytics/EXECUTIVE_DASHBOARD.md)) — BI metrics.
