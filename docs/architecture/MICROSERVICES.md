# 🏗️ Microservices Architecture

**Version:** 1.0 | **Last Updated:** 2026-07-16 | **Owner:** Chief Architect

## Overview

While HEXA Studio currently operates as a modular monolith, the architecture is designed for evolutionary migration to microservices. This document outlines the current structure and future-proofing strategies.

---

## Current State: Modular Monolith

### Why Not Full Microservices?
- **Scale:** Team is small enough for effective monolith management
- **Complexity:** Reduces operational overhead
- **Performance:** No network latency between modules
- **Cost:** Single deployment pipeline
- **Tradeoff:** Clear module boundaries enable future decomposition

### Module Organization
```
apps/backend/src/modules/
├── auth/              # Authentication & Authorization
├── users/             # User management
├── projects/          # Portfolio project management
├── leads/             # Lead capture & CRM integration
├── portfolio/         # Portfolio display
├── common/            # Shared utilities, interceptors, filters
└── integrations/      # External service adapters
```

---

## Service Boundaries

Each module represents a potential future microservice with clear responsibilities:

### 1. **Auth Service**
- JWT generation and validation
- OAuth provider integration
- Session management
- Permission validation

### 2. **User Service**
- User CRUD operations
- Profile management
- Settings and preferences
- Role assignment

### 3. **Project Service**
- Portfolio project management
- 3D asset storage and retrieval
- Project metadata
- Search and filtering

### 4. **Lead Service**
- Lead capture from website
- Odoo CRM sync
- Lead scoring and qualification
- Conversion tracking

### 5. **Integration Service**
- Odoo API calls
- External service adapters
- Webhook handling
- Event publishing

---

## Communication Patterns

### Synchronous Communication
Used for immediate responses, within 200ms latency budget:
```
HTTP/REST → Service-to-Service Calls
```

### Asynchronous Communication
Used for non-blocking operations:
```
Event Bus → Background Jobs → Persistence
```

### Data Consistency
- **Eventual Consistency:** Used for cross-service updates
- **ACID Transactions:** Within single service boundaries
- **Saga Pattern:** For distributed transactions (future)

---

## Shared Infrastructure

### Databases
- **PostgreSQL:** Main relational data
- **Redis:** Caching and session store
- **Qdrant:** Vector embeddings

### Communication
- **Event Bus:** NestJS EventEmitter (in-memory, future: Redis)
- **Message Queue:** Background jobs (future: Bull/Redis)

### Observability
- **Logging:** Winston (structured, JSON format)
- **Monitoring:** Prometheus metrics
- **Tracing:** Distributed tracing (future)

---

## Evolution Path to Microservices

### Phase 1: Current (Monolith)
- Modular structure with clear boundaries
- Event-based communication

### Phase 2: Independent Deployments
- Each module deployable independently
- Shared database (temporary)

### Phase 3: Service Decomposition
- Separate databases per service
- Event-driven synchronization

### Phase 4: Containerized Services
- Docker-based deployment
- Kubernetes orchestration
- Service mesh (Istio)

---

## Anti-Patterns to Avoid

❌ **Distributed Monolith:** All services must work together to deploy  
❌ **Chatty Services:** Services calling each other excessively  
❌ **Shared Databases:** Services with direct database access across boundaries  
❌ **Tight Coupling:** Services depend on implementation details  

---

## Related Documentation

- [Backend Architecture](./backend-architecture.md)
- [Integration Architecture](./INTEGRATION_ARCHITECTURE.md)
- [System Architecture](./SYSTEM_ARCHITECTURE.md)
