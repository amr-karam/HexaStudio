# 👁️ CODE REVIEW GUIDELINES & SENIOR AGENT MANDATE

**Version:** 1.0.0 | **Scope:** Code Review Quality | **Standard:** Rigorous & Constructive Peer Review

---

## 1. OVERVIEW & PHILOSOPHY

Code review is a collaborative quality assurance process designed to preserve code maintainability, prevent technical debt, and ensure adherence to the HEXA Vision Gold Standard.

---

## 2. REVIEWER CHECKLIST

Reviewers MUST verify the following before approving any PR:

### A. Architectural & Code Quality
- [ ] Logic is clear and maintainable over "clever".
- [ ] No `any` types or raw unvalidated API responses.
- [ ] Monorepo package boundaries respected (no direct cross-app imports).

### B. 3D & Animation Performance
- [ ] R3F geometries and materials manually disposed of in `useEffect` cleanup.
- [ ] `useFrame` loops do not allocate memory per frame (no `new THREE.Vector3()` in render loop).
- [ ] GSAP timelines initialized inside `gsap.context()` with `ctx.revert()` on unmount.

### C. Security & Data Protection
- [ ] SQL/NoSQL parameters sanitized.
- [ ] Route endpoints protected with JWT or role guards.
- [ ] PII masked in logs.

---

## 3. FEEDBACK CONVENTIONS

Review comments use explicit prefix tags to communicate severity:
- `[CRITICAL]`: Must fix prior to merge (security vulnerability, broken contract, memory leak).
- `[HIGH]`: Architectural flaw or performance regression.
- `[MEDIUM]`: Code style or non-blocking improvement suggestion.
- `[NIT]`: Minor cosmetic tweak (optional).

---

## 4. RELATED DOCUMENTATION

- [PULL_REQUESTS.md](docs/git/PULL_REQUESTS.md) — PR lifecycle.
- [CODING_STANDARDS.md](docs/engineering/CODING_STANDARDS.md) — Coding standards.
- [QUALITY_GATES.md](docs/quality/QUALITY_GATES.md) — Review gates.
