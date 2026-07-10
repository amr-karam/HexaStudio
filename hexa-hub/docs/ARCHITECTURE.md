# HEXA Hub Architecture Blueprint

## 1. High-Level System Design
HEXA Hub is designed as a distributed system to ensure high availability, scalability, and strict separation of concerns.

### 1.1 Core Components
- **Web Frontend (`apps/web`):** Next.js 14 App Router. Handles the user interface, client-side state, and real-time sockets.
- **API Gateway (`apps/api`):** NestJS. The central brain. Manages auth, business logic, Odoo/Website integrations, and data persistence.
- **Realtime Server (`apps/realtime`):** Socket.IO + Redis. Handles instant messaging, presence, and live notifications.
- **Background Worker (`apps/worker`):** BullMQ + Redis. Handles long-running tasks (AI generation, email blasts, report generation).

## 2. Data Flow & Communication
### 2.1 Communication Patterns
- **Client $\rightarrow$ API:** REST / JSON over HTTPS.
- **Client $\rightarrow$ Realtime:** WebSockets (Socket.IO).
- **API $\rightarrow$ Realtime:** Redis Pub/Sub (to push events to specific users).
- **API $\rightarrow$ Worker:** Redis Queue (BullMQ).
- **External $\rightarrow$ API:** Webhooks (from Odoo, Website).

### 2.2 Integration Strategy
- **Odoo ERP:** Bi-directional sync via Odoo External API (XML-RPC/REST).
- **Website:** Webhook-driven lead and message ingestion.
- **AI Platform:** Integration via Gemini/OpenAI APIs for semantic search and automation.

## 3. Database Schema Strategy
- **Primary DB:** PostgreSQL (Relational data: Users, Projects, Messages, Permissions).
- **Cache/Queue:** Redis (Session management, Real-time state, Job queues).
- **Object Storage:** MinIO (Files, Documents, Media).

## 4. Security Model
- **Authentication:** JWT (Access + Refresh tokens) with secure HTTP-only cookies.
- **Authorization:** Granular RBAC (Role-Based Access Control).
  - `SUPER_ADMIN`: Full system access.
  - `EMPLOYEE`: Workspace and department access.
  - `CLIENT`: Project-specific workspace access.
- **Network:** All internal traffic within a Docker bridge network. External access only via Nginx Reverse Proxy.

## 5. Module Roadmap
### Phase 1: Foundation
- [ ] Auth & RBAC.
- [ ] Basic Project Workspaces.
- [ ] Real-time Messaging.

### Phase 2: Ecosystem Integration
- [ ] Odoo CRM/Project Sync.
- [ ] Website Lead Ingestion.
- [ ] Unified Inbox.

### Phase 3: Intelligence & Scale
- [ ] AI Assistant (Summaries & Search).
- [ ] Knowledge Center (Semantic Wiki).
- [ ] Executive Dashboard.
