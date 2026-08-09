# ♿ ACCESSIBILITY AUDITING & WCAG 2.1 AAA STANDARDS

**Version:** 1.0.0 | **Scope:** Accessibility Testing | **Standard:** WCAG 2.2 Level AA Compliance

---

## 1. OVERVIEW & PRINCIPLES

HEXA Vision enforces strict digital accessibility. Every interactive element, 3D experience fallback, modal, menu, and form control MUST comply with **WCAG 2.2 Level AA** standards under the 4 core principles: **P**erceivable, **O**perable, **U**nderstandable, and **R**obust.

---

## 2. KEY ACCESSIBILITY REQUIREMENTS

### A. Motion Policy (`MotionPolicyProvider`)
- OS Setting `prefers-reduced-motion: reduce` automatically disables particle simulations, camera parallax, cursor pull, and auto-playing animations.
- Persistent **"Pause Animations"** toggle button provided in UI with `localStorage` state retention.

### B. Coarse Pointer (Mobile / Touch Devices)
- All interactive touch targets MUST measure at least $44 \times 44\text{px}$.
- Hover-only interactions MUST provide accessible tap/click alternatives.

### C. Keyboard Navigation & ARIA Focus
- All interactive elements must be focusable with visible focus rings.
- Modals (`ProjectDetailModal`, `Navbar` mobile menu) MUST trap focus while open and restore focus to trigger element upon close (`role="dialog"`, `aria-modal="true"`).
- Color contrast ratio MUST meet or exceed $4.5:1$ for standard body text and $3.0:1$ for large text.

---

## 3. AUTOMATED ACCESSIBILITY TESTING

Automated checks are integrated into CI via `axe-core`:
```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Homepage should have zero accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

---

## 4. OPERATIONAL COMMANDS

```bash
# Run axe-core accessibility check in Playwright
npx playwright test --project=chromium --grep "@a11y"

# Emulate prefers-reduced-motion in headless Chrome
npx lighthouse "http://localhost:3000" --chrome-flags="--emulate-media-features=prefers-reduced-motion"
```

---

## 5. RELATED DOCUMENTATION

- [ACCESSIBILITY.md](../accessibility/ACCESSIBILITY.md)) — Coding accessibility standards.
- [accessibility-checklist.md](../checklists/accessibility-checklist.md)) — WCAG 2.1 AAA verification checklist.
- [FRONTEND_EXCELLENCE.md](../design/FRONTEND_EXCELLENCE.md)) — Frontend contract.
