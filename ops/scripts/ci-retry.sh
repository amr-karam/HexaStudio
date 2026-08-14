#!/bin/bash
# Retry failed CI jobs + trigger deploy via GitLab API (root basic auth from server git remote)
set -u
PIPELINE="${1:-78}"
GL="http://19.16.1.100:8929/api/v4"

# Extract basic-auth credentials from the deploy repo remote URL
REMOTE=$(git -C /home/hexa/hexastudio remote get-url gitlab)
USER=$(echo "$REMOTE" | sed -E 's#http://([^:]+):.*#\1#')
PASS=$(echo "$REMOTE" | sed -E 's#http://[^:]+:([^@]+)@.*#\1#')

AUTH="-u ${USER}:${PASS}"

echo "--- Retrying all failed jobs in pipeline $PIPELINE ---"
curl -s $AUTH --request POST "$GL/projects/3/pipelines/$PIPELINE/retry" | head -c 300
echo
echo "--- Pipeline status after retry ---"
sleep 3
curl -s $AUTH "$GL/projects/3/pipelines/$PIPELINE" | python3 -c "import json,sys; p=json.load(sys.stdin); print('status:', p.get('status'))"
