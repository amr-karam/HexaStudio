# 📈 BUSINESS INTELLIGENCE (BI) ARCHITECTURE

**Version:** 1.0.0 | **Scope:** Data Warehouse & Analytics Pipeline | **Standard:** Enterprise BI Stack

---

## 1. OVERVIEW & PIPELINE

The Business Intelligence pipeline extracts transactional data from PostgreSQL, Redis, Strapi, and Odoo ERP into an analytical data store for continuous metric reporting and dashboard visualization.

---

## 2. BI DATA PIPELINE FLOW

```
  Data Sources (Postgres, Odoo, Analytics Events) ──► Extract & Load ──► Data Warehouse (BigQuery) ──► Grafana / BI
```

---

## 3. RELATED DOCUMENTATION

- [EXECUTIVE_DASHBOARD.md](EXECUTIVE_DASHBOARD.md) — Executive reporting.
- [EVENTS.md](EVENTS.md) — Event schema.
