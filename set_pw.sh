#!/bin/sh
NEW='iP@ssw0rd'
for ENV in /home/hexa/hexastudio/.env /root/.env; do
  [ -f "$ENV" ] || continue
  for var in POSTGRES_PASSWORD REDIS_PASSWORD MINIO_ROOT_PASSWORD GRAFANA_ADMIN_PASSWORD ODOO_PASSWORD; do
    if grep -q "^$var=" "$ENV"; then
      sed -i "s#^$var=.*#$var=$NEW#" "$ENV"
    else
      echo "$var=$NEW" >> "$ENV"
    fi
  done
  echo "Updated $ENV"
done

echo "--- ALTER postgres role to new password ---"
docker exec -e NEW="$NEW" hexastudio-postgres-1 sh -c 'PGPASSWORD=$POSTGRES_PASSWORD psql -U hexastudio -d postgres -c "ALTER USER hexastudio PASSWORD '"'"'$NEW'"'"';"'
echo "ALTER exit: $?"

echo "--- restarting dependent services ---"
docker restart hexastudio-redis-1 hexastudio-minio-1 hexa-backend-blue hexa-cms-blue hexastudio-odoo-1 hexastudio-grafana-1 hexastudio-backup-1
