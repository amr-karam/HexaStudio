#!/bin/bash
# Create a fresh root PAT with api scope via rails console (valid 1 day, 1 use-case: CI ops)
set -e
echo "--- Creating fresh root PAT via rails console ---"
docker exec hexa-gitlab bash -c "gitlab-rails runner \"
user = User.find_by(username: 'root')
token = user.personal_access_tokens.create!(
  name: 'orchestrator-deploy-' + Time.current.strftime('%H%M'),
  scopes: ['api'],
  expires_at: 1.day.from_now
)
token.set_token('***REDACTED***')
token.save!
puts 'PAT_CREATED'
\" 2>&1 | tail -5"
echo "--- Verifying new PAT ---"
curl -s --header "PRIVATE-TOKEN: ***REDACTED***" "http://localhost:8929/api/v4/user" | head -c 200
echo
