#!/bin/bash
# verify-webdev-setup.sh
# Verifies all Phase 4 WebDev MCP Integration files are present and executable

echo "🔍 Verifying WebDev Phase 4 Setup"
echo "==================================="

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

all_ok=true

# Check Phase 4 files
PHASE4_FILES=(
    "scripts/setup-git-config.sh"
    "scripts/setup-mcp-integration.sh"
    "scripts/anima-workflow.sh"
    "scripts/coordinate-agents.sh"
    "scripts/init-sprint.sh"
    "scripts/webdev-quick-start.sh"
    "scripts/sprint-development.sh"
    ".github/workflows/webdev-ci.yml"
    ".security-config"
)

echo ""
echo "📋 Checking Phase 4 files..."
for file in "${PHASE4_FILES[@]}"; do
    if [ -f "$file" ]; then
        if [[ "$file" == *.sh ]]; then
            if [ -x "$file" ]; then
                echo "  ✅ $file (exists, executable)"
            else
                echo "  ⚠️  $file (exists, NOT executable)"
                all_ok=false
            fi
        else
            echo "  ✅ $file (exists)"
        fi
    else
        echo "  ❌ $file (MISSING)"
        all_ok=false
    fi
done

# Check MCP server
echo ""
echo "📦 Checking MCP server..."
if [ -d "scripts/mcp" ]; then
    echo "  ✅ scripts/mcp/ directory exists"
    if [ -f "scripts/mcp/server.js" ]; then
        echo "  ✅ scripts/mcp/server.js exists"
    else
        echo "  ❌ scripts/mcp/server.js MISSING"
        all_ok=false
    fi
    if [ -f "scripts/mcp/package.json" ]; then
        echo "  ✅ scripts/mcp/package.json exists"
    else
        echo "  ❌ scripts/mcp/package.json MISSING"
        all_ok=false
    fi
else
    echo "  ❌ scripts/mcp/ directory MISSING"
    all_ok=false
fi

# Check security config in .gitignore
echo ""
echo "🔒 Checking security config..."
if grep -q ".security-config" .gitignore 2>/dev/null; then
    echo "  ✅ .security-config in .gitignore"
else
    echo "  ⚠️  .security-config NOT in .gitignore"
fi

# Check existing CI/CD
echo ""
echo "🔄 Checking CI/CD pipelines..."
if [ -f ".github/workflows/webdev-ci.yml" ]; then
    echo "  ✅ webdev-ci.yml present"
fi
if [ -f ".github/workflows/pages-deploy.yml" ]; then
    echo "  ✅ pages-deploy.yml present"
fi

# Summary
echo ""
if [ "$all_ok" = true ]; then
    echo "✅ All Phase 4 checks passed!"
    exit 0
else
    echo "❌ Some checks failed. Run: ./scripts/webdev-quick-start.sh"
    exit 1
fi
