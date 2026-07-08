# SOP-TO-02: Emergency Hotfix Deployment

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  
**Owner:** DevOps Engineer / Chief Architect  

---

## Goal

To resolve critical production issues (SEV-1/SEV-2) as quickly as possible while maintaining stability and ensuring the fix is properly integrated into the main development branch.

## Prerequisites

- Incident identified and triaged as SEV-1 or SEV-2.
- Root cause identified.
- Temporary mitigation applied (if possible).

## Step-by-Step Process

### 1. Isolation
- **Branch:** Create a hotfix branch from `main`: `hotfix/issue-id`.
- **Environment:** Reproduce the issue in a local environment using the production data snapshot (anonymized).

### 2. Fix Implementation
- **Minimal Change:** Implement the smallest possible fix to resolve the issue. Avoid "while I'm here" refactors.
- **Verify:** Test the fix against the reproduction case.
- **Regression:** Run critical path E2E tests to ensure no other features are broken.

### 3. Fast-Track Review
- **PR:** Open PR against `main`.
- **Review:** Immediate review by at least one lead. Focus on correctness and side effects.
- **CI:** Ensure CI pipeline passes (lint, typecheck, tests).

### 4. Deployment
- **Merge:** Squash merge into `main`.
- **Deploy:** Trigger production deployment.
- **Verification:** Verify the fix on the live site.

### 5. Synchronization
- **Backport:** Cherry-pick the fix into `develop` to prevent regression in future releases.
- **Close:** Close the incident ticket.

## Verification

- [ ] Fix verified on production.
- [ ] No regressions in critical paths.
- [ ] Fix merged into both `main` and `develop`.

## Exception Handling

| Issue | Action |
|-------|---------|
| Fix causes more issues | Immediate rollback to previous tag |
| CI is too slow | Manual verification by two leads (emergency only) |
| No available reviewer | Escalate to Chief Architect |

## Related Docs

- `RELEASE_PROCESS.md`
- `devops\incident-response.md`
- `devops\disaster-recovery.md`
