import fs from 'node:fs';
import path from 'node:path';

const NEXT_DIR = path.join(process.cwd(), '.next');
const MANIFEST_PATH = path.join(NEXT_DIR, 'build-manifest.json');
const CHUNKS_DIR = path.join(NEXT_DIR, 'static', 'chunks');

interface BuildManifest {
  pages: Record<string, string[]>;
  app?: Record<string, string[]>;
}

function injectPreloads() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.warn('Build manifest not found, skipping preload injection.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8')) as BuildManifest;
  const preloadChunks = new Set<string>();

  const addFromList = (files: string[]) => {
    for (const file of files) {
      if (!file.endsWith('.js')) continue;
      const basename = path.basename(file);
      if (basename.startsWith('threejs-core') || basename.startsWith('threejs-r3f')) {
        preloadChunks.add(file);
      }
    }
  };

  if (manifest.app) {
    Object.values(manifest.app).forEach(addFromList);
  }
  Object.values(manifest.pages).forEach(addFromList);

  if (preloadChunks.size === 0) {
    console.log('No threejs-core/r3f chunks found in manifest.');
    return;
  }

  const preloadLinks = Array.from(preloadChunks)
    .map((chunk) => `<link rel="preload" href="/_next/static/${chunk}" as="script" crossorigin="anonymous" />`)
    .join('\n    ');

  console.log(`Injecting ${preloadChunks.size} preload hints for critical 3D chunks.`);

  const serverDir = path.join(NEXT_DIR, 'server');
  if (!fs.existsSync(serverDir)) {
    console.warn('Server directory not found, skipping preload injection.');
    return;
  }

  let injected = 0;
  const htmlFiles = fs.readdirSync(serverDir).filter((f) => f.endsWith('.html') || f.endsWith('.js'));

  for (const file of htmlFiles) {
    const fullPath = path.join(serverDir, file);
    let content = fs.readFileSync(fullPath, 'utf-8');

    if (content.includes('threejs-preload-injected')) continue;

    const marker = '<meta name="next-head-count"';
    if (!content.includes(marker)) continue;

    const insertPoint = content.indexOf(marker);
    const before = content.slice(0, insertPoint);
    const after = content.slice(insertPoint);

    const injectedHTML = `${preloadLinks}\n    `;
    fs.writeFileSync(fullPath, before + injectedHTML + after);
    injected++;
  }

  console.log(`Preload hints injected into ${injected} server files.`);
}

injectPreloads();
