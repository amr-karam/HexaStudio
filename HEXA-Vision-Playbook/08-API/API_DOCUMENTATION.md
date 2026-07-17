# 📚 API Documentation

**Version:** 1.0 | **Last Updated:** 2026-07-16 | **Status:** Active

## Getting Started

### Base URL
```
https://api.hexastudio.net/api/v1
```

### Authentication
All endpoints (except public) require Bearer token:
```
Authorization: Bearer {access_token}
```

See: [Authorization](./AUTHORIZATION.md)

---

## Core Resources

### Users
- `GET /users` - List users (admin only)
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user account

### Projects
- `GET /projects` - List portfolio projects
- `GET /projects/:id` - Get project details
- `POST /projects` - Create new project
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Leads
- `GET /leads` - List leads (admin/sales)
- `POST /leads` - Capture new lead
- `PATCH /leads/:id` - Update lead status

### Search
- `GET /search` - Vector search across projects
- Query: `?q=query&limit=10`

---

## Response Format

All successful responses use this envelope:
```json
{
  "status": "success",
  "data": { /* resource data */ },
  "meta": {
    "timestamp": "2026-07-16T10:00:00Z",
    "request_id": "uuid"
  }
}
```

---

## Error Responses

```json
{
  "status": "error",
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Validation failed",
      "field": "email"
    }
  ],
  "meta": { /* ... */ }
}
```

See: [Error Codes](./error-codes.md)

---

## Pagination

List endpoints support pagination:
```
GET /projects?page=1&limit=20

Response includes:
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Rate Limiting

- **Limit:** 100 requests/minute
- **Headers:**
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1626433200`

---

## Tools

- **Interactive:** Swagger UI at `/docs`
- **Download:** OpenAPI spec at `/docs/openapi.json`
- **Testing:** Postman collection available

---

## Related Documentation

- [Authorization](./AUTHORIZATION.md)
- [API Standards](../06-STANDARDS/API_STANDARDS.md)
- [Error Codes](./error-codes.md)
