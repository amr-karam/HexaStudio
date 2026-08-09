# 🚀 RELEASE MANAGEMENT & PUBLISHING FLOW

**Version:** 1.0.0 | **Scope:** Release Operations | **Standard:** Semantic Versioning 2.0.0

---

## 1. OVERVIEW & STRATEGY

HEXA Vision follows **Semantic Versioning (SemVer 2.0.0)** (`MAJOR.MINOR.PATCH`). Releases are published through release branches (`release/vX.Y.Z`) and deployed via zero-downtime rolling updates.

---

## 2. RELEASE STAGING WORKFLOW

```
  develop ──► Branch release/v1.1.0 ──► Staging QA & E2E ──► Merge main (Tag v1.1.0) ──► CD Deploy
```

1. **Cut Release Branch**: Branch `release/vX.Y.Z` from `develop`.
2. **Version Bump**: Bump version in root `package.json` and sync `CHANGELOG.md`.
3. **Staging Validation**: Deploy to Staging environment (`staging.hexastudio.net`) for UAT and Playwright regression testing.
4. **Chief Architect Approval**: Final sign-off against Gate 5 Release Criteria.
5. **Merge & Tag**: Merge release branch into `main` with standard Git tag (`vX.Y.Z`). Back-merge into `develop`.

---

## 3. HOTFIX FLOW

For emergency production fixes:
1. Branch `hotfix/vX.Y.Z` directly from `main`.
2. Apply fix and test locally and in staging.
3. Merge into `main` and `develop` simultaneously.
4. Trigger immediate production CD pipeline.

---

## 4. OPERATIONAL COMMANDS

```bash
# Create release branch
git checkout -b release/v1.1.0 develop

# Create annotated release tag
git tag -a v1.1.0 -m "Release v1.1.0 - Horizon 3 AI Integrations"
git push origin v1.1.0
```

---

## 5. RELATED DOCUMENTATION

- [TAGGING.md](docs/git/TAGGING.md) — Git tagging rules.
- [CHANGELOG.md](./CHANGELOG.md) — Release changelog.
- [DEPLOYMENT.md](docs/devops/DEPLOYMENT.md) — Production CD execution.
