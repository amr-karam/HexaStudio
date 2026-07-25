# 🌿 GIT BRANCHING STRATEGY & MODEL

**Version:** 1.0.0 | **Scope:** Repository Workflow | **Standard:** Modified Git-Flow Strategy

---

## 1. OVERVIEW & BRANCH MODEL

HEXA Vision enforces a **Modified Git-Flow** branching model tailored for monorepo development. Code changes flow sequentially through feature isolation, integration testing, staging QA, and tagged production deployment.

```
  main      ───●───────────────────────────● (v1.0.4 Release Tag)
                ▲                           ▲
  stage     ────┼──────────────●────────────┤ (Staging / UAT)
                │              ▲            │
  develop   ───●───●───────●───┴───●────────┘ (Integration)
                   │       ▲
  feature/* ───────┴──●────┘ (Short-lived feature isolation)
```

---

## 2. BRANCH TYPES & CONVENTIONS

| Branch | Base | Target | Merge Strategy | Lifecycle | Protection Rules |
|--------|------|--------|----------------|-----------|------------------|
| `main` | — | Production | Merge Commit (Release) | Permanent | Require PR, 1 Approval, CI Green |
| `stage` | `develop` | Staging | Merge Commit | Permanent | Require PR, CI Green |
| `develop` | `main` | Integration | Merge Commit | Permanent | Require PR, CI Green |
| `feature/*` | `develop` | `develop` | **Squash & Merge** | Ephemeral | Delete on merge |
| `bugfix/*` | `develop` | `develop` | **Squash & Merge** | Ephemeral | Delete on merge |
| `hotfix/*` | `main` | `main` & `develop` | **Squash & Merge** | Ephemeral | Immediate deploy |

---

## 3. BRANCH NAMING CONVENTIONS

- `feature/<ticket-id>-<short-description>` (e.g. `feature/S16-P11-font-css-async`)
- `bugfix/<ticket-id>-<short-description>` (e.g. `bugfix/S15-csp-cloud-flare-beacon`)
- `hotfix/v<version>-<short-description>` (e.g. `hotfix/v1.0.4-oom-cms-build`)
- `release/v<version>` (e.g. `release/v1.1.0`)

---

## 4. WORKTREE LIFECYCLE HOOKS (`paseo-hooks/`)

Developers using Paseo worktree daemon execute isolated feature branches in independent git worktrees:
- `post-create`: Auto-installs dependencies (`npm install --legacy-peer-deps`).
- `pre-archive`: Stashes uncommitted WIP and cleans docker development containers.
- `post-archive`: Removes stale references and updates local tracking.

---

## 5. OPERATIONAL COMMANDS

```bash
# Create feature branch in new Paseo worktree
npm run paseo:worktree:create -- feature/S16-my-feature

# List active worktrees
git worktree list

# Archive completed worktree
npm run paseo:worktree:archive -- feature/S16-my-feature
```

---

## 6. RELATED DOCUMENTATION

- [GIT_STRATEGY.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/14-GIT/GIT_STRATEGY.md) — Core Git strategy.
- [COMMITS.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/14-GIT/COMMITS.md) — Commit conventions.
- [PULL_REQUESTS.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/14-GIT/PULL_REQUESTS.md) — PR review standards.
