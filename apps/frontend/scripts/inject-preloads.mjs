import fs from 'node:fs';
import path from 'node:path';

const NEXT_DIR = path.join(process.cwd(), '.next');
const SERVER_DIR = path.join(NEXT_DIR, 'server');
const APP_DIR = path.join(SERVER_DIR, 'app');
const CHUNKS_DIR = path.join(NEXT_DIR, 'static', 'chunks');
const MARKER = 'critical-css-injected';
const MAX_CRITICAL_BYTES = 18000;

function findCssFiles() {
  if (!fs.existsSync(CHUNKS_DIR)) return [];
  return fs
    .readdirSync(CHUNKS_DIR)
    .filter((f) => f.endsWith('.css'))
    .map((f) => path.join(CHUNKS_DIR, f));
}

function readBalanced(css, start) {
  let depth = 1;
  let s = '';
  for (let i = start; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      depth++;
      s += ch;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) return { str: s, next: i + 1 };
      s += ch;
    } else {
      s += ch;
    }
  }
  return { str: s, next: css.length };
}

function parseBlocks(css) {
  const blocks = [];
  let i = 0;
  while (i < css.length) {
    const at = css[i];
    if (at === '@') {
      const start = i;
      while (i < css.length && css[i] !== '{' && css[i] !== ';') i++;
      const atRule = css.slice(start, i).trim();
      if (css[i] === ';') {
        i++;
        continue;
      }
      i++; // consume '{'
      const { str: inner, next } = readBalanced(css, i);
      i = next;
      blocks.push({ atRule, inner });
    } else if (at === '{') {
      i++;
      const { next } = readBalanced(css, i);
      i = next;
    } else if (/\s/.test(at)) {
      i++;
    } else {
      const selStart = i;
      while (i < css.length && css[i] !== '{' && css[i] !== '}' && css[i] !== '@') i++;
      if (i >= css.length || css[i] !== '{') continue;
      const selector = css.slice(selStart, i).trim();
      i++;
      const { str: body, next } = readBalanced(css, i);
      i = next;
      blocks.push({ selector, body });
    }
  }
  return blocks;
}

function classTokens(selector) {
  const tokens = [];
  let m;
  const re = /\.([A-Za-z0-9_][A-Za-z0-9_-]*(?:\\:[\w-]+)?)/g;
  while ((m = re.exec(selector)) !== null) tokens.push(m[1].replace('\\:', ':'));
  return tokens;
}

function collectAboveFoldClasses(html, budget) {
  const bodyIdx = html.indexOf('<body');
  let segment = html;
  if (bodyIdx >= 0) segment = html.slice(html.indexOf('>', bodyIdx) + 1);
  if (segment.length > budget) segment = segment.slice(0, budget);
  const classes = new Set();
  const re = /\bclass="([^"]*)"/g;
  let m;
  while ((m = re.exec(segment)) !== null) {
    for (const c of m[1].split(/\s+/)) if (c) classes.add(c);
  }
  return classes;
}

function selectCritical(blocks, aboveFold) {
  let css = '';
  const seen = new Set();
  function add(key, str) {
    if (seen.has(key)) return;
    seen.add(key);
    css += str;
  }
  function recurse(block) {
    if (block.atRule) {
      const ar = block.atRule;
      if (ar.startsWith('@keyframes') || ar.startsWith('@font-face')) {
        add(ar, ar + '{' + block.inner + '}');
        return true;
      }
      const inner = parseBlocks(block.inner);
      let any = false;
      for (const ib of inner) if (recurse(ib)) any = true;
      if (any) add(ar, ar + '{' + block.inner + '}');
      return any;
    }
    const toks = classTokens(block.selector);
    const hit = toks.some((t) => aboveFold.has(t));
    if (hit) add(block.selector, block.selector + '{' + block.body + '}');
    return hit;
  }
  for (const b of blocks) recurse(b);
  return css;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function processFile(file, cssRel, criticalCss) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes(MARKER)) {
    console.log('  ' + path.basename(file) + ': already processed, skipping');
    return false;
  }
  const linkRe = new RegExp(
    '<link[^>]*rel="stylesheet"[^>]*href="' + escapeRegex(cssRel) + '"[^>]*>'
  );
  const match = html.match(linkRe);
  if (!match) {
    console.log('  ' + path.basename(file) + ': CSS link not found, skipping');
    return false;
  }
  let replacement;
  if (criticalCss.length > MAX_CRITICAL_BYTES) {
    console.log(
      '  ' +
        path.basename(file) +
        ': critical ' +
        Math.round(criticalCss.length / 1024) +
        ' KB > budget, async-only (no inline)'
    );
    replacement =
      '<link rel="stylesheet" href="' +
      cssRel +
      '" media="print" onload="this.media=\'all\'" data-precedence="next">';
  } else {
    replacement =
      '<style id="critical-css" data-precedence="next">' +
      criticalCss +
      '</style>\n    ' +
      '<link rel="stylesheet" href="' +
      cssRel +
      '" media="print" onload="this.media=\'all\'" data-precedence="next">';
    console.log(
      '  ' +
        path.basename(file) +
        ': inlined ' +
        Math.round(criticalCss.length / 1024) +
        ' KB critical, async-loaded ' +
        Math.round(fs.statSync(path.join(process.cwd(), '.next/static/chunks', path.basename(cssRel))).size / 1024) +
        ' KB remainder'
    );
  }
  html = html.replace(match[0], replacement);
  if (!html.includes(MARKER)) {
    html = html.replace(/<head[^>]*>/, (m) => m + '\n  <!-- ' + MARKER + ' -->');
  }
  fs.writeFileSync(file, html);
  return true;
}

function run() {
  const cssFiles = findCssFiles();
  if (cssFiles.length === 0) {
    console.warn('No CSS chunks found; skipping critical-CSS inlining.');
    return;
  }

  const htmlFiles = [];
  if (fs.existsSync(APP_DIR)) {
    for (const f of fs.readdirSync(APP_DIR)) if (f.endsWith('.html')) htmlFiles.push(path.join(APP_DIR, f));
  }
  if (fs.existsSync(SERVER_DIR)) {
    for (const f of fs.readdirSync(SERVER_DIR)) if (f.endsWith('.html')) htmlFiles.push(path.join(SERVER_DIR, f));
  }
  if (htmlFiles.length === 0) {
    console.warn('No HTML files found to process.');
    return;
  }

  console.log('Inlining critical CSS into ' + htmlFiles.length + ' HTML file(s) for ' + cssFiles.length + ' stylesheet(s).');
  for (const cssFile of cssFiles) {
    const cssRel = '/_next/static/chunks/' + path.basename(cssFile);
    const cssContent = fs.readFileSync(cssFile, 'utf8');
    const blocks = parseBlocks(cssContent);
    for (const htmlFile of htmlFiles) {
      const html = fs.readFileSync(htmlFile, 'utf8');
      const aboveFold = collectAboveFoldClasses(html, 2600);
      if (aboveFold.size === 0) {
        console.log('  ' + path.basename(htmlFile) + ': no above-fold classes detected');
        continue;
      }
      const critical = selectCritical(blocks, aboveFold);
      processFile(htmlFile, cssRel, critical);
    }
  }
}

run();
