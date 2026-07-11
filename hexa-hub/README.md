# HEXA Hub — Enterprise Communication Platform
Version 2.0

## Overview
HEXA Hub is the unified communication and collaboration platform for the HEXA Studio ecosystem. It serves as the central workspace where clients, employees, AI Agents, the Website, and Odoo converge.

**HEXA Hub is NOT a chat application; it is the operational center of the company.**

## Platform Identity
- **Platform Name:** HEXA Hub
- **Primary Domain:** `https://hub.hexastudio.net`
- **Brand:** HEXA Studio

## Core Objectives
1. **Unified Experience:** A single point of entry for all stakeholders.
2. **Centralized Communication:** Integrated inbox for email, web messages, internal chat, and AI.
3. **Collaborative Workspaces:** Dedicated spaces for projects, including approvals, tasks, and documents.
4. **AI-Driven Productivity:** Integrated AI assistants for summaries, action items, and knowledge retrieval.
5. **Odoo Synergy:** Real-time synchronization with CRM, Projects, Sales, and Invoices.

## System Architecture
The platform follows a decoupled microservices-inspired architecture:
- **Frontend (`apps/web`):** Next.js application.
- **API Gateway (`apps/api`):** NestJS backend managing business logic and integrations.
- **Realtime Server (`apps/realtime`):** Socket.IO server for instant communication.
- **Worker (`apps/worker`):** Background processing for emails, notifications, and AI tasks.

## Tech Stack
- **Frontend:** Next.js, React, TypeScript, TailwindCSS.
- **Backend:** NestJS, PostgreSQL, Redis.
- **Realtime:** Socket.IO, Redis Pub/Sub.
- **Storage:** MinIO (S3 Compatible).
- **Auth:** JWT, RBAC.
- **DevOps:** Docker, Nginx, Prometheus, Grafana, Loki, Uptime Kuma.

## Project Structure
\`\`\`
hexa-hub/
├── apps/
│   ├── web/        # Next.js Frontend
│   ├── api/        # NestJS Backend API
│   ├── realtime/   # Socket.IO Realtime Server
│   └── worker/     # Background Worker
├── packages/       # Shared libraries (types, utils, ui)
├── docs/           # Architecture and User Documentation
├── docker/         # Docker configurations
├── scripts/        # Utility scripts
└── tests/          # E2E and Unit tests
\`\`\`
