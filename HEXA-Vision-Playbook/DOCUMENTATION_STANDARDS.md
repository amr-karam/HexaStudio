# Documentation Standards

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Principles

1. **Living Documents** — Documentation is never "done". It evolves with the codebase.
2. **Self-Documenting Code First** — Write clear code before writing documentation.
3. **Single Source of Truth** — One authoritative location for each piece of information.
4. **Just Enough** — Document the "why" and "how", not the obvious "what".
5. **Accessible** — Written for both human developers and AI Agents.

---

## Document Types

| Type | Location | Purpose |
|------|----------|---------|
| **Playbook** | `HEXA-Vision-Playbook/` | Operating manual, standards, processes |
| **Architecture** | `docs/` | High-level system documentation |
| **Code** | In-source | JSDoc for public APIs only |
| **API** | Swagger (in NestJS) | Automatically generated from decorators |
| **Sprint** | `HEXA-Vision-Playbook/sprints/` | Sprint backlogs and retrospectives |
| **ADR** | `HEXA-Vision-Playbook/adr/` | Architecture Decision Records |
| **Templates** | `HEXA-Vision-Playbook/templates/` | Reusable document templates |
| **Meeting Notes** | `HEXA-Vision-Playbook/meeting-notes/` | Meeting records |

---

## Markdown Style Guide

### Headers

```markdown
# Title (H1) — Document title, one per file
## Section (H2) — Major sections
### Subsection (H3) — Within sections
#### Sub-subsection (H4) — Avoid if possible
```

### Code Blocks

Use fenced code blocks with language annotation:

```typescript
const greeting: string = 'Hello, world!';
```

### Tables

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

### Lists

- Unordered with `-`
- Ordered with `1.`
- Nested with 2-space indent

### Admonitions

```markdown
> **Note:** Additional context.

> **Warning:** Important caution.

> **Critical:** This is a hard requirement.
```

### Links

```markdown
[Link text](path/to/document.md)
```

### Images

```markdown
![Alt text](path/to/image.png)
```

---

## Document Metadata

Every Playbook document must start with:

```markdown
# Title

**Version:** 1.0.0
**Last Updated:** YYYY-MM-DD
**Owner:** Role Name

---
```

---

## API Documentation

### In NestJS

Use Swagger decorators on all endpoints:

```typescript
@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id);
  }
}
```

### API Documentation Rules

- Every endpoint must have `@ApiOperation`
- Every DTO must have `@ApiProperty`
- Every parameter must have `@ApiParam` or `@ApiQuery`
- Every response must have `@ApiResponse`

---

## In-Code Documentation

### When to Comment

| Situation | Comment? | Example |
|-----------|----------|---------|
| Complex business logic | Yes | "Why we use this algorithm" |
| Non-obvious performance decision | Yes | "This cache avoids N+1 queries" |
| Workaround for third-party issue | Yes | "Bug in library X requires..." |
| Public API | Yes | JSDoc for exported functions |
| Simple getter/setter | No | Code is self-documenting |
| Obvious loop/condition | No | Says what it does |

### JSDoc Format

```typescript
/**
 * Formats a date string for display.
 *
 * @param date - ISO 8601 date string
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-01-15', 'en-US')
 * // Returns: 'January 15, 2024'
 */
export function formatDate(date: string, locale = 'en-US'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

### TODO Comments

TODOs are **temporary** and must include:

```typescript
// TODO(@username): Fix this when API v2 is released
// TODO(#123): Implement retry logic after rate limit fix
```

---

## ADR Format

Architecture Decision Records follow the MADR format:

```markdown
# ADR-{NNN}: {Title}

**Status:** {Proposed | Accepted | Deprecated | Superseded}
**Date:** {YYYY-MM-DD}
**Deciders:** {Names}

---

## Context

What is the issue motivating this decision?

## Decision

What is the change being proposed?

## Consequences

What becomes easier or harder?

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Option A | ... | ... |
| Option B | ... | ... |

## Compliance

How will this decision be enforced?
```

---

## Versioning

All documents in the Playbook are versioned:

- **Version** reflects document content, not file state
- **Changelog** at the bottom of each document tracks changes
- **Breaking changes** increment MAJOR version

### Changelog Section (at bottom of document)

```markdown
---

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-07-08 | Initial version |
| 1.1.0 | 2026-08-01 | Added XYZ section |
```

---

## Review Cadence

| Document Type | Review Frequency | Reviewer |
|---------------|-----------------|----------|
| Playbook root docs | Quarterly | Chief Architect |
| Architecture docs | Per ADR | Chief Architect |
| Sprint docs | Per sprint | Product Owner |
| API docs | Per endpoint | Backend Lead |
| Templates | Per use | Document creator |

---

## File Naming

| Rule | Example |
|------|---------|
| UPPER_SNAKE_CASE | `PRODUCT_VISION.md` |
| kebab-case for subdirs | `meeting-notes/` |
| kebab-case for ADRs | `adr-001-auth-strategy.md` |
| Semantic prefixes | `TEMPLATE_*.md` |

---

## Templates

See `templates/` directory for reusable templates:

- `TEMPLATE_Feature_Story.md` — Feature implementation story
- `TEMPLATE_PR.md` — Pull Request description
- `TEMPLATE_Meeting_Notes.md` — Meeting records
- `TEMPLATE_Sprint_Review.md` — Sprint retrospective
- `TEMPLATE_Incident_Report.md` — Post-incident analysis
