#!/usr/bin/env node
/**
 * HEXA Fast Token Codemod — Silent Luxury 2.0 (PRECISE)
 * Migrates legacy Tailwind tokens -> sl-* in < 2s
 * Only touches Tailwind class utilities, never JS identifiers
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = 'apps/frontend/src';
const DRY = process.argv.includes('--dry');
const CHECK = process.argv.includes('--check');

const REPLACEMENTS = [
  [/bg-background/g, 'bg-sl-void'],
  [/text-foreground/g, 'text-sl-alabaster'],
  [/border-border\/50/g, 'border-sl-silver/20'],
  [/border-border\/30/g, 'border-sl-silver/20'],
  [/border-border\/20/g, 'border-sl-silver/20'],
  [/border-border\/10/g, 'border-sl-silver/10'],
  [/border-border/g, 'border-sl-silver/20'],
  [/bg-surface-light\/30/g, 'bg-sl-obsidian/30'],
  [/bg-surface-light\/20/g, 'bg-sl-obsidian/20'],
  [/bg-surface-secondary/g, 'bg-sl-obsidian'],
  [/bg-surface/g, 'bg-sl-obsidian'],
  [/text-card-foreground/g, 'text-sl-alabaster'],
  [/bg-card/g, 'bg-sl-obsidian'],
  [/text-accent\/80/g, 'text-sl-gold-hover/80'],
  [/text-accent\/70/g, 'text-sl-gold-hover/70'],
  [/text-accent\/60/g, 'text-sl-gold-hover/60'],
  [/text-accent\/50/g, 'text-sl-gold-hover/50'],
  [/text-accent\/30/g, 'text-sl-gold-hover/30'],
  [/text-accent\/20/g, 'text-sl-gold-hover/20'],
  [/text-accent\/10/g, 'text-sl-gold-hover/10'],
  [/text-accent\/5/g, 'text-sl-gold-hover/5'],
  [/bg-accent\/10/g, 'bg-sl-gold-subtle/10'],
  [/bg-accent\/20/g, 'bg-sl-gold-subtle/20'],
  [/bg-accent\/30/g, 'bg-sl-gold-subtle/30'],
  [/bg-accent/g, 'bg-sl-gold-subtle'],
  [/border-accent\/50/g, 'border-sl-gold-subtle/50'],
  [/border-accent\/40/g, 'border-sl-gold-subtle/40'],
  [/border-accent\/30/g, 'border-sl-gold-subtle/30'],
  [/border-accent\/10/g, 'border-sl-gold-subtle/10'],
  [/border-accent/g, 'border-sl-gold-subtle'],
  [/from-accent-light/g, 'from-sl-gold-hover'],
  [/to-accent-light/g, 'to-sl-gold-hover'],
  [/via-accent-light/g, 'via-sl-gold-hover'],
  [/from-accent\/50/g, 'from-sl-gold-subtle/50'],
  [/from-accent/g, 'from-sl-gold-subtle'],
  [/to-accent/g, 'to-sl-gold-subtle'],
  [/via-accent\/30/g, 'via-sl-gold-subtle/30'],
  [/via-accent/g, 'via-sl-gold-subtle'],
  [/ring-accent/g, 'ring-sl-gold-subtle'],
  [/divide-accent/g, 'divide-sl-gold-subtle'],
  [/outline-accent/g, 'outline-sl-gold-subtle'],
  [/decoration-accent/g, 'decoration-sl-gold-subtle'],
  [/shadow-accent/g, 'shadow-sl-gold-subtle'],
  [/text-accent-light/g, 'text-sl-gold-hover'],
  [/text-accent-hover/g, 'text-sl-gold-hover'],
  [/hover:text-accent-light/g, 'hover:text-sl-gold-hover'],
  [/hover:text-accent-hover/g, 'hover:text-sl-gold-hover'],
  [/hover:text-accent/g, 'hover:text-sl-gold-hover'],
  [/hover:border-accent/g, 'hover:border-sl-gold-hover'],
  [/focus-visible:ring-accent/g, 'focus-visible:ring-sl-gold-hover'],
  [/text-accent/g, 'text-sl-gold-hover'],
  [/text-muted-foreground/g, 'text-sl-mist/60'],
  [/text-muted/g, 'text-sl-mist/60'],
  [/bg-muted/g, 'bg-sl-obsidian'],
  [/text-neutral-500/g, 'text-sl-mist/60'],
  [/text-neutral-400/g, 'text-sl-mist/60'],
  [/text-neutral-300/g, 'text-sl-mist/80'],
  [/text-neutral-600/g, 'text-sl-mist/60'],
  [/bg-neutral-900/g, 'bg-sl-void'],
  [/bg-neutral-800/g, 'bg-sl-obsidian'],
  [/border-neutral-800/g, 'border-sl-obsidian'],
  [/text-white\/90/g, 'text-sl-alabaster/90'],
  [/text-white/g, 'text-sl-alabaster'],
  [/from-background\/60/g, 'from-sl-void/60'],
  [/via-background\/80/g, 'via-sl-void/80'],
  [/to-background/g, 'to-sl-void'],
  [/bg-gold\/20/g, 'bg-sl-gold-subtle/20'],
  [/bg-gold\/10/g, 'bg-sl-gold-subtle/10'],
  [/text-gold/g, 'text-sl-gold-hover'],
  [/bg-gold/g, 'bg-sl-gold-subtle'],
  [/border-gold/g, 'border-sl-gold-subtle'],
  [/var\(--color-gold-15\)/g, 'var(--sl-gold-subtle)'],
  [/var\(--color-gold-25\)/g, 'var(--sl-gold-subtle)'],
];

const EXCLUDE = ['__tests__', '.test.', '.spec.', 'globals.css', 'silent-luxury-tokens.css'];
const EXTENSIONS = new Set(['.tsx', '.ts', '.css']);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (EXTENSIONS.has(extname(full))) files.push(full);
  }
  return files;
}

let changed = 0;
let totalReplacements = 0;
const files = walk(ROOT);
for (const file of files) {
  if (EXCLUDE.some(e => file.replace(/\\/g, '/').includes(e))) continue;
  let content = readFileSync(file, 'utf8');
  let fileCount = 0;
  for (const [re, replacement] of REPLACEMENTS) {
    const matches = content.match(re);
    if (matches) {
      content = content.replace(re, replacement);
      fileCount += matches.length;
    }
  }
  if (fileCount > 0) {
    totalReplacements += fileCount;
    changed++;
    if (CHECK) {
      console.log(`[CHECK] ${file} — ${fileCount} replacements needed`);
    } else if (!DRY) {
      writeFileSync(file, content, 'utf8');
      console.log(`[MIGRATED] ${file} — ${fileCount} replacements`);
    } else {
      console.log(`[DRY] ${file} — ${fileCount} replacements`);
    }
  }
}

console.log(`\nDone: ${changed} files, ${totalReplacements} replacements${DRY ? ' (dry run)' : ''}${CHECK ? ' (check mode)' : ''}`);
if (CHECK && changed > 0) process.exit(1);
