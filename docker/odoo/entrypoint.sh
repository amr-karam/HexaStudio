#!/bin/bash
# Odoo entrypoint: copies the read-only custom addons into a writable location,
# substitutes the BFF webhook secret into the hexa_studio module data file, then
# launches Odoo with the writable addons path.
set -e

SRC_ADDONS="/mnt/extra-addons"
WORK_ADDONS="/opt/hexa-addons"

mkdir -p "${WORK_ADDONS}"
cp -r "${SRC_ADDONS}/." "${WORK_ADDONS}/"

CONFIG_FILE="${WORK_ADDONS}/hexa_studio/data/webhook_config.xml"

if [ -n "${ODOO_WEBHOOK_SECRET}" ] && [ -f "${CONFIG_FILE}" ]; then
  echo "Substituting ODOO_WEBHOOK_SECRET into hexa_studio webhook config..."
  sed -i "s/__ODOO_WEBHOOK_SECRET__/${ODOO_WEBHOOK_SECRET}/g" "${CONFIG_FILE}"
fi

# Database credentials are passed as CLI options because Odoo configuration files
# do not expand shell-style environment variable placeholders.
exec odoo \
  --addons-path="${WORK_ADDONS},/usr/lib/python3/dist-packages/odoo/addons" \
  --db_host="${HOST}" \
  --db_port="${PORT}" \
  --db_user="${USER}" \
  --db_password="${PASSWORD}" \
  --database="${DB_NAME}" \
  --admin_passwd="${ODOO_MASTER_PASSWORD}" \
  "$@"
