# HEXA STUDIO — ENGINEERING GOVERNANCE

**Version:** 1.0.0  
**Status:** Active  
**Authority:** Highest project-level authority  
**Repository:** HEXA STUDIO  
**DevOps Source of Truth:** GitLab CE  
**Governance Model:** AI-Agent-First, Production-Grade  

---

# 1. PURPOSE

This document defines the engineering governance system for HEXA STUDIO.

It establishes the rules under which the project is:

- Architected
- Designed
- Developed
- Reviewed
- Tested
- Secured
- Optimized
- Documented
- Deployed
- Maintained
- Extended by AI agents

This document is not merely documentation.

It is the **Engineering Operating System of HEXA STUDIO**.

Every human developer and AI agent working on the project must operate within this governance system.

### References

**Normative / Engineering:**
- ISO/IEC/IEEE 12207 — Software life cycle processes
- NIST Secure Software Development Framework (SSDF)

**Official:**
- GitLab Documentation
- Git documentation

---

# 2. PROJECT MISSION

HEXA STUDIO is a premium architecture visualization and digital studio platform.

The platform is intended to combine:

- World-class architecture studio presentation
- Architectural portfolio
- Project storytelling
- Architectural visualization
- Cinematic media
- 3D/WebGL experiences
- CMS-driven content
- Client-facing experiences
- Lead generation
- Analytics
- Scalable production infrastructure
- AI-assisted development

The final product must feel like a **world-class architecture visualization studio**, not a generic agency template.

### Success Principles

The product should communicate:

- Architectural intelligence
- Visual sophistication
- Technical excellence
- Premium positioning
- Strong art direction
- Trust
- Precision
- Performance
- Accessibility

### References

**Benchmark / Inspiration:**
- ArchDaily
- Dezeen
- Architizer
- Divisare
- DBOX
- MIR
- Brick Visual
- Beauty and the Bit
- TMRW

**Design Research:**
- Awwwards
- SiteInspire
- CSS Design Awards
- Godly

These references are inspiration sources only and do not define HEXA STUDIO's identity.

---

# 3. GOVERNANCE PRINCIPLES

These principles are non-negotiable.

## 3.1 Architecture First

Major architectural decisions must be understood before implementation.

No significant architecture change may be introduced silently.

When a decision affects system structure, create an ADR.

### References

- Architecture Decision Records — ADR documentation
- ISO/IEC/IEEE 42010 — Architecture description
- NIST SSDF

---

## 3.2 Quality Over Speed

Development speed must never be prioritized over:

- Correctness
- Security
- Maintainability
- Performance
- Accessibility
- Reliability

Fast development is valuable only when the result remains production-grade.

### References

- ISO/IEC 25010 — Software quality model
- NIST SSDF
- OWASP Software Assurance Maturity Model (SAMM)

---

## 3.3 Production Mindset

Every feature must be considered production software.

Avoid temporary hacks that silently become permanent architecture.

Prototype code must be clearly identified.

### References

- Twelve-Factor App
- ISO/IEC/IEEE 12207
- NIST SSDF

---

## 3.4 Security by Default

Security is part of implementation.

It is not a final-stage checklist.

### References

- OWASP Top 10
- OWASP ASVS
- OWASP Cheat Sheet Series
- NIST SSDF

---

## 3.5 Performance by Default

Performance must be considered before introducing:

- Large dependencies
- Heavy animations
- Video
- WebGL
- Large images
- Client-side JavaScript
- Third-party services

### References

- web.dev
- Chrome Developers
- Core Web Vitals
- MDN Web Performance documentation

---

## 3.6 Accessibility by Default

Accessibility is a product requirement.

It is not optional polish.

### References

- WCAG 2.2
- WAI-ARIA
- W3C Web Accessibility Initiative
- MDN Accessibility

---

## 3.7 Documentation as Code

Important decisions must be:

- Written
- Version controlled
- Reviewable
- Kept synchronized with implementation

### References

- GitLab Documentation
- ISO/IEC/IEEE 12207
- Architecture Decision Records

---

## 3.8 AI Governance

AI agents are engineering participants.

They must follow the same quality, security, architecture, and review requirements as human developers.

### References

- NIST AI Risk Management Framework
- NIST SSDF
- OWASP AI Security and Governance guidance

---

## 3.9 Don't Guess — Verify

AI agents must never invent:

- APIs
- Configuration options
- Framework behavior
- Security behavior
- Deployment behavior
- Package capabilities

If uncertain:

```text
STOP
↓
VERIFY
↓
UNDERSTAND
↓
IMPLEMENT
```

### References

- Official documentation of the technology being used
- Official specifications
- MDN
- W3C
- NIST SSDF

---

# 4. AUTHORITY HIERARCHY

When instructions conflict, the following hierarchy determines authority:

```text
GOVERNANCE.md
        ↓
ARCHITECTURE.md
        ↓
ADR/
        ↓
PRODUCT.md
        ↓
DESIGN_SYSTEM.md
        ↓
ENGINEERING_STANDARDS.md
        ↓
SECURITY.md
        ↓
PERFORMANCE.md
        ↓
ACCESSIBILITY.md
        ↓
SEO.md
        ↓
DELIVERY.md
        ↓
ROADMAP.md
        ↓
PROJECT_STATUS.md
        ↓
Sprint specifications
        ↓
Agent task instructions
```

Higher-level rules override lower-level instructions.

### Operating Model

Work flows through the AI-agent operating hierarchy (see `docs/adr/010-operating-model.md`):

```text
GOVERNANCE.md
        ↓
ORCHESTRATOR
        ↓
ARCHITECT | BUILDER | REVIEWER
        ↓
GitLab Merge Request
        ↓
CI/CD
        ↓
Staging
        ↓
Production
```

- **ORCHESTRATOR** coordinates: decompose → parallel dispatch → sequential chains → quality gate → consolidate.
- **ARCHITECT** owns architecture integrity and ADRs.
- **BUILDER** leads implementation across Frontend / Backend / CMS / Three.js.
- **REVIEWER** gates on QA / Security / Performance / SEO before merge.
- Role definitions live in `.ai/agents/`; orchestration prompts in `.opencode/prompts/`.

If a conflict is discovered:

1. Do not silently choose.
2. Identify the conflict.
3. Follow the higher authority.
4. Document the conflict.
5. Create an ADR when the conflict represents an architectural decision.

### References

- Architecture Decision Records
- ISO/IEC/IEEE 42010
- GitLab Code Review / Merge Request practices
- `docs/adr/010-operating-model.md` — AI-Agent Operating Model
- `.ai/agents/*.md` — Agent role definitions

---

# 5. OFFICIAL REFERENCES & KNOWLEDGE SOURCES

The following references form the official external technical knowledge base for HEXA STUDIO.

They do not override repository-specific architecture decisions.

Repository implementation and accepted ADRs remain authoritative for project-specific decisions.

---

## 5.1 Next.js

Official reference:

**Next.js Documentation**

Use for:

- App Router
- Server Components
- Client Components
- Routing
- Metadata
- Image optimization
- Font optimization
- Caching
- Rendering
- Dynamic imports
- Deployment

### References

- Next.js Documentation
- Next.js API Reference
- Next.js Architecture Documentation

---

## 5.2 React

Use for:

- Components
- Hooks
- Rendering
- Server/client boundaries
- Performance
- Accessibility

### References

- React Documentation
- React API Reference
- React Server Components documentation

---

## 5.3 TypeScript

Use for:

- Strict typing
- Type design
- Generics
- Utility types
- Compiler configuration

### References

- TypeScript Handbook
- TypeScript TSConfig Reference

---

# 6. UI & DESIGN TECHNOLOGY

## Tailwind CSS

Use for utility-based styling and design-system implementation.

## shadcn/ui

Use as a component foundation where appropriate.

Neither technology defines the HEXA STUDIO visual identity.

### References

**Official:**
- Tailwind CSS Documentation
- shadcn/ui Documentation
- CSS Specifications
- MDN CSS

---

# 7. 3D & MOTION

Three-dimensional and motion technologies are treated as high-cost capabilities.

Potential technologies include:

- Three.js
- React Three Fiber
- Drei
- GSAP
- Motion
- Lenis

Use them only when they improve the experience.

Never introduce motion merely because it is technically possible.

### References

**Official:**
- Three.js Documentation
- React Three Fiber Documentation
- Drei Documentation
- GSAP Documentation
- Motion Documentation
- Lenis Documentation

**Standards:**
- WCAG 2.2 — Animation / Motion considerations
- MDN Web APIs
- web.dev Performance

---

# 8. BACKEND ARCHITECTURE

The backend must prioritize:

- Clear module boundaries
- Dependency injection
- Validation
- Authentication
- Authorization
- Observability
- Error handling
- Testing
- API contracts

### Primary technology

NestJS.

### References

**Official:**
- NestJS Documentation
- Node.js Documentation

**API:**
- OpenAPI Specification

**Security:**
- OWASP ASVS
- OWASP API Security Top 10

---

# 9. CMS ARCHITECTURE

Strapi is used as the CMS layer where appropriate.

Use it for:

- Content modeling
- REST APIs
- GraphQL where justified
- Authentication
- Media
- Content management
- Editorial workflows

The frontend must not become tightly coupled to Strapi internals.

Content access should be abstracted where practical.

### References

**Official:**
- Strapi Documentation
- Strapi REST API documentation
- Strapi GraphQL documentation

**Architecture:**
- Twelve-Factor App
- OpenAPI Specification

---

# 10. DATABASE ARCHITECTURE

PostgreSQL is the primary relational database.

Database design must consider:

- Schema integrity
- Constraints
- Indexes
- Transactions
- Query performance
- Migrations
- Backup
- Recovery
- Data lifecycle

### Rules

Never use application code as a substitute for database integrity where database constraints are appropriate.

### References

**Official:**
- PostgreSQL Documentation

**Engineering:**
- PostgreSQL Performance Documentation
- OWASP Database Security guidance

---

# 11. CACHE & BACKGROUND SYSTEMS

Redis may be used for:

- Caching
- Rate limiting
- Temporary state
- Queues/background jobs where appropriate

Redis must not become the primary persistent business-data store.

### References

**Official:**
- Redis Documentation

**Security:**
- Redis Security Documentation
- OWASP guidance

---

# 12. INFRASTRUCTURE

Known infrastructure:

```text
Ubuntu
Docker
Docker Compose
Traefik
PostgreSQL
Redis
GitLab CE
```

Infrastructure must prioritize:

- Reproducibility
- Security
- Isolation
- Observability
- Rollback
- Maintainability

### References

**Official:**
- Docker Documentation
- Docker Compose Documentation
- Traefik Documentation
- Ubuntu Server Documentation

**Architecture:**
- Twelve-Factor App

**Security:**
- OWASP
- CIS Benchmarks where applicable

---

# 13. GITLAB CE & DEVOPS

GitLab CE is the project's DevOps source of truth.

Use:

- Repository
- Issues
- Merge Requests
- GitLab CI/CD
- GitLab Runner
- Container Registry
- Environments
- Releases
- Variables
- Security scanning

GitHub Actions must not be used as the project's CI/CD system.

Production branches must be protected.

### References

**Official:**
- GitLab Documentation
- GitLab CI/CD Documentation
- GitLab Runner Documentation
- GitLab Container Registry Documentation
- GitLab Security Documentation

---

# 14. WEB STANDARDS

Web implementation must follow established standards.

### References

**Normative:**
- W3C
- WHATWG HTML Standard
- ECMAScript Specification

**Technical:**
- MDN Web Docs

When standards and framework abstractions differ, understand the underlying web behavior before making architectural decisions.

---

# 15. ACCESSIBILITY

The application must support:

- Keyboard navigation
- Screen readers
- Focus management
- Semantic HTML
- Accessible forms
- Color contrast
- Reduced motion
- Responsive text
- Accessible interactive components

### Minimum expectation

Target WCAG 2.2 AA where practical.

### References

**Normative:**
- WCAG 2.2
- WAI-ARIA
- W3C Accessibility Guidelines

**Implementation:**
- MDN Accessibility
- web.dev Accessibility

---

# 16. SEO

SEO must be implemented intentionally.

Consider:

- Metadata
- Canonical URLs
- Open Graph
- Structured data
- Sitemap
- Robots
- Semantic HTML
- Crawlability
- Performance

SEO must never compromise accessibility or UX.

### References

**Official:**
- Google Search Central
- Google Search Console documentation

**Structured Data:**
- Schema.org

**Web Standards:**
- W3C
- MDN

---

# 17. PERFORMANCE

Performance is an architectural concern.

Consider:

- Server rendering
- Streaming
- Caching
- Image optimization
- Font optimization
- Code splitting
- Lazy loading
- CDN
- WebGL cost
- Animation cost
- Third-party scripts

Avoid unnecessary JavaScript.

Avoid unnecessary network requests.

Avoid unoptimized media.

### Performance targets

```text
LCP < 2.5s
INP < 200ms
CLS < 0.1
```

These are target budgets, not guarantees.

### References

**Official / Primary:**
- web.dev
- Chrome Developers
- Core Web Vitals documentation
- MDN Performance

---

# 18. SECURITY

Security requirements include:

- Never commit secrets.
- Never expose credentials.
- Validate external input.
- Enforce authorization server-side.
- Use secure authentication.
- Protect internal services.
- Rate-limit sensitive endpoints.
- Keep dependencies updated.
- Log relevant security events.
- Maintain auditability.

PostgreSQL and Redis must not be publicly exposed unnecessarily.

### References

**Normative / Industry:**
- OWASP Top 10
- OWASP ASVS
- OWASP API Security Top 10
- OWASP Cheat Sheet Series
- NIST SSDF

**Platform:**
- Node.js Security Best Practices

---

# 19. ARCHITECTURE GOVERNANCE

The system should remain as simple as possible while supporting the product requirements.

Do not introduce:

- Microservices
- Kubernetes
- Additional databases
- Additional frameworks
- Additional infrastructure

without justification.

Complexity must have a measurable reason to exist.

### References

- ISO/IEC/IEEE 42010
- Twelve-Factor App
- NIST SSDF
- Architecture Decision Records

---

# 20. FRONTEND ARCHITECTURE

The frontend must prioritize:

- Server-first rendering where appropriate
- Minimal client-side JavaScript
- Component reuse
- Feature isolation
- Clear data boundaries
- Typed APIs
- Accessibility
- Performance
- Progressive enhancement

Client Components must have a reason to exist.

Do not make entire pages client-rendered without justification.

### References

**Official:**
- Next.js Documentation
- React Documentation
- TypeScript Documentation

**Performance:**
- web.dev
- Chrome Developers

**Accessibility:**
- WCAG 2.2
- MDN

---

# 21. API GOVERNANCE

APIs must have:

- Clear contracts
- Validation
- Authentication where required
- Authorization
- Error handling
- Versioning strategy where appropriate
- Documentation
- Observability

### References

- OpenAPI Specification
- NestJS Documentation
- OWASP API Security Top 10
- MDN HTTP Documentation

---

# 22. THREE.JS / WEBGL GOVERNANCE

Three.js/WebGL is a high-cost capability.

Rules:

- Lazy-load where appropriate.
- Avoid unnecessary render loops.
- Minimize GPU workload.
- Optimize textures.
- Optimize geometry.
- Consider device capabilities.
- Provide graceful fallbacks.
- Support reduced motion.
- Avoid blocking initial rendering.
- Monitor memory usage.

Three.js code should remain isolated from ordinary application logic where practical.

### References

**Official:**
- Three.js Documentation
- Three.js Examples
- React Three Fiber Documentation
- Drei Documentation

**Performance:**
- web.dev
- Chrome DevTools Performance documentation

**Accessibility:**
- WCAG 2.2

---

# 23. DEPENDENCY GOVERNANCE

Before adding a dependency evaluate:

- Why it is required
- Existing alternatives
- Bundle impact
- Security
- Maintenance
- License
- Compatibility
- Long-term cost

The agent must consult the dependency's official documentation.

Do not add dependencies for trivial functionality.

### References

- npm Documentation
- Node.js Documentation
- OSV.dev
- GitHub Advisory Database
- OWASP Dependency guidance
- OpenSSF guidance

---

# 24. DATA GOVERNANCE

Data must be handled according to sensitivity.

Never:

- Log secrets
- Log credentials
- Expose private information
- Store unnecessary sensitive information
- Copy production data into development environments without justification

Database migrations must be reversible where practical.

### References

- OWASP
- NIST Privacy Framework
- PostgreSQL Documentation
- GDPR principles where legally applicable

---

# 25. OBSERVABILITY

Production systems should provide appropriate:

- Logs
- Metrics
- Health checks
- Error tracking
- Tracing where justified
- Infrastructure monitoring

Observability must be proportional to system complexity.

### References

**Official:**
- OpenTelemetry Documentation
- Prometheus Documentation
- Grafana Documentation

**Architecture:**
- Twelve-Factor App

---

# 26. DESIGN SYSTEM GOVERNANCE

The design system must provide centralized definitions for:

- Typography
- Colors
- Spacing
- Grid
- Components
- Motion
- Icons
- Breakpoints
- States
- Accessibility

Rules:

- No random colors.
- No random typography.
- No inconsistent spacing.
- No arbitrary component variants.
- No duplicated tokens.
- No page-specific design systems.

The design system must support:

- Desktop
- Tablet
- Mobile
- LTR
- RTL
- Reduced motion
- Accessibility

### References

**Technical:**
- CSS Design Specifications
- MDN CSS
- WCAG 2.2

**Design Systems:**
- Material Design guidance
- W3C Design System accessibility principles

**Inspiration:**
- SiteInspire
- Minimal Gallery
- Awwwards

Inspiration does not override HEXA STUDIO's own design system.

---

# 27. DESIGN INSPIRATION & BENCHMARKS

These sources exist for visual research.

They are not implementation authorities.

They may be used to study:

- Art direction
- Typography
- Layout
- Grid systems
- Editorial composition
- Navigation
- Project storytelling
- Motion
- Interaction
- Media treatment
- 3D experiences
- Responsive behavior

### Web Design

- Awwwards
- CSS Design Awards
- SiteInspire
- Godly
- Minimal Gallery
- Land-book
- One Page Love

### Architecture

- ArchDaily
- Dezeen
- Divisare
- Architizer

### Architectural Visualization

- DBOX
- Brick Visual
- MIR
- Beauty and the Bit
- TMRW

### Creative Technology

- Locomotive
- Active Theory
- Resn
- Hello Monday / DEPT®

### Typography

- Typewolf
- Fonts In Use

### Creative Development

- Codrops
- Three.js Examples

### References

**Benchmark / Inspiration only.**

These sources must never be treated as authoritative implementation documentation.

---

# 28. DESIGN INSPIRATION RULES

The correct workflow is:

```text
Design Problem
      ↓
Research Multiple References
      ↓
Identify Patterns
      ↓
Extract Principles
      ↓
Evaluate Brand Fit
      ↓
Evaluate UX
      ↓
Evaluate Accessibility
      ↓
Evaluate Performance
      ↓
Create Original Direction
      ↓
Implement
```

Never:

```text
Reference
      ↓
Copy
```

Never copy:

- Source code
- HTML
- CSS
- Images
- Videos
- Logos
- Brand identity
- Proprietary content
- Exact layouts
- Exact animations
- Exact interactions

The objective is to understand **why a design works**, not to reproduce it.

### References

- WIPO Copyright guidance
- Creative Commons guidance where applicable
- Awwwards
- SiteInspire
- ArchDaily
- Dezeen

---

# 29. DESIGN REVIEW

Before approving a major visual direction, the Design Agent must answer:

1. What problem does this design solve?
2. Which references influenced it?
3. What principles were extracted?
4. What was intentionally made original?
5. How does it support HEXA STUDIO?
6. How does it perform on mobile?
7. How does it perform on low-end devices?
8. How does it behave with reduced motion?
9. Is it accessible?
10. Is it maintainable?

### References

- WCAG 2.2
- web.dev
- Awwwards
- SiteInspire
- Material Design accessibility guidance

---

# 30. VERSION-AWARE RESEARCH

Before using technical documentation:

1. Determine the installed version.
2. Prefer documentation matching that version.
3. Do not blindly use newer major-version documentation.
4. Identify breaking changes.
5. Verify compatibility.
6. Do not silently upgrade dependencies.

Example:

```text
Project:
Next.js 15.x

Do not automatically implement:
Next.js 16.x behavior
```

If an upgrade is required:

```text
STOP
↓
Assess impact
↓
Document
↓
Create ADR
↓
Plan migration
↓
Test
↓
Implement
```

### References

- Official documentation for each installed technology
- npm package metadata
- Node.js release documentation
- Next.js release notes
- React release notes
- Strapi release notes

---

# 31. RESEARCH PROTOCOL

When technical uncertainty exists:

```text
Don't Guess
    ↓
Identify Exact Question
    ↓
Inspect Repository
    ↓
Check Installed Version
    ↓
Check Official Documentation
    ↓
Check Official Specification
    ↓
Check Trusted Primary Sources
    ↓
Implement
```

If reliable information cannot be verified:

**Do not fabricate an answer.**

State the uncertainty.

### References

- NIST SSDF
- MDN
- W3C
- Official framework documentation

---

# 32. AI AGENT GOVERNANCE

HEXA STUDIO may use multiple specialized AI agents.

Recommended roles:

```text
Architect
Frontend
Backend
CMS
Design
ThreeJS
DevOps
Security
QA
Performance
SEO
Reviewer
Release
```

Each agent must have:

- Mission
- Responsibilities
- Allowed actions
- Forbidden actions
- Required checks
- Documentation requirements
- Handoff rules

### References

- NIST AI RMF
- NIST SSDF
- OWASP AI Security guidance

---

# 33. AI AGENT OPERATING RULES

Every AI agent MUST:

1. Read `GOVERNANCE.md`.
2. Read relevant architecture documentation.
3. Read relevant ADRs.
4. Read `PROJECT_STATUS.md`.
5. Inspect affected code.
6. Determine risk.
7. Consult relevant references.
8. Create a plan for non-trivial work.
9. Implement incrementally.
10. Run validation.
11. Review its work.
12. Update documentation.
13. Update project status.
14. Commit or prepare a Merge Request.

### References

- NIST SSDF
- GitLab Merge Request documentation
- OWASP SAMM

---

# 34. AI AGENT FORBIDDEN ACTIONS

Agents MUST NOT:

- Change architecture silently.
- Invent APIs.
- Invent configuration.
- Introduce dependencies without justification.
- Delete working functionality without approval.
- Disable tests to make CI pass.
- Disable TypeScript checks.
- Use `any` as an escape hatch.
- Commit secrets.
- Bypass security controls.
- Bypass authorization.
- Push directly to protected production branches.
- Deploy untested code.
- Hide failures.
- Fabricate progress.
- Claim tests passed when they did not run.
- Treat design inspiration as implementation authority.

### References

- NIST SSDF
- OWASP ASVS
- GitLab Protected Branches
- GitLab Merge Requests

---

# 35. AGENT HANDOFF MODEL

Recommended workflow:

```text
Request
   ↓
Architect
   ↓
Planner
   ↓
Builder
   ↓
Self Review
   ↓
QA
   ↓
Security Review
   ↓
Performance Review
   ↓
Reviewer
   ↓
GitLab Merge Request
   ↓
GitLab CI
   ↓
Staging
   ↓
Approval
   ↓
Production
```

Not every task requires every role.

Risk determines the review chain.

### References

- GitLab Merge Request workflows
- NIST SSDF
- OWASP SAMM

---

# 36. RISK LEVELS

## LOW

Examples:

- Documentation
- Copy
- Minor styling
- Small UI fixes

## MEDIUM

Examples:

- New components
- API changes
- Database queries
- New dependencies
- CMS schema changes

## HIGH

Examples:

- Authentication
- Authorization
- Database migrations
- Infrastructure
- Deployment
- Security
- Architecture
- Data deletion

HIGH-risk work requires additional review and explicit documentation.

### References

- NIST Risk Management Framework
- OWASP ASVS
- NIST SSDF

---

# 37. ADR GOVERNANCE

Create:

```text
ADR/
0000-template.md
```

Each ADR must contain:

- Title
- Status
- Date
- Context
- Problem
- Decision
- Alternatives considered
- Consequences
- Migration
- Rollback

Statuses:

- Proposed
- Accepted
- Rejected
- Superseded

Major architectural decisions MUST use ADRs.

### References

- Architecture Decision Records
- ISO/IEC/IEEE 42010
- ISO/IEC/IEEE 12207

---

# 38. CHANGE MANAGEMENT

For significant changes document:

```text
Why?
What?
Impact?
Risk?
Rollback?
Tests?
Documentation?
```

Architecture changes require ADRs.

Security changes require security review.

Database changes require migration and rollback planning.

Infrastructure changes require deployment verification.

### References

- NIST SSDF
- ISO/IEC/IEEE 12207
- GitLab Merge Requests
- ADR methodology

---

# 39. GIT & BRANCH GOVERNANCE

Recommended flow:

```text
main
  ↓
feature/*
  ↓
Merge Request
  ↓
CI
  ↓
Review
  ↓
Merge
```

Production branches must be protected.

Significant changes must go through Merge Requests.

### References

- Git Documentation
- GitLab Protected Branches
- GitLab Merge Requests
- GitLab CI/CD

---

# 40. SPRINT GOVERNANCE

Every Sprint must define:

- Objective
- Scope
- Non-goals
- Dependencies
- Risks
- Acceptance criteria
- Validation criteria
- Deliverables

Do not allow uncontrolled scope creep.

New work goes to the backlog unless required to unblock the current Sprint.

### References

- Agile Manifesto
- Scrum Guide
- GitLab Issues / Milestones

---

# 41. DEFINITION OF DONE

A task is not complete because code exists.

A task is complete when the applicable requirements have been satisfied:

```text
Implementation
+
Tests
+
Lint
+
Typecheck
+
Security checks
+
Performance checks
+
Documentation
+
PROJECT_STATUS update
+
Git commit / Merge Request
```

Not every check is required for every trivial change.

The agent must determine which checks apply and report them.

### References

- NIST SSDF
- GitLab CI/CD
- ISO/IEC 25010

---

# 42. TESTING GOVERNANCE

Testing must be proportional to risk.

Where appropriate, use:

- Unit tests
- Integration tests
- API tests
- Component tests
- End-to-end tests
- Accessibility tests
- Performance tests
- Security tests
- Smoke tests

Tests must validate behavior, not merely implementation details.

### References

- Vitest / Jest official documentation where applicable
- Playwright Documentation
- Testing Library Documentation
- OWASP Testing Guide
- WCAG 2.2
- web.dev

---

# 43. PROJECT STATUS GOVERNANCE

`PROJECT_STATUS.md` must accurately show:

- Current phase
- Current Sprint
- Completed work
- Active work
- Blockers
- Risks
- Technical debt
- Architecture changes
- Next actions

Never fabricate progress.

### References

- GitLab Issues
- GitLab Milestones
- Agile Manifesto
- Scrum Guide

---

# 44. RELEASE GOVERNANCE

Production releases must:

- Pass GitLab CI
- Have a known version
- Have release notes
- Have rollback instructions
- Have health checks
- Have smoke tests

Never deploy known broken builds.

### References

- GitLab Releases
- GitLab CI/CD
- Twelve-Factor App
- NIST SSDF

---

# 45. INCIDENT GOVERNANCE

For production incidents:

```text
Detect
↓
Contain
↓
Restore
↓
Verify
↓
Document
↓
Root Cause
↓
Corrective Actions
```

Incidents must not be hidden.

Repeated incidents must result in corrective engineering work.

### References

- Google SRE principles
- NIST Incident Response guidance
- OpenTelemetry
- Prometheus
- Grafana

---

# 46. DOCUMENTATION GOVERNANCE

Documentation must be:

- Version controlled
- Accurate
- Concise
- Discoverable
- Updated with architectural changes

Outdated documentation is technical debt.

### Documentation Manifest

GOVERNANCE.md is the manifest for the documentation tree. Each governance section maps to a `docs/<area>/` folder containing a README manifest that points to the canonical playbook content:

| Governance area | Manifest |
|-----------------|----------|
| Architecture | `docs/architecture/README.md` |
| Decisions (ADR) | `docs/adr/README.md` |
| Product | `docs/product/README.md` |
| Design | `docs/design/README.md` |
| Engineering | `docs/engineering/README.md` |
| Security | `docs/security/README.md` |
| Performance | `docs/performance/README.md` |
| Accessibility | `docs/accessibility/README.md` |
| SEO | `docs/seo/README.md` |
| DevOps | `docs/devops/README.md` |

### References

- GitLab Documentation
- ISO/IEC/IEEE 12207
- Architecture Decision Records
- `docs/<area>/README.md` — documentation manifests

---

# 47. BACKUP & RECOVERY

Production data must have an appropriate backup and recovery strategy.

Consider:

- Backup frequency
- Retention
- Encryption
- Restore testing
- Disaster recovery
- Recovery Point Objective (RPO)
- Recovery Time Objective (RTO)

A backup that has never been restored successfully must not be considered fully validated.

### References

- PostgreSQL Backup and Restore Documentation
- Docker Documentation
- Ubuntu Server Documentation
- NIST Contingency Planning guidance

---

# 48. SECRETS & CONFIGURATION

Secrets must never be stored in:

- Source code
- Public repositories
- Docker images
- Client-side bundles
- Documentation

Use appropriate secret management mechanisms.

Environment-specific configuration must be separated from application code.

### References

- GitLab CI/CD Variables
- Docker Secrets
- OWASP Secrets Management guidance
- NIST SSDF
- Twelve-Factor App

---

# 49. DEPLOYMENT GOVERNANCE

Deployment must be reproducible.

The deployment process should provide:

- Versioned artifacts
- Environment separation
- Health checks
- Rollback capability
- Logs
- Monitoring
- Smoke tests

Production deployment must not depend on undocumented manual steps.

### References

- Docker Documentation
- GitLab CI/CD
- Traefik Documentation
- Twelve-Factor App
- NIST SSDF

---

# 50. CONTENT & MEDIA GOVERNANCE

Architectural imagery and media are core product assets.

Media must be:

- Optimized
- Properly sized
- Responsively delivered
- Accessible where appropriate
- Properly licensed
- Properly attributed where required

Do not use copyrighted third-party assets without appropriate rights.

### References

- MDN Images
- web.dev Image Performance
- W3C Accessibility
- WIPO Copyright guidance

---

# 51. RESPONSIVE GOVERNANCE

The experience must be designed intentionally for:

- Large desktop
- Desktop
- Tablet
- Mobile
- Touch interaction
- Keyboard interaction

Responsive behavior must not simply be a scaled-down desktop version.

Important layouts must be validated at realistic viewport sizes.

### References

- MDN Responsive Design
- web.dev Responsive Design
- WCAG 2.2

---

# 52. MOTION & REDUCED MOTION

Motion should communicate:

- Hierarchy
- Spatial relationships
- State changes
- Navigation
- Brand personality

Avoid decorative motion that creates unnecessary cognitive or performance cost.

Users who prefer reduced motion must receive an appropriate experience.

### References

- WCAG 2.2
- W3C Media Queries
- MDN `prefers-reduced-motion`
- web.dev

---

# 53. BROWSER COMPATIBILITY

The application must define supported browsers based on actual product requirements.

Do not add browser-specific hacks without justification.

When using experimental browser APIs, provide appropriate fallbacks where required.

### References

- MDN Browser Compatibility Data
- Can I Use
- Web Platform Tests
- WHATWG

---

# 54. THIRD-PARTY SERVICES

Third-party services must be evaluated for:

- Security
- Privacy
- Performance
- Availability
- Cost
- Vendor lock-in
- Failure behavior

Do not make a critical product function depend on an unnecessary external service.

### References

- NIST SSDF
- OWASP Third-Party Components guidance
- Twelve-Factor App

---

# 55. TECHNICAL DEBT

Technical debt must be:

- Identified
- Documented
- Prioritized
- Tracked

Do not normalize permanent workarounds.

When technical debt creates security, reliability, or performance risk, it becomes higher priority.

### References

- ISO/IEC 25010
- NIST SSDF
- Agile engineering practices

---

# 56. GOVERNANCE CHANGE POLICY

`GOVERNANCE.md` itself must not be changed casually.

Changes require:

1. Clear justification.
2. Impact assessment.
3. Review of AI-agent behavior.
4. Review of architecture impact.
5. Documentation.
6. Version update where appropriate.
7. Review before adoption.

Changes that materially alter project governance should have an ADR.

### References

- ISO/IEC/IEEE 42010
- ISO/IEC/IEEE 12207
- ADR methodology

---

# 57. INITIALIZATION REQUIREMENTS

When this Governance System is introduced:

1. Inspect the complete repository.
2. Inspect current architecture.
3. Inspect package versions.
4. Inspect infrastructure.
5. Inspect GitLab CI/CD.
6. Inspect existing documentation.
7. Identify conflicts.
8. Create governance structure.
9. Create ADR infrastructure.
10. Create AI-agent role definitions.
11. Create workflows.
12. Create checklists.
13. Create templates.
14. Create `PROJECT_STATUS.md`.
15. Do not begin unrelated feature development.
16. Do not redesign the application as part of governance initialization.
17. Do not perform an architectural migration as part of governance initialization.

At completion, report:

- Files created
- Files modified
- Current architecture
- Current technology versions
- Detected conflicts
- Missing infrastructure
- Governance gaps
- Recommended next phase
- References consulted
- Validation performed

### References

- ISO/IEC/IEEE 12207
- NIST SSDF
- GitLab Documentation
- ADR methodology

---

# 58. KIMI / OPENCODE OPERATING MODE

Kimi and OpenCode are implementation agents operating under this governance system.

They must not interpret a user request as permission to violate governance.

For every implementation request:

```text
Read Governance
      ↓
Read Architecture
      ↓
Read ADRs
      ↓
Read Project Status
      ↓
Inspect Code
      ↓
Determine Risk
      ↓
Research / Verify
      ↓
Plan
      ↓
Implement
      ↓
Validate
      ↓
Review
      ↓
Document
      ↓
Update Status
      ↓
Commit / Merge Request
```

If a requested change conflicts with governance:

```text
STOP
↓
Explain Conflict
↓
Identify Affected Rule
↓
Evaluate Alternatives
↓
Create ADR if Required
↓
Request / Await Architectural Decision
```

Never silently violate governance.

### References

- NIST SSDF
- NIST AI RMF
- GitLab Merge Requests
- OWASP SAMM

---

# 59. FINAL GOVERNANCE RULE

The repository itself must become self-governing.

A new developer or AI agent should be able to clone the repository and understand:

- What HEXA STUDIO is
- Why it exists
- How it is architected
- How it should be developed
- How it should be tested
- How it should be deployed
- What decisions have been made
- What must not be changed casually
- What is currently being built
- What remains to be built
- Which official references should be consulted
- How design inspiration should be evaluated
- How AI agents are expected to operate

The goal is not to create a large documentation folder.

The goal is to create a **living engineering operating system for HEXA STUDIO**.

---

# 60. GOVERNANCE QUALITY GATE

Before accepting any significant implementation, verify:

```text
[ ] Governance rules followed
[ ] Architecture reviewed
[ ] ADR created if required
[ ] Correct technology version verified
[ ] Official documentation consulted where required
[ ] Security implications reviewed
[ ] Performance implications reviewed
[ ] Accessibility implications reviewed
[ ] Responsive behavior reviewed
[ ] SEO implications reviewed where applicable
[ ] Tests completed
[ ] CI passed
[ ] Documentation updated
[ ] PROJECT_STATUS updated
[ ] Rollback considered where applicable
[ ] Merge Request reviewed
```

### References

- NIST SSDF
- OWASP ASVS
- WCAG 2.2
- web.dev
- GitLab CI/CD
- ISO/IEC 25010

---

# 61. GOVERNANCE STATUS

This document represents the current governing rules of HEXA STUDIO.

It should evolve with the project.

However:

**Change must be intentional.**

**Architecture must be explicit.**

**Security must be continuous.**

**Performance must be measured.**

**Accessibility must be respected.**

**Design must be original.**

**AI must be governed.**

**Documentation must remain truthful.**

**Production must never be treated as an experiment.**

---

# END OF GOVERNANCE

HEXA STUDIO is not governed by prompts.

It is governed by:

**Principles → Architecture → Decisions → Standards → Agents → Reviews → CI/CD → Production**

And every AI agent working on the project is expected to operate within that system.
