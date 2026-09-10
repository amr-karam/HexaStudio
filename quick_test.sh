#!/bin/bash
# Quick test: create a file with a known secret and scan it

set -e

TMPDIR=$(mktemp -d)
echo "Creating test directory: $TMPDIR"

# Create a file with an AWS key (known secret pattern)
cat > "$TMPDIR/aws_test.py" << 'EOF'
AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE'
AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
EOF

echo "Created test file with AWS key"
echo "Contents:"
cat "$TMPDIR/aws_test.py"
echo ""

echo "Running gitleaks on test file..."
./gitleaks.exe detect --source "$TMPDIR" --no-git --verbose --redact
EXIT_CODE=$?

echo ""
echo "Exit code: $EXIT_CODE"

if [ $EXIT_CODE -eq 0 ]; then
    echo "RESULT: NO SECRETS DETECTED (unexpected for known AWS key)"
    echo "This suggests gitleaks default rules may not be detecting this pattern"
else
    echo "RESULT: SECRETS DETECTED (expected)"
fi

# Cleanup
rm -rf "$TMPDIR"
echo "Cleaned up test directory"
