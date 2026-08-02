# CHECKLIST: PRE-COMMIT QUALITY GATE

- [ ] `npm run lint` yields `0 errors, 0 warnings`.
- [ ] `npm run typecheck` yields `0 errors`.
- [ ] `npm run test` passes all unit tests (`461 / 461 passing`).
- [ ] No `any` type overrides or disabled TypeScript rules.
- [ ] No hardcoded secrets, API keys, or private SSH keys.
- [ ] `PROJECT_STATUS.md` updated if task deliverables changed.
