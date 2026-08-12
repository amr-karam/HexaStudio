#!/usr/bin/env node
/**
 * HexaFast — HEXA Studio speed workflow CLI
 * =========================================
 * Fast, safe, parallel commands for the everyday session loop. Complements
 * scripts/hexaops.mjs (which owns the slow / ops commands) — nothing here
 * duplicates hexaops.
 *
 * Commands:
 *   hexa-fast context           ONE-SHOT startup snapshot: branch / HEAD / status /
 *                               recent commits / reflog / concurrent-activity / design-token gate
 *   hexa-fast gate:frontend     typecheck + lint + design-token gate in parallel;
 *                               add --tests to also run vitest after
 *   hexa-fast gate[:all]        ALL 9 quality gates (lint + typecheck + test × 3 workspaces)
 *                               in parallel — frontend, backend, mobile
 *   hexa-fast tokens            design-token fix ritual: --dry-run (default) | --apply | --check
 *   hexa-fast commit "<msg>" <paths...> → SAFE commit with explicit pathspec (never git add -A)
 *   hexa-fast help              Show this help
 *
 * Env vars:
 *   (none required — all optional)
 */
import { exec, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const run = promisify(exec);
const cwd = process.cwd();

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */
const COLORS = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

function pad(s, n) {
  return String(s).padEnd(n);
}

async function execSilent(cmd, opts = {}) {
  try {
    const { stdout } = await run(cmd, { cwd, maxBuffer: 64 * 1024 * 1024, ...opts });
    return { ok: true, output: stdout };
  } catch (err) {
    return { ok: false, output: err.stdout ?? '', error: err.stderr ?? err.message };
  }
}

async function timedExecSilent(cmd) {
  const started = Date.now();
  const res = await execSilent(cmd);
  return { ...res, ms: Date.now() - started };
}

/* ------------------------------------------------------------------ */
/*  Concurrent-activity detection (node:fs, no git dependency)         */
/* ------------------------------------------------------------------ */
const SCAN_SKIP_DIRS = new Set(['node_modules', '.next', '.turbo', 'dist', 'build', 'coverage', '.git']);

/**
 * Walk `root` recursively and return files with mtime within the last `ageMs`.
 * Bounded by maxFiles (files actually stat'ed) and returns at most maxPrint.
 */
function scanRecent(root, ageMs, maxFiles, maxPrint) {
  const recent = [];
  const dirs = [root];
  const now = Date.now();
  let scanned = 0;
  while (dirs.length && scanned < maxFiles) {
    const dir = dirs.shift();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (scanned >= maxFiles) break;
      if (entry.name.startsWith('.') || SCAN_SKIP_DIRS.has(entry.name)) continue;
      const full = join(dir, entry.name);
      try {
        const st = statSync(full);
        if (entry.isDirectory()) {
          dirs.push(full);
        } else {
          scanned++;
          if (now - st.mtimeMs <= ageMs) recent.push({ path: full, mtime: st.mtimeMs });
        }
      } catch {
        // stat raced with a write/deletion — skip, never crash
      }
    }
  }
  recent.sort((a, b) => b.mtime - a.mtime);
  return recent.slice(0, maxPrint);
}

function printGateResult(label, res) {
  const status = res.ok ? COLORS.green('PASS') : COLORS.red('FAIL');
  console.log(`${pad(label, 14)} ${pad(status, 8)} ${COLORS.dim(`(${res.ms}ms)`)}`);
  if (!res.ok) {
    const lines = (res.output + (res.error ?? '')).split('\n').filter((l) => l.trim());
    const errLine = lines.find((l) => /error|failed|✗|✘|violation/i.test(l));
    if (errLine) console.log(`${COLORS.dim('  ↳')} ${COLORS.red(errLine.trim())}`);
  }
}

/* ------------------------------------------------------------------ */
/*  1. CONTEXT — one-shot startup snapshot                             */
/* ------------------------------------------------------------------ */
async function cmdContext() {
  console.log(COLORS.bold('\n=== HEXA-FAST: CONTEXT ===\n'));

  const recent = scanRecent('apps', 5 * 60 * 1000, 400, 10)
    .concat(scanRecent('docs', 5 * 60 * 1000, 100, 10))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, 10);

  const [branchRes, headRes, statusRes, logRes, reflogRes, dtRes] = await Promise.all([
    execSilent('git rev-parse --abbrev-ref HEAD'),
    execSilent('git rev-parse --short HEAD'),
    execSilent('git status --short'),
    execSilent('git log --oneline -8'),
    execSilent('git reflog -5'),
    execSilent('node scripts/check-design-tokens.mjs --allow-inline-style-hex'),
  ]);

  const branch = (branchRes.output || '').trim() || '(detached)';
  const head = (headRes.output || '').trim() || '?';
  console.log(
    `  ${COLORS.cyan('branch')}  ${COLORS.bold(branch)} ${COLORS.dim('@')} ${COLORS.bold(head)}   ${COLORS.dim(new Date().toLocaleString())}`,
  );

  console.log(`\n  ${COLORS.cyan('[git status]')}`);
  const statusLines = (statusRes.output || '').trim().split('\n').filter(Boolean);
  if (!statusLines.length) {
    console.log(`  ${COLORS.green('✓ clean working tree')}`);
  } else {
    for (const line of statusLines.slice(0, 20)) console.log(COLORS.dim(`    ${line}`));
    if (statusLines.length > 20) console.log(COLORS.dim(`    … ${statusLines.length - 20} more`));
  }

  console.log(`\n  ${COLORS.cyan('[recent commits]')}`);
  const logLines = (logRes.output || '').trim().split('\n').filter(Boolean);
  if (!logLines.length) {
    console.log(COLORS.dim('    (no commits yet)'));
  } else {
    for (const line of logLines) console.log(COLORS.dim(`    ${line}`));
  }

  console.log(`\n  ${COLORS.cyan('[reflog]')} ${COLORS.dim('(HEAD movement — concurrent process activity)')}`);
  const reflogLines = (reflogRes.output || '').trim().split('\n').filter(Boolean);
  if (!reflogLines.length) {
    console.log(COLORS.dim('    (empty)'));
  } else {
    for (const line of reflogLines.slice(0, 5)) console.log(COLORS.dim(`    ${line}`));
  }

  console.log(`\n  ${COLORS.cyan('[concurrent activity]')} ${COLORS.dim('(files under apps/ + docs/ modified in the last 5 min)')}`);
  if (!recent.length) {
    console.log(COLORS.green('    ✓ none detected'));
  } else {
    for (const f of recent) {
      const rel = f.path.startsWith(cwd + join('/', '')) ? f.path.slice(cwd.length + 1) : f.path;
      console.log(`    ${COLORS.yellow('•')} ${rel} ${COLORS.dim(new Date(f.mtime).toLocaleTimeString())}`);
    }
  }

  const dtOk = dtRes.ok;
  console.log(`\n  ${COLORS.cyan('[design-token gate]')}  ${dtOk ? COLORS.green('PASS') : COLORS.red('FAIL')}  ${COLORS.dim('(node scripts/check-design-tokens.mjs --allow-inline-style-hex)')}`);
  if (!dtOk) {
    const lines = (dtRes.output + (dtRes.error ?? '')).split('\n').filter((l) => l.trim());
    for (const l of lines.slice(0, 3)) console.log(COLORS.dim(`    ↳ ${l.trim()}`));
  }
  console.log('');
}

/* ------------------------------------------------------------------ */
/*  2. FRONTEND GATE — typecheck + lint + tokens in parallel           */
/* ------------------------------------------------------------------ */
async function cmdGateFrontend(rest) {
  const withTests = rest.includes('--tests');
  console.log(COLORS.bold('\n=== HEXA-FAST: FRONTEND GATE ===\n'));

  const gates = [
    ['typecheck', 'npm run typecheck --workspace=apps/frontend'],
    ['lint', 'npm run lint --workspace=apps/frontend'],
    ['tokens', 'node scripts/check-design-tokens.mjs --allow-inline-style-hex'],
  ];

  const results = await Promise.all(gates.map(async ([name, cmd]) => ({ name, ...(await timedExecSilent(cmd)) })));

  console.log(`${COLORS.dim(pad('gate', 14))} ${COLORS.dim(pad('status', 8))} ${COLORS.dim('time')}`);
  console.log('─'.repeat(36));

  if (withTests) {
    console.log(`${COLORS.dim(pad('test (running…)', 14))}`);
    const testRes = await timedExecSilent('npm run test --workspace=apps/frontend');
    results.push({ name: 'test', ...testRes });
  }

  let failed = 0;
  for (const r of results) {
    if (!r.ok) failed++;
    printGateResult(r.name, r);
  }

  console.log('─'.repeat(36));
  if (failed === 0) {
    console.log(COLORS.green(COLORS.bold(`\n✓ FRONTEND GATE PASSED (${results.length} checks)`)));
  } else {
    console.log(COLORS.red(COLORS.bold(`\n✗ ${failed}/${results.length} CHECKS FAILED`)));
  }
  console.log('');
  process.exitCode = failed > 0 ? 1 : 0;
}

/* ------------------------------------------------------------------ */
/*  3. ALL-GATES — delegate to hexaops (owns the 9 quality gates)      */
/* ------------------------------------------------------------------ */
async function cmdGateAll() {
  const res = await execSilent('node scripts/hexaops.mjs gate');
  process.stdout.write(res.output || res.error || '');
  if (res.ok && res.output.includes('ALL 9 GATES PASSED')) process.exit(0);
  else if (res.ok && res.output.includes('FAILED')) process.exit(1);
  else process.exit(res.ok ? 0 : 1);
}

/* ------------------------------------------------------------------ */
/*  4. TOKENS — design-token fix ritual                                */
/* ------------------------------------------------------------------ */
async function cmdTokens(rest) {
  const mode = rest.includes('--apply') ? 'apply' : rest.includes('--check') ? 'check' : 'dry-run';

  if (mode === 'check') {
    console.log(COLORS.bold('\n=== HEXA-FAST: DESIGN TOKEN GATE ===\n'));
    const res = await timedExecSilent('node scripts/check-design-tokens.mjs --allow-inline-style-hex');
    printGateResult('tokens', res);
    console.log('');
    process.exitCode = res.ok ? 0 : 1;
    return;
  }

  const fixCmd = mode === 'apply' ? 'node scripts/fix-design-tokens.mjs --report' : 'node scripts/fix-design-tokens.mjs --dry-run --report';
  console.log(COLORS.bold(`\n=== HEXA-FAST: DESIGN TOKEN FIX (${mode}) ===\n`));
  const res = await timedExecSilent(fixCmd);
  if (res.ok) {
    console.log(res.output.trim());
    console.log(COLORS.green(`\n  ✓ fix command finished (${res.ms}ms)`));
  } else {
    console.log(res.error || res.output);
    console.log(COLORS.red(`\n  ✗ fix command failed (${res.ms}ms)`));
    process.exitCode = 1;
    return;
  }

  if (mode === 'apply') {
    console.log(COLORS.cyan('\n  Re-running gate to verify…\n'));
    const gate = await timedExecSilent('node scripts/check-design-tokens.mjs --allow-inline-style-hex');
    printGateResult('tokens', gate);
    process.exitCode = gate.ok ? 0 : 1;
  }
  console.log('');
}

/* ------------------------------------------------------------------ */
/*  5. SAFE COMMIT — explicit pathspec only (never git add -A)         */
/* ------------------------------------------------------------------ */
const CONVENTIONAL_TYPES = '(feat|fix|chore|docs|refactor|perf|ci|test|style|build|revert)';

function shellQuote(p) {
  return /[\s"'&|<>()]/.test(p) ? `"${p.replace(/"/g, '\\"')}"` : p;
}

async function cmdCommit(rest) {
  const message = rest[0];
  const paths = rest.slice(1);

  if (!message || paths.length === 0) {
    console.error(COLORS.red('\nUsage: hexa-fast commit "<message>" <paths...>'));
    console.error(COLORS.yellow('  Example: hexa-fast commit "feat(ui): add hero section" apps/frontend/src/app/page.tsx'));
    console.error(COLORS.yellow('  SAFE: only the given paths are added/committed — other staged files are untouched.\n'));
    process.exit(1);
  }

  const hasType = new RegExp(`^${CONVENTIONAL_TYPES}(\\()|(\\:)`).test(message);
  const full = hasType ? message : `chore: ${message}`;

  console.log(COLORS.bold('\n=== HEXA-FAST: SAFE COMMIT ===\n'));
  console.log(`  ${COLORS.cyan('message')}  ${COLORS.bold(full)}`);
  console.log(`  ${COLORS.cyan('paths')}    ${paths.join(' ')}`);

  const status = await execSilent('git status --short');
  const statusLines = (status.output || '').trim().split('\n').filter(Boolean);
  console.log('');
  if (!statusLines.length) {
    console.log(COLORS.yellow('  (working tree clean — nothing modified)'));
  } else {
    console.log(COLORS.dim('  current state (will commit vs deliberately left alone):'));
    for (const line of statusLines) {
      const p = line.slice(3);
      const inScope = paths.some((x) => p === x || p.startsWith(x.replace(/\/+$/, '') + '/'));
      const mark = inScope ? COLORS.green('[commit]') : COLORS.dim('[keep]');
      console.log(`  ${mark} ${COLORS.dim(line)}`);
    }
  }
  console.log('');

  const quoted = paths.map(shellQuote).join(' ');

  const add = await execSilent(`git add -- ${quoted}`);
  if (!add.ok) {
    console.error(COLORS.red(`  git add failed: ${add.error || add.output}`));
    process.exit(1);
  }

  const commit = await execSilent(`git commit -m "${full.replace(/"/g, '\\"')}" -- ${quoted}`);
  if (!commit.ok) {
    console.error(COLORS.red(`\n  Commit failed: ${commit.error || commit.output}`));
    process.exit(1);
  }

  const hash = await execSilent('git rev-parse --short HEAD');
  console.log(COLORS.green(`  ✓ Committed ${full} @ ${(hash.output || '').trim()}`));

  const after = await execSilent('git status --short');
  const afterLines = (after.output || '').trim().split('\n').filter(Boolean);
  console.log(COLORS.cyan('\n  remaining:' ));
  if (!afterLines.length) {
    console.log(COLORS.green('    ✓ clean'));
  } else {
    for (const line of afterLines) console.log(COLORS.dim(`    ${line}`));
  }
  console.log('');
}

/* ------------------------------------------------------------------ */
/*  MAIN                                                               */
/* ------------------------------------------------------------------ */
function help() {
  console.log(COLORS.bold('\nHexaFast — HEXA Studio speed workflow CLI\n'));
  console.log('  hexa-fast context          ONE-SHOT startup snapshot (branch/HEAD/status/log/reflog/activity/tokens)');
  console.log('  hexa-fast gate:all         ALL 9 quality gates (lint+typecheck+test × 3 workspaces) via hexaops');
  console.log('  hexa-fast gate:frontend    typecheck + lint + design-token gate in parallel  [--tests]');
  console.log('  hexa-fast tokens           design-token ritual: --dry-run (default) | --apply | --check');
  console.log('  hexa-fast commit <msg> <paths...>');
  console.log('                             SAFE commit with explicit pathspec (never git add -A)');
  console.log('  hexa-fast help             Show this help\n');
  console.log(COLORS.dim('  Flag aliases (run before any command):'));
  console.log(COLORS.dim('    --lint   npm run lint (turbo, all workspaces)'));
  console.log(COLORS.dim('    --types  npm run typecheck (all workspaces)'));
  console.log(COLORS.dim('    --test   npm run test:apps (all workspaces)'));
  console.log(COLORS.dim('    --watch  delegate to hexaops watch loop (never terminates)'));
  console.log(COLORS.dim('    --tests  modifier for gate:frontend (also run vitest)\n'));
  console.log(COLORS.dim('  Complements scripts/hexaops.mjs (gate/status/watch/pipeline/deploy/commit). No command overlaps.'));
  console.log(COLORS.dim('  Env vars: none required.\n'));
}

const [, , cmd, ...rest] = process.argv;

/* --lint / --types / --test / --watch flag aliases (quality:* scripts) */
if (cmd && cmd.startsWith('--')) {
  switch (cmd) {
    case '--lint': {
      const res = await timedExecSilent('npm run lint');
      process.stdout.write(res.output || res.error || '');
      console.log(`${pad('lint', 14)} ${res.ok ? COLORS.green('PASS') : COLORS.red('FAIL')} ${COLORS.dim(`(${res.ms}ms)`)}`);
      process.exit(res.ok ? 0 : 1);
      break;
    }
    case '--types': {
      const res = await timedExecSilent('npx turbo run typecheck');
      process.stdout.write(res.output || res.error || '');
      console.log(`${pad('types', 14)} ${res.ok ? COLORS.green('PASS') : COLORS.red('FAIL')} ${COLORS.dim(`(${res.ms}ms)`)}`);
      process.exit(res.ok ? 0 : 1);
      break;
    }
    case '--test': {
      const res = await timedExecSilent('npm run test:apps');
      process.stdout.write(res.output || res.error || '');
      console.log(`${pad('test', 14)} ${res.ok ? COLORS.green('PASS') : COLORS.red('FAIL')} ${COLORS.dim(`(${res.ms}ms)`)}`);
      process.exit(res.ok ? 0 : 1);
      break;
    }
    case '--watch': {
      const child = spawn('node', ['scripts/hexaops.mjs', 'watch', '30'], { stdio: 'inherit', cwd });
      const stop = () => {
        child.kill();
        process.exit(0);
      };
      process.on('SIGINT', stop);
      process.on('SIGTERM', stop);
      child.on('exit', (code) => process.exit(code ?? 0));
      break;
    }
    default:
      help();
      process.exitCode = 1;
      break;
  }
} else {
  switch (cmd) {
    case 'context': await cmdContext(); break;
    case 'gate:frontend': await cmdGateFrontend(rest); break;
    case 'gate':
    case 'gate:all': await cmdGateAll(rest); break;
    case 'tokens': await cmdTokens(rest); break;
    case 'commit': await cmdCommit(rest); break;
    case 'help':
    case '--help':
    case '-h':
      help();
      break;
    default:
      help();
      process.exitCode = 1;
      break;
  }
}
