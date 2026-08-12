#!/usr/bin/env node
/**
 * Design Token Regression Gate
 * ============================
 *
 * Scans every `.tsx` / `.ts` file under `apps/frontend/src` and exits 1 if any
 * raw design-token hex / easing violation is found. Pair with
 * `scripts/fix-design-tokens.mjs` to keep the semantic-token standard from
 * regressing in CI.
 *
 * Violation categories:
 *   1. Arbitrary accent hex class        — `[#D4AF37]` (case-insensitive)
 *   2. Stray dark surface classes        — `bg-[#050505]`, `bg-[#0F0F10]`,
 *                                          `bg-[#1A1A1A]`, `bg-[#0A0A0A]`
 *   3. Raw easing curve                  — `cubic-bezier(...)` (components must
 *                                          use `var(--hexa-...` EASE tokens; the
 *                                          easing source `lib/motion/tokens.ts`
 *                                          is exempt as the canonical definition)
 *   4. Inline-style hex                  — raw `#hex` literals outside arbitrary
 *                                          classes (e.g. `style={{ color: '#...' }}`,
 *                                          `color="#..."`, `stopColor="#..."`).
 *                                          Suppress with `--allow-inline-style-hex`;
 *                                          files with legitimate dynamic colors are
 *                                          hardcoded in the ALLOWLIST below.
 *
 * Usage:
 *   node scripts/check-design-tokens.mjs [--root <monorepo-root>] [--allow-inline-style-hex|-a] [--quiet|-q]
 *
 * Flags:
 *   --root <path>            Monorepo root containing apps/frontend/src (default: cwd)
 *   --allow-inline-style-hex -a   Do not fail on the inline-style-hex category
 *   --quiet, -q              Suppress per-line violation output (summary only)
 *
 * Exit codes: 0 = clean; 1 = violations found.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

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

/**
 * Files that intentionally use raw inline hex for dynamic, non-tokenable
 * colors (procedural canvas/SVG/3D materials, runtime theming, shaders).
 * These are excluded from the inline-style-hex category only — the
 * arbitrary-class and easing categories still apply to them.
 */
const ALLOWLIST = [
  "apps/frontend/src/components/CustomCursor.tsx",
  "apps/frontend/src/features/ai/components/MultimodalAnalyzer.tsx",
  "apps/frontend/src/features/portal/components/PortalThemeProvider.tsx",
  "apps/frontend/src/components/effects/AmbientScene.tsx",
];

/** Canonical easing definition file — raw cubic-bezier strings belong here. */
const EASE_TOKEN_SOURCE = "apps/frontend/src/lib/motion/tokens.ts";

/** Non-global (per-line `.test`) regexes — category 1–3. */
const CLASS_VIOLATIONS = [
  { name: "arbitrary accent hex class", regex: /\[#d4af37\]/i },
  { name: "stray dark surface class", regex: /bg-\[#050505\]/ },
  { name: "stray dark surface class", regex: /bg-\[#0F0F10\]/ },
  { name: "stray dark surface class", regex: /bg-\[#1A1A1A\]/ },
  { name: "stray dark surface class", regex: /bg-\[#0A0A0A\]/ },
  { name: "raw cubic-bezier(...) — use EASE token", regex: /cubic-bezier\(/ },
];

/** Arbitrary-class bracket spans to strip before inline-hex detection. */
const ARB_BRACKET_RE = /\[#[0-9a-fA-F]+\]/g;
/** Raw hex color literal (3–8 hex digits), e.g. #fff, #D4AF37, #1A1A1A.
 *  Negative lookbehind excludes HTML/XML entities like `&#9670;`. */
const INLINE_HEX_RE = /(?<!&)#[0-9a-fA-F]{3,8}\b/g;

function parseArgs(argv) {
  const args = { root: process.cwd(), allowInlineHex: false, quiet: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root") args.root = resolve(argv[++i]);
    else if (a === "--allow-inline-style-hex" || a === "-a") args.allowInlineHex = true;
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

function trim(s, max = 160) {
  const t = s.trim();
  return t.length > max ? `${t.slice(0, max - 3)}...` : t;
}

function checkFile(abs, relPosix, allowInlineHex) {
  let content;
  try {
    content = readFileSync(abs, "utf-8");
  } catch {
    return [];
  }

  const violations = [];
  const lines = content.split("\n");
  const inlineEligible = !allowInlineHex && !ALLOWLIST.includes(relPosix);

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    for (const v of CLASS_VIOLATIONS) {
      if (v.name.startsWith("raw cubic-bezier") && relPosix === EASE_TOKEN_SOURCE) continue;
      if (v.regex.test(rawLine)) {
        violations.push({ line: i + 1, category: v.name, text: trim(rawLine) });
      }
    }

    if (inlineEligible) {
      const stripped = rawLine.replace(ARB_BRACKET_RE, "");
      const matches = stripped.match(INLINE_HEX_RE);
      if (matches) {
        for (const m of matches) {
          violations.push({
            line: i + 1,
            category: "inline-style hex",
            text: trim(rawLine),
          });
        }
      }
    }
  }
  return violations;
}

function printHeader() {
  const line = "━".repeat(72);
  console.log(line);
  console.log(c("bold", "  DESIGN TOKEN REGRESSION GATE"));
  console.log(line);
  console.log("  Source: apps/frontend/src  (tokens: apps/frontend/src/app/globals.css)");
  console.log("  Categories: arbitrary accent class · stray dark surface · raw cubic-bezier · inline-style hex");
  console.log(line);
  console.log("");
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

  const byFile = new Map();
  for (const abs of sourceFiles) {
    const relPosix = toPosix(relative(root, abs));
    const violations = checkFile(abs, relPosix, args.allowInlineHex);
    if (violations.length > 0) byFile.set(relPosix, violations);
  }

  let total = 0;
  const categoryCounts = new Map();
  for (const violations of byFile.values()) {
    for (const v of violations) {
      total += 1;
      categoryCounts.set(v.category, (categoryCounts.get(v.category) || 0) + 1);
    }
  }

  if (!args.quiet) {
    for (const [file, violations] of byFile.entries()) {
      console.log(c("yellow", `  ${file}`));
      for (const v of violations) {
        console.log(`    L${String(v.line).padEnd(5)} ${c("red", `[${v.category}]`)} ${c("dim", v.text)}`);
      }
    }
  }

  const line = "━".repeat(72);
  console.log("");
  console.log(line);

  if (total > 0) {
    console.log(c("red", c("bold", `  ✗ ${total} design-token violation(s) across ${byFile.size} file(s)`)));
    console.log("");
    for (const [category, count] of categoryCounts.entries()) {
      console.log(`    - ${category}: ${count}`);
    }
    if (args.allowInlineHex) {
      console.log(c("dim", "    (inline-style hex suppressed via --allow-inline-style-hex)"));
    } else {
      console.log(c("dim", "    Tip: inline-style hex can be suppressed with --allow-inline-style-hex if intentional."));
    }
    console.log(line);
    process.exit(1);
  }

  console.log(c("green", c("bold", "  ✓ ALL DESIGN TOKEN CHECKS PASSED")));
  if (args.allowInlineHex) {
    console.log(c("dim", "    (inline-style hex category suppressed by --allow-inline-style-hex)"));
  }
  console.log(line);
  process.exit(0);
}

main();
