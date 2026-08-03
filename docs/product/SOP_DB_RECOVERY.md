# SOP-TO-03: Database Backup & Recovery

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  
**Owner:** DevOps Engineer  

---

## Goal

To ensure zero data loss for the platform's critical databases (PostgreSQL) and provide a reliable, tested process for restoring data in the event of corruption or failure.

## Prerequisites

- Backup service configured and running (`docker/backup/backup.sh` via the compose `backup` service).
- Internal MinIO available (`backups` bucket receives the offsite dumps).
- DB / MinIO credentials stored in the server `.env` and password manager.

## Step-by-Step Process

### 1. Regular Backup (Automated)
- **Full Dump:** `pg_dump -Fc` runs every 24h via the `backup` sleep-loop service for all four application DBs (`hexastudio_api`, `hexastudio_cms`, `hexastudio_odoo`, `hexastudio_db`).
- **WAL Archiving:** Not implemented — point-in-time recovery is not available (see `docs/devops/BACKUP.md`).
- **Encryption:** Not used — GPG encryption was retired. Dumps are uploaded to the internal MinIO `backups` bucket via `mc` (internal network only).
- **Offsite Storage:** Dumps are uploaded to the MinIO `backups` bucket on the same host — see `docs/devops/BACKUP.md` for the offsite gap.

### 2. Recovery Procedure (Manual)
- **Preparation:** Stop all application services (`docker compose stop backend cms odoo`).
- **Fetch:** Take the latest dump from the local `backup_data` volume, or download from MinIO: `mc cp hexabackup/backups/<file> /backups/` (see `docs/devops/BACKUP.md` §5.2).
- **Decrypt:** Not required — dumps are not encrypted.
- **Restore:** Use `pg_restore -Fc -d <db> --clean --if-exists --no-owner --no-privileges <dump>` for each application DB (`hexastudio_api`, `hexastudio_cms`, `hexastudio_odoo`, `hexastudio_db`).
- **Verify:** Run basic data integrity checks (count records, check latest timestamps).
- **Restart:** Start services and verify health.

### 3. Point-in-Time Recovery (PITR)
- **Not available** — WAL archiving is not configured. Recovery is limited to the latest `pg_dump -Fc` dump (RPO 24 hours).
- **Restore:** Restore the latest dump per database (see `docs/devops/BACKUP.md` §5) and validate data freshness within the 24h RPO.

## Verification

- [ ] Restore successfully completed in test environment.
- [ ] Data integrity verified.
- [ ] Application services start and function correctly.

## Exception Handling

| Issue | Action |
|-------|---------|
| Backup file corrupted | Use the previous backup (accept RPO loss) |
| Encryption key lost | Not applicable — dumps are not encrypted (retired scheme) |
| Restore takes too long | Scale up DB resources temporarily for restore |

## Related Docs

- `devops\backup-restore.md`
- `devops\disaster-recovery.md`
- `SECURITY_STANDARDS.md`
