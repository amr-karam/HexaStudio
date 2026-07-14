# Git Workflow

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Branch Model

```
main (production)
  │
  └── develop (integration)
        │
        ├── feature/feature-name
        ├── bugfix/issue-id
        ├── hotfix/issue-id
        └── release/x.y.z
```

---

## Branch Strategy

| Branch | Source | Target | Purpose |
|--------|--------|--------|---------|
| `main` | — | — | Production-ready code. Protected. |
| `develop` | `main` | `main` | Integration branch. Protected. |
| `feature/*` | `develop` | `develop` | New features |
| `bugfix/*` | `develop` | `develop` | Non-critical bug fixes |
| `hotfix/*` | `main` | `main` | Critical production fixes |
| `release/*` | `develop` | `main` | Release preparation |

### Branch Protection Rules

#### `main`
- Require pull request before merging
- Require approvals (1 minimum)
- Require status checks (CI)
- No direct pushes
- Require linear history

#### `develop`
- Require pull request before merging
- Require status checks (CI)
- No direct pushes

---

## Naming Conventions

```
feature/descriptive-kebab-case-name
bugfix/issue-number-short-description
hotfix/issue-number-short-description
release/major.minor.patch
```

**Examples:**
- `feature/project-3d-viewer`
- `bugfix/142-fix-nav-overflow`
- `hotfix/153-fix-auth-redirect`
- `release/1.2.0`

---

## Commit Convention: Conventional Commits

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, semicolons (no code change) |
| `refactor` | Code change — neither fix nor feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Build tasks, package config |
| `ci` | CI/CD changes |
| `security` | Security fixes |

### Scopes

| Scope | Area |
|-------|------|
| `frontend` | Next.js app |
| `backend` | NestJS API |
| `cms` | Strapi configuration |
| `types` | Shared types package |
| `utils` | Shared utilities |
| `docker` | Docker infrastructure |
| `scripts` | Build/deploy scripts |
| `docs` | Documentation |
| `playbook` | Playbook documents |

### Examples

```
feat(frontend): add interactive 3D project viewer

Implement WebGL-based project viewer with orbit controls.
Supports GLTF models with Draco compression.

Closes #42
```

```
fix(backend): validate email before CRM push

Prevent invalid email addresses from being sent to Odoo.

Fixes #87
```

```
docs(playbook): add ADR for authentication strategy

Document the decision to use JWT over session-based auth.
```

---

## Commit Rules

1. **Atomic commits** — One logical change per commit
2. **Present tense** — "Add feature" not "Added feature"
3. **Capitalize** — First letter capitalized
4. **No period** — At end of subject line
5. **Body** — Explain "why" and "how", not "what"
6. **References** — Link issues with `Closes #N` or `Fixes #N`
7. **Breaking changes** — Append `!` after type/scope: `feat!`: or add `BREAKING CHANGE:` in footer

---

## Pull Request Process

### Title

Follow Conventional Commits format (same as commit).

### Description Template

```markdown
## What
Brief description of the change.

## Why
Why this change is necessary.

## How to Test
1. Checkout branch
2. Run `npm install`
3. Navigate to /projects
4. Verify the gallery renders correctly

## Screenshots
[Required for UI changes]

## Checklist
- [ ] Lint passes
- [ ] TypeScript passes
- [ ] Tests pass
- [ ] No console errors
- [ ] Accessibility verified
- [ ] Responsive verified
- [ ] Documentation updated
```

### Review Requirements

1. Minimum **one approval** from code owner or senior developer
2. All CI checks must pass
3. No unresolved conversations
4. UI changes require screenshots
5. Architectural changes require ADR

### Merge Strategy

| Branch | Strategy |
|--------|----------|
| `feature` → `develop` | Squash merge |
| `bugfix` → `develop` | Squash merge |
| `hotfix` → `main` | Squash merge |
| `release` → `main` | Merge commit |
| `main` → `develop` | Merge commit (fast-forward) |

---

## Linear History

We prefer linear history in `main` and `develop`:

- **Rebase** feature branches before merging (not required if squash merges are used)
- **No merge commits** in feature branches
- **Fast-forward** when possible

---

## Git Hooks

Git hooks are **version-controlled** in `scripts/git-hooks/` and deployed via `core.hooksPath`.

### Installation

```bash
npm run hooks:install        # Git hooks (core.hooksPath)
npm run paseo:hooks:install  # Paseo daemon hooks (~/.paseo/config.json)
```

### Git Hooks (scripts/git-hooks/)

| Hook | Action |
|------|--------|
| `pre-commit` | Warns if `.env` missing, runs GitWand secrets scan, typechecks staged files |
| `commit-msg` | Validates Conventional Commit format (`feat:`, `fix:`, etc.) |
| `post-checkout` | Auto-runs `.setup.sh` on uninitialized worktrees; reinstalls deps if `package-lock.json` changed |
| `post-merge` | Reinstalls deps when `package.json` changes, rebuilds on config changes |
| `post-rewrite` | Same as post-merge for rebase/amend |

### Lifecycle Hooks (paseo-hooks/)

These are written into Paseo's daemon program at `~/.paseo/hooks/worktree/` and fire during Paseo worktree operations:

| Event | Hook | Trigger |
|-------|------|---------|
| `post-create` | `hooks/worktree/post-create` | After `create_worktree` — installs deps & builds |
| `pre-archive` | `hooks/worktree/pre-archive` | Before `archive_worktree` — stops docker, stashes WIP |
| `post-archive` | `hooks/worktree/post-archive` | After `archive_worktree` — prunes refs, cleans PR branch |
| `post-merge` | `hooks/worktree/post-merge` | On auto-archive after merge — updates main, reinstalls |

---

## Workflow Examples

### Starting a Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/project-3d-viewer
```

### Committing During Development

```bash
git add .
git commit -m "feat(frontend): add orbit controls to 3D viewer"
```

### Opening a PR

```bash
git push origin feature/project-3d-viewer
# Open PR on GitHub: feature/project-3d-viewer → develop
```

### Handling a Hotfix

```bash
git checkout main
git pull origin main
git checkout -b hotfix/153-fix-auth-redirect
# Fix the issue
git commit -m "fix(backend): correct auth redirect URL"
git push origin hotfix/153-fix-auth-redirect
# PR → main, then cherry-pick to develop
```
