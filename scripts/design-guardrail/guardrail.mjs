#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * HEXA STUDIO — Design Guardrail
 * This script audits staged TSX files against the Design Critic AI
 * and blocks commits that contain "Design Slop".
 */

async function runGuardrail() {
  console.log('\x1b[33m%s\x1b[0m', '🎨 Running HEXA Design Guardrail...');

  try {
    // 1. Get staged .tsx files
    const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM')
      .toString()
      .split('\n')
      .filter(file => file.endsWith('.tsx'));

    if (stagedFiles.length === 0) {
      console.log('\x1b[32m%s\x1b[0m', '✅ No design changes detected. Passing guardrail.');
      process.exit(0);
    }

    let hasCriticalViolations = false;

    for (const file of stagedFiles) {
      const filePath = join(process.cwd(), file);
      const content = readFileSync(filePath, 'utf8');
      
      console.log(`\x1b[36m%s\x1b[0m`, `Auditing: ${file}...`);

      // Call the backend Design Critic API
      // Note: Assumes backend is running on port 3000
      const response = await fetch('http://localhost:3000/audit/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tsx: content, 
          context: `File: ${file}` 
        }),
      });

      if (!response.ok) {
        console.error(`\x1b[31m%s\x1b[0m`, `❌ API Error auditing ${file}: ${response.statusText}`);
        continue;
      }

      const result = await response.json();

      if (result.luxuryScore < 80 || !result.isApproved) {
        hasCriticalViolations = true;
        console.log(`\x1b[31m%s\x1b[0m`, `🚨 Design Slop detected in ${file}!`);
        console.log(`   Score: ${result.luxuryScore}/100`);
        
        result.violations.forEach(v => {
          console.log(`   - [${v.severity.toUpperCase()}] ${v.token}: ${v.issue}`);
        });

        if (result.suggestedRefactor) {
          console.log(`\n\x1b[32m%s\x1b[0m`, `💡 Suggested Luxury Refactor:`);
          console.log(`--------------------------------------------------`);
          console.log(result.suggestedRefactor);
          console.log(`--------------------------------------------------\n`);
        }
      } else {
        console.log(`\x1b[32m%s\x1b[0m`, `✅ ${file} is luxury compliant.`);
      }
    }

    if (hasCriticalViolations) {
      console.log('\n\x1b[41m%s\x1b[0m', ' COMMIT REJECTED ');
      console.log('\x1b[31m%s\x1b[0m', 'Your changes do not meet the HEXA STUDIO visual standards.');
      console.log('Please apply the suggested refactors and try again.\n');
      process.exit(1);
    } else {
      console.log('\n\x1b[32m%s\x1b[0m', '✨ All staged components passed the luxury audit. Commit allowed.');
      process.exit(0);
    }

  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Critical Guardrail Error:');
    console.error(error);
    process.exit(1);
  }
}

runGuardrail();
