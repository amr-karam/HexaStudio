# Client Portal API

**Base:** `/v1/portal`

All portal endpoints require client authentication (JWT with `client` role).

---

## List Client Projects

```http
GET /v1/portal/projects
Authorization: Bearer <client_token>
```

### Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Sunset Villa Project",
      "description": "Modern residential project",
      "status": "in_progress",
      "progress": 65,
      "thumbnail": "https://cdn.hexastudio.net/projects/sunset-villa/thumb.webp",
      "nextMilestone": {
        "title": "Final Renderings",
        "date": "2026-08-01"
      },
      "unreadFiles": 3,
      "updatedAt": "2026-07-08T12:00:00Z"
    }
  ]
}
```

---

## Get Project Detail

```http
GET /v1/portal/projects/:id
Authorization: Bearer <client_token>
```

### Response (200)

```json
{
  "data": {
    "id": "uuid",
    "title": "Sunset Villa Project",
    "description": "Full project description",
    "status": "in_progress",
    "progress": 65,
    "team": [
      { "name": "Jane Doe", "role": "Lead Architect", "avatar": "https://..." },
      { "name": "John Smith", "role": "3D Artist", "avatar": "https://..." }
    ],
    "milestones": [
      {
        "title": "Concept Design",
        "date": "2026-06-15",
        "completed": true,
        "description": "Initial concept design presentation"
      },
      {
        "title": "Detailed Drawings",
        "date": "2026-07-15",
        "completed": false,
        "progress": 80
      },
      {
        "title": "Final Renderings",
        "date": "2026-08-01",
        "completed": false,
        "progress": 0
      }
    ],
    "timeline": {
      "startDate": "2026-06-01",
      "estimatedEndDate": "2026-09-01",
      "totalDays": 92,
      "elapsedDays": 37
    }
  }
}
```

---

## List Project Files

```http
GET /v1/portal/projects/:id/files
Authorization: Bearer <client_token>
```

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| type | string | all | Filter by file type (image, document, model) |
| sort | string | newest | Sort order |

### Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Living_Room_Render_01.png",
      "type": "image",
      "size": 2450000,
      "url": "https://cdn.hexastudio.net/projects/uuid/living-room-01.png",
      "thumbnailUrl": "https://cdn.hexastudio.net/projects/uuid/living-room-01-thumb.png",
      "uploadedBy": "Jane Doe",
      "uploadedAt": "2026-07-05T14:00:00Z",
      "downloads": 2
    }
  ],
  "meta": {
    "total": 15,
    "totalSize": 45000000
  }
}
```

---

## Upload File

```http
POST /v1/portal/projects/:id/files
Authorization: Bearer <client_token>
Content-Type: multipart/form-data

file: <binary>
```

### Response (201)

```json
{
  "data": {
    "id": "uuid",
    "name": "reference_image.jpg",
    "type": "image",
    "size": 1200000,
    "url": "https://cdn.hexastudio.net/projects/uuid/reference-image.jpg",
    "uploadedAt": "2026-07-08T12:00:00Z"
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Invalid file type or size exceeds limit |
| 413 | File too large (max 100MB) |

---

## List Notifications

```http
GET /v1/portal/notifications?page=1&pageSize=20
Authorization: Bearer <client_token>
```

### Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "type": "milestone_completed",
      "title": "Concept Design Completed",
      "message": "The concept design phase has been completed for Sunset Villa.",
      "read": false,
      "projectId": "uuid",
      "createdAt": "2026-07-08T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 12,
    "unread": 3
  }
}
```

---

## Mark Notification as Read

```http
PUT /v1/portal/notifications/:id/read
Authorization: Bearer <client_token>
```

### Response (200)

```json
{
  "data": {
    "id": "uuid",
    "read": true
  }
}
```

---

## Mark All Notifications as Read

```http
PUT /v1/portal/notifications/read-all
Authorization: Bearer <client_token>
```

### Response (200)

```json
{
  "data": {
    "markedRead": 3
  }
}
```
