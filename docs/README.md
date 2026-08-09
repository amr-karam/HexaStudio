# HEXA STUDIO — Documentation Manifest

**Last Updated:** 2026-08-09
**Version:** 2.1.5

---

## Overview

This directory contains all project documentation organized by domain. All documents are version-controlled and subject to the governance rules defined in [GOVERNANCE.md](../../GOVERNANCE.md).

## Directory Structure

`
docs/
├── accessibility/     # WCAG 2.1 AAA compliance, a11y audits
├── adr/               # Architecture Decision Records (001-013)
├── agents/            # AI agent role definitions
├── ai/                # AI architecture, pipelines, prompts
├── analytics/         # BI, dashboards, metrics
├── api/               # API documentation, endpoints
├── architecture/      # System design, data flow, security architecture
├── audit/             # Historical audit reports
├── checklists/        # QA, release, deployment checklists
├── client-portal/     # Portal v3.0 feature documentation
├── design/            # Design system, tokens, components
├── devops/            # Docker, Traefik, monitoring, deployment
├── engineering/       # Coding standards, engineering guides
├── git/               # Branching, commits, PRs, release flow
├── implementation/    # Implementation plans and guidelines
├── meeting-notes/     # Historical meeting notes
├── odoo/              # Odoo ERP architecture and integrations
├── performance/       # Performance standards, budgets, audits
├── plan/              # Execution plans, milestones, risk register
├── product/           # Vision, roadmap, sprints, KPIs
├── prompts/           # Agent prompt templates
├── quality/           # Quality gates, testing, audits, reports
├── review/            # Final review reports
├── security/          # Security standards, threat models, incident response
├── seo/               # SEO standards and guides
├── spec/              # System specification, requirements, constraints
└── templates/         # Reusable document templates
`

## Key Documents

| Document | Purpose |
|----------|---------|
| [SYSTEM_SPECIFICATION.md](spec/SYSTEM_SPECIFICATION.md) | Canonical system specification |
| [SYSTEM_ARCHITECTURE.md](architecture/SYSTEM_ARCHITECTURE.md) | High-level architecture |
| [SECURITY_ARCHITECTURE.md](architecture/SECURITY_ARCHITECTURE.md) | Security architecture overview |
| [EXECUTION_PLAN.md](plan/EXECUTION_PLAN.md) | Phased execution roadmap |
| [FINAL_REVIEW.md](review/FINAL_REVIEW.md) | Final review with quality gate results |
| [ADR-012](adr/012-specification-and-plan-refresh.md) | Spec/plan refresh decision record |

## Governance

- All documentation changes must follow [GOVERNANCE.md](../../GOVERNANCE.md)
- Architecture changes require an ADR in [adr/](adr/)
- Quality gates must pass before merging documentation changes
- Outdated references (Next.js 15, WCAG 2.2 AA) must be updated to current stack (Next.js 16.2.11, WCAG 2.1 AAA)

## Conventions

- File naming: UPPER_SNAKE_CASE.md for canonical documents
- Version format: MAJOR.MINOR.PATCH (tracked in document headers)
- Status values: Draft, Active, Deprecated, Archived
- References: Use relative markdown links between documents
