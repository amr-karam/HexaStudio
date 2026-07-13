# Exploration Plan: Next Task Selection

## Summary

This plan defines a decision-complete exploration pass to identify the best next implementation task for `HexaStudio` without making repository changes yet. Based on the current Playbook, repository state, and official documentation, the most likely highest-value next task is `CMS/Strapi hardening` across proxy, URL, and admin access controls, followed by `Lighthouse CI`, then `frontend component test foundation`.

The plan follows a research-first workflow: prefer official sources, surface contradictions instead of smoothing them over, and avoid assuming that documentation and code are already aligned.

## Current State Analysis

### Project status and planning context

- `AGENTS.md` requires a read-first workflow, alignment with the current sprint, and a plan before non-trivial work.
- `PROJECT_OVERVIEW.md` says the project is in `Phase 0 — Foundation`.
- `CURRENT_SPRINT.md` says `S-006 Enterprise Hardening` is active and targets `v1.0.0`.
- The repository’s local memory in `.memory/topics/project-state.md` says deployment is stable, CI/CD and production hardening have progressed, and unresolved work includes visual regression, Lighthouse, tests, and environment constraints.

These sources are not fully consistent. The practical execution source of truth should therefore be treated as:

1. `CURRENT_SPRINT.md`
2. `OPEN_TASKS.md`
3. The code and deployment files that exist now

while the contradiction with `PROJECT_OVERVIEW.md` is recorded as a planning risk.

### Repository evidence

- `apps/frontend/package.json` has no unit/component test script and no visible Vitest setup.
- `apps/frontend` currently has no matching frontend `*.test.tsx` or `*.spec.tsx` files.
- `.github/workflows/ci.yml` runs typecheck, lint, backend tests, build, and Playwright E2E, but does not run Lighthouse CI.
- `apps/cms/config/server.ts` is still minimal and does not configure Strapi proxy or public URL behavior.
- `HEXA-Vision-Playbook/13-DEVOPS/BACKUP.md` defines backup and restore procedures, but the sprint still marks backup verification as pending.

### External documentation findings

- Next.js official testing guidance recommends `Vitest` with `React Testing Library` for unit/component testing, and notes that `async` Server Components are better covered with E2E tests rather than Vitest. [$TRAE_REF](https://nextjs.org/docs/app/guides/testing/vitest)
- Strapi official documentation shows that reverse-proxy deployments commonly need correct `server.url` and proxy configuration, and that admin panel behavior and host/path configuration are controlled through `/config/admin`. [$TRAE_REF](https://docs.strapi.io/cms/configurations/server)[$TRAE_REF](https://docs.strapi.io/cms/configurations/admin-panel)
- Lighthouse CI official guidance requires a repository config file plus an explicit CI step such as `lhci autorun`; this is not represented in the current CI workflow. [$TRAE_REF](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)

## Proposed Changes

This is an exploration plan only. No production code or configuration changes should be made until this plan is approved and execution begins.

### 1. Resolve the current planning source of truth

#### Files to inspect

- `HEXA-Vision-Playbook/00-GOVERNANCE/PROJECT_OVERVIEW.md`
- `HEXA-Vision-Playbook/02-ROADMAP/CURRENT_SPRINT.md`
- `HEXA-Vision-Playbook/02-ROADMAP/OPEN_TASKS.md`
- `HEXA-Vision-Playbook/02-ROADMAP/PROJECT_STATUS.md`
- `HEXA-Vision-Playbook/02-ROADMAP/MILESTONES.md`
- `.memory/topics/project-state.md`

#### What

Confirm which documents reflect the operational reality of the project right now.

#### Why

Task selection is unsafe if one source says “Foundation” while another says “Enterprise Hardening toward v1.0.0”.

#### How

Use the sprint and repository files as the temporary execution truth, and explicitly note documentation drift as a blocker for future planning hygiene rather than letting it distort near-term prioritization.

### 2. Prioritize CMS/Strapi hardening exploration first

#### Files to inspect

- `apps/cms/config/server.ts`
- `apps/cms/config/admin.ts`
- `apps/cms/config/middlewares.ts`
- `docker-compose.prod.yml`
- `docker/traefik/traefik.yml`
- `docker/traefik/dynamic.yml`
- `HEXA-Vision-Playbook/02-ROADMAP/CURRENT_SPRINT.md`
- `HEXA-Vision-Playbook/02-ROADMAP/OPEN_TASKS.md`

#### What

Determine whether the Strapi admin path, public URL, proxy handling, and admin exposure are properly aligned with the current reverse-proxy deployment.

#### Why

This has the highest combined impact across:

- security hardening
- deployment correctness
- admin login/session reliability over HTTPS
- direct alignment with an open sprint item: `CMS admin IP allowlist`

#### How

Validate whether the deployment files in the repository are the live reference point for production and whether they currently enforce the intended admin access restrictions. If they do, this becomes the best next execution task.

### 3. Make Lighthouse CI the second exploration target

#### Files to inspect

- `.github/workflows/ci.yml`
- `package.json`
- `apps/frontend/package.json`
- `e2e/playwright.config.ts`
- `HEXA-Vision-Playbook/15-QUALITY/QUALITY_GATES.md`
- Any existing `lighthouserc.*` file in the repo root if present

#### What

Determine the smallest viable Lighthouse CI path that matches the project’s quality gates.

#### Why

The Playbook expects Lighthouse-based gating, but the current CI workflow does not implement it.

#### How

Define whether the project should use:

- a local production build + local server audit inside GitHub Actions, or
- an environment-based URL audit path

and identify the exact pages and thresholds to audit first.

### 4. Make frontend component tests the third exploration target

#### Files to inspect

- `apps/frontend/package.json`
- `packages/ui/package.json`
- `apps/frontend/src/components/ui/nav/Navbar.tsx`
- `apps/frontend/src/components/ui/StrapiBlocks.tsx`
- `apps/frontend/src/features/portfolio/components/ProjectGrid.tsx`
- `apps/frontend/src/components/ui/modals/ProjectDetailModal.tsx`
- `packages/ui/src/components/ui/Button.tsx`

#### What

Define the minimum viable frontend unit/component test foundation for this codebase.

#### Why

Frontend tests are explicitly open in the sprint, but the repository currently lacks the visible setup and scripts needed to start them cleanly.

#### How

Scope the first test wave to client components and synchronous UI behavior only, consistent with Next.js guidance. Defer `async` Server Component coverage to existing or expanded Playwright coverage rather than forcing Vitest into unsupported territory.

## Assumptions & Decisions

### Assumptions

- The repository files currently mounted in the selected folder represent the implementation baseline to plan against.
- The current sprint is the most reliable short-term execution reference, even if some governance documents are stale.
- The deployment/security files in the repository are relevant enough to justify priority analysis.

### Decisions

- Treat this as an `L2 exploratory planning` task, not an implementation task.
- Prefer official vendor guidance over third-party articles when deciding testing, Strapi, and Lighthouse direction.
- Rank next-task candidates by operational risk and release relevance, not by ease alone.
- Recommended priority order after exploration:
  1. `CMS/Strapi hardening`
  2. `Lighthouse CI`
  3. `Frontend component test foundation`

## Verification Steps

The executor should treat the exploration as complete only when all of the following are true:

1. The project’s temporary operational source of truth is explicitly chosen and documented from the conflicting project documents.
2. The CMS/Strapi deployment path has been traced across `Strapi config -> Traefik config -> compose config`, with a clear answer on whether admin hardening is incomplete.
3. The CI workflow has been checked for an actual Lighthouse step and the absence or presence of `lighthouserc` has been confirmed.
4. Frontend testing readiness has been checked at the script, config, and initial target-component levels.
5. One specific next execution task is selected with:
   - exact target files
   - exact reason for priority
   - exact verification criteria for the later implementation phase

## Recommended Next Execution Task

If the deployment files inspected during execution are confirmed to be authoritative, execute `CMS/Strapi hardening` next.

If those files are stale or non-authoritative, execute `Lighthouse CI setup` next.

Only move to `frontend component tests` after one of the above two tasks is resolved or explicitly deprioritized.
