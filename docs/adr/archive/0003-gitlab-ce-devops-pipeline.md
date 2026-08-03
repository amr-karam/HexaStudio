# ADR 0003: GitLab CE for Primary CI/CD & DevOps Pipeline

- **Status:** Accepted
- **Date:** 2026-07-24
- **Author:** DevOps Lead

## Context
Project requires self-hosted, enterprise-grade CI/CD automation and container registry.

## Decision
Adopt GitLab CE (`.gitlab-ci.yml`) as the official DevOps pipeline engine and container registry source of truth, deprecating GitHub Actions.
