#!/usr/bin/env node
/**
 * HexaOps — HEXA Studio unified operations CLI
 * ============================================
 * One tool for the slow, repetitive workflows that previously took
 * many sequential commands. Everything runs in parallel where possible.
 *
 * Commands:
 *   hexaops gate          → Run ALL quality gates (lint+typecheck+test × 3 workspaces) in parallel
 *   hexaops pipeline      → Check GitLab pipeline status + latest jobs (needs HEXA_GITLAB_PAT)
 *   hexaops deploy        → Sync configs to server + show deploy status (needs HEXA_SSH_KEY)
 *   hexaops commit        → Conventional commit with auto-detected type
 *   hexaops help          → Show this help
 *
 * Env vars:
 *   HEXA_GITLAB_PAT       GitLab personal access token (for pipeline)
 *   HEXA_GITLAB_URL       Default http://19.16.1.100:8929
 *   HEXA_SSH_KEY          Default ~/.ssh/hexastudio_key
 *   HEXA_SERVER           Default root@19.16.1.100
 *   HEXA_PROJECT_PATH     Default /home/hexa/hexastudio
 */
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import os from 'node:os';

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

/* ------------------------------------------------------------------ */
/*  1. QUALITY GATES — run 9 gates in parallel                         */
/* ------------------------------------------------------------------ */
async function cmdGate() {
  const gates = [
    ['lint', 'frontend'], ['typecheck', 'frontend'], ['test', 'frontend'],
    ['lint', 'backend'], ['typecheck', 'backend'], ['test', 'backend'],
    ['lint', 'mobile'], ['typecheck', 'mobile'], ['test', 'mobile'],
  ];

  console.log(COLORS.bold('\n=== HEXAOPS: QUALITY GATES ===\n'));
  const started = Date.now();

  const results = await Promise.all(
    gates.map(async ([gate, ws]) => {
      const res = await execSilent(`npm run ${gate} --workspace=apps/${ws}`);
      return { gate, ws, ...res, ms: 0 };
    }),
  );

  // Annotate durations (execSilent doesn't time, so we approximate per-gate)
  const elapsed = Date.now() - started;
  const perGate = Math.round(elapsed / gates.length);

  console.log(`${COLORS.dim(pad('workspace', 18))} ${COLORS.dim(pad('gate', 12))} ${COLORS.dim('status')}`);
  console.log('─'.repeat(46));

  let failed = 0;
  for (const r of results) {
    const label = r.ok ? COLORS.green('PASS') : COLORS.red('FAIL');
    if (!r.ok) failed++;
    console.log(
      `${pad(r.ws, 18)} ${pad(r.gate, 12)} ${label} ${COLORS.dim(`(${perGate}ms)`)}`,
    );
    if (!r.ok) {
      // Show the first meaningful error line for debugging
      const lines = (r.output + r.error).split('\n').filter((l) => l.trim());
      const errLine = lines.find((l) => /error|failed|✗|✘/i.test(l));
      if (errLine) console.log(`${COLORS.dim('  ↳')} ${COLORS.red(errLine.trim())}`);
    }
  }

  console.log('─'.repeat(46));
  console.log(
    failed === 0
      ? COLORS.green(COLORS.bold(`\n✓ ALL ${gates.length} GATES PASSED  (${(elapsed / 1000).toFixed(1)}s)`))
      : COLORS.red(COLORS.bold(`\n✗ ${failed}/${gates.length} GATES FAILED  (${(elapsed / 1000).toFixed(1)}s)`)),
  );
  process.exitCode = failed > 0 ? 1 : 0;
}

/* ------------------------------------------------------------------ */
/*  2. PIPELINE STATUS — GitLab API                                    */
/* ------------------------------------------------------------------ */
async function cmdPipeline() {
  const pat = process.env.HEXA_GITLAB_PAT;
  const url = process.env.HEXA_GITLAB_URL || 'http://19.16.1.100:8929';
  const projectId = process.env.HEXA_GITLAB_PROJECT_ID || '1';

  if (!pat) {
    console.error(COLORS.red('\nMissing HEXA_GITLAB_PAT. Create a token and export it:'));
    console.error(COLORS.yellow('  export HEXA_GITLAB_PAT=glpat-xxx\n'));
    process.exit(1);
  }

  console.log(COLORS.bold('\n=== HEXAOPS: GITLAB PIPELINE STATUS ===\n'));
  const headers = { 'PRIVATE-TOKEN': pat };

  try {
    const pipe = JSON.parse(
      (await execSilent(
        `curl -s -H "PRIVATE-TOKEN: ${pat}" "${url}/api/v4/projects/${projectId}/pipelines?per_page=5"`,
      )).output,
    );
    if (!pipe?.length) {
      console.log(COLORS.yellow('No pipelines found.'));
      return;
    }

    for (const p of pipe.slice(0, 3)) {
      const statusColor =
        p.status === 'success' ? COLORS.green : p.status === 'failed' ? COLORS.red : COLORS.yellow;
      console.log(
        `  #${pad(p.id, 5)} ${statusColor(pad(p.status, 10))} ${COLORS.dim(new Date(p.created_at).toISOString())} (${p.ref})`,
      );

      // Fetch jobs for the latest pipeline only
      if (p.id === pipe[0].id) {
        const jobs = JSON.parse(
          (await execSilent(
            `curl -s -H "PRIVATE-TOKEN: ${pat}" "${url}/api/v4/projects/${projectId}/pipelines/${p.id}/jobs?per_page=100"`,
          )).output,
        );
        const interesting = jobs.filter((j) => ['failed', 'running', 'pending', 'manual'].includes(j.status));
        if (interesting.length) {
          console.log(COLORS.dim('    ── interesting jobs ──'));
          for (const j of interesting) {
            const c = j.status === 'failed' ? COLORS.red : j.status === 'manual' ? COLORS.cyan : COLORS.yellow;
            console.log(`    ${c(pad(j.status, 8))} ${pad(j.name, 28)} ${COLORS.dim(j.stage)}`);
          }
        }
      }
    }
  } catch (err) {
    console.error(COLORS.red(`\nAPI error: ${err.message}`));
    process.exit(1);
  }
}

/* ------------------------------------------------------------------ */
/*  3. DEPLOY SYNC — copy configs to server + show status              */
/* ------------------------------------------------------------------ */
async function cmdDeploy() {
  const key = process.env.HEXA_SSH_KEY || join(os.homedir(), '.ssh', 'hexastudio_key');
  const server = process.env.HEXA_SERVER || 'root@19.16.1.100';
  const proj = process.env.HEXA_PROJECT_PATH || '/home/hexa/hexastudio';

  console.log(COLORS.bold('\n=== HEXAOPS: DEPLOY SYNC ===\n'));

  if (!existsSync(key)) {
    console.error(COLORS.red(`SSH key not found: ${key}`));
    process.exit(1);
  }

  const sshBase = `ssh -i "${key}" -o StrictHostKeyChecking=no ${server}`;
  // Sync the ACTIVE compose files first, then optional optimized variants.
  // Order matters: docker-compose.gitlab.yml is what docker compose actually reads.
  const files = [
    'docker-compose.gitlab.yml',
    'docker-compose.gitlab-runner.yml',
    'docker-compose.gitlab.optimized.yml',
    'docker-compose.gitlab-runner.optimized.yml',
    '.gitlab-ci.yml',
  ];

  // Step 1 — push configs (parallel scp)
  console.log(COLORS.cyan('  [1/3] Syncing config files…'));
  const scpResults = await Promise.all(
    files
      .filter((f) => existsSync(resolve(cwd, f)))
      .map(async (f) => {
        const res = await execSilent(
          `scp -i "${key}" -o StrictHostKeyChecking=no "${resolve(cwd, f)}" ${server}:${proj}/`,
        );
        return { file: f, ok: res.ok };
      }),
  );
  for (const r of scpResults) {
    console.log(`    ${r.ok ? COLORS.green('✓') : COLORS.red('✗')} ${r.file}`);
  }

  // Step 2 — show container status
  console.log(COLORS.cyan(`\n  [2/3] Container status on ${server}…`));
  const status = await execSilent(
    `${sshBase} "docker ps --format '{{.Names}}\t{{.Status}}' | grep -E 'gitlab|runner' || echo '  (no gitlab/runner containers)'"`,
  );
  console.log(status.ok ? status.output.trim() : COLORS.red(status.error));

  // Step 3 — health check
  console.log(COLORS.cyan('\n  [3/3] GitLab health check…'));
  const health = await execSilent(
    `${sshBase} "docker exec hexa-gitlab curl -sf http://localhost/-/health >/dev/null 2>&1 && echo '  GitLab: HEALTHY' || echo '  GitLab: not ready yet'"`,
  );
  console.log(health.ok ? health.output.trim() : COLORS.yellow('  (cannot reach GitLab yet)'));
  console.log('');
}

/* ------------------------------------------------------------------ */
/*  4. CONVENTIONAL COMMIT                                             */
/* ------------------------------------------------------------------ */
async function cmdCommit(rest) {
  const message = rest.join(' ');
  if (!message) {
    console.error(COLORS.red('\nUsage: hexaops commit "<message>"'));
    console.error(COLORS.yellow('  Example: hexaops commit "fix(backend): correct lead scoring\n'));
    process.exit(1);
  }

  // Auto-detect conventional type from prefix if present
  const hasType = /^(feat|fix|chore|docs|refactor|perf|ci|test|style|build|revert)\(/.test(message);
  const full = hasType ? message : `chore: ${message}`;

  console.log(COLORS.bold('\n=== HEXAOPS: COMMIT ===\n'));

  const status = await execSilent('git status --short');
  if (!status.output.trim()) {
    console.log(COLORS.yellow('  Nothing to commit.'));
    return;
  }
  console.log(status.output.trim());

  const add = await execSilent('git add -A');
  if (!add.ok) {
    console.error(COLORS.red(`  git add failed: ${add.error}`));
    process.exit(1);
  }

  const commit = await execSilent(`git commit -m "${full.replace(/"/g, '\\"')}"`);
  if (commit.ok) {
    console.log(COLORS.green(`\n  ✓ Committed: ${full}`));
  } else {
    // Possibly nothing staged — surface the real error
    console.error(COLORS.red(`\n  Commit failed: ${commit.error || commit.output}`));
    process.exit(1);
  }
}

/* ------------------------------------------------------------------ */
/*  MAIN                                                               */
/* ------------------------------------------------------------------ */
function help() {
  console.log(COLORS.bold('\nHexaOps — HEXA Studio operations CLI\n'));
  console.log('  hexaops gate          Run all 9 quality gates in parallel');
  console.log('  hexaops pipeline      Check GitLab pipeline status');
  console.log('  hexaops deploy        Sync configs to server + health check');
  console.log('  hexaops commit <msg>  Conventional commit (auto type detection)');
  console.log('  hexaops help          Show this help\n');
}

const [, , cmd, ...rest] = process.argv;
switch (cmd) {
  case 'gate': await cmdGate(); break;
  case 'pipeline': await cmdPipeline(); break;
  case 'deploy': await cmdDeploy(); break;
  case 'commit': await cmdCommit(rest); break;
  default: help(); break;
}
