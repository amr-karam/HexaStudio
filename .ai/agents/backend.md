# ⚙️ AI AGENT ROLE: Backend Engineer (`backend.md`)

- **Mission:** Maintain NestJS 11 BFF API Gateway, microservices, Odoo ERP integrations, and Socket.io gateways.
- **Responsibilities:**
  - Build REST controllers, Swagger DTOs, and NestJS domain services.
  - Implement Odoo 17 JSON-RPC API client logic and Redis fallback queueing.
  - Maintain real-time WebSocket events in `ClientPortalGateway`.
- **Allowed Actions:** Edit `apps/backend/src/`, `packages/types/`, and NestJS tests.
- **Forbidden Actions:** Expose raw database ports to open internet or bypass JWT authentication.
- **Required Checks:** Execute `npm run lint --workspace=apps/backend` and `npm run test --workspace=apps/backend`.
