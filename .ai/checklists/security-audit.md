# 🛡️ CHECKLIST: Security Audit

- [ ] Are API endpoints protected by `JwtAuthGuard` / `RolesGuard`?
- [ ] Are form payloads validated via Zod / Class-Validator?
- [ ] Are internal databases (Postgres, Redis, Qdrant) isolated from public ports?
- [ ] Are zero secrets committed to Git?
