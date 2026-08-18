#!/usr/bin/env node
/**
 * Font Preload Drift Gate
 * =======================
 *
 * Google Fonts bumps static woff2 URLs silently (e.g. jetbrainsmono v20 ->
 * v24), which leaves the hardcoded `rel="preload"` hrefs in the root layout
 * stale ("preloaded but not used" warnings) with zero signal. This script
 * closes that loop:
 *
 *   1. Parses the 5 font `rel="preload" as="font"` hrefs from
 *      `apps/frontend/src/app/layout.tsx` plus the Google Fonts CSS URL
 *      (the `gf-preload` / `gf-css` href).
 *   2. Fetches the CSS API URL with a modern browser UA and extracts the
 *      latin-subset woff2 URLs served per family.
 *   3. Asserts every preload href matches a served latin URL EXACTLY.
 *
 * JetBrains Mono is deliberately NOT preloaded (loads on demand) — the
 * script only validates what the layout actually preloads.
 *
 * Network handling: when the fetch fails (offline CI, blocked egress, DNS),
 * the check skips gracefully with exit 0 and a "skipped" note — a missing
 * network must not break the lint gate.
 *
 * Usage:
 *   node scripts/check-font-preloads.mjs
 *
 * Exit codes: 0 = all preloads match served latin URLs (or check skipped);
 * 1 = stale preload href(s) found.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const c = (color, text) => {
  if (process.env.NO_COLOR || process.env.CI) return text;
  return `${COLORS[color]}${text}${COLORS.reset}`;
};

// Modern Chrome UA so the CSS2 API responds with woff2 + unicode-range
// (subset) blocks instead of TTF fallbacks. `Connection: close` keeps the
// socket out of undici's keep-alive pool: on Windows, `process.exit()` with
// a pooled connection races libuv teardown and abort-crashes the process
// (fail-fast) after the check has already passed.
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const REQUEST_HEADERS = {
  'User-Agent': CHROME_UA,
  Connection: 'close',
};

const LAYOUT_PATH = fileURLToPath(
  new URL('../apps/frontend/src/app/layout.tsx', import.meta.url),
);

function parseLayout() {
  const source = readFileSync(LAYOUT_PATH, 'utf8');

  const preloadHrefs = [];
  for (const tag of source.matchAll(/<link\b[^>]*>/g)) {
    const markup = tag[0];
    if (/rel="preload"/.test(markup) && /as="font"/.test(markup)) {
      const href = markup.match(/href="([^"]+)"/);
      if (href) preloadHrefs.push(href[1]);
    }
  }

  const cssUrlMatch = source.match(
    /<link\b[^>]*id="gf-(?:preload|css)"[^>]*href="([^"]+)"/,
  );
  if (!cssUrlMatch) {
    throw new Error(
      `Cannot find the Google Fonts CSS URL (id="gf-preload" / id="gf-css") in ${LAYOUT_PATH}`,
    );
  }

  return { preloadHrefs, cssUrl: cssUrlMatch[1] };
}

/**
 * Extracts the latin-subset woff2 URLs per font-family from the CSS API
 * response. Blocks without a `unicode-range` (full-font fallback) are also
 * kept as candidates since they serve every subset.
 */
function extractServedLatinUrls(css) {
  const served = new Map(); // family -> Set<url>
  for (const block of css.split('@font-face').slice(1)) {
    const url = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
    if (!url) continue;
    const family = block.match(/font-family:\s*'([^']+)'/)?.[1] ?? 'unknown';
    const hasUnicodeRange = /unicode-range:/.test(block);
    const isLatin = /unicode-range:\s*U\+0000-00FF/.test(block);
    if (!hasUnicodeRange || isLatin) {
      if (!served.has(family)) served.set(family, new Set());
      served.get(family).add(url[1]);
    }
  }
  return served;
}

async function main() {
  const line = '━'.repeat(72);
  let layout;
  try {
    layout = parseLayout();
  } catch (error) {
    console.error(c('red', c('bold', `✗ ${error.message}`)));
    process.exitCode = 1;
    return;
  }

  console.log(`${c('cyan', 'Font preload drift check')} — ${LAYOUT_PATH}`);
  console.log(c('dim', `  preload hrefs: ${layout.preloadHrefs.length} · css: ${layout.cssUrl}`));

  let css;
  try {
    const response = await fetch(layout.cssUrl, { headers: REQUEST_HEADERS });
    if (!response.ok) {
      throw new Error(`Google Fonts CSS API returned HTTP ${response.status}`);
    }
    css = await response.text();
  } catch (error) {
    // Offline / blocked egress in CI must not fail the lint gate.
    console.log('');
    console.log(c('yellow', `  ⚠ SKIPPED — cannot fetch the Google Fonts CSS (${error.message})`));
    console.log(c('dim', '    Network-dependent check; skipping is treated as a pass.'));
    console.log(line);
    process.exitCode = 0;
    return;
  }

  const servedByFamily = extractServedLatinUrls(css);
  const servedLatinUrls = new Set(
    [...servedByFamily.values()].flatMap((urls) => [...urls]),
  );

  const stale = layout.preloadHrefs.filter((href) => !servedLatinUrls.has(href));

  console.log('');
  console.log(line);

  if (stale.length === 0) {
    for (const href of layout.preloadHrefs) {
      console.log(c('green', `  ✓ ${href}`));
    }
    console.log('');
    console.log(c('green', c('bold', '  ✓ ALL FONT PRELOADS MATCH SERVED LATIN URLS')));
    console.log(line);
    process.exitCode = 0;
    return;
  }

  console.log(c('red', c('bold', `  ✗ ${stale.length} stale font preload(s) — Google bumped a font version?`)));
  console.log('');
  for (const href of stale) {
    console.log(c('red', `  STALE  ${href}`));
  }
  console.log('');
  console.log(c('yellow', '  Served latin URLs (update the layout hrefs to these):'));
  for (const [family, urls] of servedByFamily.entries()) {
    for (const url of urls) {
      console.log(`    ${family}: ${url}`);
    }
  }
  console.log('');
  console.log(c('dim', '  Tip: copy the served URL(s) for the stale family above into'));
  console.log(c('dim', '        apps/frontend/src/app/layout.tsx and re-run this check.'));
  console.log(line);
  process.exitCode = 1;
}

main();