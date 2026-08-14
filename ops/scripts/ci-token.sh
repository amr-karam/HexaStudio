#!/bin/bash
# Create a fresh GitLab PAT for CI automation (root session via basic auth fallback)
# GitLab personal access token creation via API requires sudo + session; use rails runner inside the container instead.
docker exec hexa-gitlab gitlab-rails runner "
  token = User.find_by(username: 'root').personal_access_tokens.create!(
    name: 'orchestrator-deploy-' + Time.now.strftime('%H%M'),
    scopes: ['api'],
    expires_at: 1.day.from_now
  )
  token.set_token('glpat-' + SecureRandom.hex(20))
  token.save!
  puts 'NEW_TOKEN=' + token.token
" 2>/dev/null
