# HEXA STUDIO — CONSTRAINTS

**Version:** 2.1.5  
**Date:** 2026-08-09  
**Last Verified:** 2026-08-09 — Technology reference audit (Next.js 16.2.11, WCAG 2.1 AAA)
**Status:** Active

---

## 1. PURPOSE
This document establishes the non-negotiable architectural and operational constraints governing the HEXA STUDIO platform.

## 2. ARCHITECTURE CONSTRAINTS (MUST)
- **Frontend:** Must use Next.js 16.2.11 App Router, React 19, TypeScript 5.8+.
- **Backend:** Must use NestJS 11, PostgreSQL 16.
- **Infrastructure:** Must use Traefik v3 + Cloudflared Tunnel; NO public port exposure for PG/Redis/Qdrant.
- **CI/CD:** Must use GitLab CE; GitHub CI is NOT authorized.

## 3. OPERATIONAL CONSTRAINTS (MUST)
- **Secrets:** MUST NOT commit secrets; MUST use env vars / Docker secrets.
- **Quality:** MUST pass all quality gates (backend 339, frontend 207, mobile 25); MUST have 0 lint/typecheck warnings.
- **Accessibility:** MUST comply with WCAG 2.1 AAA.

## 4. FINAL READINESS VERDICT: READY FOR PRODUCTION

## 5. REFERENCES
- [/GOVERNANCE.md](../../GOVERNANCE.md)
- [/docs/spec/SYSTEM_SPECIFICATION.md](SYSTEM_SPECIFICATION.md)
