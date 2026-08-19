#!/usr/bin/env bash
set -euo pipefail

API_URL="${HEXA_HUB_API_URL:-http://localhost:3000/api}"
WEB_URL="${HEXA_HUB_WEB_URL:-http://localhost:3001}"
CURL_OPTS=(-fsS --max-time 20)

pass() { echo "PASS: $*"; }
fail() { echo "FAIL: $*"; exit 1; }

echo "=== HEXA Hub smoke test ==="
echo "API: ${API_URL}"
echo "WEB: ${WEB_URL}"
echo

# 1) API health
if curl "${CURL_OPTS[@]}" "${API_URL}/health" >/dev/null; then
  pass "API health endpoint reachable"
else
  fail "API health endpoint unreachable at ${API_URL}/health"
fi

# 2) Web home
if curl "${CURL_OPTS[@]}" "${WEB_URL}/" >/dev/null; then
  pass "Web home page reachable"
else
  fail "Web home page unreachable at ${WEB_URL}/"
fi

# 3) Portal BFF surface
if curl "${CURL_OPTS[@]}" "${WEB_URL}/portal" >/dev/null; then
  pass "Portal page reachable"
else
  fail "Portal page unreachable at ${WEB_URL}/portal"
fi

# 4) Optional login probe
if [[ -n "${HEXA_HUB_TEST_EMAIL:-}" && -n "${HEXA_HUB_TEST_PASSWORD:-}" ]]; then
  LOGIN_BODY=$(printf '{"email":"%s","password":"%s"}' "${HEXA_HUB_TEST_EMAIL}" "${HEXA_HUB_TEST_PASSWORD}")
  STATUS=$(curl "${CURL_OPTS[@]}" -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "${LOGIN_BODY}" \
    "${API_URL}/auth/login" || true)
  if [[ "${STATUS}" == "200" ]]; then
    pass "Login endpoint returned 200"
  else
    fail "Login endpoint returned ${STATUS}"
  fi
else
  echo "SKIP: set HEXA_HUB_TEST_EMAIL / HEXA_HUB_TEST_PASSWORD to probe login"
fi

echo
echo "=== Smoke test complete ==="
