# fix(tokens): align visual design tokens to canonical gold (#D4AF37)

**Branch:** `fix/ui-design-tokens` (from `bugfix/frontend-userevent`)  
**Commit:** `21a3eff`

---

## Changes

- Updated `--sl-gold-*` CSS custom properties from `rgba(196, 176, 145)` → `rgba(212, 175, 55)` (canonical HEXA gold `#D4AF37`, per DESIGN_SYSTEM.md 60-30-10 rule)
- Consolidated `--sl-heading-font` (Playfair Display) and `--sl-body-font` (Inter) across `globals.css` and `silent-luxury-tokens.css`
- Removed stray Cormorant Garamond / Jost font references from token layers

**Files touched:**
- `apps/frontend/src/app/globals.css` — gold tokens + font-stack alignment
- `apps/frontend/src/styles/silent-luxury-tokens.css` — same alignment

---

## Verification

| Gate | Result |
|------|--------|
| `npm run lint --workspace=apps/frontend` | ✅ PASS (0 errors, 0 warnings) |
| `npm run typecheck --workspace=apps/frontend` | ❌ FAIL — `test/features/portal/approval-center-view.test.tsx(94,46): Cannot find namespace 'userEvent'` (PRE-EXISTING — unrelated to this PR) |
| `check-design-tokens.mjs --allow-inline-style-hex` | ✅ PASS |
| Font preload check | ✅ PASS |

---

## Scope control

Only 2 CSS token files + COMMIT_MSG.txt modified in this commit.  
The 44-file unrelated WIP in the working tree (backend service changes, mobile pages, deleted `gemini.service.ts`, untracked `flowdeck/photographer/` dirs) was **NOT** committed.

---

## Next steps

1. **Fix pre-existing `userEvent` namespace error** in `test/features/portal/approval-center-view.test.tsx`
2. **Apply component-level size/spacing standardization** — clamp-based heading scale, body text scale, mono tracking enforcement per DESIGN_SYSTEM.md §2C
3. **Push to remote** — GitLab internal (`ssh://git@19.16.1.100`) unreachable; GitHub push timed out (network restriction)
