#!/usr/bin/env node
const { execSync } = require("child_process");

const files = [
  "apps/frontend/src/lib/evey-design/design_token_lookup.ts",
  "apps/frontend/src/lib/evey-design/design_audit.ts",
  "apps/frontend/src/lib/evey-design/scaffold_component.ts",
  "apps/frontend/src/lib/evey-design/a11y_check.ts",
  "apps/frontend/src/lib/evey-design/motion_variants.ts",
];

for (const f of files) {
  try {
    const result = execSync(
      `node scripts/check-design-tokens.mjs --root . --quiet --allow-inline-style-hex "${f}"`,
      { cwd: process.cwd(), timeout: 10000 }
    );
    console.log(f + ": PASS");
  } catch (e) {
    console.log(f + ": FAIL - " + e.stdout.toString().trim());
  }
}
