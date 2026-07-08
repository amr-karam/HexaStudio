# 🏢 ODOO INTEGRATION: THE BUSINESS ENGINE

**Version:** 1.0 | **Scope:** Backend $\rightarrow$ ERP | **Standard:** Synchronized / Automated / Robust

## 1. THE ODOO PHILOSOPHY
Odoo is the **Single Source of Truth (SOT)** for all business logic. While Strapi handles the "Marketing Content," Odoo handles the "Project State." The integration must be a bidirectional, real-time sync.

---

## 2. INTEGRATION ARCHITECTURE

### I. The Connector Pattern
We do not allow the frontend to call Odoo directly. All communication goes through the NestJS BFF.
- **Odoo External API:** Use the `xmlrpc` or `jsonrpc` protocol for communication.
- **Abstraction Layer:** Create an `OdooService` in the BFF that abstracts the XML-RPC calls into clean TypeScript methods.

### II. Data Mapping (The Symmetry)
Every Odoo Model has a corresponding View Model in the BFF.
- **Odoo Model:** `project.project` $\rightarrow$ **BFF ViewModel:** `ProjectSummary`.
- **Odoo Model:** `res.partner` $\rightarrow$ **BFF ViewModel:** `ClientProfile`.

---

## 3. SYNCHRONIZATION STRATEGIES

### I. Real-Time Push (Webhooks)
Use Odoo "Automated Actions" to trigger webhooks in the BFF when a record changes.
- **Flow:** Odoo Change $\rightarrow$ Webhook $\rightarrow$ BFF $\rightarrow$ Redis Cache Update $\rightarrow$ Frontend (via WebSocket).

### II. Scheduled Pull (Cron)
For non-critical data, use a scheduled Cron job to sync states.
- **Frequency:** Every 15-60 minutes for non-urgent business reports.

---

## 4. ERROR HANDLING & RESILIENCY

### I. The Circuit Breaker
If the Odoo server is slow or down, the BFF must not crash.
- **Circuit Breaker:** Stop calling Odoo if the failure rate exceeds 20% and serve cached data from Redis.
- **Retry Logic:** Implement exponential backoff for failed webhook deliveries.

### II. Data Integrity
- **Idempotency:** Ensure that receiving the same webhook twice does not create duplicate records.
- **Logging:** Log every Odoo request/response for auditability.

---

## 5. QUALITY GATE: ODOO AUDIT
An integration is "Odoo-Done" only when:
- [ ] The data mapping is documented in the `09-ODOO` folder.
- [ ] The sync is bidirectional and real-time.
- [ ] The Circuit Breaker is implemented and tested.
- [ ] No raw XML-RPC calls exist outside the `OdooService`.

*“The ERP is the brain; the API is the nervous system. Both must be perfectly synchronized for the body to move.”*
