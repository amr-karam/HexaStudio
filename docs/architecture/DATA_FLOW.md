# Data Flow - HEXA STUDIO

## Request/Response Life Cycle
1. **Client Request:** User initiates action in Next.js frontend.
2. **API Interaction:** Frontend calls Backend API (NestJS) for data/logic operations.
3. **Backend Processing:** NestJS authenticates, validates, and authorizes the request.
4. **Data Synchronization (Odoo):** Backend updates/queries Odoo via custom module endpoints (XML-RPC or REST).
5. **Persistence/Retrieval:** Backend updates PostgreSQL, caches in Redis, or manages assets in MinIO.
6. **Response:** Backend returns structured data; frontend updates state/UI.

## Real-time Communication
- **Socket.io:** Used for real-time updates between Frontend and Backend (e.g., project status updates, collaborative features).

## Consistency Constraints
- Odoo is the source of truth for Project and Partner records.
- Backend database (PostgreSQL) caches non-ERP state and handles local performance-critical data.
- MinIO handles raw media/project assets referenced by ID in Odoo/PostgreSQL.
