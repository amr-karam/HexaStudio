# ADR-004: API and CMS Architecture

**Status:** Accepted
**Date:** 2026-07-08
**Deciders:** Chief Architect, Backend Lead

---

## Context

The platform needs a content management system for portfolio projects, blog posts, and media assets. It also requires a backend API for client portal, authentication, and admin operations. We need to decide between a unified backend or a split approach.

## Decision

Use a **split architecture**: Strapi 5 (headless CMS) for content management + NestJS (custom backend) for business logic.

### CMS (Strapi 5)

- Manages: portfolio projects, blog posts, categories, media
- Provides: REST API, admin panel, media optimization
- Scoped to content authoring only
- No custom business logic in Strapi

### Backend (NestJS)

- Custom endpoints: client portal, admin requests, authentication
- Business logic: Odoo integration, project enrichment, user management
- JWT authentication with guards
- Swagger documentation

### Data Flow

```
Frontend → Strapi (content) + NestJS (business logic)
NestJS → Strapi (enriched queries) + Odoo (status sync) + PostgreSQL (app data)
```

## Consequences

### Positive
- Clear separation of content management and business logic
- Strapi provides free admin panel for non-technical users
- NestJS allows complex business rules and integrations
- Each service can be scaled independently

### Negative
- Two services to deploy and maintain
- Increased network latency for cross-service queries
- Duplicate some configuration (CORS, auth)
- Strapi lifecycle constraints (Node 20-22, npm limitations)

## Verification

- Strapi admin panel accessible at /admin (proxy)
- Backend returns enriched project data (Strapi + Odoo)
- Authentication works across both services
