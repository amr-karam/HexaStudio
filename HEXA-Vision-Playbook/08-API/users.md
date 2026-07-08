# Users API

**Base:** `/v1/users`

---

## List Users (Admin)

```http
GET /v1/users?page=1&pageSize=20&role=client
Authorization: Bearer <admin_token>
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| pageSize | number | 20 | Items per page |
| role | string | — | Filter by role |
| search | string | — | Search by name or email |
| status | string | all | Filter by active/inactive |

### Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "email": "client@example.com",
      "name": "John Doe",
      "roles": ["client"],
      "active": true,
      "lastLogin": "2026-07-07T10:00:00Z",
      "createdAt": "2026-06-01T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## Get User (Admin)

```http
GET /v1/users/:id
Authorization: Bearer <admin_token>
```

### Response (200)

```json
{
  "data": {
    "id": "uuid",
    "email": "client@example.com",
    "name": "John Doe",
    "roles": ["client"],
    "active": true,
    "lastLogin": "2026-07-07T10:00:00Z",
    "createdAt": "2026-06-01T12:00:00Z",
    "metadata": {
      "company": "Acme Corp",
      "phone": "+1234567890"
    }
  }
}
```

---

## Update User (Admin)

```http
PUT /v1/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "John Updated",
  "active": true,
  "metadata": {
    "company": "Acme Corp Updated"
  }
}
```

### Response (200)

```json
{
  "data": {
    "id": "uuid",
    "email": "client@example.com",
    "name": "John Updated",
    "roles": ["client"],
    "active": true
  }
}
```

---

## Delete User (Admin)

```http
DELETE /v1/users/:id
Authorization: Bearer <admin_token>
```

### Response (204)

No content. User is soft-deleted (active = false) and data anonymized after 90 days per GDPR.

---

## Update Roles (Superadmin)

```http
PUT /v1/users/:id/roles
Authorization: Bearer <superadmin_token>
Content-Type: application/json

{
  "roles": ["client", "editor"]
}
```

### Response (200)

```json
{
  "data": {
    "id": "uuid",
    "email": "client@example.com",
    "roles": ["client", "editor"]
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 403 | Only superadmin can modify roles |
| 422 | Cannot remove last superadmin |

---

## Errors

| Status | Condition |
|--------|-----------|
| 400 | Invalid input |
| 403 | Insufficient permissions |
| 404 | User not found |
| 409 | Email already in use |
