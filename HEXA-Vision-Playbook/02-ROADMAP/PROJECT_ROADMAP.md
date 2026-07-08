# Project Roadmap

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Phase Overview

```
Phase 0 ─── Foundation ──────────────────────────── Current
     │
     ▼
Phase 1 ─── Website Excellence ──────────────────── Q3 2026
     │
     ▼
Phase 2 ─── Business Platform ───────────────────── Q4 2026
     │
     ▼
Phase 3 ─── Integration ─────────────────────────── Q1 2027
     │
     ▼
Phase 4 ─── Intelligence ────────────────────────── Q2 2027
     │
     ▼
Phase 5 ─── Client Experience ───────────────────── Q3 2027
     │
     ▼
Phase 6 ─── Production Excellence ───────────────── Q4 2027
```

---

## Phase 0: Foundation (Current)

**Theme:** *"Build the foundation that nothing will topple."*

### Deliverables

| Deliverable | Description | Status |
|-------------|-------------|--------|
| Project Playbook | Complete operating manual | ✅ Complete |
| System Architecture | Architecture documentation | ✅ Complete |
| Tech Stack Finalized | All technology decisions documented | ✅ Complete |
| Repository Structure | Monorepo structure established | ✅ Complete |
| Development Standards | Coding, Git, documentation standards | ✅ Complete |
| CI/CD Pipeline | GitHub Actions workflow | ⬜ Pending |
| Docker Infrastructure | Docker Compose for all services | ⬜ Pending |

### Exit Criteria

- [ ] Playbook is reviewed and approved by all stakeholders
- [ ] CI pipeline passes lint, type-check, and build
- [ ] Docker environment runs locally
- [ ] All environment variables documented
- [ ] AGENTS.md is current

---

## Phase 1: Website Excellence (Q3 2026)

**Theme:** *"First impressions that convert."*

### Deliverables

| Deliverable | Description |
|-------------|-------------|
| Design System | Complete Figma design system |
| Landing Page | Hero, about, services, portfolio |
| 3D Viewer | Interactive 3D project viewer |
| Project Gallery | Filterable project showcase |
| Blog | Dynamic blog from Strapi |
| Contact | Contact form → CRM pipeline |
| Performance | All performance targets met |
| Accessibility | WCAG 2.1 AA compliance |
| SEO | Structured data, sitemaps, metadata |

### Exit Criteria

- [ ] Lighthouse scores >95 across all categories
- [ ] LCP < 1.2s
- [ ] 3D scenes run at 60 FPS on modern devices
- [ ] All pages pass WAVE accessibility validation
- [ ] Structured data validates with Google Rich Results
- [ ] Mobile-first responsive design verified on 320px, 768px, 1024px, 1440px

---

## Phase 2: Business Platform (Q4 2026)

**Theme:** *"Where architecture firms run their business."*

### Deliverables

| Deliverable | Description |
|-------------|-------------|
| Odoo Integration | ERP backend for CRM, Sales, Projects |
| CRM | Lead management, pipeline, scoring |
| Projects | Project lifecycle management |
| Documents | Document generation and storage |
| Users & Permissions | RBAC for all roles |
| HEXA CMS | Custom Strapi content types |

### Exit Criteria

- [ ] Odoo instance is deployed and configured
- [ ] CRM pipeline maps to website contact flow
- [ ] Project lifecycle covers inquiry → delivery
- [ ] Document templates for proposals, contracts, invoices
- [ ] Role-based access control is comprehensive
- [ ] Strapi content types are finalized

---

## Phase 3: Integration (Q1 2027)

**Theme:** *"Everything connected, nothing lost."*

### Deliverables

| Deliverable | Description |
|-------------|-------------|
| API Architecture | NestJS BFF layer complete |
| Auth Strategy | JWT-based authentication |
| Website ↔ Odoo Sync | Bidirectional data sync |
| Media Sync | MinIO ↔ Odoo media bridge |
| Webhooks | Event-driven Strapi ISR |
| Error Handling | Global exception handling, retry logic |

### Exit Criteria

- [ ] All API endpoints documented in Swagger
- [ ] Auth flow covers login, register, forgot password, SSO
- [ ] Data sync latency < 30s
- [ ] Media synchronization preserves EXIF and metadata
- [ ] Webhook-triggered ISR works within 5s
- [ ] Error responses follow RFC 7807 (Problem Details)

---

## Phase 4: Intelligence (Q2 2027)

**Theme:** *"Data that drives decisions."*

### Deliverables

| Deliverable | Description |
|-------------|-------------|
| Analytics Dashboard | Website + business metrics |
| BI Reports | Customizable business intelligence |
| Executive Dashboard | CEO-level KPI overview |
| AI Platform | Content generation, smart tagging |
| Communication Hub | Email campaigns, notifications |

### Exit Criteria

- [ ] Analytics capture all key user interactions
- [ ] BI reports exportable to PDF/CSV
- [ ] Executive dashboard loads in < 2s
- [ ] AI content generation achieves > 80% acceptance rate
- [ ] Email campaigns have open rate tracking

---

## Phase 5: Client Experience (Q3 2027)

**Theme:** *"The portal that closes deals."*

### Deliverables

| Deliverable | Description |
|-------------|-------------|
| Client Portal | Secure client login |
| Notifications | Email, in-app, and push notifications |
| File Management | Client document sharing |
| Timeline | Project milestone visualization |
| Project Tracking | Real-time status updates |

### Exit Criteria

- [ ] Client portal passes security audit
- [ ] Notification delivery rate > 99%
- [ ] File upload supports 100MB+ files
- [ ] Timeline component handles 100+ milestones
- [ ] Portal loads in < 2s on mobile

---

## Phase 6: Production Excellence (Q4 2027)

**Theme:** *"Ship with confidence."*

### Deliverables

| Deliverable | Description |
|-------------|-------------|
| Deployment Pipeline | Production-grade CI/CD |
| Monitoring | Prometheus, Grafana, Sentry |
| Backup | Automated backup and restore |
| Disaster Recovery | Documented DR plan |
| Maintenance Plan | Scheduled maintenance procedures |

### Exit Criteria

- [ ] Zero-downtime deployment is verified
- [ ] Monitoring covers all services
- [ ] Backup RTO < 1 hour, RPO < 15 minutes
- [ ] DR plan is tested quarterly
- [ ] Maintenance window documented and agreed

---

## Timeline Visualization

```
2026                    2027
Q2  Q3  Q4    Q1   Q2   Q3   Q4
█░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Phase 0: Foundation
    ███████░░░░░░░░░░░░░░░░░░░░  Phase 1: Website
           ███████░░░░░░░░░░░░░  Phase 2: Business
                  ███████░░░░░░░  Phase 3: Integration
                         ██████  Phase 4: Intelligence
                                ███████  Phase 5: Client
                                       ██████  Phase 6: Production
```

Note: Phases may overlap. Work on Phase 2 may begin before Phase 1 is fully complete.
