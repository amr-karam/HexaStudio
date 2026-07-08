# Pre-Commit Checklist

Run this checklist before every commit.

---

## Code Quality
- [ ] `npm run lint` — 0 errors, 0 warnings
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run test` — all tests green
- [ ] No `console.log` statements
- [ ] No `debugger` statements
- [ ] No commented-out code
- [ ] No `any` types
- [ ] No TODO without ticket reference

## Formatting
- [ ] Code formatted with Prettier
- [ ] No trailing whitespace
- [ ] Files end with newline

## Commit
- [ ] Commit message follows Conventional Commits
- [ ] Message is present tense ("Add feature" not "Added")
- [ ] Message is capitalized
- [ ] Message has no trailing period
- [ ] Scope is appropriate (frontend, backend, etc.)

## Security
- [ ] No secrets committed
- [ ] No hardcoded credentials
- [ ] No `.env` files committed

## Scope
- [ ] Commit is atomic (one logical change)
- [ ] Only intended files are staged
- [ ] No unrelated changes
