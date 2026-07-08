# SOP-BO-02: Project Proposal & Contracting

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  
**Owner:** Product Owner / Sales Lead  

---

## Goal

To transform a qualified consultation into a legally binding contract and a finalized project scope, ensuring all expectations are aligned and the project is financially viable.

## Prerequisites

- Consultation completed.
- Client requirements documented in Odoo.
- Budget range and timeline agreed upon in principle.

## Step-by-Step Process

### 1. Proposal Generation
- **Data Gathering:** Review consultation notes and la-logs.
- **Template Selection:** Use the "Project Proposal" template in Odoo.
- **Scoping:** Define clear deliverables, exclusions, and a phased timeline.
- **Pricing:** Calculate fees based on complexity and estimated hours.
- **Drafting:** Create the proposal document in Odoo Documents.

### 2. Proposal Review & Iteration
- **Internal Review:** Chief Architect reviews the scope for technical feasibility.
- **Submission:** Send the proposal to the client via the Portal.
- **Feedback Loop:** Use portal comments to iterate on scope or pricing.
- **Approval:** Client marks the proposal as "Accepted" in the Portal.

### 3. Contracting
- **Agreement:** Generate the formal contract using the "Service Agreement" template.
- **Legal Review:** Ensure standard terms and conditions are included.
-, **E-Signature:** Send the contract via the Portal for digital signature.
- **Storage:** Save the signed PDF in Odoo Documents and MinIO.

### 4. Finalization
- **Payment:** Issue the initial deposit invoice.
- **Status Change:** Move Odoo Opportunity to "Won".
- **Hand-off:** Trigger the project creation flow.

## Verification

- [ ] Proposal accepted by client.
- [ ] Signed contract stored in Odoo.
- [ ] Deposit invoice sent.
- [ ] Project created in Odoo Projects.

## Exception Handling

| Issue | Action |
|-------|---------|
| Budget mismatch | Renegotiate scope or pricing |
| Legal redlines | Escalate to legal counsel |
| Delay in signature | Send automated reminder via Odoo |

## Related Docs

- `03-BUSINESS\SOPs.md`
- `09-ODOO\SALES.md`
- `12-CLIENT-PORTAL\INVOICES.md`
