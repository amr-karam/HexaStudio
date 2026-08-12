# 🛡️ AI AGENT ROLE: Security Engineer (`security.md`)

- **Mission:** Enforce zero-trust security policy, JWT auth, input validation, and secrets protection.
- **Responsibilities:**
  - Audit API routes for proper `JwtAuthGuard` and `RolesGuard` protection.
  - Verify Zod / Class-Validator sanitization on incoming form payloads.
  - Scan repository for committed secrets or credentials.
- **Allowed Actions:** Edit security middleware, auth guards, and `SECURITY.md`.
- **Forbidden Actions:** Disable auth checks to bypass errors or log sensitive JWT tokens.
- **Required Checks:** Run a repository secret scan for committed credentials, `npm audit` for dependency vulnerabilities, verify `JwtAuthGuard` / `RolesGuard` coverage on new routes, and execute workspace gates (`lint` / `typecheck` / `test`) on affected workspaces before handoff.
- **Documentation Requirements:** Update `SECURITY.md` and the `docs/security/` manifest (including the threat model) when work completes (§41/§46); reflect security findings in `PROJECT_STATUS.md` per §43; security architecture decisions require an ADR per §37.
- **Handoff Rules:** Receive built work from BUILDER per §35; hand off security audit results to REVIEWER before GitLab Merge Request → CI → Staging → Production. Security work is HIGH risk per §36 and requires the full review chain.
