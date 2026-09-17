#!/usr/bin/env node
/**
 * Motion Token Regression Gate
 * ============================
 *
 * Scans animation-related files and exits 1 if raw easing/duration
 * values are found instead of --hexa-* design tokens.
 *
 * Violation categories:
 *   1. Raw cubic-bezier() — components must use var(--hexa-...-ease)
 *   2. Hardcoded durations — must use var(--hexa-duration-*)
 *   3. Raw hex colors in animation — must use sl-* tokens
 *
 * Usage:
 *   node scripts/check-motion-tokens.mjs [--root <monorepo-root>]
 *
 * Exit codes:
 *   0 - All motion tokens are compliant
 *   1 - Violations found
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.argv.includes('--root')
  ? process.argv[process.argv.indexOf('--root') + 1]
  : process.cwd();

const VIOLATIONS = [];
const ALLOWLIST = [
  'lib/motion.ts',
  'lib/motion/tokens.ts',
  'lib/motion.tsx',
];

const TS_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.scss']);

function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const relPath = filePath.replace(ROOT + '/', '');

    if (ALLOWLIST.some(f => relPath.includes(f))) return;

    // Check for raw cubic-bezier
    const cubicMatches = content.match(/cubic-bezier\([^)]+\)/g);
    if (cubicMatches) {
      for (const match of cubicMatches) {
        VIOLATIONS.push({
          file: relPath,
          line: 'multiple',
          type: 'raw-cubic-bezier',
          value: match,
          suggestion: 'Use var(--hexa-ease-*) instead'
        });
      }
    }

    // Check for hardcoded animation durations (0.1s, 0.2s, 0.3s, etc.)
    // But exclude --hexa-duration-* variable definitions
    const durationRegex = /(?:animation-duration|transition-duration|duration)\s*:\s*(?!\s*var\(--hexa-)[\d.]+\s*(s|ms))/gi;
    const durationMatches = content.match(durationRegex);
    if (durationMatches) {
      for (const match of durationMatches) {
        VIOLATIONS.push({
          file: relPath,
          type: 'hardcoded-duration',
          value: match.trim(),
          suggestion: 'Use var(--hexa-duration-*) instead'
        });
      }
    }

    // Check for raw hex colors in style props (animation context)
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx')) {
      const hexInStyle = content.match(/style\s*=\s*\{\s*[^}]*#[0-9a-fA-F]{3,8}/g);
      if (hexInStyle) {
        for (const match of hexInStyle) {
          VIOLATIONS.push({
            file: relPath,
            type: 'raw-hex-in-style',
            value: match.trim().slice(0, 80),
            suggestion: 'Use sl-* design tokens instead'
          });
        }
      }
    }
  } catch (err) {
    // Skip files that can't be read
  }
}

function scanDirectory(dir) {
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        if (['node_modules', '.git', '.worktrees', 'dist', '.next', 'build'].includes(entry)) continue;
        scanDirectory(fullPath);
      } else if (TS_EXTENSIONS.has(extname(entry))) {
        scanFile(fullPath);
      }
    }
  } catch (err) {
    // Skip directories that can't be read
  }
}

// Main
const scanDir = join(ROOT, 'apps', 'frontend', 'src');
if (!existsSync(scanDir)) {
  console.log('⚠️  Scan directory not found, scanning project root instead');
  scanDirectory(ROOT);
} else {
  scanDirectory(scanDir);
}

// Output results
console.log('🎨 Motion Token Regression Gate');
console.log('================================');
console.log(`Root: ${ROOT}`);
console.log(`Scanning: ${scanDir}`);

if (VIOLATIONS.length === 0) {
  console.log('\n✅ All motion tokens are compliant!');
  process.exit(0);
} else {
  console.log(`\n❌ Found ${VIOLATIONS.length} violation(s):\n`);
  const grouped = {};
  for (const v of VIOLATIONS) {
    const key = v.file;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(v);
  }
  for (const [file, violations] of Object.entries(grouped)) {
    console.log(`  ${file}:`);
    for (const v of violations) {
      console.log(`    - ${v.type}: ${v.value} → ${v.suggestion}`);
    }
  }
  console.log('\n💡 Fix: Run node scripts/fix-design-tokens.mjs');
  console.log('   Or replace raw values with --hexa-* token variables.');
  process.exit(1);
}

function existsSync(path) {
  try { return statSync(path).isDirectory(); } catch { return false; }
}
