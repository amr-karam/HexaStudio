#!/bin/bash
# setup-security-config.sh
# Initializes the .security-config for WebDev profile

echo "🔒 Setting up WebDev Security Configuration"
echo "=========================================="

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# Create .security-config if it doesn't exist
if [ ! -f ".security-config" ]; then
    cat > .security-config << 'SECEOF'
# WebDev Security Configuration
security:
  approval_required: true
  allowed_workspaces: ["webdev"]
  max_session_duration: 86400
  audit_logging: true

  mcp_servers:
    filesystem:
      allowed_paths: ["/workspace/webdev"]
      max_file_size: 10485760

    web_search:
      rate_limit: 100
      blocked_domains: ["malicious.com", "phishing.com"]

    anima:
      token_expiry: 3600
      webhook_urls: ["https://hooks.anima.dev/webdev"]

  git_security:
    require_signing: true
    token_rotation: 3600
    allowed_branches: ["main", "develop"]

  data_protection:
    encryption_at_rest: true
    encryption_in_transit: true
    data_classification: ["public", "internal", "confidential"]
SECEOF
    echo "✅ Created .security-config"
else
    echo "✅ .security-config already exists"
fi

# Ensure .security-config is in .gitignore
if ! grep -q ".security-config" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# WebDev security configuration" >> .gitignore
    echo ".security-config" >> .gitignore
    echo "✅ Added .security-config to .gitignore"
fi

# Verify
if [ -f ".security-config" ]; then
    echo ""
    echo "✅ Security configuration verified"
    echo "   Location: $(pwd)/.security-config"
    echo "   Size: $(wc -c < .security-config) bytes"
else
    echo "❌ Failed to create .security-config"
    exit 1
fi
