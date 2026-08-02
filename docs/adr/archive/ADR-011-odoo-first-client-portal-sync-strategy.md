# 📝 ADR-011: Odoo-First Client Portal v3.0 Synchronization Strategy

**Date:** 2026-08-02
**Status:** Proposed
**Deciders:** Chief Architect, Backend Lead, DevOps Lead

---

## 1. CONTEXT
With the launch of the HEXA Client Portal v3.0, we require a seamless integration between the Portal and Odoo ERP. Odoo will serve as the **Source of Truth** for all client-related operational data, including:
- Projects & Milestones
- Invoices & Payments
- Documents (Deliverables)
- Client-specific Notifications

The current Strapi ↔ Odoo sync (ADR-009) handles portfolio content. The Portal v3.0 requires deeper transactional synchronization. Challenges include high concurrency during peak client traffic, data integrity for financial records (invoices), and robust handling of synchronization failures between Odoo and our microservices.

## 2. CONSIDERED OPTIONS
- **Option A: Synchronous API Gateway:** The Portal makes real-time JSON-RPC calls to Odoo for every client request.
- **Option B: Background Queue-Based Synchronization (Recommended):** The Portal uses a dedicated Sync Service (BullMQ-based) to process Odoo events asynchronously.
- **Option C: Database Replication:** Direct read-only replicas of Odoo database for the Portal to query.

## 3. TRADE-OFF ANALYSIS

| Option | Pros | Cons | Score (1-10) |
|---------|------|------|--------------|
| A | Real-time, no state management | High latency, Odoo overload, fragile | 4 |
| B | Resilient, scalable, decoupling | Higher complexity, eventual consistency | 9 |
| C | Fastest reads | Security risk, tight coupling, hard to maintain | 3 |

## 4. THE DECISION
**Chosen Option:** **Option B: Background Queue-Based Synchronization**
**Justification:** This aligns with our microservices architecture and provides the required resilience for financial data (invoices). It allows us to implement sophisticated retry logic and idempotent processing, which are critical for data integrity.

## 5. IMPACT & CONSEQUENCES
- **Positive:** Increased stability under load, robust error handling, decoupled services, improved client experience.
- **Negative:** Increased development complexity, requires managing Redis/BullMQ infrastructure, "Eventual Consistency" means data might be stale by a few seconds.
- **Dependencies:** NestJS Queue module (BullMQ), Redis 7, Odoo JSON-RPC client.

## 6. VERIFICATION PLAN
- **Integrity Testing:** Automated reconciliation scripts comparing Portal data vs. Odoo records nightly.
- **Resilience Testing:** Simulating Odoo outages and verifying that the Sync Service correctly queues and retries operations.
- **Performance:** Measuring average sync latency and queue processing time.

---
**Sign-off:** `🏛️ Chief Architect Approved`
