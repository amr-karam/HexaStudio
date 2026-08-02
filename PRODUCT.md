# 💎 HEXA STUDIO — PRODUCT STRATEGY & VISION

**Version:** 1.0.0  
**Authority Level:** 3  
**Scope:** Product Mission, Client HQ Experience, Media Engine, and Feature Architecture  

---

## 1. PRODUCT MISSION

HEXA STUDIO is not merely an agency website or project tracker. It is engineered as the **Enterprise Digital Headquarters** for high-end architectural visualization and spatial intelligence clients.

Every interaction between HEXA STUDIO and its ultra-luxury clients occurs within a seamless, cinematic digital environment that inspires transparency, confidence, and visual awe.

---

## 2. THE THREE PRODUCT HORIZONS

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ HORIZON 1: THE LUXURY SHOWCASE (Awwwards-Grade Portfolio Engine)            │
│ High-fidelity WebGL 3D visuals, chapter scroll cinema, dynamic ISR blog.   │
├─────────────────────────────────────────────────────────────────────────────┤
│ HORIZON 2: THE DIGITAL HQ (Client Portal v3.0)                               │
│ 5-Second Executive Clarity, presigned S3 deliverables, Odoo billing sync.   │
├─────────────────────────────────────────────────────────────────────────────┤
│ HORIZON 3: SPATIAL INTELLIGENCE & AI (The AI Architect)                      │
│ Gemini 2.5 Flash agents, material studio inspector, autonomous lead scoring. │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CLIENT DIGITAL HEADQUARTERS (Portal v3.0 Specifications)

### A. 5-Second Executive Clarity Grid (`/portal`)
The portal dashboard MUST answer *"What is happening with my project right now?"* in under 5 seconds upon login.
- **Key Metrics**: Overall progress %, next milestone due date, pending approvals count, overall project health score (e.g. 94/100 Excellent).
- **Activity Stream**: Live project updates, document uploads, and scheduled review meetings.

### B. Embedded AI Portal Copilot (`PortalAiCopilot.tsx`)
- Page-aware assistant built into every portal page.
- Answers client queries regarding milestone schedules, deliverable status, invoice totals, and document summaries.
- Enforces strict partner-scoped data boundaries (never exposes studio internal profit margins or operational costs).

### C. Audit-Trailed Approval Center (`/portal/approvals`)
- Authorized digital sign-offs for 3D renderings, wireframes, contracts, quotations, invoices, and scope change requests.
- Maintains a permanent, immutable audit log recording timestamp, actor, action, and client notes.

### D. Presigned S3 Document Center (`/portal/documents`)
- Categorized folders (*Design, Contracts, Blueprints, Reports*) for 8K render outputs and BIM CAD packages.
- Download links generated via secure presigned MinIO S3 URLs.

### E. Finance & Multi-Currency (`/portal/finance`)
- Real-time Odoo ERP `account.move` sync displaying invoice status (*Paid, Pending, Overdue*).
- Dynamic multi-currency conversion across USD, EUR, and GBP.
