# SOP-TO-04: Security Vulnerability Patching

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  
**Owner:** Security Architect / DevOps Architect  

---

## Goal

To ensure that all identified security vulnerabilities in the application or infrastructure are patched swiftly and systematically, minimizing the window of exposure.

## Prerequisites

- Access to Sentry and Prometheus alerts.
- Access to `15-QUALITY\SECURITY_AUDIT.md`.
- Staging environment identical to Production.
- Approved "Emergency Patch" pipeline in GitHub Actions.

## Step-by-Step Process

### 1. Identification & Triage
- **Trigger:** Alert from Sentry, a vulnerability scan (npm audit, Snyk), or a report from the Security Architect.
- **Triage:** Assign a severity level (Critical, High, Medium, Low) based on the CVSS score.
- **Logging:** Record the vulnerability in `15-QUALITY\SECURITY_AUDIT.md` with a "Pending" status.

### 2. Analysis & Isolation
- **Reproduction:** Attempt to reproduce the vulnerability in the `development` environment.
- **Impact Analysis:** Determine which components are affected (e.g., "BFF API", "Client Portal").
- **Isolation:** If critical, implement a temporary WAF rule via Cloudflare to block the attack vector while the patch is developed.

### 3. Development & Testing
- **Patching:** Implement the fix (e.g., updating a dependency, adding input validation, rotating a leaked key).
- **Unit Testing:** Write a regression test that fails without the patch and passes with it.
- **Security Audit:** Have the Security Architect review the fix to ensure it doesn't introduce new vulnerabilities.

### 4. Deployment & Verification
- **Staging:** Deploy the patch to `staging` and run the full E2E test suite.
- **Production:** Execute the "Emergency Patch" deployment pipeline.
- **Verification:** Re-run the vulnerability scan to confirm the issue is resolved.

### 5. Closure
- **Documentation:** Update the `SECURITY_AUDIT.md` to mark the vulnerability as "Resolved".
- **Review:** Conduct a brief post-mortem to identify how the vulnerability was introduced and how to prevent it.

## Verification

- [ ] Vulnerability scan returns "Clean" for the affected component.
- [ ] Regression tests pass.
- [ ] No performance regression observed in production.
- [ ] Security Audit log updated.

## Exception Handling

| Issue | Action |
|-------|---------|
| Patch breaks core feature | Roll back immediately, refine patch in staging |
| Dependency conflict | Use `overrides` in package.json (if safe) or seek alternative library |
| Zero-day with no fix | Implement strict WAF rules and disable affected feature |

## Related Docs

- `06-STANDARDS\SECURITY.md`
- `15-QUALITY\SECURITY_AUDIT.md`
- `15-QUALITY\SECURITY_CHECKLIST.md`
