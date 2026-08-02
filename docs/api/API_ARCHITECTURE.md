# 🌐 API ARCHITECTURE: THE DATA HIGHWAY

**Version:** 1.0 | **Scope:** Backend $\rightarrow$ Frontend | **Standard:** RESTful / Type-Safe / Performant

## 1. THE API PHILOSOPHY
Our API is not just a data source; it is a **BFF (Backend for Frontend)**. Its primary goal is to deliver the exact payload the UI needs, in the most efficient format, with zero unnecessary data.

---

## 2. ARCHITECTURAL PATTERNS

### I. The BFF Pattern (Backend for Frontend)
Instead of exposing the Strapi/Odoo APIs directly to the frontend, we use a NestJS BFF layer.
- **Aggregation:** The BFF fetches data from Strapi (CMS) and Odoo (ERP) and merges it into a single response.
- **Transformation:** The BFF transforms raw database entities into "View Models" optimized for the UI.
- **Security:** The BFF handles authentication and authorization, ensuring the frontend never talks to the DB directly.

### II. Type-Safe Contracts
The API is governed by a shared types package (`/packages/types`).
- **Symmetry:** A change in the Backend DTO must immediately be reflected in the Frontend Type.
- **Validation:** All incoming requests are validated using `class-validator` and `class-transformer`.

---

## 3. ENDPOINT DESIGN STANDARDS

### I. Naming & Structure
- **Resource-Based:** Use nouns, not verbs (e.g., `/projects` instead of `/getProjects`).
- **Versioning:** All endpoints must be versioned (e.g., `/api/v1/...`).
- **Kebab-Case:** Use kebab-case for URL paths (e.g., `/project-details`).

### II. Response Format
All responses must follow a consistent wrapper:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-07-08T10:00:00Z",
    "requestId": "req_12345"
  },
  "error": null
}
```

---

## 4. PERFORMANCE OPTIMIZATIONS

### I. Caching Strategy
- **Redis Layer:** Implement a Redis cache for static or slow-changing data (e.g., Project Portfolio).
- **Cache-Control:** Use appropriate `Cache-Control` headers for browser caching.
- **Invalidation:** Implement "Webhook-based Invalidation" (Strapi $\rightarrow$ BFF $\rightarrow$ Redis).

### II. Payload Optimization
- **Filtering:** Allow the frontend to request only the fields it needs (e.g., `?fields=id,name,thumbnail`).
- **Compression:** Enable Gzip/Brotli compression at the Traefik/Nginx level.

---

## 5. QUALITY GATE: API AUDIT
An endpoint is "API-Done" only when:
- [ ] The request/response types are defined in `/packages/types`.
- [ ] The response time is < 200ms.
- [ ] All input validation is implemented.
- [ ] The endpoint is documented in the Swagger/OpenAPI spec.

*“A great API is like a great waiter: it brings exactly what you need, exactly when you need it, and disappears.”*
