#!/bin/bash
# pdf-setup.sh — Local PDF generation setup for HEXA Studio
# Sprint S022.4 — Automated Cost Estimator (self-hosted, no cloud/SaaS)
#
# Uses pdfkit (Node.js) — no external PDF services required.
#
# Prerequisites:
#   - Node.js 18+ (already in this monorepo)
#   - pdfkit (added via package.json)
#
# Usage:
#   chmod +x scripts/pdf-setup.sh
#   ./scripts/pdf-setup.sh    # Install pdfkit + verify

set -euo pipefail

echo "=================================================="
echo "  PDF Setup — Automated Cost Estimator"
echo "  HEXA Studio — Sprint S022.4"
echo "  Self-hosted • Offline • No cloud/SaaS"
echo "=================================================="

# Check Node.js
echo "[CHECK] node..."
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js not found. Install Node.js 18+."
  exit 1
fi
echo "  OK: $(node --version)"

# Check pdfkit
echo "[CHECK] pdfkit..."
if ! node -e "require('pdfkit')" 2>/dev/null; then
  echo "  [SETUP] Installing pdfkit..."
  npm install --save pdfkit
else
  echo "  OK: pdfkit is installed"
fi

# Verify
echo "[VERIFY] Testing PDF generation..."
node -e "
const PDFDocument = require('pdfkit');
const doc = new PDFDocument();
doc.text('HEXA Studio PDF test');
console.log('  OK: PDF generation works');
doc.end();
"

echo ""
echo "=================================================="
echo "  PDF Setup Complete"
echo "  - CostEstimatorService uses pdfkit for local PDF"
echo "  - No external PDF APIs needed (no cloud/SaaS)"
echo "=================================================="
