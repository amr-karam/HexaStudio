# Business Workflows

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Overview

This document defines the key business workflows that the HEXA Vision platform automates. These workflows span the website, CRM, project management, and client portal.

---

## Workflow 1: Lead Capture → CRM

### Flow Diagram

```
Visitor lands on website
        │
        ▼
Contacts via: [Contact Form | Chat | Phone | Social]
        │
        ▼
NestJS API receives lead
        │
        ├──► Create lead in PostgreSQL
        ├──► Push to Odoo CRM (Opportunity)
        ├──► Send notification to sales team (Email/Slack)
        └──► Log analytics event
                │
                ▼
Sales team reviews opportunity in Odoo
        │
        ├──► Qualify lead → Convert to Customer
        ├──► Disqualify lead → Archive
        └──► Follow up → Schedule meeting
```

### Acceptance Criteria

- [ ] Lead is created within 1 second of form submission
- [ ] Lead appears in Odoo CRM within 30 seconds
- [ ] Sales team receives notification within 5 seconds
- [ ] Duplicate leads are merged automatically
- [ ] Lead source is tracked (website, referral, direct)

---

## Workflow 2: Project Lifecycle

### Stages

```
Inquiry → Consultation → Proposal → Contract → In Progress → Review → Delivered → Archived
```

### Detail

```
1. INQUIRY
   - Lead submits project inquiry via website
   - System creates lead in CRM
   - Sales team accepts and schedules consultation

2. CONSULTATION
   - Meeting scheduled (via calendar integration)
   - Notes captured in Odoo
   - Requirements documented

3. PROPOSAL
   - Project proposal generated from template
   - Pricing, timeline, scope defined
   - Sent to client for review
   - Client can accept/reject/negotiate via portal

4. CONTRACT
   - Digital contract generated
   - E-signature via portal
   - Contract stored in Odoo Documents
   - Project created in Odoo Projects

5. IN PROGRESS
   - Milestones created (Design → Modeling → Rendering → Review)
   - Client portal updated with progress
   - File sharing active
   - Timeline visible to client

6. REVIEW
   - Client reviews deliverables via portal
   - Feedback captured as tasks
   - Revisions managed with version control

7. DELIVERED
   - Final files delivered via portal
   - Project marked complete
   - Invoice sent (auto-generated)

8. ARCHIVED
   - Project archived after 90 days
   - Data retained for reference
   - Client moved to "Past Client" segment
```

### Acceptance Criteria

- [ ] Project lifecycle is fully automated
- [ ] Client can view progress in real-time
- [ ] Proposal generation takes < 5 minutes
- [ ] Contract e-signature is legally binding
- [ ] File versioning preserves all revisions

---

## Workflow 3: Content Management (Strapi → Website)

### Flow

```
Strapi Admin
  Creates/Updates Content
    (Portfolio, Blog, Services)
        │
        ▼
Strapi Webhook → NestJS
        │
        ▼
NestJS validates and transforms data
        │
        ├──► Triggers Next.js ISR
        └──► Invalidates Redis cache
                │
                ▼
Next.js re-generates pages
        │
        ▼
Updated content live on website
```

### Content Types

| Content Type | Update Frequency | Cache TTL |
|-------------|-----------------|-----------|
| Portfolio Projects | Weekly | 1 hour |
| Blog Posts | Weekly | 1 hour |
| Services | Quarterly | 1 day |
| Team Members | Monthly | 1 day |
| Testimonials | Monthly | 1 day |
| Site Settings | Quarterly | 1 day |

---

## Workflow 4: Client Portal Access

### Flow

```
Existing Client
        │
        ▼
Login via website
        │
        ├──► JWT Authentication
        ├──► RBAC check (client role)
        └──► Session created
                │
                ▼
Dashboard loads:
  - Active projects (with progress %)
  - Recent files
  - Upcoming milestones
  - Notifications
  - Invoice status
```

### Portal Features

| Feature | Access Level |
|---------|-------------|
| View active projects | All clients |
| Download deliverables | All clients |
| Upload reference files | All clients |
| View project timeline | All clients |
| Submit feedback | All clients |
| View invoices | Billing contact only |
| Download invoice PDF | Billing contact only |
| Update profile | All clients |
| View team | All clients |

---

## Workflow 5: Document Generation

### Documents

| Document | Trigger | Source Data |
|----------|---------|-------------|
| Project Proposal | Consultation completed | Odoo Opportunity |
| Contract | Proposal accepted | Odoo Opportunity |
| Invoice | Project delivered | Odoo Project |
| Receipt | Payment received | Odoo Invoice |
| Statement of Work | Project started | Odoo Project |
| Change Order | Scope change | Odoo Project |

### Generation Pipeline

```
Odoo triggers document need
        │
        ▼
NestJS requests document generation
        │
        ├──► Fetch data from Odoo
        ├──► Fill template (PDF/HTML)
        ├──► Upload to MinIO
        ├──► Update Odoo record with link
        └──► Notify relevant parties
```

---

## Workflow 6: Notifications

### Notification Types

| Type | Channel | Trigger |
|------|---------|---------|
| New Inquiry | Slack + Email | Lead created |
| Project Milestone | Email + Portal | Milestone reached |
| File Uploaded | Email + Portal | File added to project |
| Invoice Due | Email + Portal | 7 days before due |
| Payment Received | Email | Payment processed |
| Project Delivered | Email + Portal | Final files ready |
| Feedback Required | Email + Portal | Review stage reached |

### Preference Management

- Clients can opt out of marketing emails
- Project notifications are mandatory for active projects
- Notification frequency: instant, daily digest, or weekly summary

---

## Workflow 7: Analytics & Reporting

### Reports

| Report | Frequency | Audience |
|--------|-----------|----------|
| Website Traffic | Daily | Marketing |
| Lead Conversion | Weekly | Sales |
| Project Pipeline | Weekly | Operations |
| Revenue | Monthly | Finance |
| Client Satisfaction | Per project | Management |
| Employee Utilization | Monthly | HR |
| Executive Dashboard | Real-time | CEO |

### Data Sources

- Website: Google Analytics 4, Sentry
- CRM: Odoo (leads, opportunities, conversions)
- Projects: Odoo (milestones, time tracking, deliverables)
- Finance: Odoo (invoices, payments, revenue)
- 3D Performance: Custom instrumentation
