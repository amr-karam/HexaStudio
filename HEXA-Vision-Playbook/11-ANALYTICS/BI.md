# 📊 BI & ANALYTICS: THE INSIGHT ENGINE

**Version:** 1.0 | **Scope:** Business $\rightarrow$ Executive | **Standard:** Real-Time / Actionable

## 1. THE ANALYTICS PHILOSOPHY
We do not track "metrics"; we track **"Behaviors."** Data is useless unless it leads to a decision. Every dashboard must answer a specific business question.

---

## 2. THE DATA PIPELINE

### I. Event Collection (The Source)
- **Frontend Events:** Track user interactions in the 3D scene (e.g., "Project_Zoomed", "CTA_Clicked").
- **Backend Events:** Track API performance and error rates (Sentry/Loki).
- **Business Events:** Track Odoo status changes (e.g., "Lead_Converted", "Invoice_Paid").

### II. Processing Layer
- **Stream Processing:** Real-time aggregation of events via a message queue.
- **Data Warehouse:** Long-term storage in PostgreSQL for trend analysis.

### III. Visualization Layer (The Window)
- **Executive Dashboard:** High-level KPIs for the CEO.
- **Project Dashboard:** Granular metrics for the PMs.
- **Technical Dashboard:** Health metrics for the DevOps agent.

---

## 3. KEY PERFORMANCE INDICATORS (KPIs)

### I. The "Luxury" Metrics (UX)
- **Engagement Rate:** Time spent in the 3D experience.
- **Interaction Depth:** Number of unique 3D elements interacted with.
- **Conversion Velocity:** Time from first visit to "Contact" form submission.

### II. The "Engine" Metrics (Technical)
- **LCP (Largest Contentful Paint):** Target < 1.2s.
- **FPS Stability:** % of time the scene stays at 60 FPS.
- **Error Rate:** % of API requests resulting in 5xx errors.

### III. The "Growth" Metrics (Business)
- **CAC (Customer Acquisition Cost):** Cost per qualified lead.
- **LTV (Lifetime Value):** Predicted value of a client.
- **Pipeline Velocity:** Average time a lead stays in each Odoo stage.

---

## 4. THE "INSIGHT $\rightarrow$ ACTION" LOOP
Data is only "Done" when it follows this loop:
`Data Point` $\rightarrow$ `Pattern Identified` $\rightarrow$ `Hypothesis Formed` $\rightarrow$ `Action Taken` $\rightarrow$ `Result Measured`.

---

## 5. QUALITY GATE: ANALYTICS AUDIT
A dashboard is "BI-Done" only when:
- [ ] It answers a specific, pre-defined business question.
- [ ] The data is real-time (or updated within the required frequency).
- [ ] The visualization is intuitive (no "chart junk").
- [ ] The insight is translated into a task in `OPEN_TASKS.md`.

*“In God we trust; all others must bring data.”*
