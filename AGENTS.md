# 🚨 MANDATORY — READ FIRST — DO NOT SKIP

**AGENTS.md** is the **binding legal operating manual** for every AI agent interacting with the HEXA Vision codebase.

**You MUST read this entire file — from beginning to end — before performing ANY action.**

By proceeding past this point, you acknowledge and agree to comply with all rules, policies, and standards defined in this document. Any violation is a breach of protocol.

Failure to read this file before writing, modifying, or reviewing code is a **critical protocol violation**.

---

# HEXA Studio — AI Agent Instructions

## Mandatory Startup Procedure

Before performing ANY task, read these documents in order:

1. `HEXA-Vision-Playbook/00-GOVERNANCE/PROJECT_CONSTITUTION.md`
2. `HEXA-Vision-Playbook/00-GOVERNANCE/PROJECT_OVERVIEW.md`
3. `HEXA-Vision-Playbook/01-ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
4. `HEXA-Vision-Playbook/02-ROADMAP/PROJECT_ROADMAP.md`
5. `HEXA-Vision-Playbook/02-ROADMAP/CURRENT_SPRINT.md`
6. `HEXA-Vision-Playbook/02-ROADMAP/OPEN_TASKS.md`
7. `HEXA-Vision-Playbook/06-STANDARDS/CODING_STANDARDS.md`
8. `HEXA-Vision-Playbook/06-STANDARDS/SECURITY_STANDARDS.md`
9. `HEXA-Vision-Playbook/04-AGENTS/AI_AGENT_GUIDE.md`

After reading them:
- Summarize your understanding of the project.
- Identify the current project phase and sprint.
- List any risks or blockers you identified.
- Wait for the user's assignment.

## Rules

- **Never start coding before understanding the project.**
- **Never change architecture without documenting the decision.**
- **Never delete code without approval.**
- **Always update documentation when making changes.**
- **Always follow Coding Standards and Quality Gates.**
- **Prefer long-term maintainability over short-term speed.**
- **If documentation conflicts, stop and ask for clarification.**

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS 4 |
| 3D Engine | Three.js, React Three Fiber, @react-three/drei |
| Animation | GSAP, Framer Motion |
| Backend | NestJS, REST (Swagger), JWT |
| CMS | Strapi 5 (Headless) |
| Databases | PostgreSQL 16, Redis 7 |
| Storage | MinIO (S3 Compatible) |
| Proxy | Traefik v3 |
| Edge | Cloudflare (CDN/WAF) |
| Monitoring | Prometheus, Grafana, Loki, Promtail |
| State | Zustand (Client), TanStack Query (Server) |
| Observability | Sentry |

## GitHub Organization

```
HEXA-Studio/
├── hexa-platform      ← Single Source of Truth (monorepo)
├── hexa-website
├── hexa-api
├── hexa-odoo
├── hexa-ai
├── hexa-devops
├── hexa-mobile        (Future)
├── hexa-design-system (Optional)
└── hexa-docs          (Optional)
```

## Creative Excellence Mode

When working on the Frontend, agents must operate in **Creative Excellence Mode**. This means:
- **Role Shift:** You are no longer just an engineer; you are an elite multidisciplinary design team (Creative Director, UX Director, Motion Expert, etc.).
- **Objective:** Redesign for a premium, world-class digital experience. Every interaction must feel handcrafted and cinematic.
- **Standard:** Any UI/UX element must score at least **9.5/10** on the Luxury and Performance scale.
- **Mandate:** Challenge every design decision. If a solution is "average," redesign it.
- **Framework:** Follow the guidelines in `HEXA-Vision-Playbook/07-DESIGN/UX_STRATEGY.md` and `HEXA-Vision-Playbook/06-STANDARDS/MOTION_SYSTEM.md`.

## Playbook Structure

All documentation lives inside `HEXA-Vision-Playbook/`:


All documentation lives inside `HEXA-Vision-Playbook/`:

```
HEXA-Vision/
├── AGENTS.md                          ← Mandatory entry point (this file)
├── README.md
└── HEXA-Vision-Playbook/              ← All documentation
    ├── AGENTS.md                      ← Copy of this file
    │
    ├── 00-GOVERNANCE/
    │   ├── PROJECT_CONSTITUTION.md
    │   ├── PROJECT_OVERVIEW.md
    │   ├── PRODUCT_VISION.md
    │   ├── PRODUCT_VISION_2030.md
    │   ├── BUSINESS_GOALS.md
    │   ├── CORE_PRINCIPLES.md
    │   ├── SUCCESS_METRICS.md
    │   ├── DEFINITIONS.md
    │   ├── GLOSSARY.md
    │   ├── START_HERE.md
    │   ├── FOLDER_STRUCTURE.md
    │   ├── PROJECT_DIRECTIVE.md
    │   └── TECH_STACK.md
    │
    ├── 01-ARCHITECTURE/
    │   ├── SYSTEM_ARCHITECTURE.md
    │   ├── HIGH_LEVEL_DESIGN.md
    │   ├── LOW_LEVEL_DESIGN.md
    │   ├── DOMAIN_MODEL.md
    │   ├── MICROSERVICES.md
    │   ├── DATA_FLOW.md
    │   ├── EVENT_FLOW.md
    │   ├── DEPLOYMENT_ARCHITECTURE.md
    │   ├── NETWORK_ARCHITECTURE.md
    │   ├── DATABASE_ARCHITECTURE.md
    │   ├── API_ARCHITECTURE.md
    │   ├── INTEGRATION_ARCHITECTURE.md
    │   └── ARCHITECTURE_DECISIONS/
    │
    ├── 02-ROADMAP/
    │   ├── ROADMAP.md
    │   ├── RELEASE_PLAN.md
    │   ├── MILESTONES.md
    │   ├── PHASES.md
    │   ├── BACKLOG.md
    │   ├── CURRENT_SPRINT.md
    │   ├── NEXT_SPRINT.md
    │   ├── OPEN_TASKS.md
    │   ├── PROJECT_STATUS.md
    │   ├── CHANGELOG.md
    │   ├── IMPLEMENTATION_ROADMAP.md
    │   └── IMPROVEMENT_ROADMAP.md
    │
    ├── 03-BUSINESS/
    │   ├── BUSINESS_WORKFLOWS.md
    │   ├── CLIENT_JOURNEY.md
    │   ├── SALES_FUNNEL.md
    │   ├── CRM_PROCESS.md
    │   ├── PROJECT_LIFECYCLE.md
    │   ├── SOPs.md
    │   └── KPIs.md
    │
    ├── 04-AGENTS/
    │   ├── AI_AGENT_GUIDE.md
    │   ├── CHIEF_ARCHITECT.md
    │   ├── FRONTEND_AGENT.md
    │   ├── BACKEND_AGENT.md
    │   ├── ODOO_AGENT.md
    │   ├── DEVOPS_AGENT.md
    │   ├── QA_AGENT.md
    │   ├── SECURITY_AGENT.md
    │   ├── AI_ENGINEER.md
    │   ├── ANALYTICS_AGENT.md
    │   ├── DOCUMENTATION_AGENT.md
    │   └── COMMUNICATION_AGENT.md
    │
    ├── 05-PROMPTS/
    │   ├── 000_PROJECT_BOOTSTRAP.md through 016_PRODUCTION.md
    │
    ├── 06-STANDARDS/
    │   ├── CODING_STANDARDS.md
    │   ├── TYPESCRIPT_GUIDE.md
    │   ├── REACT_GUIDE.md
    │   ├── NEXTJS_GUIDE.md
    │   ├── TAILWIND_GUIDE.md
    │   ├── THREEJS_GUIDE.md
    │   ├── GSAP_GUIDE.md
    │   ├── API_STANDARDS.md
    │   ├── DATABASE_STANDARDS.md
    │   ├── ODOO_STANDARDS.md
    │   ├── DOCUMENTATION_STANDARDS.md
    │   ├── UI_STANDARDS.md
    │   ├── UX_STANDARDS.md
    │   ├── ACCESSIBILITY.md
    │   ├── SEO.md
    │   ├── PERFORMANCE.md
    │   └── SECURITY.md
    │
    ├── 07-DESIGN/
    │   ├── DESIGN_SYSTEM.md
    │   ├── COLORS.md
    │   ├── TYPOGRAPHY.md
    │   ├── COMPONENTS.md
    │   ├── ICONOGRAPHY.md
    │   ├── MOTION.md
    │   ├── TOKENS.md
    │   ├── WIREFRAMES.md
    │   └── BRAND_GUIDELINES.md
    │
    ├── 08-API/
    │   ├── API_DOCUMENTATION.md
    │   ├── AUTHENTICATION.md
    │   ├── AUTHORIZATION.md
    │   ├── ENDPOINTS.md
    │   ├── ERROR_CODES.md
    │   ├── WEBHOOKS.md
    │   └── VERSIONING.md
    │
    ├── 09-ODOO/
    │   ├── ODOO_ARCHITECTURE.md
    │   ├── HEXA_CMS.md
    │   ├── CRM.md
    │   ├── SALES.md
    │   ├── PROJECTS.md
    │   ├── DOCUMENTS.md
    │   ├── EMAIL.md
    │   ├── USERS.md
    │   ├── AUTOMATIONS.md
    │   └── MODULES.md
    │
    ├── 10-AI/
    │   ├── AI_ARCHITECTURE.md
    │   ├── PROMPT_LIBRARY.md
    │   ├── CEO_ASSISTANT.md
    │   ├── SALES_ASSISTANT.md
    │   ├── CRM_ASSISTANT.md
    │   ├── PM_ASSISTANT.md
    │   ├── EMAIL_ASSISTANT.md
    │   ├── AUTOMATIONS.md
    │   └── VECTOR_SEARCH.md
    │
    ├── 11-ANALYTICS/
    │   ├── EXECUTIVE_DASHBOARD.md
    │   ├── BI.md
    │   ├── REPORTS.md
    │   ├── DASHBOARDS.md
    │   ├── FORECASTING.md
    │   ├── EVENTS.md
    │   └── METRICS.md
    │
    ├── 12-CLIENT-PORTAL/
    │   ├── CLIENT_PORTAL.md
    │   ├── FILES.md
    │   ├── PROJECT_TRACKING.md
    │   ├── TIMELINE.md
    │   ├── NOTIFICATIONS.md
    │   └── INVOICES.md
    │
    ├── 13-DEVOPS/
    │   ├── DOCKER.md
    │   ├── DOCKER_COMPOSE.md
    │   ├── UBUNTU.md
    │   ├── NGINX.md
    │   ├── SSL.md
    │   ├── GITHUB_ACTIONS.md
    │   ├── DEPLOYMENT.md
    │   ├── MONITORING.md
    │   ├── BACKUP.md
    │   └── DISASTER_RECOVERY.md
    │
    ├── 14-GIT/
    │   ├── GIT_STRATEGY.md
    │   ├── BRANCHING.md
    │   ├── COMMITS.md
    │   ├── PULL_REQUESTS.md
    │   ├── CODE_REVIEW.md
    │   ├── RELEASE_FLOW.md
    │   └── TAGGING.md
    │
    ├── 15-QUALITY/
    │   ├── QUALITY_GATES.md
    │   ├── TESTING.md
    │   ├── UNIT_TESTS.md
    │   ├── INTEGRATION_TESTS.md
    │   ├── E2E.md
    │   ├── LIGHTHOUSE.md
    │   ├── PERFORMANCE_AUDIT.md
    │   ├── SECURITY_AUDIT.md
    │   └── ACCESSIBILITY_AUDIT.md
    │
    ├── 16-TEMPLATES/
    │   ├── ADR_TEMPLATE.md
    │   ├── SPRINT_TEMPLATE.md
    │   ├── TASK_TEMPLATE.md
    │   ├── BUG_TEMPLATE.md
    │   ├── FEATURE_TEMPLATE.md
    │   ├── PR_TEMPLATE.md
    │   ├── RELEASE_TEMPLATE.md
    │   └── MEETING_TEMPLATE.md
    │
    └── 17-CHECKLISTS/
        ├── STARTUP_CHECKLIST.md
        ├── FEATURE_CHECKLIST.md
        ├── RELEASE_CHECKLIST.md
        ├── DEPLOYMENT_CHECKLIST.md
        ├── SECURITY_CHECKLIST.md
        ├── SEO_CHECKLIST.md
        ├── UI_CHECKLIST.md
        ├── PERFORMANCE_CHECKLIST.md
        └── QA_CHECKLIST.md
```
