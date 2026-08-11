# Speed Workflow — `hexa-fast`

**Last Updated:** 2026-08-11

---

`scripts/hexa-fast.mjs` is the **speed** companion to `scripts/hexaops.mjs`.
`hexaops` owns the slow/ops commands (`gate`, `status`, `watch`, `pipeline`,
`deploy`, `commit`); `hexa-fast` owns the **fast daily loop**:

| Command | Purpose |
|---------|---------|
| `hexa-fast context` | One-shot startup snapshot (branch, HEAD, status, log, reflog, concurrent activity, token gate) |
| `hexa-fast gate:frontend` | typecheck + lint + design-token gate in parallel (`--tests` adds vitest) |
| `hexa-fast gate:all` | Full 9-gate quality suite via hexaops (delegates to `scripts/hexaops.mjs gate`) |
| `hexa-fast tokens` | Design-token fix ritual (`--dry-run` / `--apply` / `--check`) |
| `hexa-fast commit "<msg>" <paths...>` | SAFE commit with explicit pathspec — never `git add -A` |
| `hexa-fast help` | Show usage |

Run through npm: `npm run fast:context`, `npm run fast:gate`,
`npm run fast:tokens -- --apply`, `npm run fast:commit -- "<msg>" <paths>`.

---

## 1. Startup ritual — `npm run fast:context`

Replaces the ~6 manual git commands every session used to start with. One call
prints:

- Branch + short HEAD + current date/time
- `git status --short` (first 20 lines)
- `git log --oneline -8` (recent commits)
- `git reflog -5` (HEAD movement — catches a **concurrent process** committing)
- `[concurrent activity]` — files under `apps/` and `docs/` with mtime newer
  than 5 minutes (max ~500 files scanned, up to 10 printed)
- Design-token gate PASS/FAIL one-liner

All checks run in parallel; failures degrade to a dim note, never a crash.

```bash
npm run fast:context
```

## 2. Gate — `npm run fast:gate`

Runs `typecheck`, `lint`, and the design-token gate **in parallel**, prints a
compact `gate | status | ms` table, and exits `1` on any failure. Tests are
slow, so they are opt-in and run sequentially after:

```bash
npm run fast:gate            # typecheck + lint + tokens
npm run fast:gate -- --tests # + frontend vitest
```

## 2b. Full gate — `npm run fast:gate:all`

Delegates to `scripts/hexaops.mjs gate` for the complete 9-gate suite (lint +
typecheck + test across frontend, backend, and mobile). Use this when you need
the authoritative full-suite verdict:

```bash
npm run fast:gate:all
```

## 3. Design tokens — `npm run fast:tokens`

The 3-step fix ritual in one command:

```bash
npm run fast:tokens -- --dry-run   # default: preview what would change
npm run fast:tokens -- --apply     # apply fixes, then re-run the gate
npm run fast:tokens -- --check     # just run the design-token gate
```

## 4. Safe commit — `npm run fast:commit`

**Why explicit pathspec?** `hexaops commit` uses `git add -A`, which sweeps up
**every** staged/unstaged change in the repo. In a session where another agent
is working in the same tree, that would silently commit the other agent's work.
`hexa-fast commit` only ever touches the exact paths you name:

```bash
npm run fast:commit -- "feat(ui): add hero section" apps/frontend/src/app/page.tsx
```

It shows what will be committed vs what is deliberately **left alone** before
running `git add -- <paths>` and `git commit -m "<msg>" -- <paths>`, then prints
the commit hash and remaining `git status --short`. At least one path is
required; a message without a conventional prefix gets `chore: ` prepended.

**Rule: never use `git add -A` while another agent is active.**

## Env vars

None required. `hexa-fast` uses git + the design-token scripts from the repo
root and Node built-ins only.
