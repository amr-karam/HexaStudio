# 💳 INVOICE & BILLING MANAGEMENT SPECIFICATIONS

**Version:** 1.0.0 | **Scope:** Financial Invoicing | **Standard:** Odoo Invoicing & Regional Tax Compliance

---

## 1. OVERVIEW & FEATURES

The Invoice Management module (`/portal/invoices`) provides clients with access to project estimates, milestone billing statements, and payment status synced directly from Odoo `account.move`.

---

## 2. DYNAMIC REGIONAL PRICING & TAX BREAKDOWN

Integrates backend `CurrencyModule` to display:
- Subtotal, regional tax rate (e.g. 19% VAT or 8% Sales Tax), and total final amount.
- Multi-currency toggle with dynamic exchange conversion.

---

## 3. RELATED DOCUMENTATION

- [SALES.md](.docs/odoo/SALES.md) — Odoo sales module.
- [CLIENT_PORTAL.md](.docs/client-portal/CLIENT_PORTAL.md) — Client portal.
