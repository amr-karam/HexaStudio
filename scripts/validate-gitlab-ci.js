#!/usr/bin/env node
// Validate .gitlab-ci.yml syntax locally without running GitLab.
// Catches common errors:
//   - YAML syntax errors (parse failure)
//   - Duplicate job names
//   - Missing required keys (script, image, etc.)
//   - Invalid stage references
//   - Invalid extends references
//
// Usage: node scripts/validate-gitlab-ci.js

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CI_FILE = path.join(PROJECT_ROOT, '.gitlab-ci.yml');

if (!fs.existsSync(CI_FILE)) {
  console.error(`ERROR: .gitlab-ci.yml not found at ${CI_FILE}`);
  process.exit(1);
}

console.log(`=== Validating ${CI_FILE} ===\n`);

// Use js-yaml from dependencies
let yaml;
try {
  yaml = require(path.join(PROJECT_ROOT, 'node_modules', 'js-yaml'));
} catch {
  try {
    yaml = require('js-yaml');
  } catch {
    console.error('js-yaml not installed. Run: npm install --legacy-peer-deps');
    process.exit(1);
  }
}

let config;
try {
  const content = fs.readFileSync(CI_FILE, 'utf8');
  config = yaml.load(content);
  console.log('[1/5] YAML parse OK.');
} catch (e) {
  console.error(`[1/5] YAML parse FAILED: ${e.message}`);
  process.exit(1);
}

// 2. Required top-level keys
console.log('[2/5] Checking top-level structure...');
const required = ['stages'];
for (const r of required) {
  if (!(r in config)) {
    console.error(`  MISSING: '${r}' not defined`);
    process.exit(1);
  }
}
console.log(`  Top-level keys: ${Object.keys(config).sort().join(', ')}`);

// 3. Job-level checks
console.log('[3/5] Checking job definitions...');
const stages = new Set(config.stages || []);
const reserved = new Set([
  'stages', 'variables', 'workflow', 'include', 'cache', 'default', 'services',
  'before_script', 'after_script', 'image', 'spec', 'pages',
]);
const jobs = {};
for (const [key, val] of Object.entries(config)) {
  if (typeof val !== 'object' || val === null) continue;
  if (reserved.has(key)) continue;
  if (key.startsWith('.')) continue; // hidden/template
  if ('script' in val || 'extends' in val || 'trigger' in val) {
    jobs[key] = val;
  }
}

const seen = new Set();
for (const [name, spec] of Object.entries(jobs)) {
  if (seen.has(name)) {
    console.error(`  DUPLICATE: job '${name}' defined multiple times`);
    process.exit(1);
  }
  seen.add(name);

  if (!('script' in spec) && !('extends' in spec) && !('trigger' in spec)) {
    console.log(`  WARN: job '${name}' has no 'script', 'extends', or 'trigger'`);
  }

  const stage = spec.stage;
  if (stage && !stages.has(stage)) {
    console.error(`  ERROR: job '${name}' references unknown stage '${stage}'`);
    process.exit(1);
  }

  const ext = spec.extends;
  if (ext) {
    const extList = Array.isArray(ext) ? ext : [ext];
    for (const e of extList) {
      if (!(e in config) && !(e in jobs)) {
        console.error(`  ERROR: job '${name}' extends unknown job '${e}'`);
        process.exit(1);
      }
    }
  }
}

console.log(`  Found ${Object.keys(jobs).length} jobs across ${stages.size} stages`);
for (const stage of stages) {
  const stageJobs = Object.entries(jobs)
    .filter(([, s]) => s.stage === stage)
    .map(([n]) => n);
  if (stageJobs.length > 0) {
    console.log(`    [${stage}] ${stageJobs.length} jobs: ${stageJobs.join(', ')}`);
  }
}

// 4. Variables check
console.log('[4/5] Checking variables...');
const vars = config.variables || {};
if (typeof vars !== 'object' || Array.isArray(vars)) {
  console.error(`  ERROR: variables must be a dict, got ${typeof vars}`);
  process.exit(1);
}

const ciVarPattern = /\$CI_[A-Z_]+/g;
const ciVarsUsed = new Set();
const configStr = JSON.stringify(config);
for (const m of configStr.match(ciVarPattern) || []) {
  ciVarsUsed.add(m);
}

console.log(`  ${Object.keys(vars).length} global variables defined`);
console.log(`  ${ciVarsUsed.size} CI variables referenced: ${[...ciVarsUsed].sort().join(', ')}`);

// 5. Include check
console.log('[5/5] Checking includes...');
const includes = config.include || [];
const includesList = Array.isArray(includes) ? includes : [includes];

for (const inc of includesList) {
  if (typeof inc === 'object' && inc !== null && 'local' in inc) {
    const localPath = path.join(PROJECT_ROOT, inc.local);
    if (!fs.existsSync(localPath)) {
      console.error(`  ERROR: include '${inc.local}' does not exist`);
      process.exit(1);
    }
    console.log(`  Found local include: ${inc.local}`);
  }
}

console.log('\n=== Validation PASSED ===');
console.log('Next: deploy GitLab and trigger a pipeline.');
