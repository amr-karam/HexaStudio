# BI & Analytics Strategy

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Overview

The Analytics layer provides data-driven insights for three primary personas: the CEO (Executive), the Project Manager (Operational), and the Marketing Lead (Growth).

## Data Pipeline

```
[Event Sources]
    │
    ├── Frontend: Google Analytics 4, Sentry, Custom Events
    ├── Backend: NestJS logs, API usage metrics
    ├── Odoo: Lead status, Sales figures, Project hours
    │
    ▼
[Data Aggregator] (PostgreSQL / BigQuery)
    │
    ├── Transformation: SQL views, dbt (data build tool)
    ├── Validation: Data quality checks
    │
    ▼
[Visualization]
    ├── Grafana: Real-time system & business health
    ├── Executive Dashboard: High-level KPIs
    └── BI Reports: Monthly/Quarterly PDF exports
```

## KPI Framework

### 1. Executive KPIs (CEO)
- **LTV (Life Time Value):** Average revenue per client.
- **CAC (Customer Acquisition Cost):** Cost to acquire one new client.
- **Pipeline Value:** Total potential revenue of all open opportunities.
- **Net Profit Margin:** Revenue minus all operational costs.

### 2. Operational KPIs (Project Manager)
- **Utilization Rate:** Percentage of billable hours vs. total hours.
- **Milestone Variance:** Difference between planned and actual completion dates.
- **Resource Bottlenecks:** Most overloaded team members.
- **Project Profitability:** Actual hours spent vs. quoted hours.

### 3. Growth KPIs (Marketing)
- **Conversion Rate:** Visitor → Lead → Client percentage.
- **Acquisition Channel:** Which source (SEO, Social, Referral) brings the best clients.
- **User Engagement:** Avg time spent in 3D scenes.
- **Bounce Rate:** percentage of users leaving the landing page immediately.

## Dashboard Specifications

### Executive Dashboard (Real-time)
- **Top Row:** Revenue (Month), Open Leads, Active Projects, Net Profit.
- **Middle Row:** Revenue growth chart, Lead conversion funnel.
- **Bottom Row:** Top 5 most profitable projects, Resource utilization heatmap.

### Operational Dashboard (Daily)
- **Active Tasks:** List of overdue tasks and milestones.
- **Team Load:** Bar chart of hours assigned per person.
- **Pipeline Status:** Number of leads in each CRM stage.

## Data Governance

- **Privacy:** PII is hashed or removed before entering the BI layer.
- **Accuracy:** Monthly reconciliation between Odoo and the analytics database.
- **Access:** RBAC controls who can see which dashboard.
