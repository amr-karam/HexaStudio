# Current Sprint: Sprint 001 — Foundation

**Sprint Dates:** 2026-07-08 to 2026-07-22  
**Theme:** *"Build the foundation that nothing will topple."*  
**Team Capacity:** 20 story points  

---

## Sprint Goal

Complete the HEXA Vision Playbook and establish the development foundation so Phase 1 development can begin immediately after this sprint.

## Backlog

| Priority | Item | Owner | Points | Status |
|----------|------|-------|--------|--------|
| P0 | Create HEXA Vision Playbook (all docs) | Chief Architect | XL | ✅ Done |
| P0 | Set up Docker Compose infrastructure | DevOps Engineer | L | ⬜ To Do |
| P0 | Configure CI/CD pipeline (GitHub Actions) | DevOps Engineer | M | ⬜ To Do |
| P0 | Initialize monorepo structure | All | S | ⬜ To Do |
| P1 | Set up Strapi CMS with content types | Backend Lead | M | ⬜ To Do |
| P1 | Configure ESLint + Prettier + Husky | Frontend Lead | S | ⬜ To Do |
| P1 | Set up testing infrastructure (Vitest, Playwright) | QA Lead | M | ⬜ To Do |
| P2 | Create .env.example for all environments | DevOps Engineer | S | ⬜ To Do |
| P2 | Document environment variables | DevOps Engineer | S | ⬜ To Do |

## Sprint Rules

1. **No feature code** during this sprint — infrastructure only
2. Every PR must be reviewed by at least one other team member
3. Documentation must be updated alongside any configuration change
4. All config changes must be reproducible (no manual server steps)

## Risks

| Risk | Mitigation |
|------|------------|
| Docker Compose complexity | Use proven configurations from existing projects |
| Strapi 5 edge cases | Allocate buffer time for debugging |
| Team unfamiliar with monorepo | Pair programming on initial setup |

## Definition of Done (Sprint-Specific)

- [ ] Playbook complete and reviewed
- [ ] Docker Compose starts all services locally
- [ ] CI pipeline passes on every PR
- [ ] Linting + type checking run automatically
- [ ] Tests run in CI
- [ ] All environment variables documented
- [ ] Strapi admin accessible locally with configured content types
