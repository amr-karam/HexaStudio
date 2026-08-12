# HEXA STUDIO — ASSUMPTIONS

**Version:** 2.1.5  
**Date:** 2026-08-09  
**Last Verified:** 2026-08-09 — Technology reference audit (Next.js 16.2.11, WCAG 2.1 AAA)
**Status:** Active

---

## 1. PURPOSE
This document lists the critical operational and environmental assumptions under which the HEXA STUDIO platform is designed and maintained.

## 2. OPERATIONAL ASSUMPTIONS
- Production server (`19.16.1.100`) is reachable via secure SSH.
- GitLab CE CI/CD environment has adequate memory (8G+ for builds).
- Automated backup verification loop (`backup-verify-scheduled`) is functional and alerts are active in Alertmanager.

## 3. SECURITY ASSUMPTIONS
- All third-party API keys (Gemini, OpenAI, Odoo, Cloudflare) are current and injected securely.
- Internal network isolation (`hexastudio_internal`) is correctly enforced by Docker.

## 4. FINAL READINESS VERDICT: READY FOR PRODUCTION

## 5. REFERENCES
- [/docs/spec/SYSTEM_SPECIFICATION.md](SYSTEM_SPECIFICATION.md)
- [/PROJECT_STATUS.md](../../PROJECT_STATUS.md)
