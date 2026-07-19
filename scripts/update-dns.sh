#!/bin/bash
set -e

# Load HOSTINGER_API_KEY, DNS_DOMAIN, SERVER_IP from the repo root .env file.
# Never commit the actual API key — keep it in .env (gitignored) on the server.
if [ -f .env ]; then
  set -a
  # shellcheck source=/dev/null
  . .env
  set +a
fi

if [ -z "${HOSTINGER_API_KEY:-}" ]; then
  echo "Error: HOSTINGER_API_KEY is not set." >&2
  echo "Add it to .env on the server or export it before running this script." >&2
  exit 1
fi

export DNS_DOMAIN="${DNS_DOMAIN:-hexastudio.net}"
export SERVER_IP="${SERVER_IP:-19.16.1.100}"

ts-node scripts/dns-hostinger.ts
