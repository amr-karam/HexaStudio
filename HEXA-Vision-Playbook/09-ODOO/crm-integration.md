# Odoo CRM Integration

**Last Updated:** 2026-07-08

---

## Overview

The Odoo CRM module manages the entire lead-to-opportunity pipeline for HEXA Studio. All website inquiries automatically create CRM leads.

## Data Flow

```
Website Contact Form
    │
    ▼
NestJS: POST /v1/contacts
    │
    ├── Save to PostgreSQL (contacts table)
    ├── Push to Odoo via XML-RPC
    └── Log analytics event
            │
            ▼
    Odoo: crm.lead created
            │
            ├── name: "Inquiry from John Doe"
            ├── contact_name: "John Doe"
            ├── email_from: "john@example.com"
            ├── description: "Message from contact form"
            ├── stage_id: "New" (default)
            └── custom fields:
                ├── hexa_source: "website"
                ├── hexa_service: "residential"
                └── hexa_budget: "100k-500k"
```

## Odoo CRM Pipeline Stages

| Stage | Description | Automation |
|-------|-------------|------------|
| **New** | New inquiry from website | Auto-created |
| **Contacted** | Sales team reached out | Trigger email sequence |
| **Qualified** | Lead qualifies for consultation | Schedule consultation |
| **Consultation** | Meeting scheduled | Calendar invite |
| **Proposal Sent** | Proposal delivered | Generate proposal |
| **Negotiation** | Client reviewing | Follow-up reminder |
| **Won** | Project confirmed | Auto-create project |
| **Lost** | Lead declined | Archive, analytics |

## NestJS → Odoo Mapping

```typescript
function mapContactToOdooLead(contact: Contact): OdooLeadInput {
  return {
    name: `Inquiry from ${contact.name}`,
    contact_name: contact.name,
    email_from: contact.email,
    phone: contact.phone || '',
    description: contact.message,
    partner_name: contact.company || '',
    // Custom HEXA fields
    x_hexa_source: contact.source || 'website',
    x_hexa_service: contact.service || '',
    x_hexa_budget: contact.budget || '',
    // Stage ID for "New"
    stage_id: 1,
  };
}
```

## Error Handling

| Scenario | Handling |
|----------|----------|
| Odoo unavailable | Queue in Redis, retry with backoff |
| Validation error | Log error, notify ops |
| Duplicate email | Merge with existing contact |
| Rate limit | Implement jittered retry |

## Quality Gate

- Lead created in Odoo within 5 seconds of form submission
- No lead data loss (at-least-once delivery)
- All custom fields populated on creation
- Duplicate detection active
