# 🏎️ CHROME DEVTOOLS PROTOCOL (CDP) PERFORMANCE PROFILING

**Version:** 1.0.0 | **Scope:** Headless Chrome Profiling | **Standard:** Objective TBT & Long Task Profiling

---

## 1. OVERVIEW & METHODOLOGY

When physical devices or GUI browsers are unavailable, performance engineers profile the web application using **Chrome DevTools Protocol (CDP)** via `chrome-remote-interface` or `lighthouse` CLI in headless mode (`--headless=new`).

---

## 2. KEY PROFILING METRICS

| Metric | Target | Description | Primary Contributor |
|--------|--------|-------------|---------------------|
| **FCP** | $< 1.2\text{s}$ | First Contentful Paint | Render-blocking CSS & Fonts |
| **LCP** | $< 1.7\text{s}$ | Largest Contentful Paint | Hero image loading & 3D canvas render |
| **TBT** | $< 150\text{ms}$ | Total Blocking Time | Main thread JS execution ($>50\text{ms}$ tasks) |
| **CLS** | $< 0.001$ | Cumulative Layout Shift | Unsized images/embeds & late font swaps |
| **FPS** | 60 FPS | 3D Scene Frame Rate | WebGL draw calls, shader complexity, LOD |

---

## 3. CDP LONG-TASK ENUMERATION SCRIPT

Use `chrome-remote-interface` to enumerate every main-thread long task during page load:

```javascript
import CDP from 'chrome-remote-interface';

const client = await CDP({ port: 9222 });
const { Page, Runtime } = client;
await Page.enable();
await Page.navigate({ url: 'http://localhost:3000/' });

const { result } = await Runtime.evaluate({
  expression: `
    (async () => {
      const tasks = [];
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) tasks.push({ duration: Math.round(e.duration), startTime: Math.round(e.startTime) });
      }).observe({ entryTypes: ['longtask'] });
      await new Promise(r => setTimeout(r, 4000));
      return JSON.stringify(tasks);
    })()
  `,
  awaitPromise: true,
  returnByValue: true,
});
console.log('Long tasks:', JSON.parse(result.value));
await client.close();
```

---

## 4. AUDIT REPORT TEMPLATE

All performance audits MUST be recorded in `15-QUALITY/LIGHTHOUSE_AUDIT_<YYYY-MM-DD>.md` following the template:
1. Environment metadata (Chrome version, Node version, commit hash).
2. 3-run median Core Web Vitals table.
3. Long tasks breakdown.
4. Actionable remediation steps.

---

## 5. RELATED DOCUMENTATION

- [chrome-devtools-profiling skill](./.agents/skills/chrome-devtools-profiling/SKILL.md) — CDP profiling skill instructions.
- [LIGHTHOUSE.md](docs/quality/LIGHTHOUSE.md) — Lighthouse CI thresholds.
- [PERFORMANCE_CHECKLIST.md](docs/checklists/PERFORMANCE_CHECKLIST.md) — Performance checklist.
