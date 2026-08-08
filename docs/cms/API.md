# CMS API Architecture

**Version:** 1.0 | **Status:** Active | **Authority:** `docs/cms/README.md`
**Scope:** CMS API — REST API, GraphQL, authentication, authorization, rate limiting, error handling, testing
**Implementation:** `apps/cms/src/api/` (Strapi API)

---

## 1. API Overview

Strapi exposes content via APIs. The architecture supports both REST and GraphQL, with REST as the primary interface.

### 1.1 API Role in the Platform

| Role | Description |
|-------|-------------|
| **Content Delivery** | Serves published content to the frontend via BFF |
| **Content Management** | Provides CRUD operations for content editors via admin panel |
| **Integration** | Provides APIs for external integrations (Odoo sync, etc.) |
| **Authentication** | Manages API token authentication for service-to-service communication |
| **Authorization** | Enforces RBAC for all API operations |

### 1.2 API Architecture Position

```
Frontend (Next.js) → NestJS BFF (authenticated, cached, transformed) → Strapi CMS API
```

The frontend never directly accesses Strapi. All CMS content flows through the NestJS BFF, which:
- Authenticates requests
- Caches CMS responses for performance
- Aggregates CMS data with Odoo and other sources
- Transforms data into frontend-friendly format
- Protects CMS from direct public access

---

## 2. REST API Architecture

### 2.1 Endpoint Structure

REST endpoints follow a consistent pattern:

```
GET    /api/<content-type>             → List records
GET    /api/<content-type>/:id         → Get record by ID
POST   /api/<content-type>             → Create record (authenticated)
PUT    /api/<content-type>/:id         → Update record (authenticated)
DELETE /api/<content-type>/:id         → Delete record (authenticated)
```

Content types use kebab-case plural names:
- `/api/projects` — Project content type
- `/api/services` — Service content type
- `/api/blog-posts` — Blog Post content type
- `/api/categories` — Category content type
- `/api/testimonials` — Testimonial content type
- `/api/clients` — Client content type
- `/api/team-members` — Team Member content type
- `/api/faqs` — FAQ content type
- `/api/global-settings` — Global Settings (singleton)
- `/api/navigations` — Navigation (singleton)
- `/api/media/:id` — Media library
- `/api/tags` — Tag content type
- `/api/subcategories` — Subcategory content type

### 2.2 API Features

| Feature | Implementation |
|---------|---------------|
| **Authentication** | JWT tokens, API tokens, session-based |
| **Authorization** | RBAC (admin, editor, author, contributor, public) |
| **Pagination** | Page-based (`pagination[start]`, `pagination[limit]`) |
| **Filtering** | Field-based (`filters[title][$contains]=...`) |
| **Sorting** | Field-based (`sort=title:asc`) |
| **Population** | Relation population (`populate=*` or selective) |
| **Field Selection** | Field selection (`fields=title,slug,description`) |
| **Localization** | Locale parameter (`?locale=en` or `?locale=ar`) |

### 2.3 API Response Structure

All REST responses follow a consistent structure:

```json
{
  "data": {
    "id": 1,
    "attributes": {
      "title": "Project Title",
      "slug": "project-title",
      "publishedAt": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-10T08:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  },
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 10,
      "total": 250
    }
  }
}
```

For related data, use `populate`:

```json
{
  "data": {
    "id": 1,
    "attributes": {
      "title": "Project Title",
      "slug": "project-title",
      "seo": {
        "data": {
          "attributes": {
            "metaTitle": "Project Title | HEXA STUDIO",
            "metaDescription": "Project description for search engines..."
          }
        }
      }
    }
  }
}
```

---

## 3. GraphQL Architecture

### 3.1 GraphQL Overview

GraphQL provides a flexible alternative to REST for complex queries:

- **Schema** — type definitions mirroring content types
- **Queries** — fetching content (single, list, with filters, sorting, pagination)
- **Mutations** — creating, updating, deleting content (where permissions allow)
- **Subscriptions** — real-time updates (where configured)

### 3.2 GraphQL Benefits

- **Complex queries** — nested relations in a single request
- **Flexible field selection** — clients request exactly what they need
- **Reduced over-fetching** — no unnecessary data
- **Strong typing** — generated types for TypeScript consumers
- **Self-documenting** — schema introspection provides documentation

### 3.3 GraphQL Endpoint Structure

```
POST /api/graphql
```

Example query:

```graphql
query GetProject($slug: String!) {
  project(where: { slug: $slug }) {
    data {
      id
      attributes {
        title
        slug
        client
        architect
        location
        year
        description
        heroMedia {
          data {
            attributes {
              url
              alternativeText
              formats
            }
          }
        }
        seo {
          data {
            attributes {
              metaTitle
              metaDescription
              ogImage {
                data {
                  attributes {
                    url
                  }
                }
              }
            }
          }
        }
        publishedAt
      }
    }
  }
}
```

---

## 4. API Authentication

### 4.1 Authentication Methods

| Method | Usage | Token Lifetime |
|-------------|-------|---------------|
| **JWT (Session)** | Admin panel, interactive sessions | Short-lived (hours) |
| **API Token** | Service-to-service, automated systems | Long-lived (months/years) |
| **Session Cookie** | Browser-based admin panel | Session duration |

### 4.2 API Token Management

API tokens are managed through Strapi's admin panel or API:

- **Create token** — generate a new API token with specific scopes
- **List tokens** — view all tokens for the current user
- **Revoke token** — revoke a token to invalidate it
- **Regenerate token** — create a new token and revoke the old one

### 4.3 Token Scoping

API tokens can be scoped:

- **Role-based** — token is scoped to a specific role (admin, editor, author, contributor, public)
- **Content-type-based** — token can be restricted to specific content types
- **Operation-based** — token can be restricted to specific operations (find, findOne, create, update, delete, publish, upload)

---

## 5. API Authorization

### 5.1 RBAC System

Strapi's RBAC system defines roles and permissions:

| Role | Description | Typical User |
|-------|-------------|-------------|
| **Admin** | Full access | Platform administrators |
| **Editor** | Create, update, publish content | Content editors |
| **Author** | Create, update, delete own content | Content authors |
| **Contributor** | Create, update own content (cannot publish) | Reviewers, translators |
| **Public** | Read-only access to published content | End users, frontend |

### 5.2 Permission Structure

Permissions are defined per content type and per operation:

| Operation | Description |
|-----------|-------------|
| **find** | Read access to list endpoints |
| **findOne** | Read access to single record endpoints |
| **create** | Create access to create endpoints |
| **update** | Update access to update endpoints |
| **delete** | Delete access to delete endpoints |
| **publish** | Publish access (if draft/publish enabled) |
| **unpublish** | Unpublish access (if draft/publish enabled) |
| **upload** | Upload access (for media) |

### 5.3 Permission Enforcement

Permissions are enforced at multiple levels:

1. **Strapi level** — Strapi enforces permissions on API requests
2. **BFF level** — NestJS BFF enforces additional authorization
3. **Frontend level** — Frontend hides unavailable actions (not a security measure, just UX)

---

## 6. API Rate Limiting

### 6.1 Rate Limiting Strategy

Rate limiting protects the API from abuse and ensures fair usage:

| Endpoint Type | Rate Limit | Scope |
|--------------|------------|-------|
| Public endpoints | 100 requests/minute | Per IP address |
| Authenticated endpoints | 1000 requests/minute | Per user |
| Admin endpoints | 5000 requests/minute | Per admin user |
| Upload endpoints | 10 requests/minute | Per user |
| GraphQL endpoints | 50 requests/minute | Per IP address |

### 6.2 Rate Limiting Implementation

- **Token bucket algorithm** — smooths out request bursts
- **Sliding window** — tracks requests in a time window
- **IP-based limiting** — for public endpoints
- **User-based limiting** — for authenticated endpoints
- **Custom limits** — configurable per endpoint

### 6.3 Rate Limit Response

When a rate limit is exceeded:

```json
{
  "data": null,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    },
    "statusCode": 429
  }
}
```

---

## 7. API Error Handling

### 7.1 Error Structure

All API errors follow a consistent structure:

```json
{
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... },
    "statusCode": 400
  }
}
```

### 7.2 Error Codes

| Code | Description | HTTP Status |
|------|-------------|------------|
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Validation failed | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `CONFLICT` | Resource conflict | 409 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

### 7.3 Error Handling Best Practices

- **Consistent structure** — all errors follow the same format
- **Clear messages** — error messages are clear and actionable
- **Appropriate status codes** — HTTP status codes match the error type
- **Details** — additional details provided when helpful (validation errors, etc.)
- **Security** — error messages don't leak sensitive information

---

## 8. API Documentation

### 8.1 Documentation Sources

API documentation is provided through multiple sources:

- **Swagger/OpenAPI** — auto-generated API documentation (where Strapi supports it)
- **GraphQL Schema** — self-documenting GraphQL schema with introspection
- **Custom docs** — `docs/api/` for API architecture, patterns, and guides

### 8.2 API Documentation Structure

| Document | Purpose |
|---------|-------------|
| `docs/api/API_ARCHITECTURE.md` | API architecture overview |
| `docs/api/endpoints.md` | API endpoint reference |
| `docs/api/authentication.md` | API authentication |
| `docs/api/authorization.md` | API authorization |
| `docs/api/pagination.md` | API pagination |
| `docs/api/filtering.md` | API filtering and sorting |
| `docs/api/localization.md` | API localization |

---

## 9. API Versioning

### 9.1 Versioning Strategy

APIs are versioned to ensure backwards compatibility:

- **URL versioning** — version in the URL path (`/api/v1/projects`)
- **Date-based versioning** — version based on date (`2024-01-01`)

HEXA STUDIO uses URL versioning with date-based version identifiers for major changes.

### 9.2 Version Lifecycle

- **Active versions** — currently supported versions
- **Deprecated versions** — versions that will be removed (with sunset date)
- **Removed versions** — versions that are no longer available

### 9.3 Version Documentation

Each API version is documented with:

- **Version identifier** — the version number or date
- **Changes** — what changed in this version
- **Deprecations** — what was deprecated
- **Removal date** — when the version will be removed (for deprecated versions)
- **Migration guide** — how to migrate to the new version

---

## 10. API Testing Strategy

### 10.1 Testing Layers

| Testing Layer | Purpose | Tools |
|---------------|---------|-------|
| **Unit tests** | Individual endpoint logic | Jest, Vitest |
| **Integration tests** | Endpoint-to-database integration | Supertest, test database |
| **E2E tests** | Full API flows | Playwright, Cypress |
| **Contract tests** | API contract verification | Pact, custom tooling |
| **Load tests** | Performance under load | k6, Artillery |

### 10.2 Testing Best Practices

- **Test each endpoint** — every endpoint has test coverage
- **Test all operations** — CRUD operations for each content type
- **Test authentication** — auth flows, token validation, permission checks
- **Test error cases** — validation errors, not found, forbidden, etc.
- **Test edge cases** — pagination, filtering, sorting, population
- **Test localization** — different locales, fallback behavior
- **Test rate limiting** — rate limit responses, retry-after headers

---

## 11. API Security

### 11.1 Security Measures

API security is implemented at multiple levels:

| Security Measure | Implementation |
|-----------------|---------------|
| **Authentication** | JWT tokens, API tokens, session-based |
| **Authorization** | RBAC with fine-grained permissions |
| **Input validation** | Zod schemas, class-validator decorators |
| **Rate limiting** | Token bucket, sliding window |
| **CORS** | Configured CORS headers |
| **Security headers** | Helmet.js, CSP headers |
| **Audit logging** | Log all API access for audit |
| **Dependency scanning** | Regular dependency security scans |

### 11.2 API Security Best Practices

- **Never expose API keys** — API keys are stored securely, never in code
- **Use HTTPS** — all API traffic is over HTTPS
- **Validate all input** — all input is validated before processing
- **Sanitize output** — output is sanitized to prevent injection
- **Log security events** — authentication failures, authorization failures, rate limit violations
- **Monitor for abuse** — detect and respond to abuse patterns

---

## 12. References

### Internal

- `docs/architecture/README.md` — Architecture manifest
- `docs/architecture/api-architecture.md` — API architecture overview
- `docs/cms/README.md` — CMS architecture overview
- `docs/cms/CONTENT_MODELING.md` — CMS content modeling
- `docs/api/` — API documentation
- `apps/cms/` — Strapi application
- `apps/backend/` — NestJS BFF application

### External

- Strapi Documentation — CMS reference
- Strapi REST API Documentation — API reference
- Strapi GraphQL Documentation — GraphQL reference
- Strapi Plugins Documentation — Plugin reference
- OWASP API Security Top 10 — API security reference

---

*This document is the architecture of the HEXA STUDIO CMS API. It defines how the REST and GraphQL APIs are structured, how authentication and authorization work, how rate limiting is implemented, how errors are handled, how APIs are documented, how they're tested, and how they're versioned.*
