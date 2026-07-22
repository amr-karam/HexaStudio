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

# Drop the image's default CMD ("odoo") when this script is used as the
# container entrypoint, so it isn't forwarded as an Odoo argument.
if [ "${1:-}" = "odoo" ]; then
  shift
fi

# Support both dev (DB_NAME) and prod (DBNAME) variable names.
DB_NAME_EFFECTIVE="${DB_NAME:-${DBNAME:-}}"

# Master password: Odoo reliably reads admin_passwd from the config file.
# The mounted config is read-only, so render a writable runtime copy with
# the secret injected.
RUNTIME_CONFIG="/tmp/hexa-odoo.conf"
cp /etc/odoo/odoo.conf "${RUNTIME_CONFIG}"
if [ -n "${ODOO_MASTER_PASSWORD:-}" ]; then
  printf '\nadmin_passwd = %s\n' "${ODOO_MASTER_PASSWORD}" >> "${RUNTIME_CONFIG}"
fi

# Database credentials are passed as CLI options because Odoo configuration files
# do not expand shell-style environment variable placeholders.
exec odoo \
  --config="${RUNTIME_CONFIG}" \
  --addons-path="${WORK_ADDONS},/usr/lib/python3/dist-packages/odoo/addons" \
  --db_host="${HOST}" \
  --db_port="${PORT}" \
  --db_user="${USER}" \
  --db_password="${PASSWORD}" \
  ${DB_NAME_EFFECTIVE:+--database="${DB_NAME_EFFECTIVE}"} \
  "$@"
