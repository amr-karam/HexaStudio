# =============================================================================
# minio-backup.Dockerfile
# Vendors the MinIO client (`mc`) into the postgres:16-alpine base so the
# minio-backup service needs NO external download at startup.
#
# Why: minio-backup.sh originally downloaded mc from dl.min.io on first start
# (the `backup` service pattern). On the prod server that URL 302-redirects to
# GitHub release assets at ~76 KB/s, so the download times out and leaves a
# corrupt/partial binary — the service then crash-loops with
# "FATAL: could not reach minio with the given credentials" even though MinIO
# itself is healthy (verified 2026-08-03 with minio/mc:latest).
#
# This image keeps postgres:16-alpine (for sh / find / pgrep / wget / sleep /
# date used by minio-backup.sh) and adds the mc binary from the already-pulled
# minio/mc:latest image. Build is fully offline; no dl.min.io dependency.
#
# Build:
#   docker compose -f docker-compose.prod.yml build minio-backup
# =============================================================================
FROM minio/mc:latest AS mc

FROM postgres:16-alpine
COPY --from=mc /usr/bin/mc /usr/local/bin/mc
RUN chmod +x /usr/local/bin/mc && /usr/local/bin/mc --version | head -1
