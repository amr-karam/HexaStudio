#!/usr/bin/env node
/**
 * check-design-tokens.mjs
 *
 * Scans source files for hardcoded hex colors (#RRGGBB) and flags violations
 * of the design token policy. Allowed exceptions are files that define the
 * design tokens themselves (tokens.ts) or require literal hex values for
 * technical reasons (PDF generation, PWA manifests).
 *
 * Usage:
 *   node scripts/check-design-tokens.mjs [target-dir] --allow-inline-style-hex
 *
 * Default target: apps/web/src
 * Usage in AGENTS.md quality gates:
 *   node scripts/check-design-tokens.mjs --allow-inline-style-hex
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Configuration ──────────────────────────────────────────────────────────

const TARGET = process.argv[2] && !process.argv[2].startsWith('--')
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, '../apps/web/src');

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css'];

const ALLOWED_FILES = new Set([
  'tokens.ts',
  'tokens.css',
  'globals.css',     // Source of truth for CSS design tokens
  'manifest.ts',     // PWA manifest — spec requires hex values
  'InvoicePDF.tsx',  // Print/dark mode PDF context
  'Charts.tsx',      // Chart color palette with opacity variants (hex+alpha)
  'PDFDownloadButton.tsx', // html2canvas backgroundColor — literal hex required
]);

const HEX_REGEX = /#[0-9A-Fa-f]{3,8}\b/g;

// ─── Helpers ────────────────────────────────────────────────────────────────

function shouldSkipFile(filePath) {
  const relPath = path.relative(TARGET, filePath).replace(/\\/g, '/');

  for (const allowed of ALLOWED_FILES) {
    if (relPath === allowed || relPath.endsWith(allowed)) return true;
  }

  if (relPath.includes('node_modules')) return true;
  if (relPath.includes('.next')) return true;
  if (relPath.includes('dist')) return true;
  if (relPath.includes('build')) return true;
  if (relPath.includes('.git')) return true;
  if (relPath.includes('coverage')) return true;
  return false;
}

function* walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const allowInline = args.includes('--allow-inline-style-hex');

  let violations = 0;
  const violationList = [];

  for (const filePath of walkDir(TARGET)) {
    if (shouldSkipFile(filePath)) continue;

    const ext = path.extname(filePath);
    if (!EXTENSIONS.includes(ext)) continue;

    const content = fs.readFileSync(filePath, 'utf8');

    // Remove comments to avoid false positives
    const cleaned = content
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/<!--[\s\S]*?-->/g, '');

    // Find all hex colors
    let match;
    HEX_REGEX.lastIndex = 0;
    while ((match = HEX_REGEX.exec(cleaned)) !== null) {
      const hex = match[0];
      const beforeMatch = cleaned.substring(0, match.index);
      const lineNum = beforeMatch.split('\n').length;
      const line = content.split('\n')[lineNum - 1];

      // Skip CSS variable definitions
      if (line && line.includes('--color') && line.includes(':')) continue;
      // Skip CSS variable references
      if (hex.includes('var')) continue;

      violations++;
      violationList.push({
        file: path.relative(TARGET, filePath),
        line: lineNum,
        hex,
        context: line.trim(),
      });
    }
  }

  if (violations === 0) {
    console.log('No hardcoded hex colors found.');
    console.log('Design token policy is compliant.');
    process.exit(0);
  } else {
    console.error(`Found ${violations} hardcoded hex color(s):`);
    for (const v of violationList) {
      console.error(`  ${v.file}:${v.line} - ${v.hex}`);
      console.error(`     ${v.context}`);
    }
    if (allowInline) {
      console.log('\n(--allow-inline-style-hex flag was set, but violations are still reported.)');
    }
    process.exit(1);
  }
}

main();
