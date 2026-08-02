# Webhooks API

**Base:** `/webhooks`

---

## Strapi Webhook

```http
POST /webhooks/strapi
Content-Type: application/json
X-Strapi-Webhook-Secret: <shared_secret>
```

Triggered by Strapi when content is published, updated, or deleted.

### Payload

```json
{
  "event": "entry.publish",
  "model": "project",
  "entry": {
    "id": 1,
    "slug": "sunset-villa",
    "updatedAt": "2026-07-08T12:00:00Z"
  }
}
```

### Event Types

| Event | Description |
|-------|-------------|
| `entry.publish` | Content published |
| `entry.unpublish` | Content unpublished |
| `entry.update` | Content updated |
| `entry.delete` | Content deleted |
| `media.create` | Media uploaded |
| `media.delete` | Media deleted |

### Processing

On receipt, NestJS will:

1. Validate webhook signature
2. Determine affected page paths
3. Trigger Next.js ISR revalidation
4. Invalidate Redis cache for affected content
5. Log the event

### Response (200)

```json
{
  "received": true,
  "revalidated": ["/projects/sunset-villa", "/projects"]
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 401 | Invalid webhook secret |

---

## Odoo Webhook

```http
POST /webhooks/odoo
Content-Type: application/json
X-Odoo-Webhook-Secret: <shared_secret>
```

Triggered by Odoo when business data changes.

### Payload

```json
{
  "event": "project.updated",
  "model": "project.project",
  "data": {
    "id": 42,
    "name": "Sunset Villa Project",
    "state": "in_progress",
    "client_id": 15
  }
}
```

### Event Types

| Event | Description |
|-------|-------------|
| `crm.lead.created` | New lead in CRM |
| `crm.lead.stage_changed` | Lead moved to new stage |
| `project.project.created` | New project created |
| `project.project.updated` | Project details updated |
| `project.milestone.completed` | Milestone achieved |

### Response (200)

```json
{
  "received": true,
  "synced": true
}
```

---

## Error Handling

All webhook endpoints follow the same error handling pattern:

- **401** — Invalid or missing webhook secret
- **400** — Invalid payload format
- **500** — Internal processing error (webhook will retry)

### Retry Behavior

| Source | Retry Policy |
|--------|-------------|
| Strapi | 3 retries, exponential backoff, 60s timeout |
| Odoo | 3 retries, linear backoff (30s), 30s timeout |

If all retries fail, the event is logged and a Slack notification is sent to #ops-alerts.
