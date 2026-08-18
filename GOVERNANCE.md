# 26. DESIGN SYSTEM GOVERNANCE

## Rule

The design system must provide centralized, non-conflicting definitions for typography, colors, spacing, grid, components, motion, icons, breakpoints, states, and accessibility.

## Rationale

Random design decisions accumulate into inconsistency, maintenance cost, and brand dilution.

## Required Practice

- No random colors, typography, spacing, variants, duplicated tokens, or page-specific design systems.
- Support desktop, tablet, mobile, LTR, RTL, reduced motion, and accessibility.

## References

**Normative:**
- WCAG 2.2

**Official:**
- CSS Specifications
- MDN CSS
- Material Design guidance
- W3C Design System accessibility principles

**Benchmark / Inspiration:**
- SiteInspire
- Minimal Gallery
- Awwwards

## Validation

- Design tokens are centralized.
- Inspections reject ad-hoc values outside the token system.

---

# 27. DESIGN INSPIRATION & BENCHMARKS

## Rule

Design references are for research and benchmarking only. They are not templates and must not be copied.

## Rationale

Copying reference sites removes HEXA STUDIO's originality and violates brand and legal standards.

## Required Practice

- Study references to extract principles, not reproduce implementations.
- Apply the Design Research Rules and Design Reference Matrix.
- Never copy source code, HTML, CSS, assets, exact layouts, animations, or interactions.

## References

**Benchmark / Inspiration:**
- Web Design: Awwwards, CSS Design Awards, SiteInspire, Godly, Minimal Gallery, Land-book, One Page Love
- Architecture: ArchDaily, Dezeen, Divisare, Architizer
- Architectural Visualization: DBOX, Brick Visual, MIR, Beauty and the Bit, TMRW
- Creative Technology: Locomotive, Active Theory, Resn, Hello Monday / DEPT®
- Typography: Typewolf, Fonts In Use
- Creative Development: Codrops, Three.js Examples

## Validation

- Design reviews answer the 10-point review requirement.
- Implementation traces to extracted principles, not copied sites.

---

# 28. DESIGN INSPIRATION RULES

## Rule

Research must follow a disciplined workflow from problem to original implementation.

## Rationale

Selecting designs because they look impressive produces inconsistent user experience and brand drift.

## Required Practice

- Identify the design problem.
- Review multiple references.
- Extract principles.
- Evaluate brand fit, UX, accessibility, performance, and maintainability.
- Create an original implementation.
- Document major design decisions.

## References

**Normative:**
- WIPO Copyright guidance
- Creative Commons guidance where applicable

**Benchmark / Inspiration:**
- Awwwards
- SiteInspire
- ArchDaily
- Dezeen

## Validation

- Design decisions are documented with extracted principles and tradeoffs.

---

# 29. DESIGN REVIEW

## Rule

Before approving a major visual direction, the Design Agent must answer the 10-point review.

## Rationale

Unreviewed visual direction risks brand inconsistency, performance regression, and accessibility failure.

## Required Practice

Answer:
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

## References

**Normative:**
- WCAG 2.2

**Official:**
- web.dev
- Material Design accessibility guidance

**Benchmark / Inspiration:**
- Awwwards
- SiteInspire

## Validation

- No major visual direction merges without documented review answers.

---

# 30. VERSION-AWARE RESEARCH

## Rule

Before using technical documentation, agents must determine the installed version and prefer matching documentation.

## Rationale

Applying newer-version behavior to older dependencies creates silent breakage.

## Required Practice

- Check installed versions before implementing framework behavior.
- Document breaking changes.
- Do not silently upgrade dependencies.
- Use ADRs and migration plans for required upgrades.

## References

**Official:**
- Official documentation for each installed technology
- npm package metadata
- Node.js release documentation
- Next.js release notes
- React release notes
- Strapi release notes

## Validation

- Version mismatches are documented before implementation.

---

# 31. RESEARCH PROTOCOL

## Rule

When technical uncertainty exists, agents must research and verify before implementing.

## Rationale

Fabricated APIs, configuration, or framework behavior become production defects.

## Required Practice

- Inspect the repository first.
- Check installed versions.
- Check official documentation and specifications.
- State uncertainty explicitly when verification fails.

## References

**Normative:**
- NIST SSDF

**Official:**
- MDN
- W3C
- Official framework documentation

## Validation

- No unsupported claim is accepted without a verifiable source.

---

# 32. AI AGENT GOVERNANCE

## Rule

HEXA STUDIO uses specialized AI agent roles with explicit missions, responsibilities, allowed actions, forbidden actions, required checks, documentation requirements, and handoff rules.

## Rationale

Unstructured agent behavior creates architecture drift, security gaps, and inconsistent quality.

## Required Practice

- Maintain role definitions in `.ai/agents/`.
- Assign risk-appropriate review chains.
- Keep agent behavior traceable to governance rules.

## References

**Normative:**
- NIST AI Risk Management Framework
- NIST SSDF

**Official:**
- OWASP AI Security guidance

## Validation

- Agents operate from documented roles and handoff rules.
- Agent work products include documentation and validation records.

---

# 33. AI AGENT OPERATING RULES

## Rule

Every AI agent must follow a consistent operating sequence before and after implementation.

## Rationale

Consistent sequencing prevents skipped governance steps and unreviewed changes.

## Required Practice

For every implementation request:
1. Read `GOVERNANCE.md`
2. Read relevant architecture documentation
3. Read relevant ADRs
4. Read `PROJECT_STATUS.md`
5. Inspect affected code
6. Determine risk
7. Consult relevant references
8. Create a plan for non-trivial work
9. Implement incrementally
10. Run validation
11. Review its work
12. Update documentation
13. Update project status
14. Commit or prepare a Merge Request

## References

**Normative:**
- NIST SSDF

**Official:**
- GitLab Merge Request documentation
- OWASP SAMM

## Validation

- Agent commits include linked documentation and validation results.

---

# 34. AI AGENT FORBIDDEN ACTIONS

## Rule

Agents must not perform actions that bypass governance, quality, or security controls.

## Rationale

These actions create unreviewed risk and undermine production readiness.

## Required Practice

Agents MUST NOT:
- Change architecture silently
- Invent APIs or configuration
- Introduce dependencies without justification
- Delete working functionality without approval
- Disable tests or TypeScript checks
- Use `any` as an escape hatch
- Commit secrets
- Bypass security or authorization
- Push directly to protected production branches
- Deploy untested code
- Hide or fabricate failures
- Treat design inspiration as implementation authority

## References

**Normative:**
- NIST SSDF
- OWASP ASVS

**Official:**
- GitLab Protected Branches
- GitLab Merge Requests

## Validation

- Violations are treated as incidents and documented.

---

# 35. AGENT HANDOFF MODEL

## Rule

Work flows through a defined handoff chain, with review depth determined by risk.

## Rationale

Structured handoffs prevent unreviewed changes from reaching production.

## Required Practice

- Use Request → Architect → Planner → Builder → Self Review → QA → Security Review → Performance Review → Reviewer → Merge Request → CI/CD → Staging → Approval → Production.
- Not every task requires every role.
- Document exceptions.

## References

**Official:**
- GitLab Merge Request workflows
- GitLab CI/CD

**Normative:**
- NIST SSDF
- OWASP SAMM

## Validation

- High-risk changes include documented review evidence.

---

# 36. RISK LEVELS

## Rule

Risk determines required review depth and documentation burden.

## Rationale

Uniform review for trivial and critical changes wastes time or misses risk.

## Required Practice

Classify work as:
- LOW: documentation, copy, minor styling, small UI fixes
- MEDIUM: new components, API changes, database queries, new dependencies, CMS schema changes
- HIGH: authentication, authorization, database migrations, infrastructure, deployment, security, architecture, data deletion

HIGH-risk work requires additional review and explicit documentation.

## References

**Normative:**
- NIST Risk Management Framework
- OWASP ASVS
- NIST SSDF

## Validation

- Risk classification is stated before implementation begins.

---

# 37. ADR GOVERNANCE

## Rule

Major architectural decisions MUST use Architecture Decision Records.

## Rationale

ADRs preserve context, alternatives, and consequences for future maintainers and agents.

## Required Practice

- Use `docs/adr/0000-template.md`.
- Each ADR includes title, status, date, context, problem, decision, alternatives, consequences, migration, and rollback.
- Statuses: Proposed, Accepted, Rejected, Superseded.

## References

**Normative:**
- Architecture Decision Records methodology
- ISO/IEC/IEEE 42010
- ISO/IEC/IEEE 12207

## Validation

- Every significant architecture change links to an ADR.

---

# 38. CHANGE MANAGEMENT

## Rule

Significant changes must document why, what, impact, risk, rollback, tests, and documentation updates.

## Rationale

Undocumented changes become irreversible debt in production systems.

## Required Practice

- Architecture changes require ADRs.
- Security changes require security review.
- Database changes require migration and rollback planning.
- Infrastructure changes require deployment verification.

## References

**Normative:**
- NIST SSDF
- ISO/IEC/IEEE 12207

**Official:**
- GitLab Merge Requests
- ADR methodology

## Validation

- Change records exist for non-trivial modifications.

---

# 39. GIT & BRANCH GOVERNANCE

## Rule

Use GitLab Flow with protected branches and merge requests for significant changes.

## Rationale

Protected branches and reviewed merge requests are the primary defense against unreviewed production changes.

## Required Practice

- Follow `main` → `feature/*` → Merge Request → CI → Review → Merge.
- Protect production branches.
- Require merge requests for significant changes.

## References

**Official:**
- Git Documentation
- GitLab Protected Branches
- GitLab Merge Requests
- GitLab CI/CD

## Validation

- Production branches have protection rules.
- No direct pushes to protected branches are accepted.

---

# 40. SPRINT GOVERNANCE

## Rule

Every sprint must define objective, scope, non-goals, dependencies, risks, acceptance criteria, validation criteria, and deliverables.

## Rationale

Uncontrolled scope creep degrades quality and predictability.

## Required Practice

- Track work in GitLab Issues and Milestones.
- New work goes to backlog unless required to unblock the current sprint.

## References

**Official:**
- Agile Manifesto
- Scrum Guide
- GitLab Issues / Milestones

## Validation

- Active work has documented sprint alignment.

---

# 41. DEFINITION OF DONE

## Rule

A task is complete only when applicable requirements are satisfied, not merely when code exists.

## Rationale

Incomplete tasks accumulate as hidden technical debt and reliability risk.

## Required Practice

Confirm, as applicable:
- Implementation
- Tests
- Lint
- Typecheck
- Security checks
- Performance checks
- Documentation
- `PROJECT_STATUS` update
- Git commit / Merge Request

## References

**Normative:**
- NIST SSDF
- ISO/IEC 25010

**Official:**
- GitLab CI/CD

## Validation

- Merge requests include a documented Definition of Done checklist.

---

# 42. TESTING GOVERNANCE

## Rule

Testing must be proportional to risk and validate behavior, not merely implementation details.

## Rationale

Insufficient or brittle testing misses defects; excessive testing wastes time.

## Required Practice

- Use unit, integration, API, component, end-to-end, accessibility, performance, security, and smoke tests where appropriate.
- Cover authentication, authorization, contact form, client project access, CMS content retrieval, navigation, responsive behavior, and production health checks.

## References

**Official:**
- Vitest / Jest official documentation where applicable
- Playwright Documentation
- Testing Library Documentation

**Normative:**
- OWASP Testing Guide
- WCAG 2.2
- web.dev

## Validation

- Critical flows have test coverage.
- CI reports test results.

---

# 43. PROJECT STATUS GOVERNANCE

## Rule

`PROJECT_STATUS.md` must accurately reflect current phase, sprint, completed work, active work, blockers, risks, technical debt, architecture changes, and next actions.

## Rationale

Fabricated or stale status misleads agents, reviewers, and stakeholders.

## Required Practice

- Update status after substantive changes.
- Never fabricate progress.
- Use GitLab Issues and Milestones as operational sources of truth.

## References

**Official:**
- GitLab Issues
- GitLab Milestones

**Normative:**
- Agile Manifesto
- Scrum Guide

## Validation

- Status documents match branch and issue state.

---

# 44. RELEASE GOVERNANCE

## Rule

Production releases must pass CI, have a known version, release notes, rollback instructions, health checks, and smoke tests.

## Rationale

Releases without verification and rollback capability create outage risk.

## Required Practice

- Never deploy known broken builds.
- Use immutable artifact tags.
- Verify health after deployment.

## References

**Official:**
- GitLab Releases
- GitLab CI/CD

**Normative:**
- Twelve-Factor App
- NIST SSDF

## Validation

- Releases include smoke-test evidence.

---

# 45. INCIDENT GOVERNANCE

## Rule

Incidents follow Detect → Contain → Restore → Verify → Document → Root Cause → Corrective Actions, and must not be hidden.

## Rationale

Hidden incidents recur; documented incidents improve system resilience.

## Required Practice

- Record incidents transparently.
- Drive repeated incidents to corrective engineering work.

## References

**Official:**
- Google SRE principles
- OpenTelemetry
- Prometheus
- Grafana

**Normative:**
- NIST Incident Response guidance

## Validation

- Incident records exist for production-impacting events.

---

# 46. DOCUMENTATION GOVERNANCE

## Rule

Documentation must be version controlled, accurate, concise, discoverable, and kept synchronized with implementation.

## Rationale

Outdated documentation is technical debt that misleads agents and developers.

## Required Practice

- Update documentation with architectural changes.
- Use manifests under `docs/<area>/README.md` where applicable.
- Treat documentation as code.

## References

**Normative:**
- ISO/IEC/IEEE 12207
- Architecture Decision Records methodology

**Official:**
- GitLab Documentation

## Validation

- Documentation manifests index current content.
- Stale manifests are updated or removed.

---

# 47. BACKUP & RECOVERY

## Rule

Production data must have backup frequency, retention, encryption, restore testing, disaster recovery, RPO, and RTO strategy.

## Rationale

Untested backups are not valid recovery assets.

## Required Practice

- Define backup cadence.
- Test restore procedures.
- Document RPO and RTO targets.

## References

**Official:**
- PostgreSQL Backup and Restore Documentation
- Docker Documentation
- Ubuntu Server Documentation

**Normative:**
- NIST Contingency Planning guidance

## Validation

- Backup validation includes successful restore evidence.

---

# 48. SECRETS & CONFIGURATION

## Rule

Secrets must never be stored in source code, public repositories, Docker images, client-side bundles, or documentation.

## Rationale

Exposed secrets create immediate security and compliance risk.

## Required Practice

- Use GitLab CI/CD variables, Docker Secrets, or approved secret management.
- Separate environment-specific configuration from application code.

## References

**Normative:**
- OWASP Secrets Management guidance
- NIST SSDF
- Twelve-Factor App

**Official:**
- GitLab CI/CD Variables
- Docker Secrets

## Validation

- Secret scanning runs in CI.
- No secrets appear in committed files.

---

# 49. DEPLOYMENT GOVERNANCE

## Rule

Deployment must be reproducible, versioned, environment-separated, and include health checks, rollback, logs, monitoring, and smoke tests.

## Rationale

Non-reproducible deployments create unrecoverable production states.

## Required Practice

- Avoid undocumented manual steps.
- Verify health after deployment.
- Maintain rollback capability.

## References

**Official:**
- Docker Documentation
- GitLab CI/CD
- Traefik Documentation

**Normative:**
- Twelve-Factor App
- NIST SSDF

## Validation

- Deployment steps are documented and repeatable.

---

# 50. CONTENT & MEDIA GOVERNANCE

## Rule

Architectural imagery and media must be optimized, properly sized, responsively delivered, accessibly treated, properly licensed, and properly attributed.

## Rationale

Media quality directly affects performance, accessibility, brand perception, and legal compliance.

## Required Practice

- Deliver responsive variants.
- Optimize images and video.
- Do not use copyrighted third-party assets without rights.

## References

**Official:**
- MDN Images
- web.dev Image Performance
- W3C Accessibility
- WIPO Copyright guidance

## Validation

- Media assets include optimization and licensing checks.

---

# 51. RESPONSIVE GOVERNANCE

## Rule

The experience must be designed intentionally for large desktop, desktop, tablet, mobile, touch, and keyboard interaction.

## Rationale

Scaled-down desktop experiences fail on mobile and harm usability.

## Required Practice

- Validate important layouts at realistic viewport sizes.
- Do not treat mobile as an afterthought.

## References

**Official:**
- MDN Responsive Design
- web.dev Responsive Design

**Normative:**
- WCAG 2.2

## Validation

- Critical flows are validated at target viewport sizes.

---

# 52. MOTION & REDUCED MOTION

## Rule

Motion must communicate hierarchy, state, navigation, or brand personality, and must respect reduced-motion preferences.

## Rationale

Decorative motion creates cognitive cost, performance cost, and accessibility failures.

## Required Practice

- Avoid motion without purpose.
- Provide reduced-motion alternatives.

## References

**Normative:**
- WCAG 2.2
- W3C Media Queries
- MDN `prefers-reduced-motion`

**Official:**
- web.dev

## Validation

- Motion behavior is reviewed for reduced-motion users.

---

# 53. BROWSER COMPATIBILITY

## Rule

Supported browsers must be defined by product requirements, and experimental APIs must include fallbacks where required.

## Rationale

Browser-specific hacks without justification create maintenance burden and inconsistent behavior.

## Required Practice

- Define supported browsers explicitly.
- Avoid undocumented compatibility assumptions.

## References

**Official:**
- MDN Browser Compatibility Data
- Can I Use
- Web Platform Tests
- WHATWG

## Validation

- Browser support decisions are documented.

---

# 54. THIRD-PARTY SERVICES

## Rule

Third-party services must be evaluated for security, privacy, performance, availability, cost, vendor lock-in, and failure behavior.

## Rationale

Unreviewed dependencies on external services create availability and security risk.

## Required Practice

- Do not make critical product functions depend on unnecessary external services.
- Document failure behavior and fallback plans.

## References

**Normative:**
- NIST SSDF
- OWASP Third-Party Components guidance
- Twelve-Factor App

## Validation

- Third-party integrations include documented risk assessment.

---

# 55. TECHNICAL DEBT

## Rule

Technical debt must be identified, documented, prioritized, and tracked.

## Rationale

Unmanaged debt becomes structural risk in security, reliability, and performance.

## Required Practice

- Record debt explicitly.
- Prioritize remediation when risk rises.
- Do not normalize permanent workarounds.

## References

**Normative:**
- ISO/IEC 25010
- NIST SSDF

**Official:**
- Agile engineering practices

## Validation

- Technical debt is visible and reviewed regularly.

---

# 56. GOVERNANCE CHANGE POLICY

## Rule

`GOVERNANCE.md` must not be changed casually.

## Rationale

Casual governance changes destabilize AI-agent behavior, architecture decisions, and review standards.

## Required Practice

- Provide clear justification and impact assessment.
- Review AI-agent behavior, architecture impact, and documentation.
- Create an ADR for material governance changes.

## References

**Normative:**
- ISO/IEC/IEEE 42010
- ISO/IEC/IEEE 12207
- ADR methodology

## Validation

- Governance changes are documented and reviewed before adoption.

---

# 57. INITIALIZATION REQUIREMENTS

## Rule

Governance initialization must inspect the repository, create required structure, and avoid unrelated feature work or migrations.

## Rationale

Initialization must establish stable foundations without disturbing existing application behavior.

## Required Practice

- Inspect repository, architecture, packages, infrastructure, CI/CD, and documentation.
- Create governance, ADR, agent, workflow, checklist, template, and status artifacts.
- Do not begin unrelated feature development, application redesign, or architectural migration during initialization.

## References

**Normative:**
- ISO/IEC/IEEE 12207
- NIST SSDF

**Official:**
- GitLab Documentation
- ADR methodology

## Validation

- Initialization reports list files created/modified, conflicts, gaps, and recommended next phase.

---

# 58. KIMI / OPENCODE OPERATING MODE

## Rule

Implementation agents must operate under this governance system and may not interpret user requests as permission to violate governance.

## Rationale

Agents must preserve architectural and quality guarantees even under pressure to deliver quickly.

## Required Practice

For every implementation request:
1. Read Governance
2. Read Architecture
3. Read ADRs
4. Read Project Status
5. Inspect Code
6. Determine Risk
7. Research / Verify
8. Plan
9. Implement
10. Validate
11. Review
12. Document
13. Update Status
14. Commit / Merge Request

If a requested change conflicts with governance:
1. Stop
2. Explain conflict
3. Identify affected rule
4. Evaluate alternatives
5. Create ADR if required
6. Request / Await Architectural Decision

## References

**Normative:**
- NIST SSDF
- NIST AI RMF

**Official:**
- GitLab Merge Requests
- OWASP SAMM

## Validation

- Agent outputs include governance alignment statements and evidence.

---

# 59. FINAL GOVERNANCE RULE

## Rule

The repository must become self-governing.

## Rationale

A self-governing repository enables consistent development by humans and agents without repeated instruction.

## Required Practice

- Preserve institutional knowledge in documentation, ADRs, and status files.
- Keep documentation truthful and current.
- Never treat production as an experiment.

## Validation

- A new developer or agent can understand purpose, architecture, standards, history, and constraints from the repository alone.

---

# 60. GOVERNANCE QUALITY GATE

## Rule

Before accepting significant implementation, the governance quality gate must be verified.

## Rationale

A single checklist prevents skipped security, performance, accessibility, SEO, testing, documentation, and review requirements.

## Required Practice

Verify before merge:
- [ ] Governance rules followed
- [ ] Architecture reviewed
- [ ] ADR created if required
- [ ] Correct technology version verified
- [ ] Official documentation consulted where required
- [ ] Security implications reviewed
- [ ] Performance implications reviewed
- [ ] Accessibility implications reviewed
- [ ] Responsive behavior reviewed
- [ ] SEO implications reviewed where applicable
- [ ] Tests completed
- [ ] CI passed
- [ ] Documentation updated
- [ ] PROJECT_STATUS updated
- [ ] Rollback considered where applicable
- [ ] Merge Request reviewed

## References

**Normative:**
- NIST SSDF
- OWASP ASVS
- WCAG 2.2
- web.dev
- ISO/IEC 25010

**Official:**
- GitLab CI/CD

## Validation

- Significant merge requests include a completed quality gate record.

---

# 61. GOVERNANCE STATUS

## Rule

This document represents the current governing rules and must evolve intentionally.

## Rationale

Governance that does not evolve becomes obsolete; governance that changes arbitrarily becomes unreliable.

## Required Practice

- Change must be intentional.
- Architecture must be explicit.
- Security must be continuous.
- Performance must be measured.
- Accessibility must be respected.
- Design must be original.
- AI must be governed.
- Documentation must remain truthful.
- Production must never be treated as an experiment.

## Validation

- Changes to governance are justified, reviewed, and versioned.

---

# GOVERNANCE CHANGE LOG

| Version | Date | Summary |
|---|---|---|
| 1.2.0 | 2026-08-18 | Rebuilt into governance-spec format. Every technical section now carries Rule, Rationale, Required Practice, References, and Validation. Reference taxonomy enforced: Normative / Official / Benchmark / Inspiration. |
| 1.1.0 | 2026-08-08 | Merged governance draft into active 61-section document; added design-inspiration catalog A–X, design research rules, review requirement. |
| 1.0.0 | — | Initial governance system. |

---

# END OF GOVERNANCE

HEXA STUDIO is not governed by prompts.

It is governed by:

**Principles → Architecture → Decisions → Standards → Agents → Reviews → CI/CD → Production**

And every AI agent working on the project is expected to operate within that system.
