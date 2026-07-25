#!/usr/bin/env node
/**
 * Bundle Budget Enforcement (S-019 P1)
 * =====================================
 *
 * Parses Next.js build output and enforces three bundle size budgets:
 *   1. First-load JS per route: 200KB max (S-019 P1 success criteria)
 *   2. Total initial bundle:    500KB max
 *   3. Largest single chunk:    500KB max
 *
 * Exits 0 if all budgets pass; exits 1 if any are exceeded, with a clear
 * error report listing each violation. Run after `npm run analyze` (or any
 * `next build`) so that .next/app-build-manifest.json and .next/static
 * are present.
 *
 * Usage:
 *   node scripts/check-bundle-budgets.mjs [--root <monorepo-root>]
 *
 * Flags:
 *   --root <path>   Monorepo root containing apps/frontend/.next (default: cwd)
 *   --quiet         Suppress per-route PASS output (only show violations)
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const THRESHOLDS = {
  firstLoadJsPerRouteKB: 200,
  totalInitialBundleKB: 500,
  largestSingleChunkKB: 500,
};

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

const c = (color, text) => {
  if (process.env.NO_COLOR || process.env.CI) return text;
  return `${COLORS[color]}${text}${COLORS.reset}`;
};

function parseArgs(argv) {
  const args = { root: process.cwd(), quiet: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root") args.root = resolve(argv[++i]);
    else if (a === "--quiet" || a === "-q") args.quiet = true;
  }
  return args;
}

async function fileExists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function fileSizeKB(p) {
  try {
    const s = await stat(p);
    return s.size / 1024;
  } catch {
    return 0;
  }
}

async function readJson(p) {
  return JSON.parse(await readFile(p, "utf-8"));
}

async function scanChunks(staticDir) {
  const chunks = new Map();
  if (!existsSync(staticDir)) return chunks;

  async function walk(dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.name.endsWith(".js")) {
        chunks.set(full, await fileSizeKB(full));
      }
    }
  }

  await walk(staticDir);
  return chunks;
}

function resolveChunkPath(staticDir, chunkRef) {
  // Chunks in manifests are referenced as "/_next/static/chunks/..." —
  // strip the leading "/_next/static" and join onto the on-disk staticDir.
  const stripped = chunkRef.replace(/^\/_next\/static\//, "");
  return join(staticDir, stripped);
}

async function getLargestChunk(chunks) {
  let largestKB = 0;
  let largestName = "";
  for (const [path, kb] of chunks.entries()) {
    if (kb > largestKB) {
      largestKB = kb;
      largestName = path;
    }
  }
  return { largestKB, largestName };
}

async function checkFirstLoadPerRoute(root) {
  const nextDir = join(root, "apps/frontend/.next");
  const appBuildManifestPath = join(nextDir, "app-build-manifest.json");
  const pathRoutesManifestPath = join(nextDir, "app-path-routes-manifest.json");
  const staticDir = join(nextDir, "static");

  if (!(await fileExists(appBuildManifestPath))) {
    return {
      skipped: true,
      reason: `${relative(process.cwd(), appBuildManifestPath)} not found — did you run \`next build\`?`,
      violations: [],
      routeSizes: [],
    };
  }

  const appBuildManifest = await readJson(appBuildManifestPath);
  const pathRoutesManifest = (await fileExists(pathRoutesManifestPath))
    ? await readJson(pathRoutesManifestPath)
    : {};

  // Build reverse map: pageKey -> URL. Falls back to "/" for "/" route.
  const pageKeyToUrl = {};
  for (const [url, pageKey] of Object.entries(pathRoutesManifest)) {
    pageKeyToUrl[pageKey] = url;
  }
  // App Router root maps to "/page" key.
  if (!pageKeyToUrl["/page"]) pageKeyToUrl["/page"] = "/";

  const pages = appBuildManifest.pages || {};
  const routeSizes = [];
  const violations = [];

  for (const [pageKey, chunkRefs] of Object.entries(pages)) {
    let totalKB = 0;
    const missing = [];
    for (const ref of chunkRefs) {
      const onDisk = resolveChunkPath(staticDir, ref);
      const kb = await fileSizeKB(onDisk);
      if (kb === 0) missing.push(ref);
      totalKB += kb;
    }
    const url = pageKeyToUrl[pageKey] || pageKey;
    const entry = { route: url, pageKey, sizeKB: totalKB, chunks: chunkRefs.length };
    routeSizes.push(entry);
    if (totalKB > THRESHOLDS.firstLoadJsPerRouteKB) {
      violations.push({
        ...entry,
        thresholdKB: THRESHOLDS.firstLoadJsPerRouteKB,
        missing,
      });
    }
  }

  routeSizes.sort((a, b) => b.sizeKB - a.sizeKB);
  return { skipped: false, violations, routeSizes };
}

async function checkTotalInitialBundle(root) {
  // "Initial bundle" = sum of every unique chunk referenced by the root route
  // ("/page") plus shared webpack/runtime chunks. This is what every user
  // downloads on first visit, regardless of which page they land on.
  const nextDir = join(root, "apps/frontend/.next");
  const appBuildManifestPath = join(nextDir, "app-build-manifest.json");
  const staticDir = join(nextDir, "static");

  if (!(await fileExists(appBuildManifestPath))) {
    return { sizeKB: 0, skipped: true };
  }

  const appBuildManifest = await readJson(appBuildManifestPath);
  const pages = appBuildManifest.pages || {};
  const rootChunks = pages["/page"] || pages["/_app"] || [];
  const unique = new Set(rootChunks);

  let totalKB = 0;
  for (const ref of unique) {
    const onDisk = resolveChunkPath(staticDir, ref);
    totalKB += await fileSizeKB(onDisk);
  }
  return { sizeKB: totalKB, skipped: false, chunkCount: unique.size };
}

function printHeader() {
  const line = "━".repeat(72);
  console.log(line);
  console.log(c("bold", "  BUNDLE BUDGET ENFORCEMENT (S-019 P1)"));
  console.log(line);
  console.log("  Thresholds (S-019 P1 success criteria):");
  console.log(`    First-load JS per route:   ${THRESHOLDS.firstLoadJsPerRouteKB} KB max`);
  console.log(`    Total initial bundle:      ${THRESHOLDS.totalInitialBundleKB} KB max`);
  console.log(`    Largest single chunk:      ${THRESHOLDS.largestSingleChunkKB} KB max`);
  console.log(line);
  console.log("");
}

function fmtKB(kb) {
  return `${kb.toFixed(2)} KB`;
}

async function main() {
  const args = parseArgs(process.argv);
  const root = args.root;
  const quiet = args.quiet;
  const nextDir = join(root, "apps/frontend/.next");
  const staticDir = join(nextDir, "static");

  printHeader();

  if (!(await fileExists(nextDir))) {
    console.log(c("red", `  ✗ .next directory not found at ${nextDir}`));
    console.log(c("dim", "    Run `npm run build --workspace=apps/frontend` first."));
    console.log("");
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  // ── Check 1: Largest single chunk ─────────────────────────────────────
  console.log(c("cyan", "▶ Check 1: Largest single chunk"));
  const chunks = await scanChunks(staticDir);
  const { largestKB, largestName } = await getLargestChunk(chunks);
  if (largestName) {
    const rel = relative(root, largestName);
    console.log(`  ${c("dim", "Largest:")} ${fmtKB(largestKB)}  ${c("dim", rel)}`);
  } else {
    console.log(`  ${c("dim", "No chunks found.")}`);
  }
  if (largestKB > THRESHOLDS.largestSingleChunkKB) {
    errors.push(
      `Largest single chunk exceeds budget: ${fmtKB(largestKB)} > ${THRESHOLDS.largestSingleChunkKB} KB\n` +
      `    File: ${relative(root, largestName)}`,
    );
    console.log(`  ${c("red", "✗ FAIL")} — exceeds ${THRESHOLDS.largestSingleChunkKB} KB threshold`);
  } else if (largestKB > 0) {
    console.log(`  ${c("green", "✓ PASS")}`);
  } else {
    warnings.push("No JS chunks found in .next/static — build may be incomplete.");
    console.log(`  ${c("yellow", "⚠ WARN")} — no chunks found`);
  }
  console.log("");

  // ── Check 2: First-load JS per route ──────────────────────────────────
  console.log(c("cyan", "▶ Check 2: First-load JS per route"));
  const routeResult = await checkFirstLoadPerRoute(root);
  if (routeResult.skipped) {
    console.log(`  ${c("yellow", "⚠ SKIPPED")} — ${routeResult.reason}`);
    warnings.push(routeResult.reason);
  } else {
    const { violations, routeSizes } = routeResult;
    if (!quiet) {
      for (const r of routeSizes) {
        const ok = r.sizeKB <= THRESHOLDS.firstLoadJsPerRouteKB;
        const mark = ok ? c("green", "✓") : c("red", "✗");
        const size = ok ? fmtKB(r.sizeKB) : c("red", fmtKB(r.sizeKB));
        console.log(`  ${mark} ${r.route.padEnd(28)} ${size}  ${c("dim", `(${r.chunks} chunks)`)}`);
      }
    }
    if (violations.length > 0) {
      for (const v of violations) {
        errors.push(
          `First-load JS exceeds budget for route "${v.route}": ${fmtKB(v.sizeKB)} > ${v.thresholdKB} KB`,
        );
      }
      console.log(
        `  ${c("red", `✗ FAIL`)} — ${violations.length} route(s) exceed ${THRESHOLDS.firstLoadJsPerRouteKB} KB`,
      );
    } else {
      console.log(
        `  ${c("green", "✓ PASS")} — all ${routeSizes.length} route(s) within ${THRESHOLDS.firstLoadJsPerRouteKB} KB`,
      );
    }
  }
  console.log("");

  // ── Check 3: Total initial bundle ─────────────────────────────────────
  console.log(c("cyan", "▶ Check 3: Total initial bundle"));
  const totalResult = await checkTotalInitialBundle(root);
  if (totalResult.skipped) {
    console.log(`  ${c("yellow", "⚠ SKIPPED")} — manifest not found`);
  } else {
    console.log(`  ${c("dim", "Total:")} ${fmtKB(totalResult.sizeKB)}  ${c("dim", `(${totalResult.chunkCount} unique chunks)`)}`);
    if (totalResult.sizeKB > THRESHOLDS.totalInitialBundleKB) {
      errors.push(
        `Total initial bundle exceeds budget: ${fmtKB(totalResult.sizeKB)} > ${THRESHOLDS.totalInitialBundleKB} KB`,
      );
      console.log(`  ${c("red", "✗ FAIL")} — exceeds ${THRESHOLDS.totalInitialBundleKB} KB threshold`);
    } else if (totalResult.sizeKB > 0) {
      console.log(`  ${c("green", "✓ PASS")}`);
    } else {
      console.log(`  ${c("yellow", "⚠ SKIPPED")} — no root chunks found`);
    }
  }
  console.log("");

  // ── Result ────────────────────────────────────────────────────────────
  const line = "━".repeat(72);
  console.log(line);
  if (errors.length > 0) {
    console.log(c("red", c("bold", `✗ BUNDLE BUDGET CHECK FAILED — ${errors.length} violation(s)`)));
    console.log("");
    for (const e of errors) console.log(`  • ${e}`);
    if (warnings.length > 0) {
      console.log("");
      console.log(c("yellow", "  Warnings:"));
      for (const w of warnings) console.log(`    - ${w}`);
    }
    console.log(line);
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log(c("yellow", c("bold", `⚠ BUNDLE BUDGET CHECK PASSED with warnings`)));
    for (const w of warnings) console.log(`    - ${w}`);
  } else {
    console.log(c("green", c("bold", "✓ ALL BUNDLE BUDGET CHECKS PASSED")));
  }
  console.log(line);
  process.exit(0);
}

main().catch((err) => {
  console.error("Bundle budget check crashed:", err);
  process.exit(1);
});
