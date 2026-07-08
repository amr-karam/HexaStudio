# Agent Collaboration Guide

**Last Updated:** 2026-07-08

---

## Overview

This guide defines how AI agents collaborate to build the HEXA Vision platform. We operate as a multidisciplinary design and engineering team, emphasizing synchronization, transparency, and quality.

## Communication Protocol

Agents must communicate using these channels:

| Channel | Purpose | Frequency |
|---------|----------|-----------|
| **GitHub Issues** | Task tracking, bug reports, feature requests | As needed |
| **Pull Requests** | Code changes, architectural proposals, review | Every change |
| **ADRs** | Architectural decisions and rationale | Per decision |
| **Meeting Notes** | Synchronous alignment and brainstorming | Weekly / Ad-hoc |
| **Sprints** | Planning and progress tracking | Every 2 weeks |

## Collaboration Workflows

### 1. Feature Implementation

```
Product Owner (Sprints/Backlog)
    │
    ▼
Chief Architect (ADR / Design)
    │
    ├── Frontend Lead (Component design)
    └── Backend Lead (API design)
            │
            ▼
Frontend & Backend Leads (Implementation)
    │
    └── QA Lead (Testing / Verification)
            │
            ▼
Quality Gate Controller (Final Approval)
```

### 2. Architecture Change

```
Proposer (any agent)
    │
    ▼
Draft ADR (in adr/ directory)
    │
    ├── Review by Chief Architect
    ├── Review by relevant Lead Agents
    │
    ▼
Approval (Accepted status)
    │
    ▼
Implementation (PR with reference to ADR)
```

### 3. Bug Fix

```
QA Lead / User (Bug Report)
    │
    ▼
Triage (Product Owner / Lead Engineer)
    │
    ├── Assign Owner
    ├── Priority Level (SEV-1 to SEV-4)
    │
    ▼
Owner (Fix + Regression Test)
    │
    ▼
Review & Verify (QA Lead)
```

## Conflict Resolution

When agents disagree on an implementation or architectural choice:

1. **Evidence-based discussion** — Provide data, examples, and benchmarks
2. **Trade-off analysis** — List pros and cons of each option
3. **Escalate to Chief Architect** — Final decision authority for architecture
4. **Escalate to Product Owner** — Final decision authority for features/priority

## Coordination Rules

1. **No Parallel Changes** — Avoid editing the same file in multiple PRs. Coordinate via Issues.
2. **Respect Ownership** — Before changing a core module, consult the Lead Agent for that area.
3. **Document everything** — If a decision is made in a thread, update the ADR or documentation.
4. ** la-logs sync** — Keep the la-logs updated to reflect current progress and blockers.
5. **Shared Types first** — Always update `packages/types/` before implementing API or Frontend changes.

## AI Agent Etiquette

- **Be Concise** — Direct and to the point in communications
- **Be Constructive** — Review code for quality, not personality
- **Be Proactive** — Identify risks and suggest improvements
- **Be Transparent** — Document mistakes and lessons learned
- **Be Consistent** — Follow the Playbook without exception
