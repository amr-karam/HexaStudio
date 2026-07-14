#!/bin/sh
NEW=$(grep '^POSTGRES_PASSWORD=' /root/.env | cut -d= -f2)
echo "Target password length: ${#NEW}"
echo "--- existing databases ---"
docker exec hexastudio-postgres-1 sh -c 'PGPASSWORD=$POSTGRES_PASSWORD psql -U hexastudio -d postgres -c "SELECT datname FROM pg_database;"'
echo "--- altering role password ---"
docker exec -e NEW="$NEW" hexastudio-postgres-1 sh -c 'PGPASSWORD=$POSTGRES_PASSWORD psql -U hexastudio -d postgres -c "ALTER USER hexastudio PASSWORD '"'"'$NEW'"'"';"'
echo "ALTER exit: $?"
