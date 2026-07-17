# Odoo 18 Deployment (Docker)

**Last Updated:** 2026-07-16

---

## Services

`docker-compose.yml` defines two internal services (on the `hexa_data` network,
not exposed publicly):

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `odoo` | `odoo:18` | 8069 (internal) | Odoo application |
| `odoo_db` | `postgres:16-alpine` | 5432 (internal) | Odoo database |

Custom module source is mounted read-only: `./odoo/custom:/mnt/extra-addons`.

## Environment Variables

Add to `.env`:

```ini
ODOO_HOST=odoo
ODOO_PORT=8069
ODOO_DB=hexastudio_odoo
ODOO_USER=admin
ODOO_PASSWORD=change_me_strong_password
ODOO_DB_USER=odoo
ODOO_DB_PASSWORD=change_me_odoo_password
ODOO_MASTER_PASSWORD=change_me_odoo_master
ODOO_WEBHOOK_SECRET=change_me_webhook_secret_at_least_32_chars_long
```

The webhook secret must match the value baked into
`odoo/custom/hexa_studio/data/webhook_config.xml` (replace
`__ODOO_WEBHOOK_SECRET__` with the real secret at deploy time).

## Security And Runtime Notes

- `ODOO_DB_USER`, `ODOO_DB_PASSWORD`, `ODOO_DB`, `ODOO_MASTER_PASSWORD`, and
  `ODOO_WEBHOOK_SECRET` are required at Compose startup. There are no
  production defaults for these values.
- The custom entrypoint supplies database credentials as Odoo CLI options;
  Odoo configuration files do not interpolate `${VARIABLE}` placeholders.
- The BFF verifies webhook HMACs against the exact request bytes. The Odoo
  custom module must sign the same serialized bytes it posts.
- ERP dashboard endpoints are restricted to authenticated `admin` users.

## Start

```bash
docker compose up -d odoo odoo_db
```

First boot initializes the `hexastudio_odoo` database. Install the
`hexa_studio` module from Apps → Activate developer mode → Update Apps list.

## Health

```bash
curl -f http://localhost:8069/web/health   # Odoo
docker compose logs -f odoo                # logs
```

The backend health endpoint reports Odoo status via `OdooService.ping()`.
