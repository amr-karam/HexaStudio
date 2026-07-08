# Contacts / CRM API

**Base:** `/v1/contacts`

---

## Submit Contact Form

```http
POST /v1/contacts
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "service": "residential",
  "budget": "100k-500k",
  "message": "I'm interested in a residential project.",
  "source": "website"
}
```

### Response (201)

```json
{
  "data": {
    "id": "uuid",
    "message": "Thank you! We'll be in touch within 24 hours."
  }
}
```

### Internal Processing

On successful submission:

1. Save contact to PostgreSQL
2. Push opportunity to Odoo CRM
3. Send notification to sales team (Slack + Email)
4. Log analytics event

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Validation error |
| 429 | Too many submissions |

---

## List Contacts (Admin)

```http
GET /v1/contacts?status=new&page=1&pageSize=20
Authorization: Bearer <admin_token>
```

### Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "status": "new",
      "service": "residential",
      "createdAt": "2026-07-08T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Convert to Lead (Admin)

```http
POST /v1/contacts/:id/convert
Authorization: Bearer <admin_token>
```

### Response (200)

```json
{
  "data": {
    "contactId": "uuid",
    "odooOpportunityId": 1234,
    "status": "converted"
  }
}
```
