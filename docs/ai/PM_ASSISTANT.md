# 📅 PROJECT MANAGEMENT (PM) ASSISTANT SPECIFICATION

**Version:** 1.0.0 | **Scope:** Project Orchestration Agent | **Standard:** Milestone Tracking & Bottleneck Prediction

---

## 1. ROLE & OBJECTIVES

The **PM Assistant** (`pm-assistant.service.ts`) monitors project delivery timelines, tracks client milestone approvals in the Client Portal, predicts resource bottlenecks, and generates weekly project status reports.

---

## 2. AGENT CAPABILITIES & TOOL REGISTRY

- **`get_project_progress`**: Fetches milestone stage and percent completion from Odoo `project.project`.
- **`detect_delays`**: Identifies overdue client approval steps or rendering bottlenecks.
- **`generate_status_update`**: Drafts client-facing project progress summaries.

---

## 3. API ENDPOINTS

```
GET  /api/v1/assistants/pm/projects/:id/status — AI milestone analysis
POST /api/v1/assistants/pm/report              — Generate project update report
```

---

## 4. RELATED DOCUMENTATION

- [PROJECTS.md](.docs/odoo/PROJECTS.md) — Odoo project integration.
- [CLIENT_PORTAL.md](.docs/client-portal/CLIENT_PORTAL.md) — Client portal.
