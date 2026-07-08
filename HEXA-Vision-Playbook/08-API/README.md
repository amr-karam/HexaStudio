# API Documentation

This directory contains API specifications and documentation for the HEXA Vision platform.

## API Architecture

The platform uses a **RESTful API** exposed by the NestJS Backend-for-Frontend (BFF) layer.

- **Base URL (Production):** `https://api.hexastudio.net/v1`
- **Base URL (Staging):** `https://api.staging.hexastudio.net/v1`
- **Base URL (Local):** `http://localhost:4000/v1`

## API Documentation

Interactive API documentation is available via Swagger:

- **Production:** `https://api.hexastudio.net/api/docs`
- **Staging:** `https://api.staging.hexastudio.net/api/docs`
- **Local:** `http://localhost:4000/api/docs`

## Contents

| File | Description |
|------|-------------|
| `endpoints.md` | Complete endpoint reference |
| `authentication.md` | Auth endpoint details |
| `projects.md` | Projects API |
| `contacts.md` | Contacts / CRM API |
| `content.md` | Content API (Strapi bridge) |
| `users.md` | Users and permissions API |
| `webhooks.md` | Webhook endpoints |
| `error-codes.md` | Standard error codes and responses |

## API Conventions

### Versioning

- API version in URL path: `/v1/`
- Breaking changes → new version (`/v2/`)
- Backward-compatible additions allowed within version

### Request/Response Format

```json
// Request
{
  "data": { ... },
  "meta": { ... }
}

// Success Response
{
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}

// Error Response (RFC 7807)
{
  "type": "https://api.hexastudio.net/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "email must be a valid email address",
  "instance": "/v1/contacts",
  "errors": [
    {
      "field": "email",
      "message": "must be a valid email"
    }
  ]
}
```

### Standard Headers

| Header | Description |
|--------|-------------|
| `Authorization: Bearer <token>` | JWT access token |
| `Content-Type: application/json` | Request body format |
| `Accept: application/json` | Response format |
| `X-Request-Id` | Trace ID (generated if not provided) |
| `X-Api-Version` | API version in use |
