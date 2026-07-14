#!/bin/sh
find /home/hexa/hexastudio/docker -name '*.sh' -exec sh -c 'tr -d "\r" < "$1" > "$1.tmp" && mv "$1.tmp" "$1"' _ {} \;
echo "stripped CRLF from shell scripts"
echo "--- project root ---"
ls /home/hexa/hexastudio
echo "--- backup.sh head ---"
cat -A /home/hexa/hexastudio/docker/backup/backup.sh | head -2
docker restart hexastudio-backup-1
