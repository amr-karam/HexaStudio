#!/usr/bin/env node
import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HEXA_HUB = path.resolve(__dirname, '../../../');
const API_URL = process.env.HEXA_HUB_API_URL || 'http://localhost:3000/api';
const WEB_URL = process.env.HEXA_HUB_WEB_URL || 'http://localhost:3001';
const SEED_PASSWORD = process.env.HEXA_HUB_SEED_PASSWORD || 'Test!2345';
const SMOKE_EMAILS = [
  { role: 'super_admin', email: 'admin@hexastudio.net' },
  { role: 'employee', email: 'employee@hexastudio.net' },
  { role: 'client', email: 'client@hexastudio.net' },
];

function request(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        method: opts.method || 'GET',
        headers: opts.headers || {},
        timeout: 20_000,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          resolve({ status: res.statusCode, headers: res.headers, body });
        });
      },
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`timeout: ${url}`));
    });
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
    return false;
  }
  console.log(`PASS: ${message}`);
  return true;
}

function tryJson(body) {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function shell(cmd, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, { shell: true, cwd, stdio: 'pipe' });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('exit', (code) =>
      code === 0
        ? resolve({ ok: true, stdout, stderr })
        : reject(new Error(`${cmd} failed: ${stderr || stdout}`)),
    );
  });
}

async function ensureSeeds() {
  console.log('Seeding test users...');
  try {
    const result = await shell('npm run seed --silent', `${HEXA_HUB}/apps/api`);
    console.log(result.stdout || 'seed completed');
  } catch (err) {
    console.log(`Seed note: ${err.message}`);
  }
}

async function login(email, password) {
  const login = await request(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const parsed = tryJson(login.body);
  const token = parsed?.access_token || parsed?.token || parsed?.accessToken;
  return { status: login.status, token };
}

async function authenticatedRequest(url, token, opts = {}) {
  const headers = { Authorization: `Bearer ${token}`, ...(opts.headers || {}) };
  return request(url, { ...opts, headers });
}

async function checkAuthSmoke() {
  console.log();
  console.log('=== Auth + RBAC smoke ===');
  await ensureSeeds();

  for (const user of SMOKE_EMAILS) {
    const { status, token } = await login(user.email, SEED_PASSWORD);
    assert(status === 200, `login ${user.role}: ${user.email} => ${status}`);
    if (!token) continue;

    const me = await authenticatedRequest(`${API_URL}/auth/me`, token);
    assert(me.status === 200, `auth/me ${user.role} => ${me.status}`);

    const projects = await authenticatedRequest(`${API_URL}/projects`, token);
    assert(projects.status === 200, `projects read ${user.role} => ${projects.status}`);

    if (user.role === 'client') {
      const createProject = await authenticatedRequest(
        `${API_URL}/projects`,
        token,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Client Smoke Project' }),
        },
      );
      assert(
        createProject.status === 403,
        `client create project forbidden => ${createProject.status}`,
      );
    }
  }
}

async function checkFeatureFlags() {
  console.log();
  console.log('=== Feature flag / AI Agents code smoke ===');
  const fs = await import('node:fs');
  const checks = [
    `${HEXA_HUB}/apps/web/src/features/ai-agents/components/AgentSelector.tsx`,
    `${HEXA_HUB}/apps/web/src/features/ai-agents/hooks/use-agent-chat.ts`,
    `${HEXA_HUB}/apps/api/src/modules/ai/agents/agents.controller.ts`,
    `${HEXA_HUB}/apps/api/src/modules/ai/agents/agents.service.ts`,
    `${HEXA_HUB}/hexa-hub/.env.example`,
  ];
  for (const file of checks) {
    assert(fs.existsSync(file), `exists ${path.basename(path.dirname(file))}/${path.basename(file)}`);
  }

  const envExample = fs.readFileSync(`${HEXA_HUB}/hexa-hub/.env.example`, 'utf8');
  assert(envExample.includes('LM_STUDIO_BASE_URL'), '.env.example includes LM_STUDIO_BASE_URL');
  assert(envExample.includes('OPENAI_API_KEY'), '.env.example includes OPENAI_API_KEY');
  assert(envExample.includes('QDRANT_URL'), '.env.example includes QDRANT_URL');
  assert(envExample.includes('STRAPI_URL'), '.env.example includes STRAPI_URL');
}

async function main() {
  console.log('=== HEXA Hub smoke test (node) ===');
  console.log(`API: ${API_URL}`);
  console.log(`WEB: ${WEB_URL}`);
  console.log();

  assert(
    (await request(`${API_URL}/health`)).status === 200,
    'API health endpoint reachable',
  );
  assert(
    (await request(WEB_URL + '/')).status === 200,
    'Web home page reachable',
  );
  assert(
    (await request(WEB_URL + '/portal')).status === 200,
    'Portal page reachable',
  );

  await checkAuthSmoke();
  await checkFeatureFlags();

  console.log();
  console.log('=== Smoke test complete ===');
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
