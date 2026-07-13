# Product Backlog

**Last Updated:** 2026-07-13

---

## Completed (v1.0.0)

All Phase 1–3 items delivered:
- ✅ Design system, landing pages, 3D project viewer
- ✅ Project gallery, blog, services, contact, about pages
- ✅ SEO metadata, accessibility pass
- ✅ Odoo CRM integration, lead capture, project lifecycle
- ✅ NestJS BFF layer, JWT auth, website↔Odoo sync
- ✅ 120 tests, 7 CI jobs, security hardening

---

## Backlog Items

### Phase 4: Intelligence (AI Evolution)

| Priority | Item | Story Points | Dependencies |
|----------|------|-------------|--------------|
| P0 | Vector database setup (Qdrant/Weaviate) | XL | Server resources |
| P0 | Embedding pipeline (Strapi → vectors) | XL | Vector DB |
| P1 | Semantic search API (`/api/search`) | L | Embedding pipeline |
| P1 | AI agent scaffold (NestJS) | XL | — |
| P1 | Auto-tagging for portfolio projects | L | Embeddings |
| P2 | Project recommendation engine | L | Vector search |
| P2 | Smart summaries generation | M | AI agent |
| P3 | VR/AR mode | XL | 3D engine |
| P3 | Mobile app | XL | API |

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
- Third-party integrations (beyond Odoo/Strapi)
