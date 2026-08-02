# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records for HEXA Vision.

## Index

| ADR | Decision | Status |
|-----|----------|--------|
| [ADR-001](001-nextjs-app-router.md) | Next.js App Router as Frontend Framework | Accepted |
| [ADR-002](002-react-three-fiber.md) | React Three Fiber for 3D Visualization | Accepted |
| [ADR-003](003-docker-compose.md) | Docker Compose for Development and Deployment | Accepted |
| [ADR-004](004-monorepo-structure.md) | Monorepo Structure with Shared Packages | Accepted |
| [ADR-005](005-tailwindcss.md) | TailwindCSS 4 for Styling | Accepted |
| [ADR-006](006-state-management.md) | Zustand + TanStack Query for State Management | Accepted |
| [ADR-007](007-opentelemetry-tracing.md) | OpenTelemetry + Grafana Tempo for Distributed Tracing | Accepted |
| [ADR-008](008-request-id-propagation.md) | Request ID Propagation for End-to-End Traceability | Accepted |
| [ADR-009](009-enterprise-governance-framework.md) | Enterprise Architecture Governance Framework | Accepted |
| [ADR-010](010-operating-model.md) | AI-Agent Operating Model (GOVERNANCE → ORCHESTRATOR → ARCHITECT/BUILDER/REVIEWER → GitLab → CI/CD → Staging → Production) | Accepted |

## Creating New ADRs

1. Copy the template from `TEMPLATE.md`
2. Name the file `NNN-decision-name.md`
3. Update this index
4. Submit a PR for review

## Template

```markdown
# ADR-NNN: Title

## Status
Proposed | Accepted | Deprecated | Superseded by [ADR-NNN](link)

## Date
YYYY-MM-DD

## Context
What is the issue that we're seeing that motivates this decision?

## Decision
What is the change that we're proposing and/or doing?

## Alternatives Considered
| Alternative | Pros | Cons |
|-------------|------|------|
| ... | ... | ... |

## Rationale
Why this decision over alternatives?

## Consequences
What are the consequences of this decision?

## References
- Links to relevant documentation
```
