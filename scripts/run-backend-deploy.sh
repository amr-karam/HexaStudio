#!/bin/bash
set -e
cd /home/hexa/hexastudio
source .env
bash /tmp/start-backend.sh 2>&1
