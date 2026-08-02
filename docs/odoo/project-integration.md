# Odoo Project Integration

**Last Updated:** 2026-07-08

---

## Overview

The Odoo Project module manages the complete project lifecycle from proposal acceptance to final delivery.

## Project Lifecycle

```
Won Opportunity (crm.lead)
    │
    ▼
Odoo: Auto-create project (automated action)
    │
    ├── name: "Sunset Villa Project"
    ├── client: John Doe
    ├── start_date: today
    ├── planned_hours: estimated from proposal
    └── hexa_type: "residential"
            │
            ▼
Project Stages (custom):
    │
    ├── Design (Concept → Schematic → Detailed)
    ├── Modeling (3D Model → Textures → Lighting)
    ├── Rendering (Still → Panoramic → VR)
    ├── Review (Internal → Client → Revisions)
    └── Delivery (Final Files → Archive)
```

## Milestone Management

```typescript
interface ProjectMilestone {
  name: string;
  date: Date;
  completed: boolean;
  client_viewable: boolean;
  description: string;
}

// Default milestones per project type
const RESIDENTIAL_MILESTONES = [
  { name: 'Initial Consultation', days_from_start: 0, client_viewable: true },
  { name: 'Concept Design', days_from_start: 14, client_viewable: true },
  { name: 'Schematic Design', days_from_start: 28, client_viewable: true },
  { name: '3D Model Complete', days_from_start: 42, client_viewable: false },
  { name: 'First Renderings', days_from_start: 56, client_viewable: true },
  { name: 'Client Review', days_from_start: 63, client_viewable: true },
  { name: 'Revisions Complete', days_from_start: 77, client_viewable: false },
  { name: 'Final Delivery', days_from_start: 90, client_viewable: true },
];
```

## Odoo ↔ Website Sync

```
Odoo: Project updated (status, milestone, files)
    │
    ├── Odoo webhook → NestJS
    │       │
    │       ├── Update PostgreSQL cache
    │       ├── Trigger website update (ISR)
    │       └── Send client notification
    │
    └── NestJS polling (every 30s, fallback)
            │
            ├── Fetch recent changes from Odoo
            ├── Compare with local cache
            └── Update if different
```

## Client Portal ↔ Odoo

| Portal Action | Odoo Effect |
|---------------|-------------|
| View project | Read from cached data |
| Upload file | Store in MinIO, link in Odoo Documents |
| Submit feedback | Create Odoo task or note |
| View timeline | Read milestones from Odoo |
| Download files | Read from MinIO via signed URL |

## Quality Gate

- Project created within 60 seconds of deal closing
- Milestones correctly mapped to timeline
- Client portal data refreshes within 30 seconds of Odoo change
- File uploads synchronize to both MinIO and Odoo Documents
