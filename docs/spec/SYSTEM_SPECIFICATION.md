# HEXA STUDIO — SYSTEM SPECIFICATION

**Version:** 2.1.5  
**Date:** 2026-08-09  
**Status:** Active — Production-Ready

---

## 1. PURPOSE
This document defines the canonical specification for the HEXA STUDIO platform, ensuring architectural alignment with the production-deployed v2.1.4 system. It supersedes all previous specification drafts.

## 2. SYSTEM BOUNDARIES
- **Public-Facing:** `hexastudio.net` (Portfolio, Projects, Contact, Blog)
- **Client Portal:** `portal.hexastudio.net` (Portal v3.0, Approvals, Deliverables, Invoices)
- **Internal:** `apps/backend` (NestJS 11 BFF), `apps/cms` (Strapi 5), `apps/mobile` (Expo)

## 3. TECHNICAL STACK
- **Frontend:** Next.js 16.2.11 (App Router), React 19, TypeScript 5.8+, TailwindCSS 4, Zustand/TanStack Query.
- **Backend:** NestJS 11, Socket.io, JWT.
- **CMS:** Strapi 5 (PostgreSQL 16).
- **ERP:** Odoo 17.0.
- **Infrastructure:** Traefik v3, Cloudflared Tunnel, Docker/Compose, MinIO (S3), Redis 7.

## 4. KEY FEATURES
- **Luxury Showcase:** WebGL 3D/R3F experiences, cinematic scroll.
- **Digital HQ:** 5-second executive clarity grid, S3 presigned deliverables.
- **Spatial Intelligence:** Gemini 2.5 Flash agents, material inspector, autonomous scoring.

## 5. NON-FUNCTIONAL REQUIREMENTS
- **Performance:** LCP <2.5s, INP <200ms, CLS <0.1, TBT <200ms, TTFB <800ms.
- **Accessibility:** WCAG 2.1 AAA (per `docs/accessibility/ACCESSIBILITY.md`).
- **Security:** OWASP Top 10 compliance, zero-trust network.

## 6. QUALITY GATES
- Frontend (207/207), Backend (339/339), Mobile (25/25) tests passing.
- 0 lint errors, 0 typecheck warnings.

## 7. FINAL READINESS VERDICT: READY FOR PRODUCTION

## 8. REFERENCES
- [/AGENTS.md](../../AGENTS.md)
- [/GOVERNANCE.md](../../GOVERNANCE.md)
- [/ARCHITECTURE.md](../../ARCHITECTURE.md)
- [/PROJECT_STATUS.md](../../PROJECT_STATUS.md)
