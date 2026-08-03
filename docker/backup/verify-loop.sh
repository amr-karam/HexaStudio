#!/bin/sh
# =============================================================================
# verify-loop.sh
# Scheduled backup verification loop (24h cadence by default).
# Wraps verify-backup.sh so the container stays alive and re-runs verification
# every day instead of exiting after a single run. The loop intentionally keeps
# running even when a verification fails so the daemon can be monitored via
# logs instead of silently dying.
#
# Usage (production, daily self-verification):
#   docker compose -f docker-compose.prod.yml --profile scheduled up -d backup-verify-scheduled
#
# Env:
#   VERIFY_INTERVAL  Seconds between verification runs (default: 86400 = 24h)
# =============================================================================

INTERVAL="${VERIFY_INTERVAL:-86400}"

while true; do
  echo "[verify-loop] Running backup verification at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  # Invoke via `sh` explicitly: scripts are bind-mounted from the repo host and
  # may not carry the executable bit (e.g. Windows checkouts), so direct exec
  # would fail with "Permission denied".
  if sh /scripts/verify-backup.sh; then
    echo "[verify-loop] Verification PASSED"
  else
    echo "[verify-loop] Verification FAILED — inspect logs above; next attempt in ${INTERVAL}s"
  fi
  echo "[verify-loop] Next verification in ${INTERVAL}s"
  sleep "${INTERVAL}"
done
