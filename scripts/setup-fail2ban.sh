#!/bin/bash
set -e

echo "=== Installing Fail2Ban ==="
apt-get update -qq
apt-get install -y -qq fail2ban

echo "=== Configuring Fail2Ban ==="

# SSH jail — protect against brute force on port 22
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
EOF

# Custom jail for Docker container logs (Traefik / backend)
# Scans docker logs for 4xx/5xx patterns to ban IPs that repeatedly hit
# non-existent endpoints (bots, scanners)
cat > /etc/fail2ban/filter.d/hexa-docker.conf << 'EOF'
[Definition]
failregex = ^.*from <HOST>.*(404|403|401).*$
ignoreregex =
EOF

cat > /etc/fail2ban/jail.d/hexa-docker.conf << 'EOF'
[hexa-docker]
enabled = false
port = http,https
filter = hexa-docker
logpath = /var/log/docker/*.log
maxretry = 20
findtime = 600
bantime = 3600
EOF

echo "=== Starting Fail2Ban ==="
systemctl enable fail2ban
systemctl restart fail2ban

echo "=== Status ==="
fail2ban-client status
fail2ban-client status sshd

echo ""
echo "=== Fail2Ban setup complete ==="
echo "Run on production server:"
echo "  sudo bash scripts/setup-fail2ban.sh"
