# Lighthouse Audit Report — 2026-08-18 (post-O1/O2)

**URL:** https://hexastudio.net/
**Tool:** Chrome DevTools MCP Lighthouse (navigation mode, desktop preset)
**Commit at time of run:** main `cea9132` (O1 `e69d7ae` + O2 `cea9132` deployed, green slot)
**Date:** 2026-08-18 · **Track:** Frontend Performance Wave — post-O2 re-measurement

---

## 1. Context

- **O1 (`e69d7ae`)** — ScrollTrigger idle init batched into one idle queue; kills timed-out `requestIdleCallback` long tasks.
- **O2 (`cea9132`)** — Preloader counter via ref `textContent`; zero per-frame React re-renders.
- Measured pre-O1 TBT: **3,384 ms** → post-O1: **294 ms** (unthrottled real-browser trace, prior session).

## 2. Post-O2 re-measurement (CDP trace)

| Item | Result |
|------|--------|
| Navigation | Reload of `https://hexastudio.net` |
| Trace validity | ⚠️ **bfcache-restored session** (3 bfcache events, no FCP/LCP paint marks) — not a valid cold-load sample |
| Long tasks (>50 ms) | **0** in captured window (leaf RunTask analysis, 5,053 tasks) |
| TBT | **0 ms** in restored session — not comparable to cold-load baselines |

**Verdict:** cold-load TBT re-measurement requires a bfcache-disabled navigation; O1's 294 ms remains the last valid cold-load figure. No regression signal post-O2; a clean re-run is queued for a quiet window / CI runner.

## 3. Lighthouse scores (desktop)

| Category | Score |
|----------|-------|
| Accessibility | **95** |
| Best Practices | **100** |
| SEO | **100** |
| Agentic Browsing | **100** |
| CLS | **0.021** (100) |

Note: performance category was not returned by this run (first attempt timed out; retry emitted non-performance categories). TTFB/LCP/TBT re-audit queued.

## 4. Accessibility failures (3)

1. **`color-contrast`** — `text-neutral-500` (9px uppercase eyebrow) + `text-neutral-600` footer/nav links on Void Black surfaces — below WCAG 4.5:1. Snippets:
   - `<p class="text-[9px] uppercase tracking-[0.5em] text-neutral-500 ...">`
   - `<span class="text-sm text-neutral-600 hover:text-neutral-300 tracking-[0.3em] uppercase ...">` (×5+)
2. **`heading-order`** — `<h4 class="text-xs uppercase tracking-[0.3em] text-foreground group-hover:text-accent ...">` skips heading levels.
3. **`label-content-name-mismatch`** — `<a aria-label="Start a Project" href="/contact">` visible text differs from accessible name.

## 5. Follow-ups

| Priority | Item | Status |
|----------|------|--------|
| P1 | Cold-load TBT re-trace (bfcache disabled) + Lighthouse perf category | ⏳ Queued |
| P2 | A11y remediation: contrast tokens (neutral-500/600 → compliant), heading order, label-name match — dispatch `@accessibility-engineer` | ⏳ Queued |
| P3 | GitLab remote PAT rotation (embedded in `git remote -v` URL) | ⏳ Security follow-up |

*Report generated 2026-08-18 by HEXA Studio orchestration session. Method matches the canonical template (LIGHTHOUSE_AUDIT_2026-07-22/08-17).*