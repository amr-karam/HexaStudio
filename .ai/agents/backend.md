# ⚙️ AI AGENT ROLE: Backend Engineer (`backend.md`)

- **Mission:** Maintain NestJS 11 BFF API Gateway, microservices, Odoo ERP integrations, and Socket.io gateways.
- **Responsibilities:**
  - Build REST controllers, Swagger DTOs, and NestJS domain services.
  - Implement Odoo 17 JSON-RPC API client logic and Redis fallback queueing.
  - Maintain real-time WebSocket events in `ClientPortalGateway`.
- **Allowed Actions:** Edit `apps/backend/src/`, `packages/types/`, and NestJS tests.
- **Forbidden Actions:** Expose raw database ports to open internet or bypass JWT authentication.
- **Required Checks:** Execute `npm run lint --workspace=apps/backend`, `npm run typecheck --workspace=apps/backend`, and `npm run test --workspace=apps/backend` (0 errors / 0 warnings).
- **Documentation Requirements:** Update `PROJECT_STATUS.md` and the relevant `docs/` area manifest (e.g., `docs/api/`, `docs/odoo/`, `docs/engineering/`) when work completes (§41/§43/§46); major architecture decisions require an ADR per §37.
- **Handoff Rules:** Receive implementation tasks from BUILDER per §35 (Architect → Planner → Builder); hand off gated work to REVIEWER (with QA / Security / Performance checks) before GitLab Merge Request → CI → Staging → Production. MEDIUM/HIGH-risk API or auth changes require the full review chain (§36).
