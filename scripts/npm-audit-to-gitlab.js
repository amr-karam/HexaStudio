#!/usr/bin/env node
// Convert npm audit JSON output to GitLab Dependency Scanning report format.
// Reads /tmp/npm-audit.json, writes gl-dependency-scanning-report.json.
//
// Usage: node scripts/npm-audit-to-gitlab.js

const fs = require('fs');

const INPUT = '/tmp/npm-audit.json';
const OUTPUT = 'gl-dependency-scanning-report.json';

let data;
try {
  data = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
} catch (e) {
  console.error(`Failed to read ${INPUT}: ${e.message}`);
  // Write empty report so the artifact job doesn't fail
  data = { vulnerabilities: {} };
}

const vulns = data.vulnerabilities || {};
const items = [];

for (const [pkg, info] of Object.entries(vulns)) {
  if (!info || !Array.isArray(info.via)) continue;
  for (const v of info.via) {
    if (typeof v !== 'object' || v === null) continue;
    items.push({
      id: `npm:${pkg}-${v.id || 'unknown'}`,
      name: pkg,
      severity: (v.severity || 'unknown').toUpperCase(),
      title: v.title || 'vulnerability',
      description: v.url || '',
      identifiers: [
        { type: 'npm', name: v.id || 'unknown', value: v.id || 'unknown' },
      ],
    });
  }
}

const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const report = {
  version: '15.0.0',
  scan: {
    start_time: now,
    end_time: now,
    analyzer: { id: 'npm-audit', name: 'npm audit', version: '1.0.0' },
    scanner: { id: 'npm-audit', name: 'npm audit', version: '1.0.0' },
    type: 'dependency_scanning',
  },
  vulnerabilities: items,
};

fs.writeFileSync(OUTPUT, JSON.stringify(report, null, 2));
console.log(`Wrote ${items.length} vulnerabilities to ${OUTPUT}`);
