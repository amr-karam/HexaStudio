#!/usr/bin/env node
/**
 * Design Token Codemod — replace raw design-token hex with semantic tokens
 * =========================================================================
 *
 * One-shot codemod that scans every `.tsx` / `.ts` file under
 * `apps/frontend/src` and replaces raw design-token violations with the
 * semantic Tailwind token classes / CSS custom properties defined in
 * `apps/frontend/src/app/globals.css` `@theme`:
 *
 *   --color-accent:        #D4AF37        → text-accent / bg-accent / border-accent ...
 *   --color-obsidian:      #050505        → bg-obsidian
 *   --color-surface:       #1A1A1A        → bg-surface
 *   --color-surface-dark:  #030303        → bg-surface-dark
 *   --hexa-ease-entrance:  cubic-bezier(0.16, 1, 0.3, 1) → var(--hexa-ease-entrance)
 *
 * The easing token source (`apps/frontend/src/lib/motion/tokens.ts`) is
 * intentionally NOT rewritten — it is the canonical definition of the easing
 * strings and must remain raw.
 *
 * Usage:
 *   node scripts/fix-design-tokens.mjs [--root <monorepo-root>] [--dry-run|-d] [--report|-r] [--quiet|-q]
 *
 * Flags:
 *   --root <path>   Monorepo root containing apps/frontend/src (default: cwd)
 *   --dry-run, -d   Preview what would change without writing any files
 *   --report, -r    Print a per-file replacement summary table
 *   --quiet, -q     Suppress per-file output (summary only)
 *
 * Exit codes: 0 = success; 1 = error (e.g. source tree missing).
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { execFileSync } from "node:child_process";

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

const SKIP_DIR_RE = /(node_modules|\.next|dist|build|\.git)/;
const SOURCE_DIR = "apps/frontend/src";
const EASE_TOKEN_SOURCE = "apps/frontend/src/lib/motion/tokens.ts";

/**
 * Ordered replacement rules. Order matters: more specific patterns first so a
 * later, broader pattern never consumes a partially-replaced token. All
 * matches are case-sensitive on the exact uppercase `#D4AF37` form used in
 * the codebase (lowercase `#d4af37` is reported as a warning, never touched).
 */
const REPLACEMENTS = [
  { name: "border-t-accent", regex: /border-t-\[#D4AF37\]/g, to: "border-t-accent" },
  { name: "focus:border-accent/N", regex: /focus:border-\[#D4AF37\]\/(\d+)/g, to: "focus:border-accent/$1" },
  { name: "border-accent/N", regex: /border-\[#D4AF37\]\/(\d+)/g, to: "border-accent/$1" },
  { name: "border-accent", regex: /border-\[#D4AF37\]/g, to: "border-accent" },
  { name: "accent-accent", regex: /accent-\[#D4AF37\]/g, to: "accent-accent" },
  { name: "text-accent", regex: /text-\[#D4AF37\]/g, to: "text-accent" },
  { name: "bg-accent", regex: /bg-\[#D4AF37\]/g, to: "bg-accent" },
  { name: "bg-obsidian", regex: /bg-\[#050505\]/g, to: "bg-obsidian" },
  { name: "bg-surface (from #0F0F10)", regex: /bg-\[#0F0F10\]/g, to: "bg-surface" },
  { name: "bg-surface (from #1A1A1A)", regex: /bg-\[#1A1A1A\]/g, to: "bg-surface" },
  { name: "bg-surface-dark", regex: /bg-\[#0A0A0A\]/g, to: "bg-surface-dark" },
  {
    name: "var(--hexa-ease-entrance)",
    regex: /cubic-bezier\(0\.16, 1, 0\.3, 1\)/g,
    to: "var(--hexa-ease-entrance)",
    skip: [EASE_TOKEN_SOURCE],
  },
  { name: "stroke-accent", regex: /stroke-\[#D4AF37\]/g, to: "stroke-accent" },
];

function parseArgs(argv) {
  const args = { root: process.cwd(), dryRun: false, report: false, quiet: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root") args.root = resolve(argv[++i]);
    else if (a === "--dry-run" || a === "-d") args.dryRun = true;
    else if (a === "--report" || a === "-r") args.report = true;
    else if (a === "--quiet" || a === "-q") args.quiet = true;
    else console.log(c("yellow", `  ⚠ Unknown flag ignored: ${a}`));
  }
  return args;
}

function toPosix(p) {
  return p.split(sep).join("/");
}

function collectSourceFiles(srcDir) {
  const files = [];
  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (SKIP_DIR_RE.test(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
    }
  }
  walk(srcDir);
  return files;
}

function applyRules(content, relPosix) {
  let updated = content;
  const counts = {};
  for (const rule of REPLACEMENTS) {
    if (rule.skip && rule.skip.includes(relPosix)) continue;
    const re = new RegExp(rule.regex.source, "g");
    const count = (updated.match(re) || []).length;
    if (count === 0) continue;
    updated = updated.replace(re, rule.to);
    counts[rule.name] = (counts[rule.name] || 0) + count;
  }
  return { updated, counts };
}

function lineChanges(original, updated) {
  const beforeLines = original.split("\n");
  const afterLines = updated.split("\n");
  const changes = [];
  const max = Math.max(beforeLines.length, afterLines.length);
  for (let i = 0; i < max; i++) {
    const b = beforeLines[i] ?? "";
    const a = afterLines[i] ?? "";
    if (b !== a) changes.push({ line: i + 1, before: b, after: a });
  }
  return changes;
}

function trim(s, max = 160) {
  const t = s.trim();
  return t.length > max ? `${t.slice(0, max - 3)}...` : t;
}

function printHeader() {
  const line = "━".repeat(72);
  console.log(line);
  console.log(c("bold", "  DESIGN TOKEN CODEMOD — raw hex → semantic tokens"));
  console.log(line);
  console.log("  Source: apps/frontend/src  (tokens: apps/frontend/src/app/globals.css)");
  console.log(`  ${REPLACEMENTS.length} ordered replacement rules`);
  console.log(line);
  console.log("");
}

function printReportTable(results) {
  if (results.length === 0) return;
  console.log("");
  console.log(c("cyan", "  PER-FILE REPLACEMENT SUMMARY"));
  const fileWidth = Math.max("File".length, ...results.map((r) => r.rel.length));
  console.log(`  ${"File".padEnd(fileWidth)}  ${"Replacements".padStart(12)}`);
  for (const r of results) {
    console.log(`  ${r.rel.padEnd(fileWidth)}  ${String(r.total).padStart(12)}`);
  }
}

function gitDiffStat(root) {
  try {
    const out = execFileSync("git", ["diff", "--stat", "--", "apps/frontend/src"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.trim();
  } catch {
    return null;
  }
}

function main() {
  const args = parseArgs(process.argv);
  const root = args.root;
  const srcDir = join(root, SOURCE_DIR);

  printHeader();

  let sourceFiles;
  try {
    sourceFiles = collectSourceFiles(srcDir);
  } catch {
    console.log(c("red", `  ✗ Source tree not found at ${srcDir}`));
    process.exit(1);
  }

  const results = [];
  const lowercaseHex = [];
  let totalReplacements = 0;

  for (const abs of sourceFiles) {
    const relPosix = toPosix(relative(root, abs));
    let content;
    try {
      content = readFileSync(abs, "utf-8");
    } catch {
      continue;
    }

    const lowerHits = (content.match(/#d4af37/g) || []).length;
    if (lowerHits > 0) {
      lowercaseHex.push({ rel: relPosix, count: lowerHits });
    }

    const { updated, counts } = applyRules(content, relPosix);
    const fileTotal = Object.values(counts).reduce((sum, n) => sum + n, 0);
    if (fileTotal === 0) continue;

    const changes = lineChanges(content, updated);
    results.push({ rel: relPosix, counts, total: fileTotal, changes });
    totalReplacements += fileTotal;

    if (args.quiet) continue;

    if (args.dryRun) {
      console.log(c("yellow", `  ~ ${relPosix}`));
      for (const ch of changes) {
        console.log(`    L${String(ch.line).padEnd(5)} ${c("red", trim(ch.before))}`);
        console.log(`         → ${c("green", trim(ch.after))}`);
      }
    } else {
      console.log(`${c("green", "  ✓")} ${relPosix}  ${c("dim", `(${fileTotal} replacement${fileTotal === 1 ? "" : "s"})`)}`);
    }
  }

  if (!args.dryRun && results.length > 0) {
    for (const r of results) {
      const abs = join(root, r.rel.split("/").join(sep));
      const content = readFileSync(abs, "utf-8");
      const { updated } = applyRules(content, r.rel);
      writeFileSync(abs, updated, "utf-8");
    }
  }

  if (args.report) printReportTable(results);

  console.log("");
  const line = "━".repeat(72);
  if (args.dryRun) {
    console.log(
      c("yellow", c("bold", `  ⚠ DRY RUN — ${results.length} file(s) would change (${totalReplacements} replacements)`)),
    );
    console.log(c("dim", "    No files were written. Remove --dry-run to apply."));
  } else {
    console.log(
      c("green", c("bold", `  ✓ ${results.length} file(s) updated — ${totalReplacements} total replacement(s)`)),
    );
  }

  if (lowercaseHex.length > 0) {
    console.log("");
    console.log(c("yellow", "  ⚠ WARNING — lowercase #d4af37 occurrences (NOT touched, case-sensitive codemod):"));
    for (const w of lowercaseHex) {
      console.log(`    - ${w.rel}: ${w.count} occurrence(s)`);
    }
  } else {
    console.log(c("dim", "  ℹ No lowercase #d4af37 occurrences found."));
  }
  console.log(line);

  if (!args.dryRun && totalReplacements > 0) {
    console.log("");
    console.log(c("cyan", "▶ git diff --stat"));
    const stat = gitDiffStat(root);
    if (stat && stat.length > 0) {
      console.log(stat);
    } else {
      console.log(c("dim", "  (no diff output — files may be untracked or git unavailable)"));
    }
    console.log(line);
  }

  process.exit(0);
}

main();
