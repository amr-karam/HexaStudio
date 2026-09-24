// HEXA STUDIO — DESIGN.md Generator
// This script auto-generates or updates the DESIGN.md file from the
// @hexa/design-guardrails package tokens, ensuring the "Supreme Law"
// is always in sync with the codebase.

const fs = require('fs');
const path = require('path');

// 1. Define the path to the design tokens module
// In a real scenario, this would import from the npm package.
// For this script, we define the tokens inline or read them from a source.
const DESIGN_TOKENS = {
  name: "HEXA STUDIO",
  version: "1.0.0",
  description: "Supreme Law of Visual Luxury",
  colors: {
    void: "#050505",
    obsidian: "#0F0F10",
    gold: "#D4AF37",
  },
  typography: {
    headingFont: "Bodoni Moda",
    bodyFont: "Inter",
    monoFont: "JetBrains Mono",
    headingTracking: "-0.02em",
    bodySize: "1rem",
  },
  motion: {
    easeDefault: "--hexa-ease-out",
  },
  luxuryScoreThreshold: 80,
};

// 2. Define the target path for the generated DESIGN.md
const DESIGN_MD_PATH = path.join(process.cwd(), 'DESIGN_SYSTEM.md');

// 3. Generate the MARKDOWN content
function generateMarkdown(tokens) {
  const lines = [];
  lines.push(`# ${tokens.name} — Design System`);
  lines.push(`\* Version: ${tokens.version}`);
  lines.push(`* Description: ${tokens.description}`);
  lines.push('');

  // Color Rule Section
  lines.push('## The 60-30-10 Color Rule');
  lines.push('');
  lines.push('HEXA STUDIO adheres to a strict 60-30-10 color balance to ensure visual luxury and prevent "Design Slop."');
  lines.push('');
  lines.push('| Ratio | Color | Hex | Purpose |');
  lines.push('|-------|-------|-----|---------|');
  lines.push('| 60%   | Void  | `${tokens.colors.void}` | Background/Base |');
  lines.push('| 30%   | Obsidian | `${tokens.colors.obsidian}` | Main Accent |');
  lines.push('| 10%   | Gold | `${tokens.colors.gold}` | Highlight/Call to Action |');
  lines.push('');

  // Typography Section
  lines.push('## Editorial Typography');
  lines.push('');
  lines.push('| Property | Value |');
  lines.push('|----------|-------|');
  lines.push(`| Heading Font | ${tokens.typography.headingFont} |`);
  lines.push(`| Body Font | ${tokens.typography.bodyFont} |`);
  lines.push(`| Mono Font | ${tokens.typography.monoFont} |`);
  lines.push(`| Heading Tracking | ${tokens.typography.headingTracking} |`);
  lines.push(`| Body Size | ${tokens.typography.bodySize} |`);
  lines.push('');

  // Motion Section
  lines.push('## Motion Tokens');
  lines.push('');
  lines.push(`| Token | Value |`);
  lines.push('|-------|-------|');
  lines.push(`| Ease Default | ${tokens.motion.easeDefault} |`);
  lines.push('');

  // Governance Section
  lines.push('## Governance');
  lines.push('');
  lines.push(`- **Luxury Score Threshold**: ${tokens.luxuryScoreThreshold} (CI/CD Gate)`);
  lines.push('- **Enforcement**: `check-design-tokens.mjs` pre-commit hook.');
  lines.push('- **Generation**: `LuxuryForge` AI for auto-refactoring.');

  return lines.join('\n');
}

// 4. Write the file
try {
  const markdownContent = generateMarkdown(DESIGN_TOKENS);
  fs.writeFileSync(DESIGN_MD_PATH, markdownContent, 'utf8');
  console.log(`✅ SUCCESS: DESIGN.md generated at ${DESIGN_MD_PATH}`);
} catch (err) {
  console.error(`❌ FAILED to write DESIGN.md:`, err);
}

// 5. Console Output for verification
console.log('--- Generated DESIGN.md Content ---');
console.log(generateMarkdown(DESIGN_TOKENS));