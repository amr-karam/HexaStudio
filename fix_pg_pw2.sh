#!/bin/sh
P=$(grep '^POSTGRES_PASSWORD=' /home/hexa/hexastudio/.env | cut -d= -f2)
echo "Aligning postgres role password to project .env value (len ${#P})"
docker exec -e P="$P" hexastudio-postgres-1 sh -c 'PGPASSWORD=$POSTGRES_PASSWORD psql -U hexastudio -d postgres -c "ALTER USER hexastudio PASSWORD '"'"'$P'"'"';"'
echo "ALTER exit: $?"
