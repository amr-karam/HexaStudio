---
name: chrome-devtools-profiling
description: Use Chrome DevTools Protocol (CDP) to profile a running local web app, measure Core Web Vitals (FCP, LCP, TBT, CLS, TTI), identify long tasks, capture network requests, and analyze JavaScript execution. Use this skill when a GUI browser or physical device is unavailable but objective performance data is needed.
---

# Chrome DevTools Profiling Skill

## Overview

This skill enables objective web performance measurement in headless / non-GUI environments by driving **Chrome via the Chrome DevTools Protocol (CDP)**. It produces the same metrics a Lighthouse run or a real-device test would, without requiring a visible browser window or physical hardware.

The skill uses **two approaches** depending on the environment:

1. **`chrome-remote-interface` (CRI)** — direct CDP access for fine-grained control (long-task timeline, PerformanceObserver data, JavaScript CPU profiling). This is the high-precision path and is what `Lighthouse` itself uses internally.
2. **`chrome-launcher` + `lighthouse`** CLI — full Lighthouse audits (FCP / LCP / TBT / CLS / Speed Index / TTI) + a structured JSON report.

Both paths need a Chrome binary. On Windows it is typically `C:\Program Files\Google\Chrome\Application\chrome.exe`. On macOS / Linux install via standard package managers.

---

## Prerequisites

- Chrome installed and discoverable (or pass `--chrome-path` / `chromePath`)
- A **running** local server (Next.js dev server, standalone production server, or any reachable URL)
- Node 20+ available
- For CRI mode: `npm i chrome-remote-interface --no-save`
- For Lighthouse mode: `npm i -g lighthouse` (or `npx --yes lighthouse@13`)

> [!IMPORTANT]
> A "NO_FCP" or "blank screenshot" in headless Chrome usually means the page requires WebGL, custom fonts, or browser features headless mode does not support. Before assuming the page is broken, try `--headless=new` (the new headless mode, not the legacy one).

---

## When to use this skill

- The sprint requires Core Web Vitals / Lighthouse numbers but no physical device or GUI is available
- You need a concrete measurement for a performance regression, not guesswork
- You need to identify which scripts cause long tasks (TBT contributors)
- You need to verify a `stale-while-revalidate` or CDN-cache configuration behaves as expected
- You need a JSON report to feed into another tool (e.g. compare against a baseline)

Do **not** use this skill for code-level changes — pair it with `@performance-engineer` to interpret the numbers, then dispatch `frontend-dev` / `backend-dev` for fixes.

---

## Workflow

### 1. Confirm Chrome and start the target

```powershell
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { throw "Chrome not found at $chrome" }

# Start the Next.js standalone server (or any local server) on a free port.
$port = 3001
$env:PORT = $port
Start-Process -FilePath "node" -ArgumentList ".next/standalone/apps/frontend/server.js" `
  -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3
curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/"   # expect 200
```

### 2. Path A — Lighthouse CLI (recommended for full audit)

```powershell
# Use the new headless mode to avoid legacy headless feature gaps.
npx --yes lighthouse@13 `
  "http://localhost:$port/" `
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" `
  --preset=desktop `
  --output=json --output-path="$env:TEMP\lighthouse.json" `
  --only-categories=performance `
  --max-wait-for-load=60000

# Then read the metrics (P75 simulation, ms):
node -e "
const r = require('$env:TEMP\lighthouse.json');
const m = r.audits;
const fmt = n => m[n] ? m[n].displayValue ?? m[n].numericValue : 'n/a';
console.log('Performance score:', Math.round((r.categories.performance.score ?? 0) * 100));
console.log('FCP:   ', fmt('first-contentful-paint'));
console.log('LCP:   ', fmt('largest-contentful-paint'));
console.log('TBT:   ', fmt('total-blocking-time'));
console.log('CLS:   ', fmt('cumulative-layout-shift'));
console.log('Speed Index:', fmt('speed-index'));
console.log('TTI:   ', fmt('interactive'));
console.log('Long tasks (>50ms):', m['mainthread-work-breakdown']?.details?.items?.length ?? 0);
"
```

> [!TIP]
> Drop `--preset=desktop` to get a **mobile** audit (default Lighthouse profile, includes throttling). Always include `--max-wait-for-load=N` for pages with heavy 3D or large dependency graphs that exceed the 30 s default.

### 3. Path B — Direct CDP via `chrome-remote-interface` (for long-task timelines)

When you need to enumerate every long task the page produces (Lighthouse only summarizes), use CRI directly:

```javascript
// profile.mjs
import CDP from 'chrome-remote-interface';

const url = process.argv[2] || 'http://localhost:3001/';

const client = await CDP({ port: 9222 });
const { Page, Performance, Network, Runtime } = client;
await Promise.all([Page.enable(), Performance.enable(), Network.enable(), Runtime.enable()]);

// Mark navigation start (perf metrics are relative to this)
await Page.navigate({ url });

// Wait for load
await Page.loadEventFired();

// Gather performance metrics
const perfMetrics = await Performance.getMetrics();
const interesting = perfMetrics.metrics.filter(m =>
  /FirstMeaningfulPaint|FirstContentfulPaint|DomContentLoaded|Load/
  .test(m.name)
);
console.log(JSON.stringify(interesting, null, 2));

// Hard fact: long tasks list
const { result } = await Runtime.evaluate({
  expression: `
    (async () => {
      const tasks = [];
      const obs = new PerformanceObserver(list => {
        for (const e of list.getEntries()) tasks.push({
          name: e.name,
          duration: Math.round(e.duration),
          startTime: Math.round(e.startTime),
        });
      });
      obs.observe({ entryTypes: ['longtask'] });
      await new Promise(r => setTimeout(r, 3000));
      obs.disconnect();
      return JSON.stringify(tasks);
    })()
  `,
  awaitPromise: true,
  returnByValue: true,
});
const longTasks = JSON.parse(result.value);
console.log('long tasks:', longTasks.length);
console.log(longTasks.slice(0, 10));

await client.close();
```

```powershell
# Launch Chrome with remote debugging
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --headless=new --no-sandbox --disable-gpu `
  --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1 `
  about:blank

Start-Sleep -Seconds 2
node profile.mjs http://localhost:3001/
```

### 4. Path C — Network + JS coverage capture

For deeper waterfall and "unused JavaScript" insights (the 163 KiB class of optimization):

```javascript
// coverage.mjs
import CDP from 'chrome-remote-interface';

const client = await CDP({ port: 9222 });
const { Page, Network, Profiler, Runtime } = client;

const requests = [];
Network.requestWillBeSent(p => requests.push({
  url: p.request.url, method: p.request.method, type: p.request.resourceType,
}));
Network.responseReceived(p => {
  const r = requests.find(x => x.url === p.request.url);
  if (r) r.status = p.response.status;
});
Network.loadingFinished(p => {
  const r = requests.find(x => x.url === p.request.url);
  if (r) r.encodedLength = p.encodedDataLength;
});

await Promise.all([Page.enable(), Network.enable()]);
await Page.navigate({ url: process.argv[2] });
await Page.loadEventFired();

// Script sizes + sort
const scripts = requests
  .filter(r => r.type === 'Script' && r.encodedLength > 0)
  .sort((a, b) => b.encodedLength - a.encodedLength);
const totalKB = (scripts.reduce((s, r) => s + r.encodedLength, 0) / 1024).toFixed(1);
console.log(`Total scripts: ${scripts.length}, total size: ${totalKB} KB`);
console.log('Top 10 largest:');
for (const r of scripts.slice(0, 10)) {
  console.log(`  ${(r.encodedLength/1024).toFixed(1)} KB  ${r.status ?? '???'}  ${r.url}`);
}

await client.close();
```

---

## Interpreting the numbers

| Metric | Target (luxury 9.5+) | What pushes it down |
|--------|----------------------|---------------------|
| FCP | < 1.2 s | Inline CSS, preconnect, font preload, no render-blocking JS |
| LCP | < 2.0 s | LCP image priority + preload, `<link rel=preload as=image>`, SSR for hero |
| **TBT** | < 150 ms | Defer 3rd-party scripts, code-split below-the-fold, break up long tasks with `scheduler.yield()` or chunked `requestIdleCallback` |
| CLS | < 0.05 | `width`/`height` on every `<img>` and `<iframe>`, font `display: swap` + `size-adjust`, no late-injected layout |
| Speed Index | < 2.0 s | Same as FCP/LCP — primarily about visual completeness |
| Long tasks > 50 ms | 0–1 | Move work to idle, use `startTransition`, top-level await only on critical fetches |

For **TBT profiling specifically**: take the long-task list, group by source (use `Performance.getMetrics({ name: 'TopLevelTaskCount' })` and `TaskDuration`-bearing traces), then dispatch concrete fixes. Without this data you are optimizing by intuition.

---

## Common pitfalls

- **`NO_FCP` on every URL**: You are on legacy headless. Switch to `--headless=new` (Lighthouse 11+ default, but explicit is safer).
- **Lighthouse score 0 with "The page did not paint any content"**: The app is *truly* failing in headless. This is a real bug — investigate (could be WebGL dependency, missing `<canvas>` context in headless, or a JS error during hydration). Pair with `@qa` to debug.
- **`EPERM` errors writing Lighthouse temp files**: Lighthouse uses `%TEMP%`; some CI/agent sandboxes block it. Pass `--output-path` to a writable directory (e.g. `C:\Windows\TEMP\opencode\`).
- **Edge-caching verification returns 200 from origin every time**: The `Cache-Control` header may be `private` or `no-store` somewhere upstream. Inspect with `curl -I` and confirm `s-maxage` / `stale-while-revalidate` reach the edge.
- **Long-task enumeration comes back empty even on a slow page**: The `PerformanceObserver` was registered *after* the work finished. Register it before navigation or use `Page.loadEventFired()` to await completion.

---

## Outputs to write to the playbook

When this skill produces new measurements, record them in:

`HEXA-Vision-Playbook/15-QUALITY/LIGHTHOUSE_AUDIT_<YYYY-MM-DD>.md`

Include the **3-run median**, the **baseline delta**, the **commit hash** at the time of the run, and the **toolchain** (Turbopack vs webpack, Node version, Chrome version). Format exactly as `LIGHTHOUSE_AUDIT_2026-07-22.md` — that file is the canonical reference template.

---

## Example: full TBT profiling loop in one command

```powershell
$port = 3001
$env:PORT = $port
Start-Process -FilePath "node" -ArgumentList ".next/standalone/apps/frontend/server.js" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3

# Run Lighthouse (Performance only — fastest path)
npx --yes lighthouse@13 "http://localhost:$port/" `
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" `
  --preset=desktop --output=json `
  --output-path="$env:TEMP\opencode\lh.json" `
  --only-categories=performance --max-wait-for-load=60000 --quiet

# Extract + print
node -e "
const r = JSON.parse(require('fs').readFileSync('$env:TEMP\opencode\lh.json','utf8'));
const a = r.audits;
const metrics = ['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index','interactive'];
console.log('Score:', Math.round((r.categories.performance.score ?? 0)*100));
for (const m of metrics) console.log(m.padEnd(28), a[m]?.displayValue ?? a[m]?.numericValue);
console.log('Long tasks (>50ms):', a['mainthread-work-breakdown']?.details?.items?.length ?? 0);
"

# Cleanup
Get-Process -Name node | Where-Object { $_.MainWindowTitle -eq '' } | Stop-Process -ErrorAction SilentlyContinue
```
