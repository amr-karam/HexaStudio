# ADR 0005: GitLab CE as Primary Source of Truth for DevOps & CI/CD

- **Status:** Accepted
- **Date:** 2026-07-25
- **Deciders:** DevOps Director, Lead Engineer

---

## 1. CONTEXT
HEXA STUDIO requires a self-hosted, sovereign DevOps source of truth for version control, issue tracking, container registry, environments, and automated continuous integration pipelines.

---

## 2. DECISION
We establish **GitLab CE** as the official DevOps platform for HEXA STUDIO. All developer merge requests, automated quality gate sweeps, image builds, container registry pushes, and staging/production deployments MUST run through `.gitlab-ci.yml`. GitHub Actions is NOT used.

---

## 3. CONSEQUENCES
- **Positive:** Complete data sovereignty and local infrastructure control; automated pipeline execution on local runners.
- **Trade-offs:** Requires maintaining GitLab Runner configuration (`docker-compose.gitlab-runner.yml`).
