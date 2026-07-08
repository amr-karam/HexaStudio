# SOP-TO-03: Database Backup & Recovery

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  
**Owner:** DevOps Engineer  

---

## Goal

To ensure zero data loss for the platform's critical databases (PostgreSQL) and provide a reliable, tested process for restoring data in the event of corruption or failure.

## Prerequisites

- Backup scripts configured and running (`scripts/backup-db.sh`).
- S3-compatible storage (MinIO) available.
- Encryption keys securely stored in password manager.

## Step-by-Step Process

### 1. Regular Backup (Automated)
- **Full Dump:** `pg_dump` runs every 6 hours for all DBs.
- **WAL Archiving:** Continuous archiving of Write-Ahead Logs (WAL) to ensure point-in-time recovery.
- **Encryption:** All backups are encrypted with AES-256 before upload.
- **Offsite Storage:** Backups are mirrored to a secondary S3 bucket in a different region.

### 2. Recovery Procedure (Manual)
- **Preparation:** Stop all application services (`docker compose stop backend cms odoo`).
- **Fetch:** Download the latest valid dump from S3.
- **Decrypt:** Decrypt the file using the master key.
- **Restore:** Use `pg_restore` to overwrite the database.
- **Verify:** Run basic data integrity checks (count records, check latest timestamps).
- **Restart:** Start services and verify health.

### 3. Point-in-Time Recovery (PITR)
- **Replay:** Restore the last full dump.
- **Apply WAL:** Replay WAL logs up to the specific timestamp before the corruption occurred.
- **Validate:** Check that the data state is correct.

## Verification

- [ ] Restore successfully completed in test environment.
- [ ] Data integrity verified.
- [ ] Application services start and function correctly.

## Exception Handling

| Issue | Action |
|-------|---------|
| Backup file corrupted | Use the previous backup (accept RPO loss) |
| Encryption key lost | Restore from physical backup keys (Escrow) |
| Restore takes too long | Scale up DB resources temporarily for restore |

## Related Docs

- `devops\backup-restore.md`
- `devops\disaster-recovery.md`
- `SECURITY_STANDARDS.md`
