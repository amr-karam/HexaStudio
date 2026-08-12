# 📝 CONVENTIONAL COMMIT STANDARDS

**Version:** 1.0.0 | **Scope:** Commit Messages | **Standard:** Conventional Commits v1.0.0

---

## 1. OVERVIEW & PRINCIPLES

HEXA Vision strictly enforces the **Conventional Commits specification**. Commit messages serve as automated audit logs, drive CHANGELOG generation, and communicate context clearly across human and AI agent teams.

---

## 2. COMMIT MESSAGE STRUCTURE

```
<type>(<scope>): <short summary in lowercase>

[optional body giving context, reasoning, and design decisions]

[optional footer(s): BREAKING CHANGE or issue reference]
```

---

## 3. COMMIT TYPES & SCOPES

### Mandatory Commit Types
- `feat`: A new feature for the user or platform.
- `fix`: A bug fix.
- `docs`: Documentation changes only (e.g. Playbook updates).
- `style`: Code style/formatting (white-space, missing semi-colons, no code logic change).
- `refactor`: Code refactoring without feature or bug change.
- `perf`: Performance improvement (e.g. TBT reduction, shader optimization).
- `test`: Adding or correcting tests.
- `chore`: Maintenance tasks, build tooling, dependency updates.
- `ci`: Changes to CI/CD workflows or scripts.
- `security`: Security patches or header updates.

### Standard Scopes
- Apps: `frontend`, `backend`, `cms`, `mobile`.
- Packages: `types`, `ui`, `utils`.
- Infrastructure: `devops`, `docker`, `traefik`, `odoo`, `db`.
- Documentation: `playbook`, `adr`.

---

## 4. EXAMPLES

```bash
# Feature commit
feat(frontend): implement ChapterProgress side rail navigation

# Bug fix commit
fix(backend): resolve NestJS config barrel import type error

# Performance commit
perf(frontend): defer GSAP ScrollTrigger init to idle window

# Breaking change commit
feat(api)!: update project response DTO structure to v2
```

---

## 5. AUTOMATED COMMIT-MSG VALIDATION

The pre-commit git hook (`scripts/git-hooks/commit-msg`) validates formatting prior to commit creation using `commitlint`. Non-conforming commits are automatically rejected.

---

## 6. RELATED DOCUMENTATION

- [GIT_WORKFLOW.md](GIT_WORKFLOW.md) — Git workflow.
- [BRANCHING.md](BRANCHING.md) — Branching strategy.
- [CHANGELOG.md](./CHANGELOG.md) — Project changelog.
