#!/usr/bin/env node
/**
 * HEXASTUDIO AI-ACCELERATOR
 * Optimized for AI Agent productivity. Reduces context latency and 
 * automates verification cycles across the monorepo.
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { globSync } from 'glob';

const ROOT = process.cwd();
const CONTEXT_DIR = join(ROOT, '.ai/context');

// Ensure context directory exists
if (!existsSync(CONTEXT_DIR)) {
  mkdirSync(CONTEXT_DIR, { recursive: true });
}

const COMMANDS = {
  /**
   * Aggregates all files related to a feature into a single context file.
   * Usage: node ai-accelerator.mjs bundle <feature_name>
   */
  bundle: (feature) => {
    console.log(`🚀 Bundling context for feature: ${feature}...`);
    const pattern = `**/*${feature}*.{ts,tsx,js,jsx,css,md}`;
    const files = globSync(pattern, { ignore: '**/node_modules/**' });
    
    if (files.length === 0) {
      console.log(`❌ No files found matching ${feature}`);
      return;
    }

    let bundledContent = `# CONTEXT BUNDLE: ${feature}\n${'='.repeat(40)}\n\n`;
    
    files.forEach(file => {
      const content = readFileSync(file, 'utf8');
      bundledContent += `\n--- FILE: ${file} ---\n${content}\n${'='.repeat(40)}\n`;
    });

    const outputPath = join(CONTEXT_DIR, `${feature}.md`);
    writeFileSync(outputPath, bundledContent);
    console.log(`✅ Bundle created at: ${outputPath}`);
    console.log(`📦 Aggregated ${files.length} files.`);
  },

  /**
   * Runs all quality gates across all workspaces in parallel.
   * Usage: node ai-accelerator.mjs verify
   */
  verify: () => {
    console.log(`🛡️ Running Parallel Quality Gates...`);
    const workspaces = ['apps/backend', 'apps/frontend', 'apps/mobile'];
    const commands = [
      'npm run lint',
      'npm run typecheck',
      'npm run test'
    ];

    const results = [];
    let allPassed = true;

    workspaces.forEach(ws => {
      commands.forEach(cmd => {
        try {
          console.log(`Running ${cmd} in ${ws}...`);
          execSync(`${cmd} --workspace=${ws}`, { stdio: 'ignore' });
          results.push({ ws, cmd, status: '✅' });
        } catch (e) {
          results.push({ ws, cmd, status: '❌' });
          allPassed = false;
        }
      });
    });

    console.log('\n--- VERIFICATION SUMMARY ---');
    console.table(results);
    if (!allPassed) process.exit(1);
  },

  /**
   * Rapidly maps the architecture of a specific directory.
   * Usage: node ai-accelerator.mjs map <dir>
   */
  map: (dir) => {
    console.log(`🗺️ Mapping architecture for ${dir}...`);
    const files = globSync(`${dir}/**/*.{ts,tsx}`, { ignore: '**/node_modules/**', nodir: true });
    
    const map = files.map(f => {
      const content = readFileSync(f, 'utf8');
      const exports = content.match(/export (const|function|class|interface|type) ([a-zA-Z0-9_]+)/g) || [];
      return {
        file: f,
        exports: exports.join(', ')
      };
    });

    console.table(map);
  }
};

// CLI Handler
const [,, cmd, arg] = process.argv;

if (COMMANDS[cmd]) {
  COMMANDS[cmd](arg);
} else {
  console.log(`
  HexaStudio AI-Accelerator
  --------------------------------------------------
  Usage: node ai-accelerator.mjs <command> [argument]

  Commands:
    bundle <feature>  - Aggregates all related files into .ai/context/<feature>.md
    verify           - Runs all quality gates in parallel for all workspaces
    map <dir>        - Extracts exports/types map from a directory
  `);
}
