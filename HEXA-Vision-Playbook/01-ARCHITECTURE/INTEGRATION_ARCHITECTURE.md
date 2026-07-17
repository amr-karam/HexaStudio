# 🔗 Integration Architecture

**Version:** 1.0 | **Last Updated:** 2026-07-16 | **Owner:** Backend Lead

## Overview

Integration architecture defines how HEXA Studio components communicate, both internally (within the monorepo) and externally (with third-party services and client systems).

---

## Internal Integration Patterns

### 1. **Event-Driven Architecture**
Services communicate through event streams:
- **Event Bus:** NestJS event emitter for cross-module communication
- **Event Types:** Domain events (ProjectCreated, LeadCaptured, etc.)
- **Subscribers:** Services subscribe to relevant domain events

```typescript
// Publishing an event
this.eventEmitter.emit('project.created', new ProjectCreatedEvent(projectId));

// Subscribing to events
@OnEvent('project.created')
handleProjectCreated(event: ProjectCreatedEvent) {
  // Business logic
}
```

### 2. **Service-to-Service Communication**
- **HTTP/REST:** For synchronous operations
- **Message Queue:** For asynchronous tasks (background jobs, notifications)
- **Shared Types:** All DTOs defined in `/packages/types`

### 3. **Data Synchronization**
- **Bidirectional Sync:** Website ↔ Odoo CRM
- **Event Sourcing:** Audit trail of all state changes
- **Reconciliation:** Periodic sync validation

---

## External Integration Points

### 1. **Odoo CRM Integration**
- **Protocol:** XML-RPC
- **Sync Direction:** Bidirectional (leads, projects, contacts)
- **Frequency:** Real-time for critical events, hourly for bulk syncs
- **Documentation:** [Odoo Integration](../09-ODOO/architecture.md)

### 2. **Third-Party Services**

| Service | Purpose | Auth | Status |
|---------|---------|------|--------|
| OpenAI | Embeddings, AI analysis | API Key | Active |
| Stripe | Payment processing | API Keys | Future |
| SendGrid | Email notifications | API Key | Future |
| Qdrant | Vector database | Bearer Token | Active |

### 3. **API Client Integrations**
- **Webhooks:** Notify clients of state changes
- **API Keys:** For programmatic access
- **Rate Limiting:** Per-client quotas

---

## Integration Patterns

### 1. **Adapter Pattern**
External services wrapped in adapters:
```
OpenAI Service → Adapter → Domain Service → Controllers
```

### 2. **Repository Pattern**
Data access abstraction:
```
Database → Repository → Service → Controller
```

### 3. **Message Queue Pattern**
Asynchronous task processing:
```
Event → Queue → Worker → Persistence
```

---

## Error Handling in Integrations

- **Retries:** Exponential backoff (3 attempts)
- **Fallbacks:** Graceful degradation when services unavailable
- **Logging:** All integration calls logged for debugging
- **Monitoring:** Integration health checked every 5 minutes

---

## Security

- **API Keys:** Stored in environment variables, never in code
- **TLS:** All external communications encrypted
- **Rate Limiting:** Applied to all integration endpoints
- **Audit Trail:** All integration actions logged

---

## Related Documentation

- [Odoo Integration](../09-ODOO/architecture.md)
- [Backend Architecture](./backend-architecture.md)
- [API Architecture](./API_ARCHITECTURE.md)
