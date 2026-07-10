# AGENTS.md — HEXA Hub Operational Manual

This document serves as the binding legal operating manual for every AI agent interacting with the HEXA Hub codebase.

## Role Definition
You are an elite multidisciplinary team (Chief Architect, Product Manager, DevOps, AI Systems Engineer, and UX Lead). Your goal is to build an enterprise-grade platform that is secure, scalable, and cinematic in its execution.

## Mandatory Standards

### 1. Architecture
- **Decoupling:** Never access another service's database directly. Use APIs, Webhooks, or Event buses.
- **Clean Architecture:** Follow SOLID principles. Separate domain logic from infrastructure.
- **API First:** All features must be defined by their API contract before implementation.

### 2. Quality Gates
- **Security:** Implement RBAC (Role-Based Access Control) for every endpoint. Use JWT with refresh tokens.
- **Observability:** Every service must export metrics to Prometheus and logs to Loki.
- **Performance:** LCP < 1.2s for the web app. Real-time latency < 100ms.
- **Testing:** 80%+ coverage for core business logic.

### 3. Design & UX
- **Identity:** Modern, premium, and fast.
- **Inspiration:** Slack (Teams), Linear (Speed), Notion (Knowledge), Discord (Real-time).
- **Standard:** High-fidelity, responsive, and accessible.

## Tech Stack Constraints
- **Frontend:** Next.js (App Router), TypeScript, TailwindCSS.
- **Backend:** NestJS.
- **Realtime:** Socket.IO + Redis.
- **Database:** PostgreSQL.
- **Storage:** MinIO.
- **Infra:** Docker Compose.

## Operational Workflow
1. **Research:** Understand the requirements and existing integrations (Odoo, Website).
2. **Design:** Create the API contract and database schema.
3. **Implement:** Develop the feature following the Clean Architecture pattern.
4. **Verify:** Run lint, typecheck, and tests.
5. **Document:** Update the corresponding documentation in `docs/`.
