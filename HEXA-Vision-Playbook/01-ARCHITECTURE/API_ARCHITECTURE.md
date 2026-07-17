# 🔌 API Architecture

**Version:** 1.0 | **Last Updated:** 2026-07-16 | **Owner:** Chief Architect

## Overview

The HEXA Studio API architecture defines a modern, scalable approach to building RESTful APIs using NestJS, with clear separation of concerns, robust error handling, and comprehensive documentation.

---

## Core Principles

### 1. **Layered Architecture**
All APIs follow a strict layered pattern:
- **Controllers:** Request handling and response formatting
- **Services:** Business logic and domain operations
- **Repositories:** Data access and persistence
- **DTOs:** Data validation and transfer objects

### 2. **Single Responsibility**
Each layer has one reason to change:
- Controller changes when request format changes
- Service changes when business logic evolves
- Repository changes when data storage evolves

### 3. **Type Safety**
- TypeScript with `strict: true`
- All endpoints must have typed request/response DTOs
- No `any` types allowed

---

## API Endpoints Structure

### Resource-Based URLs
```
GET    /api/v1/resources          # List
GET    /api/v1/resources/:id      # Retrieve
POST   /api/v1/resources          # Create
PATCH  /api/v1/resources/:id      # Partial update
DELETE /api/v1/resources/:id      # Delete
```

### Response Format
```json
{
  "status": "success|error",
  "data": {},
  "errors": [],
  "meta": {
    "timestamp": "2026-07-16T10:00:00Z",
    "request_id": "uuid"
  }
}
```

---

## Error Handling

All errors use consistent HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate, state violation)
- `500` - Internal Server Error

---

## Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Scope-based permissions
- Token expiration and refresh strategy

See: [Authentication Flow](./authentication-flow.md)

---

## API Versioning

- **Strategy:** URL-based versioning (`/api/v1/`, `/api/v2/`)
- **Lifecycle:** Major versions support minimum 12 months
- **Deprecation:** 6-month notice before EOL

See: [API Versioning](../08-API/VERSIONING.md)

---

## Performance Considerations

- **Pagination:** Default 20 items, max 100
- **Caching:** Cache headers for idempotent GETs
- **Rate Limiting:** 100 requests/minute per IP
- **Compression:** All responses gzip-compressed

---

## Related Documentation

- [API Standards](../06-STANDARDS/API_STANDARDS.md)
- [API Documentation](../08-API/API_DOCUMENTATION.md)
- [Authorization](../08-API/AUTHORIZATION.md)
- [CODING_STANDARDS.md](../06-STANDARDS/CODING_STANDARDS.md)
