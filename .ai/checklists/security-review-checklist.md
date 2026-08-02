# CHECKLIST: SECURITY REVIEW

- [ ] Zero secrets or API credentials in repository source code.
- [ ] CSP headers configured correctly in `next.config.ts`.
- [ ] Server-side authentication and authorization enforced on NestJS endpoints.
- [ ] Input validation applied via `class-validator` DTOs.
- [ ] PostgreSQL and Redis isolated from public network exposure.
