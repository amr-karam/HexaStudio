# 🌐 API Standards

**Version:** 1.0 | **Last Updated:** 2026-07-16 | **Scope:** All REST API Endpoints

## RESTful Design Principles

### Resource-Oriented Design
- Use nouns for resources: `/projects`, `/users`, `/leads`
- Use HTTP methods for operations: GET, POST, PATCH, DELETE
- Avoid verbs in URLs: `/projects` not `/getProjects`

### HTTP Status Codes
```
200 OK              - Successful GET, PATCH, DELETE
201 Created         - Successful POST
204 No Content      - Successful DELETE
400 Bad Request     - Validation error
401 Unauthorized    - Missing/invalid authentication
403 Forbidden       - Insufficient permissions
404 Not Found       - Resource doesn't exist
409 Conflict        - State violation (duplicate, dependency)
422 Unprocessable   - Semantic error
429 Too Many        - Rate limit exceeded
500 Internal Error  - Server error
```

---

## Request/Response Format

### Request Headers
```
Content-Type: application/json
Authorization: Bearer {token}
X-Request-ID: {uuid}  # For tracing
```

### Response Envelope
```json
{
  "status": "success|error",
  "data": {},           // Response payload
  "errors": [],         // Error details if status=error
  "meta": {
    "timestamp": "2026-07-16T10:00:00Z",
    "request_id": "uuid",
    "api_version": "v1"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Email is invalid",
      "field": "email"
    }
  ],
  "meta": { ... }
}
```

---

## Pagination

```
GET /api/v1/projects?page=1&limit=20&sort=-created_at

Response:
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Constraints:**
- Default limit: 20
- Max limit: 100
- Min limit: 1

---

## Filtering & Searching

### Query Parameters
```
GET /api/v1/projects?status=active&category=web&search=portfolio
```

### Operators
```
field=value           # Exact match
field[gte]=10         # Greater than or equal
field[lte]=100        # Less than or equal
field[contains]=text  # Text contains
field[in]=a,b,c       # In array
```

---

## Rate Limiting

All endpoints rate-limited to **100 requests/minute** per IP:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1626433200
```

---

## Versioning

- **Current Version:** v1
- **URL Pattern:** `/api/v1/`
- **Deprecation Timeline:** 12 months notice before EOL
- **Support:** Latest version only receives features

---

## Documentation Standards

All endpoints must document:
1. Purpose and use case
2. Authentication requirements
3. Request body/parameters
4. Response examples
5. Possible errors
6. Related endpoints

See: [API Documentation](../08-API/API_DOCUMENTATION.md)

---

## Related Documentation

- [API Architecture](../01-ARCHITECTURE/API_ARCHITECTURE.md)
- [Authorization](../08-API/AUTHORIZATION.md)
- [CODING_STANDARDS.md](./CODING_STANDARDS.md)
