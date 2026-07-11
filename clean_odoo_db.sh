#!/bin/sh
export PGPASSWORD=staging_pwd_2026
echo "=== DATABASE LIST BEFORE ==="
psql -U hexa_admin -h localhost -t -c "SELECT datname FROM pg_database;"
echo "=== DROPPING hexastudio_odoo ==="
psql -U hexa_admin -h localhost -c "DROP DATABASE IF EXISTS hexastudio_odoo;"
echo "=== CREATING hexastudio ==="
psql -U hexa_admin -h localhost -c "CREATE DATABASE hexastudio;"
echo "=== DATABASE LIST AFTER ==="
psql -U hexa_admin -h localhost -t -c "SELECT datname FROM pg_database;"
echo "=== DONE ==="
