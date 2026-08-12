# 📝 ADR-012: Specification and Plan Refresh (Aug 2026)

**Date:** 2026-08-09
**Status:** Accepted
**Deciders:** Lead Engineering Agent (Orchestrator)

---

### 1. CONTEXT
During the August 2026 reconciliation, an audit of the `docs/` repository uncovered significant drift and duplication. The `docs/spec/` and `docs/plan/` files referenced outdated technologies (Next.js 15, WCAG 2.2 AA) and contained ~70% duplicate content across files. The system is actually running on **Next.js 16.2.11** and **WCAG 2.1 AAA**.

### 2. PROBLEM
- **Content Drift:** Spec/Plan docs reference outdated stack/compliance.
- **Duplication:** 8 files share near-identical content.
- **Missing Architecture:** `SECURITY_ARCHITECTURE.md` was missing despite references.
- **System Overview:** Canonical `SYSTEM_ARCHITECTURE.md` existed but a pointer was needed to avoid duplication.

### 3. CONSIDERED OPTIONS
- **Option A:** Recreate files at directive-specified paths (Rejected: would recreate duplicates Phase 16 removed).
- **Option B:** Update existing canonical files in-place (CHOSEN).
- **Option C:** Document-only mode (Rejected: drift would persist).

### 4. TRADE-OFF ANALYSIS

| Option | Pros | Cons | Score |
|---|---|---|---|
| A | Matches directive names | Creates duplicates | 4 |
| B | Consistent with canonical structure | Requires targeted updates | 9 |
| C | Zero effort | Drift persists | 2 |

### 5. THE DECISION
**Chosen Option:** Option B (Update canonical files in-place).
**Justification:** Aligns with `GOVERNANCE.md` principles, fixes content drift, eliminates duplication, and respects Phase 16 reconciliation.

### 6. IMPACT & CONSEQUENCES
- **Positive:** Docs are now canonical, accurate (Next.js 16), and de-duplicated.
- **Negative:** File content length reduced due to de-duplication; links may require verification.

### 7. VERIFICATION PLAN
- Read back all updated files to confirm content.
- Grep for "Next.js 15" and "WCAG 2.2 AA" (must return 0 hits).
- PROJECT_STATUS.md updated with refresh note.

### 8. MIGRATION
- In-place file updates (no migration required).

### 9. ROLLBACK
- `git revert` the refresh commit.

### 10. REFERENCES
- [/AGENTS.md](../../AGENTS.md)
- [/GOVERNANCE.md](../../GOVERNANCE.md)
- [/ARCHITECTURE.md](../../ARCHITECTURE.md)
- [/PROJECT_STATUS.md](../../PROJECT_STATUS.md)
- ADR-011 (Docs Migration)

---
**Sign-off:** `🏛️ Chief Architect Approved`
