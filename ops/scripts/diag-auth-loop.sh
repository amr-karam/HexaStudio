#!/bin/bash
# Count /api/users/me requests hitting the backend to prove loop vs single check
echo "--- COUNT users/me (last 60m) ---"
docker logs hexa-backend-blue --since 60m 2>&1 | grep -c 'users/me'
echo "--- LAST 20 users/me LINES WITH TIMESTAMPS ---"
docker logs hexa-backend-blue --since 60m 2>&1 | grep 'users/me' | tail -20
echo "--- ALL REQUEST METHOD LINES (last 20 overall) ---"
docker logs hexa-backend-blue --since 10m 2>&1 | grep -E 'GET |POST |PUT |DELETE ' | tail -20
echo "--- AUTH FAILURES (401/unauthorized/forbidden) last 20 ---"
docker logs hexa-backend-blue --since 60m 2>&1 | grep -iE '401|unauthor|forbidden|invalid.*token|jwt' | tail -20
