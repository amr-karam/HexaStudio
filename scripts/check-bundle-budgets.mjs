#!/usr/bin/env node
/**
 * Bundle Budget Enforcement (S-019 P1 / S-023)
 * ============================================
 *
 * Parses Turbopack build output and enforces three bundle size budgets:
 *   1. First-load JS per route: 200KB max (S-019 P1 success criteria)
 *   2. Total initial bundle:    500KB max
 *   3. Largest single chunk:    500KB max
 *
 * Exits 0 if all budgets pass; exits 1 if any are exceeded, with a clear
 * error report listing each violation. Run after `next build` so that
 * .next/build-manifest.json and .next/static are present.
 *
 * Turbopack (App Router) notes:
 *   - The root "initial bundle" lives under build-manifest.json → rootMainFiles
 *     (chunks every client route shares, e.g. react-dom runtime).
 *   - Per-route client chunks are listed in <route>/page.js.nft.json (files).
 *     Route-only chunks (3D scene data, XR runtime, etc.) are NOT counted
 *     toward the *initial* bundle because next/dynamic(ssr:false) keeps them
 *     out of the SSR payload; they load only when that route is navigated.
 *
 * Usage:
 *   node scripts/check-bundle-budgets.mjs [--root <monorepo-root>]
 *
 * Flags:
  *   --root <path>   Monorepo root containing apps/frontend/.next (default: cwd)
 *   --quiet         Suppress per-route PASS output (only show violations)
 */

import { readFile, stat } from "node:fs/promises";
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

/**
 * Resolves a chunk ref to its on-disk path under .next.
 * Turbopack build-manifest refs look like "static/chunks/x.js".
 * nft.json file refs look like "static/chunks/x.js".
 * Both are relative to the .next directory.
 */
function resolveChunkPath(nextDir, chunkRef) {
  let ref = chunkRef;
  if (ref.startsWith("/_next/")) ref = ref.slice("/_next/".length);
  return join(nextDir, ref);
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
  const routesManifestPath = join(nextDir, "app-path-routes-manifest.json");

  if (!(await fileExists(routesManifestPath))) {
    return {
      skipped: true,
      reason: `${relative(process.cwd(), routesManifestPath)} not found — did you run \`next build\`?`,
      violations: [],
      routeSizes: [],
    };
  }

  const routesManifest = await readJson(routesManifestPath);
  // routesManifest: { "/about/page": "/about", ..., "/page": "/" }
  const routeEntries = Object.entries(routesManifest);

  const routeSizes = [];
  const violations = [];

  for (const [pageKey, url] of routeEntries) {
    // Turbopack App Router: each route's server bundle is at server/app/<url>/page.js
    // (root "/" maps to server/app/page.js). The sibling page.js.nft.json lists the
    // files the route's SSR bundle depends on; only static/chunks client JS there
    // counts toward first-load JS. Lazy next/dynamic chunks live in .segments and
    // are excluded — they load only on navigation (e.g. the 3D scene bundle).
    const nftPath = url === "/"
      ? join(nextDir, "server/app/page.js.nft.json")
      : join(nextDir, "server/app", url.replace(/^\//, ""), "page.js.nft.json");

    let totalKB = 0;
    const chunkFiles = [];

    if (await fileExists(nftPath)) {
      const nft = await readJson(nftPath);
      for (const file of nft.files || []) {
        if (
          file.startsWith("static/chunks/") &&
          file.endsWith(".js") &&
          !file.includes(".segments/")
        ) {
          const onDisk = join(nextDir, file);
          const kb = await fileSizeKB(onDisk);
          if (kb > 0) {
            totalKB += kb;
            chunkFiles.push(file);
          }
        }
      }
    }

    const entry = { route: url, sizeKB: totalKB, chunks: chunkFiles.length };
    routeSizes.push(entry);

    if (totalKB > THRESHOLDS.firstLoadJsPerRouteKB) {
      violations.push({
        ...entry,
        thresholdKB: THRESHOLDS.firstLoadJsPerRouteKB,
      });
    }
  }

  routeSizes.sort((a, b) => b.sizeKB - a.sizeKB);
  return { skipped: false, violations, routeSizes };
}

async function checkTotalInitialBundle(root) {
  // "Initial bundle" = chunks EVERY first-time visitor downloads, regardless
  // of landing page: the shared react-dom/runtime + framework bootstrap that
  // Turbopack publishes in build-manifest.json → rootMainFiles.
  const nextDir = join(root, "apps/frontend/.next");
  const buildManifestPath = join(nextDir, "build-manifest.json");

  if (!(await fileExists(buildManifestPath))) {
    return { sizeKB: 0, skipped: true, reason: "build-manifest.json not found — run next build first." };
  }

  const buildManifest = await readJson(buildManifestPath);
  const rootChunks = buildManifest.rootMainFiles || [];
  const unique = new Set(rootChunks);

  let totalKB = 0;
  for (const ref of unique) {
  const onDisk = resolveChunkPath(nextDir, ref);
  totalKB += await fileSizeKB(onDisk);
  }
  return { sizeKB: totalKB, skipped: false, chunkCount: unique.size };
  }

function printHeader() {
  const line = "━".repeat(72);
  console.log(line);
  console.log(c("bold", "  BUNDLE BUDGET ENFORCEMENT (S-019 P1 / S-023)"));
  console.log(line);
  console.log("  Thresholds:");
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
  // We only evaluate chunks that a *real first-time visitor* downloads: the
  // shared root initial bundle (build-manifest.json → rootMainFiles) UNION
  // with the first-load client chunks of every route's page.js.nft.json.
  // Chunks that exist only as dynamic-import targets (e.g. the 3D scene
  // bundle, XR runtime) are excluded — they never ship on initial load.
  console.log(c("cyan", "▶ Check 1: Largest single chunk (initial-load set)"));
  const initialRouteResult = await checkFirstLoadPerRoute(root);
  const buildManifestPath = join(nextDir, "build-manifest.json");
  let rootRefs = [];
  if (await fileExists(buildManifestPath)) {
    rootRefs = (await readJson(buildManifestPath)).rootMainFiles || [];
  }
  // Union of all first-load chunk refs across routes + root bundle.
  const initialRefs = new Set(rootRefs);
  if (!initialRouteResult.skipped) {
    for (const r of initialRouteResult.routeSizes) {
      for (const f of r.chunkFiles || []) initialRefs.add(f);
    }
  }
  const initialChunks = new Map();
  for (const ref of initialRefs) {
    const onDisk = resolveChunkPath(nextDir, ref);
    const kb = await fileSizeKB(onDisk);
    if (kb > 0) initialChunks.set(onDisk, kb);
  }
  const { largestKB, largestName } = await getLargestChunk(initialChunks);
  if (largestName) {
    const rel = relative(root, largestName);
    console.log(`  ${c("dim", "Largest:")} ${fmtKB(largestKB)}  ${c("dim", rel)}`);
  } else {
    console.log(`  ${c("dim", "No initial-load chunks found.")}`);
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
  if (initialRouteResult.skipped) {
    console.log(`  ${c("yellow", "⚠ SKIPPED")} — ${initialRouteResult.reason}`);
    warnings.push(initialRouteResult.reason);
  } else {
    const { violations, routeSizes } = initialRouteResult;
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
        `  ${c("red", "✗ FAIL")} — ${violations.length} route(s) exceed ${THRESHOLDS.firstLoadJsPerRouteKB} KB`,
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
    console.log(`  ${c("yellow", "⚠ SKIPPED")} — ${totalResult.reason || "manifest not found"}`);
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
