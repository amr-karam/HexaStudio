# 🌿 GIT STRATEGY: THE VERSION CONTROL LAW

**Version:** 1.0 | **Scope:** All Engineering | **Standard:** Atomic / Traceable / Clean

## 1. THE GIT PHILOSOPHY
Our Git history is not just a log of changes; it is a **chronicle of decisions**. We maintain a clean, linear history that allows us to pinpoint the exact moment a bug was introduced or a feature was added.

---

## 2. THE BRANCHING MODEL (Modified Git-Flow)

### I. Primary Branches
- **`main`:** The "Production" branch. Always stable. Only merges from `stage`.
- **`stage`:** The "Pre-Production" branch. Used for final QA and UAT.
- **`develop`:** The "Integration" branch. Where all feature branches merge.

### II. Supporting Branches
- **`feature/name`:** For new functionality. Merges into `develop`.
- **`bugfix/name`:** For fixing bugs. Merges into `develop`.
- **`hotfix/name`:** For critical production bugs. Merges into `main` and `develop`.

---

## 3. THE COMMIT STANDARD (Conventional Commits)

Every commit message must follow this format:
`<type>(<scope>): <description>`

### Types:
- `feat`: New feature.
- `fix`: Bug fix.
- `docs`: Documentation only.
- `style`: Formatting, missing semi-colons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: Performance improvement.
- `test`: Adding missing tests.
- `chore`: Updating build tasks, package manager configs, etc.

**Example:** `feat(auth): implement JWT rotation for client portal`

---

## 4. THE PULL REQUEST (PR) PROTOCOL

### I. The PR Requirements
A PR cannot be merged unless:
- [ ] It is linked to a task in `OPEN_TASKS.md`.
- [ ] It passes all CI checks (Lint, Test, Build).
- [ ] It has been reviewed and approved by at least one other agent/human.
- [ ] The `Definition of Done (DoD)` is fully checked.

### II. The Review Process
- **Focus:** Logic, security, and adherence to `CODING_STANDARDS.md`.
- **Tone:** Constructive, critical, and focused on the code, not the person.

---

## 5. QUALITY GATE: GIT AUDIT
A merge is "Git-Done" only when:
- [ ] The commit history is linear (use `rebase` or `squash merge`).
- [ ] The commit messages are conventional.
- [ ] The PR is documented and approved.
- [ ] The branch is deleted after merging.

*“Clean history is the mark of a professional engineer.”*
