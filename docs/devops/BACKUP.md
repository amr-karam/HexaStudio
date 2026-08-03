# Backup & Restore Procedures

**Last Updated:** 2026-08-02

> This document describes the **current, actually-deployed** backup implementation.
> The legacy S3/GPG/rclone scheme (`scripts/backup-db.sh`, `s3://hexa-backups`, GPG
> encryption, `rclone`) has been **retired** — see the
> [Legacy appendix](#legacy-retired) at the bottom. Do **not** follow the old instructions.

---

## 1. Overview

Production backups are produced by a **sleep-loop container service** that runs
continuously inside the compose stack. Every 24 hours it:

1. Dumps all 4 application databases with `pg_dump -Fc` (custom format).
2. Prunes local dump files older than 30 days (`find -mtime +30 -delete`).
3. Uploads the new dumps to MinIO (`backups` bucket, internal network only) via `mc`.

All scripts live in `docker/backup/`:

| Script | Purpose |
|--------|---------|
| `docker/backup/backup.sh` | Infinite-loop backup service (`sleep 86400` between cycles) |
| `docker/backup/verify-backup.sh` | Verifies the latest dumps (integrity + age); exits 0/1 |
| `docker/backup/verify-loop.sh` | 24h loop wrapper around `verify-backup.sh` for scheduled self-verification |

## 2. Backup Schedule

| Data | Frequency | Retention | Method | Storage |
|------|-----------|-----------|--------|---------|
| PostgreSQL — `hexastudio_api`, `hexastudio_cms`, `hexastudio_odoo`, `hexastudio_db` | Every 24h (sleep-loop service, `sleep 86400`) | 30 days | `pg_dump -Fc` | Local `backup_data` volume (`/backups`) + MinIO `backups` bucket (offsite) |
| MinIO object store (`uploads`, `models`, `textures`, `videos`, `hdr`) | **Not backed up** | — | — | **GAP** — no `mc mirror` job exists; only the `backups` bucket receives DB dumps (see [Gaps](#7-gaps-and-risks)) |
| Traefik ACME certificates | Auto-renewal | Until renewed | Traefik ACME | `traefik_certs` volume (not included in the backup script) |
| Environment config (`.env`) | Per change | Manual | — | On server + password manager |

### 2.1 What is NOT covered

- **MinIO object store contents are not mirrored.** `uploads`, `models`, `textures`,
  `videos`, `hdr` buckets are private and are **not** backed up anywhere.
- **`traefik_certs` is not copied** by `backup.sh` — after a full restore, Traefik re-issues
  certificates via ACME (Cloudflare DNS credentials must be available).
- **`POSTGRES_DB` (`hexastudio`) is the compose default database, not an application
  database**, and is intentionally **not** dumped. `backup.sh` hardcodes the four real
  application DBs.

## 3. Compose Wiring

### 3.1 Services in `docker-compose.prod.yml`

| Service | Profile | Behavior |
|---------|---------|----------|
| `backup` | (default, always on) | Runs `/scripts/backup.sh` — the 24h dump loop. `restart: unless-stopped`. |
| `backup-verify` | `verify` | Manual one-shot verification: `docker compose --profile verify run backup-verify`. Exits 0/1. |
| `backup-verify-scheduled` | `scheduled` | Daily self-verification daemon: `docker compose --profile scheduled up -d backup-verify-scheduled`. Runs `verify-backup.sh` every 24h and stays alive. |

`docker-compose.staging.yml` and `docker-compose.green.yml` each ship their own backup
service using the same `docker/backup/backup.sh` (staging: `backup_data_staging` volume;
green: `backup-green`).

### 3.2 Environment variables

Set in the server `.env` file (never committed). `backup.sh` reads them with the defaults
below; compose interpolates them into the container:

| Variable | Default | Required? | Notes |
|----------|---------|-----------|-------|
| `POSTGRES_HOST` | `postgres` | No | DB hostname on the internal network |
| `POSTGRES_USER` | `hexastudio` | No | Role used for `pg_dump` |
| `POSTGRES_PASSWORD` | *(none)* | **Yes** | Consumed without a default (`PG_PASS="${POSTGRES_PASSWORD}"`). If unset, every `pg_dump` fails and each dump is removed as empty. |
| `POSTGRES_DB` | `hexastudio` | No | Compose default DB — informational only, **not** dumped |
| `BACKUP_DIR` | `/backups` | No | Local dump directory (backed by the `backup_data` volume) |
| `MINIO_ENDPOINT` | `minio:9000` | No | Internal MinIO endpoint |
| `MINIO_ACCESS_KEY` | `hexastudio` | No | MinIO access key (compose passes `${MINIO_ROOT_USER:-hexastudio}`) |
| `MINIO_SECRET_KEY` | *(none)* | **Yes** (for offsite) | Consumed without a default (`MINIO_SK="${MINIO_SECRET_KEY}"`). If unset, the cycle still runs but **skips the MinIO upload** (local-only backups). |
| `MINIO_BUCKET` | `backups` | No | Target bucket (created by `docker/minio/init-buckets.sh`) |
| `VERIFY_INTERVAL` / `BACKUP_VERIFY_INTERVAL` | `86400` | No | Seconds between scheduled verification runs |

**Fail-fast guidance:** `POSTGRES_PASSWORD` and `MINIO_SECRET_KEY` are consumed *without*
a `:-` fallback inside `backup.sh`, so they **must** come from the server `.env`
(`POSTGRES_PASSWORD`, `MINIO_ROOT_PASSWORD` → `MINIO_SECRET_KEY`). Compose interpolates
them as empty strings when missing — validate the `.env` before deploying or the dump
cycle will silently produce no usable backups.

## 4. Verification

### 4.1 Manual (existing behavior)

```bash
docker compose -f docker-compose.prod.yml --profile verify run --rm backup-verify
```

What `verify-backup.sh` checks:

1. `BACKUP_DIR` exists and contains dumps.
2. The **latest** `hexastudio_api_*.dump` and `hexastudio_cms_*.dump` exist
   (files are named `<db>_<YYYYmmdd-HHMMSS>.dump`).
3. Each dump passes `pg_restore --list` (reads the archive table of contents;
   counts objects and reports file size).
4. **Age check:** warns if the latest dump is older than **25 hours** (i.e., a
   24h cycle may have missed a run).

Exit code is `0` (all valid) or `1` (missing/corrupt).

### 4.2 Scheduled (daily self-verification)

```bash
docker compose -f docker-compose.prod.yml --profile scheduled up -d backup-verify-scheduled
```

Starts a daemon that runs `verify-backup.sh` once every 24 hours and stays alive — no
manual intervention required. Monitor it via logs:

```bash
docker compose -f docker-compose.prod.yml logs -f backup-verify-scheduled
```

Failed runs are logged (`[verify-loop] Verification FAILED — inspect logs above`);
the daemon keeps running. See [Gaps](#7-gaps-and-risks) for alerting notes.

## 5. Restore Procedures

### 5.1 From the local backup volume

```bash
# 1. Find the latest dump per database
docker run --rm -v hexastudio_backup_data:/backups postgres:16-alpine ls -lt /backups

# 2. Restore a single database (create it first if needed)
docker run --rm \
  --network hexastudio_internal \
  -v hexastudio_backup_data:/backups:ro \
  -e PGPASSWORD="${POSTGRES_PASSWORD}" \
  postgres:16-alpine \
  pg_restore -h postgres -U "${POSTGRES_USER:-hexastudio}" \
    -d hexastudio_api \
    --clean --if-exists --no-owner --no-privileges \
    /backups/hexastudio_api_<YYYYmmdd-HHMMSS>.dump
```

Repeat for `hexastudio_cms`, `hexastudio_odoo`, `hexastudio_db`.

> The volume name `hexastudio_backup_data` assumes the compose project name
> `hexastudio` (the `name:` key in `docker-compose.prod.yml`). Verify with
> `docker volume ls` if unsure.

### 5.2 From MinIO (offsite copy)

Dumps are uploaded to the `backups` bucket of the internal MinIO instance. Download with
`mc` (using the `minio/mc` image on the internal network, writing into the backup volume):

```bash
docker run --rm \
  --network hexastudio_internal \
  -v hexastudio_backup_data:/out \
  -e MINIO_ROOT_USER="${MINIO_ROOT_USER:-hexastudio}" \
  -e MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD}" \
  minio/mc:latest \
  sh -c 'mc alias set hexabackup http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" && \
         mc ls hexabackup/backups/ && \
         mc cp "hexabackup/backups/hexastudio_api_<YYYYmmdd-HHMMSS>.dump" /out/'
```

Then run the `pg_restore` command from §5.1 against the downloaded file.

## 6. Recovery Objectives

| Scenario | RTO | RPO |
|----------|-----|-----|
| Database corruption / full DB loss | < 1 hour | **24 hours** (daily dump loop) |
| Full server failure | < 4 hours | 24 hours (restore from `backup_data` or MinIO `backups`) |
| MinIO object store loss | — | **Unsupported** — no MinIO mirror exists (see Gaps) |

> **RPO is 24 hours** because the dump loop sleeps `86400` seconds between cycles.
> Reducing RPO requires running the cycle more frequently (shorter sleep / cron wrapper)
> or adding WAL archiving — neither is currently implemented.

## 7. Operational Commands

| Action | Command |
|--------|---------|
| Inspect backup cycle logs | `docker compose -f docker-compose.prod.yml logs -f backup` |
| Trigger an immediate dump | `docker compose -f docker-compose.prod.yml restart backup` |
| Manual verification | `docker compose -f docker-compose.prod.yml --profile verify run --rm backup-verify` |
| Enable scheduled verification | `docker compose -f docker-compose.prod.yml --profile scheduled up -d backup-verify-scheduled` |
| List dumps on the volume | `docker run --rm -v hexastudio_backup_data:/backups postgres:16-alpine ls -lh /backups` |

## 8. Gaps and Risks

- **No MinIO object-store mirror.** `uploads`/`models`/`textures`/`videos`/`hdr`
  bucket contents are not backed up or replicated off-server. A future `mc mirror` job
  (or MinIO site-to-site replication) is required to cover 3D assets and client deliverables.
- **MinIO "offsite" is same-host.** The `backups` bucket lives on the same MinIO
  instance/server, so it protects against DB loss but **not** full server loss. True
  offsite replication (rclone to a remote S3, or MinIO replication) is a gap.
- **No alerting on verification failure.** `backup-verify-scheduled` logs failures but
  does not page anyone. Wire the `[verify-loop] Verification FAILED` log line into the
  monitoring stack (Loki alert) as a follow-up.
- **ACME certs not in backups.** `traefik_certs` is re-issuable via ACME, but Cloudflare
  DNS credentials must be available after a restore.

## 9. Legacy (Retired)

The previous scheme — `scripts/backup-db.sh`, S3 bucket `s3://hexa-backups/postgres`,
GPG symmetric encryption (`BACKUP_ENCRYPTION_KEY`), `rclone`, and DB names
`hexa_frontend`/`hexa_cms`/`hexa_odoo` — has been **retired**. None of those scripts
exist in this repository, the dumps are neither GPG-encrypted nor pushed to S3, and
the "every 6 hours" schedule is not accurate. Do **not** follow any old `BACKUP.md`
instructions; use this document as the source of truth.
