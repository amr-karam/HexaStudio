# HEXA Studio — Dependency Catalog

**Version:** 1.0  
**Last Updated:** 2026-07-27  
**Owner:** Engineering / Security  
**Review Cadence:** Monthly and on every dependency change

## Governance Contract

Every direct dependency requires a purpose, governed version policy, license, security status, alternatives, upgrade strategy, owner, and review date. The full generated dependency inventory is the committed npm lockfile and CI SBOM; this catalog records material architectural dependencies and exceptions.

## Current Material Decision: Rolldown Linux Binding

| Field | Value |
|-------|-------|
| Package | `@rolldown/binding-linux-x64-gnu` |
| Version | `1.1.5` exact |
| Scope | Root optional dependency; CI/test tooling |
| Purpose | Native Linux x64 glibc binding required by Rolldown/Vite/Vitest in GitLab Docker jobs |
| Parent | `rolldown@1.1.5` via Vite/Vitest |
| License | MIT |
| Runtime exposure | Development/build only; not imported by application runtime code |
| Security status | Requires npm audit, SBOM, integrity lock, and native load verification |
| Alternatives | Full Linux lockfile regeneration; ad-hoc CI install; different test bundler |
| Decision | Exact optional root dependency selected for deterministic cross-platform lock behavior |
| Upgrade strategy | Upgrade atomically with Rolldown; verify matching version, integrity, Linux load, and full tests |
| Rollback | Revert ADR-010 implementation commit |
| Owner | DevOps Lead / QA Lead |
| Review date | 2026-08-27 or on Vite/Vitest upgrade, whichever is earlier |
| ADR | `ADR-010-ci-node-toolchain-and-native-dependencies.md` |

## Governed Toolchain

| Dependency/tool | Version | Purpose | License | Security/upgrade strategy | Owner | Review |
|-----------------|---------|---------|---------|---------------------------|-------|--------|
| Node.js CI image | `20.20.2-bookworm-slim` | Deterministic Linux execution baseline | Node.js license set | Pin digest in follow-up; quarterly patch review | DevOps | Quarterly |
| npm | `11.17.0` | Workspace install and lockfile management | Artistic-2.0 | Match root `packageManager`; upgrade with clean Linux validation | DevOps | Monthly |
| Vitest | Workspace declarations | Unit/integration test runner | MIT | Upgrade with Vite/Rolldown binding review | QA | Monthly |
| CycloneDX npm | CI `latest` currently | SBOM generation | Apache-2.0 | Pin exact version in follow-up | Security | S-019 |
| Trivy image | CI `latest` currently | Image vulnerability scanning | Apache-2.0 | Pin image version/digest in follow-up | Security/DevOps | S-019 |

## Open Dependency Governance Findings

| ID | Finding | Priority | Owner | Target |
|----|---------|----------|-------|--------|
| DEP-001 | Mutable `latest` tags remain in security and infrastructure tooling | P1 | DevOps/Security | S-019 |
| DEP-002 | CI cache includes native `node_modules`; use architecture-keyed tarball cache | P1 | DevOps | S-019 |
| DEP-003 | Expo/mobile advisory counts need reconciliation with `DEPENDENCY_REPORT.md` | P1 | Mobile/Security | S-019 |
| DEP-004 | `DEPENDENCY_REPORT.md` contains stale usage claims and must be regenerated | P2 | Engineering | S-019 |
