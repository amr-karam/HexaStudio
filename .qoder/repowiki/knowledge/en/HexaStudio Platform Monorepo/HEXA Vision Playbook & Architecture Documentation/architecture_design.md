Three sibling documentation trees with distinct purposes:
- `HEXA-Vision-Playbook/` — the canonical playbook organized by domain (00-GOVERNANCE through 17-CHECKLISTS), each folder owning its own README plus a flat set of Markdown documents; cross-references use relative paths rather than a central index.
- `docs/ADR/` — an independent ADR archive mirroring the same decision-log pattern as `HEXA-Vision-Playbook/01-ARCHITECTURE/ARCHITECTURE_DECISIONS/`, with a single `README.md` index and a template-driven naming convention (`NNN-title.md`).
- `analysis/` — lightweight standalone analysis reports (architecture-analysis, codebase-progress, project-overview) not tied to any numbered domain.

Dependency direction is one-way: higher-numbered domains reference lower ones (e.g., 06-STANDARDS is cited from 05-PROMPTS and 15-QUALITY); there is no build step or tooling that renders these files — they are consumed directly by humans and AI agents via file reads.