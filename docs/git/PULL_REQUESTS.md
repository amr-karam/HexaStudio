# 🔀 PULL REQUEST & CODE REVIEW PROTOCOLS

**Version:** 1.0.0 | **Scope:** Code Review & Merging | **Standard:** Zero-Regression PR Threshold

---

## 1. OVERVIEW & OBJECTIVES

Pull Requests (PRs) are the primary gate for introducing code changes into integration (`develop`) and production (`main`) branches. Every PR MUST satisfy automated CI checks and pass human/agent peer code review.

---

## 2. PR LIFECYCLE & REQUIREMENTS

```
  Create PR ──► CI Checks (Lint / Typecheck / Test / Build) ──► Peer Review ──► Squash & Merge
```

### Pre-PR Checklist
1. **Scope Limit**: Atomic scope targeting a single feature or bugfix ticket.
2. **Title**: Follows Conventional Commit format (`type(scope): description`).
3. **Template**: Uses standard template (`docs/templates/TEMPLATE_PR.md`).
4. **Automated Checks**: 100% pass on lint, typecheck, unit tests, and production build.
5. **No Any Types**: Zero `any` casts or unjustified `@ts-ignore` flags.

---

## 3. REVIEW CRITERIA (THE "GOLD STANDARD")

Reviewers grade PRs across 5 dimensions:
1. **Architectural Symmetry**: Frontend/Backend shared DTO consistency in `/packages/types`.
2. **Security**: Inputs validated via NestJS `ValidationPipe`, no leaked secrets or plain-text passwords.
3. **Performance**: No unhandled memory leaks in R3F 3D components (`useEffect` disposal hooks present), no main-thread long tasks introduced.
4. **Accessibility**: Reduced-motion emulation verified, WCAG contrast targets maintained.
5. **Documentation**: Playbook and ADRs updated if new patterns or endpoints were added.

---

## 4. MERGE RULES

- **Feature/Bugfix to `develop`**: **Squash and Merge** (single atomic commit on target branch).
- **Release to `main`**: **Merge Commit** (preserves release branch history).
- Branch automatically deleted upon successful merge.

---

## 5. RELATED DOCUMENTATION

- [TEMPLATE_PR.md](../templates/TEMPLATE_PR.md)) — Pull Request template.
- [QUALITY_GATES.md](../quality/QUALITY_GATES.md)) — Review quality gates.
- [COMMITS.md](COMMITS.md)) — Commit standards.
