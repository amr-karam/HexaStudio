# API Error Codes

---

## Standard Error Response Format

```json
{
  "type": "https://api.hexastudio.net/errors/{error-code}",
  "title": "Human-readable title",
  "status": 400,
  "detail": "Detailed explanation of the error",
  "instance": "/v1/resource",
  "timestamp": "2026-07-08T12:00:00Z",
  "errors": [
    {
      "field": "email",
      "message": "must be a valid email address",
      "code": "isEmail"
    }
  ]
}
```

## Error Codes by Category

### 400 — Bad Request

| Code | Title | Detail |
|------|-------|--------|
| `validation-error` | Validation Error | One or more fields failed validation |
| `invalid-content-type` | Invalid Content Type | Expected application/json |
| `missing-required-field` | Missing Required Field | A required field is missing |
| `invalid-uuid` | Invalid UUID | The provided ID is not a valid UUID |

### 401 — Unauthorized

| Code | Title | Detail |
|------|-------|--------|
| `missing-token` | Missing Authentication Token | No JWT provided |
| `invalid-token` | Invalid Token | Token is malformed or invalid |
| `expired-token` | Expired Token | Token has expired |
| `invalid-credentials` | Invalid Credentials | Email or password is incorrect |

### 403 — Forbidden

| Code | Title | Detail |
|------|-------|--------|
| `insufficient-permissions` | Insufficient Permissions | User role cannot access this resource |
| `resource-restricted` | Resource Restricted | User does not own this resource |

### 404 — Not Found

| Code | Title | Detail |
|------|-------|--------|
| `resource-not-found` | Resource Not Found | The requested resource does not exist |
| `endpoint-not-found` | Endpoint Not Found | The requested API endpoint does not exist |

### 409 — Conflict

| Code | Title | Detail |
|------|-------|--------|
| `duplicate-resource` | Duplicate Resource | Resource with this key already exists |
| `duplicate-email` | Email Already Registered | A user with this email already exists |
| `duplicate-slug` | Slug Already Exists | A resource with this slug already exists |

### 422 — Unprocessable Entity

| Code | Title | Detail |
|------|-------|--------|
| `business-rule-violation` | Business Rule Violation | Operation violates a business rule |
| `odoo-sync-failed` | Odoo Sync Failed | Could not sync with Odoo ERP |

### 429 — Too Many Requests

| Code | Title | Detail |
|------|-------|--------|
| `rate-limit-exceeded` | Rate Limit Exceeded | Too many requests, please slow down |
| `rate-limit-auth` | Auth Rate Limit | Too many authentication attempts |

### 500 — Internal Server Error

| Code | Title | Detail |
|------|-------|--------|
| `internal-error` | Internal Server Error | An unexpected error occurred |
| `database-error` | Database Error | A database operation failed |
| `external-service-error` | External Service Error | A downstream service failed |

### 503 — Service Unavailable

| Code | Title | Detail |
|------|-------|--------|
| `service-unavailable` | Service Unavailable | A required service is temporarily unavailable |
| `cms-unavailable` | CMS Unavailable | Strapi CMS is not responding |
| `odoo-unavailable` | Odoo Unavailable | Odoo ERP is not responding |

## Error Handling Rules

1. Never expose stack traces in production
2. Never expose internal implementation details
3. Always include a `type` URL that documents the error
4. Field-level errors include `field`, `message`, and `code`
5. Rate limit errors include `Retry-After` header
6. All errors include a `timestamp`
