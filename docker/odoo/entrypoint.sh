#!/bin/bash
# Odoo entrypoint script for staging
# Runs initialization and then starts Odoo

set -e

echo "Starting HEXA Studio Odoo entrypoint..."

# Wait for PostgreSQL
until pg_isready -h postgres -U ${USER:-hexastudio} -d ${DBNAME:-hexastudio_odoo}; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "PostgreSQL is ready"

# Run database initialization if needed
if [ ! -f /var/lib/odoo/.initialized ]; then
    echo "Initializing Odoo database..."
    odoo -d ${DBNAME:-hexastudio_odoo} --init=base --stop-after-init --no-http
    touch /var/lib/odoo/.initialized
    echo "Odoo database initialized"
fi

# Install/update custom modules
if [ -d /mnt/extra-addons ]; then
    echo "Installing/updating custom modules..."
    odoo -d ${DBNAME:-hexastudio_odoo} -i $(ls /mnt/extra-addons | tr '\n' ',') --stop-after-init --no-http || true
fi

# Start Odoo normally
echo "Starting Odoo server..."
exec odoo -c /etc/odoo/odoo.conf "$@"