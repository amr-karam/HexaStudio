# Pre-PR Checklist

Run this checklist before opening a Pull Request.

---

## Automated Checks
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run build` succeeds
- [ ] `npm run test:e2e` passes (if applicable)

## Code Quality
- [ ] No `any` types introduced
- [ ] No dead code (unused imports, variables, functions)
- [ ] All states handled: loading, empty, error, success
- [ ] Edge cases covered
- [ ] Error messages are user-friendly

## Testing
- [ ] Unit tests written for new logic
- [ ] Existing tests still pass
- [ ] Test coverage meets threshold (≥ 80%)

## Documentation
- [ ] Types updated in `packages/types/`
- [ ] API docs updated (Swagger decorators)
- [ ] CHANGELOG.md updated
- [ ] ADR created (if architectural change)

## PR Description
- [ ] Title follows Conventional Commits
- [ ] Description includes: What, Why, How to Test
- [ ] Screenshots attached (for UI changes)
- [ ] Related issues linked ("Closes #N")
- [ ] Checklist completed in PR template
