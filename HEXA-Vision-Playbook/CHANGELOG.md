# Playbook Changelog

**Version:** 1.0.0  
**Last Updated:** 2026-07-12  

---

## [1.0.0] - 2026-07-12

### Sprint 6 — Enterprise Hardening (COMPLETE)

**Security Hardening:**
- CMS admin IP allowlist middleware (admin-ip-guard + CMS_ALLOWED_IPS)
- Traefik dashboard secured (api.insecure: false, IP allowlist, TLS-only)
- CSP headers via Traefik middleware
- JWT + Redis authentication hardened

**Performance Optimization:**
- Lazy loading for Three.js/R3F/GSAP (home 188 kB, all routes ≤ 200 kB)
- Bundle budget enforced (first-load JS ≤ 200 kB on all routes)
- Lighthouse CI configured (LHCI + CI job targeting score > 90)

**Quality & Testing:**
- Backend tests: 67 specs across 14 files (auth, accounting, portal, requests, users, email, odoo, redis, health)
- Frontend component tests: 53 specs (Vitest + RTL for UI components, hooks, lib)
- Playwright E2E scaffold: Navigation, pages, 404, SEO, a11y
- Database backup verification: verify-backup.sh + backup-verify Docker service

**Infrastructure & CI/CD:**
- CI pipeline: Typecheck, lint, test, build jobs for monorepo workspaces
- CD pipeline: GHCR image build + SSH deploy to production server
- E2E in CI: Playwright job integrated
- Docker build fix: Build args + monorepo workspace build in Dockerfile

**Release:**
- All package versions aligned to 1.0.0 (frontend, backend, cms)
- CHANGELOG complete with v1.0.0 entry
- Sprint 6 (Enterprise Hardening) complete
- v1.0.0 release ready for tag

---

## [1.0.0] - 2026-07-08

### Added
- Root-level governance documents (README, Vision, Roadmap, Tech Stack, Architecture)
- Process documents (Dev Workflow, Git Workflow, Coding Standards, Doc Standards)
- Quality & Compliance guides (Security, Performance, Accessibility, SEO)
- Deployment & Release processes (Deployment, Release, Quality Gates)
- AI Agent Guide and Business Workflows
- Complete directory structure for the Playbook
- 14 Architecture Decision Records (ADRs)
- 10 API specifications (Auth, Projects, Contacts, Content, Users, Webhooks, Portal)
- 8 Agent-specific guides (Architect, Frontend, Backend, Odoo, DevOps, QA, Security)
- 8 detailed Standards documents (Design System, 3D Modeling, Animation, Logging, Testing, Error Handling)
- 10 Verification Checklists (Pre-commit, Pre-PR, Pre-release, Accessibility, etc.)
- 8 Prompt templates for AI agents
- 8 Document templates (Feature, PR, Meeting, Incident, Bug, etc.)
- Detailed Odoo integration guides (CRM, Projects, Documents, Data Models)
- Detailed DevOps runbooks (Infrastructure, Monitoring, Backup, Incident Response)
- Detailed Architecture docs (Frontend, Backend, CMS, Auth, Data Flow, Network, 3D Pipeline)
- Sprint structure and backlog
