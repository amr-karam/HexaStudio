#!/bin/bash
set -e
export HOSTINGER_API_KEY="0Y6iF9DdmZII326hvCQ0cbXepFHnxqaBnk3xFGbZ91d599e2"
export DNS_DOMAIN="hexastudio.net"
export SERVER_IP="19.16.1.100"
ts-node scripts/dns-hostinger.ts
