# Odoo Troubleshooting Guide

**Last Updated:** 2026-07-08

---

## Common Issues

### 1. Connection Errors (XML-RPC)

**Symptom:** NestJS reports `connection failed` or `timeout` when calling Odoo.

**Checks:**
- Check if Odoo container is running: `docker compose ps`
- Verify internal network connectivity: `docker exec backend curl http://odoo:8069`
- Check Odoo logs: `docker compose logs odoo`
- Verify Odoo credentials in `.env`

**Resolution:**
- Restart Odoo: `docker compose restart odoo`
- Check if Odoo is under heavy load (CPU/RAM spike)

### 2. Data Sync Failures

**Symptom:** Website project list is not updating after Odoo change.

**Checks:**
- Check NestJS logs for Odoo sync errors.
- Verify Odoo webhooks are firing.
- Check if Redis cache is blocking updates.
- Check if Next.js ISR was triggered.

**Resolution:**
- Manually trigger revalidation: `POST /api/revalidate`
- Clear Redis cache: `redis-cli FLUSHALL`
- Verify Odoo webhook URL is correct.

### 3. Document Access Issues

**Symptom:** Client cannot download a file from the portal.

**Checks:**
- Verify file exists in MinIO.
- Check if signed URL is expired.
- Verify Odoo document record exists and is marked `client_viewable`.
- Check MinIO permissions.

**Resolution:**
- Regenerate signed URL.
- Correct Odoo document visibility settings.

### 4. Performance Sluggishness

**Symptom:** Odoo admin interface is slow.

**Checks:**
- Check PostgreSQL query performance (slow query logs).
- Verify RAM usage on server.
- Check Odoo worker configuration (`workers` in `odoo.conf`).

**Resolution:**
- Increase Odoo workers: `workers = 3` (approx 2 * CPU + 1)
- Optimize PostgreSQL with `vacuum full`.
- Upgrade server RAM.

## Odoo Admin Commands

| Action | Command |
|--------|---------|
| Restart Odoo | `docker compose restart odoo` |
| View Logs | `docker compose logs -f odoo` |
| Backup DB | `docker exec odoo pg_dump -U odoo odoo_db > backup.sql` |
| Restore DB | `docker exec -i odoo psql -U odoo odoo_db < backup.sql` |

## Escalation Path

If the issue persists:
1. Check Odoo Community Forums.
2. Review Odoo official documentation.
3. Contact Odoo Support (if on Enterprise).
4. Escalate to Chief Architect.
