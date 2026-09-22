import fs from 'node:fs';
import path from 'node:path';

const CHUNKS_DIR = path.join(process.cwd(), '.next', 'static', 'chunks');
const MAX_CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB
const ALLOWED_OVER_BUDGET = new Set([
  'threejs-xr',
  'threejs-iwer',
  'threejs-core',
]);

let failed = false;

if (!fs.existsSync(CHUNKS_DIR)) {
  console.error('Bundle chunks directory not found:', CHUNKS_DIR);
  process.exit(1);
}

const files = fs.readdirSync(CHUNKS_DIR).filter((f) => f.endsWith('.js'));

for (const file of files) {
  const fullPath = path.join(CHUNKS_DIR, file);
  const stat = fs.statSync(fullPath);
  const sizeMB = stat.size / (1024 * 1024);

  if (sizeMB > 1) {
    const chunkName = file.split('-').slice(0, 2).join('-');
    const isAllowed = ALLOWED_OVER_BUDGET.has(chunkName) || file.startsWith('threejs-xr') || file.startsWith('threejs-iwer') || file.startsWith('threejs-core');

    if (!isAllowed) {
      console.error(`\x1b[31m[FAIL]\x1b[0m ${file}: ${sizeMB.toFixed(2)} MB exceeds 1 MB budget`);
      failed = true;
    } else {
      console.warn(`\x1b[33m[WARN]\x1b[0m ${file}: ${sizeMB.toFixed(2)} MB (allowed: ${chunkName})`);
    }
  } else {
    console.log(`\x1b[32m[OK]\x1b[0m ${file}: ${sizeMB.toFixed(2)} MB`);
  }
}

if (failed) {
  console.error('\n\x1b[31mBundle size budget exceeded. See failures above.\x1b[0m');
  process.exit(1);
}

console.log('\n\x1b[32mAll chunks within size budget.\x1b[0m');
