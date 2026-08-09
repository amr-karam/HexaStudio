# ⚡ LIGHTHOUSE CI & CORE WEB VITALS STANDARDS

**Version:** 1.0.0 | **Scope:** Automated Auditing & Thresholds | **Standard:** > 95 Score Threshold

---

## 1. OVERVIEW & THRESHOLDS

HEXA Vision uses **Lighthouse CI** (`lighthouserc.json`) to audit performance, accessibility, best practices, and SEO on every production build and Pull Request.

### Constitutional Quality Thresholds
- **Performance**: $\ge 90$ (Local simulated) / $\ge 95$ (Desktop Production).
- **Accessibility**: $\ge 95$.
- **Best Practices**: $\ge 95$.
- **SEO**: $\ge 95$.

---

## 2. LIGHTHOUSE CI CONFIGURATION (`lighthouserc.json`)

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop",
        "chromeFlags": "--headless=new --no-sandbox --disable-gpu"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.90 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

---

## 3. CORE WEB VITALS OPTIMIZATION PATTERNS

1. **FCP Savings**: Font `@import` removed from CSS; fonts preloaded as parallel `<link rel="preload" as="style">`.
2. **LCP Optimization**: Next.js image optimization (`avif`/`webp`), priority preloading for hero background media.
3. **TBT Reduction**: Non-critical GSAP ScrollTrigger initializations deferred to browser idle time (`onIdle()` requestIdleCallback bound at 1200ms).

---

## 4. OPERATIONAL COMMANDS

```bash
# Run local Lighthouse audit CLI
npx --yes lighthouse@13 "http://localhost:3000" --preset=desktop --only-categories=performance

# Run full Lighthouse CI assertion suite
npx @lhci/cli autorun
```

---

## 5. RELATED DOCUMENTATION

- [LIGHTHOUSE_AUDIT_2026-07-24.md](LIGHTHOUSE_AUDIT_2026-07-24.md)) — Active Lighthouse report.
- [PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md)) — CDP profiling guide.
- [WEB_VITALS_RUM.md](../devops/WEB_VITALS_RUM.md)) — Real user monitoring.
