# SOP-BO-04: Invoicing & Payment Collection

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  
**Owner:** Finance / Product Owner  

---

## Goal

To ensure accurate invoicing and timely payment collection for all services, maintaining healthy cash flow for the studio.

## Prerequisites

- Odoo Sales module configured.
- Payment gateway (Stripe/PayPal) integrated.
- Project milestones or fixed-fee structure defined.

## Step-by-Step Process

### 1. Invoice Generation
- **Trigger:** Invoice based on:
  - Deposit (on contract signing)
  - Milestone completion (on la-log verification)
  - Final balance (on delivery)
- **Odoo Action:** Create invoice from the Sales Order.
- **Review:** Verify amounts, taxes, and client details.

### 2. Delivery
- **Portal:** Auto-publish invoice to the Client Portal.
- **Email:** Send invoice notification with a direct payment link.
- **Tracking:** Mark invoice as "Sent" in Odoo.

### 3. Payment Processing
- **Automatic:** Payment processed via gateway → Odoo automatically marks as "Paid".
- **Manual:** For wire transfers, manually mark as "Paid" after bank verification.
- **Reconciliation:** Match payment with invoice ID.

### 4. Collection & Reminders
- **Overdue:** If payment is not received by the due date:
  - Day 1: Friendly reminder email.
  - Day 7: Formal reminder email.
  - Day 14: Phone call and suspension of portal access.
- **Resolution:** Once paid, restore portal access and send receipt.

## Verification

- [ ] Invoice matches the agreed contract.
- [ ] Invoice is visible in the Client Portal.
- [ ] Payment is correctly reconciled in Odoo.
- [ ] Receipt sent to client.

## Exception Handling

| Issue | Action |
|-------|---------|
| Disputed amount | Pause collection, review with Project Manager |
| Failed payment | Notify client, request alternate payment method |
| Partial payment | Create partial payment record, keep invoice open |

## Related Docs

- `03-BUSINESS\SOPs.md`
- `09-ODOO\SALES.md`
- `12-CLIENT-PORTAL\INVOICES.md`
