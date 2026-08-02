# ADR-011: Documentation Tree Migration to `docs/<area>/`

## Status
Accepted

## Date
2026-08-02

## Context
`GOVERNANCE.md` is the manifest for the documentation tree (ADR-010 defines the operating model; Section 46 maps each governance area to a `docs/<area>/` folder). The actual documentation content, however, lives in `HEXA-Vision-Playbook/` under 19 numbered folders (`00-GOVERNANCE` … `17-CHECKLISTS`, plus `agents/`, `meeting-notes/`).

This dual layout is confusing:
1. Two documentation roots (`docs/` and `HEXA-Vision-Playbook/`).
2. Playbook folder names are numeric (`01-ARCHITECTURE`) rather than area-named (`architecture`).
3. Numerous root-level duplicates (`ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `SECURITY.md`, …) mirror playbook content.
4. Internal cross-references throughout the playbook use `HEXA-Vision-Playbook/...` paths that break if content moves.
5. External agent configurations (`.junie/AGENTS.md`, `.opencode/agents/docs.md`, `.agents/skills/...`) reference playbook paths.

The four open questions from the migration review were:

| Gap | Decision |
|-----|----------|
| Unmapped playbook folders (04-AGENTS, 05-PROMPTS, 08-API, 09-ODOO, 10-AI, 11-ANALYTICS, 12-CLIENT-PORTAL, 14-GIT, 16-TEMPLATES, 17-CHECKLISTS, meeting-notes) | Add matching `docs/<area>/` folders for each (e.g. `docs/agents/`, `docs/api/`, `docs/odoo/`, `docs/meeting-notes/`) so no content is left behind |
| Root-level duplicate docs | Keep root files as the **manifest layer** (they are the highest authority per Section 4 hierarchy and are referenced by `AGENTS.md`); their canonical content lives in `docs/<area>/`. No root file is deleted in this ADR. |
| `HEXA-Vision-Playbook/` after migration | Becomes an **empty stub** with a single `README.md` redirect to `docs/`, then removed in a follow-up once all references are verified |
| Code restructure (`src/`, `apps/`, `infrastructure/`) | **Out of scope** for this ADR — the code tree remains a multi-app monorepo (ADR-004); the single-app `src/` layout is not adopted |

## Decision
Migrate documentation content from `HEXA-Vision-Playbook/` into `docs/<area>/` folders:

| Source (playbook) | Target (`docs/`) |
|-------------------|------------------|
| `00-GOVERNANCE/` | `product/` (vision, principles, metrics) |
| `01-ARCHITECTURE/` | `architecture/` |
| `01-ARCHITECTURE/ARCHITECTURE_DECISIONS/` | `adr/archive/` (legacy series — `docs/adr/` already owns the canonical ADR-001…011 numbering, so a subdirectory avoids filename collisions) |
| `02-ROADMAP/` | `product/` (sprints, backlog, status) |
| `03-BUSINESS/` | `product/` (SOPs, KPIs) |
| `04-AGENTS/` + `agents/` | `agents/` |
| `05-PROMPTS/` | `prompts/` |
| `06-STANDARDS/` | `engineering/` (+ `security/`, `performance/`, `accessibility/`, `seo/` picks) |
| `07-DESIGN/` | `design/` |
| `08-API/` | `api/` |
| `09-ODOO/` | `odoo/` |
| `10-AI/` | `ai/` |
| `11-ANALYTICS/` | `analytics/` |
| `12-CLIENT-PORTAL/` | `client-portal/` |
| `13-DEVOPS/` | `devops/` |
| `14-GIT/` | `git/` |
| `15-QUALITY/` | `quality/` |
| `16-TEMPLATES/` | `templates/` |
| `17-CHECKLISTS/` | `checklists/` |
| `meeting-notes/` | `meeting-notes/` |
| `HEXA-Vision-Playbook/README.md`, `CHANGELOG.md`, `AGENTS.md`, audit reports | `docs/` root, then delete the `HEXA-Vision-Playbook/` directory entirely (no stub — the target structure shows no such root) |

Migration mechanics:
- Use `git mv` to preserve history.
- Each playbook folder's own `README.md` is dropped in favor of the existing `docs/<area>/README.md` manifest (dedup rule — the manifest is the authoritative index).
- Rewrite all internal `HEXA-Vision-Playbook/...` cross-references to their new `docs/...` paths.
- Update external references in `.junie/AGENTS.md`, `.opencode/agents/docs.md`, and skill files.
- Update `docs/<area>/README.md` manifests to point at the post-move locations.
- Replace `HEXA-Vision-Playbook/` with a redirect stub.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Keep playbook as-is, `docs/` only as pointer layer | Zero reference churn | Two roots persist; duplicate navigation |
| Copy (not move) into `docs/` | No breakage of existing refs | Content duplication drifts out of sync |
| Single root `HEXA-Vision-Playbook/` with `docs/` removed | One root | Contradicts GOVERNANCE Section 46 manifest structure |
| Full code restructure to single `src/` app | Matches idealized layout | Breaks ADR-004 monorepo, Docker, CI — explicitly rejected |

## Rationale
- GOVERNANCE.md (Section 46) already defines `docs/<area>/` as the manifest target — this ADR makes the filesystem match the governance contract.
- `git mv` preserves history; reference rewriting keeps links valid.
- The multi-app monorepo (ADR-004) stays untouched — only documentation moves.
- External agent configs are updated in the same commit so the docs agent keeps working.

## Consequences
- All playbook references must be rewritten in the migration commit — this is the bulk of the change.
- `docs/<area>/README.md` manifests must be updated post-move.
- Follow-up: verify no dangling references remain, then delete the `HEXA-Vision-Playbook/` stub.
- Any new documentation goes into `docs/<area>/` going forward.

## References
- `GOVERNANCE.md` Section 46 — Documentation Manifest
- `docs/adr/010-operating-model.md` — AI-Agent Operating Model
- `docs/adr/004-monorepo-structure.md` — Monorepo structure (code tree unchanged)
- `docs/<area>/README.md` — Manifests
