# Product Backlog

**Last Updated:** 2026-07-08

---

## Backlog Items

### Phase 1: Website Excellence

| Priority | Item | Story Points | Dependencies |
|----------|------|-------------|--------------|
| P0 | Design system implementation | XL | — |
| P0 | Landing page hero section | L | Design tokens |
| P0 | 3D project viewer base | XL | R3F setup |
| P1 | Project gallery page | L | Design system |
| P1 | Blog index + single post | M | Strapi setup |
| P1 | Services page | S | Content from Strapi |
| P1 | Contact form | M | Backend endpoint |
| P2 | About page | S | Content |
| P2 | SEO metadata implementation | M | Per page |
| P2 | Accessibility pass | L | All pages |

### Phase 2: Business Platform

| Priority | Item | Story Points | Dependencies |
|----------|------|-------------|--------------|
| P0 | Odoo CRM integration | XL | Odoo setup |
| P1 | Lead capture pipeline | L | Odoo CRM |
| P1 | Project lifecycle management | XL | Odoo Projects |
| P2 | Document generation | L | Odoo Documents |
| P2 | User management + RBAC | M | Auth system |
| P3 | Strapi content types setup | M | Strapi |

### Phase 3: Integration

| Priority | Item | Story Points | Dependencies |
|----------|------|-------------|--------------|
| P0 | NestJS BFF layer | XL | — |
| P0 | JWT authentication | L | BFF layer |
| P1 | Website ↔ Odoo sync | XL | BFF + Odoo |
| P1 | Webhook ISR trigger | M | Strapi webhooks |
| P2 | Error handling middleware | M | — |

### Technical Debt

| Priority | Item | Effort |
|----------|------|--------|
| P1 | TypeScript strict mode compliance | L |
| P2 | Test coverage improvement | XL |
| P2 | Performance optimization pass | L |
| P3 | Documentation updates | M |

---

## Icebox

Items deferred indefinitely:

- Multi-language support
- VR/AR mode
- Mobile app
- AI content generation
- Third-party integrations
