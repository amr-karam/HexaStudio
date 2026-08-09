# 🐧 UBUNTU SERVER INFRASTRUCTURE & HARDENING STANDARDS

**Version:** 1.0.0 | **Scope:** Production Host OS | **Standard:** CIS Ubuntu Linux Benchmark Level 2

---

## 1. OVERVIEW & SPECIFICATIONS

All HEXA Vision production host instances run on **Ubuntu 24.04 LTS (Noble Numbat)**, configured for high availability, security hardening, automated patch management, and strict access controls.

### Hardware Baseline (Production Host: `19.16.1.100`)
- **OS**: Ubuntu 24.04 LTS x86_64
- **CPU**: 8 vCPUs (Intel Xeon / AMD EPYC)
- **RAM**: 32 GB ECC DDR4/DDR5
- **Storage**: 500 GB NVMe System (`/`) + 1.0 TB NVMe Data Volume (`/var/lib/docker`)
- **Network**: 1 Gbps Egress / Ingress

---

## 2. SECURITY HARDENING & FIREWALL (UFW)

### A. UFW Rules & Port Ingress
Only essential ports are allowed through host Uncomplicated Firewall (UFW):
```bash
# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allowed ports
sudo ufw allow 22/tcp    # SSH (Key authentication only)
sudo ufw allow 80/tcp    # HTTP (Traefik redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS (Traefik TLS)

# Enable firewall
sudo ufw enable
```

### B. SSH Hardening (`/etc/ssh/sshd_config.d/99-hexa-security.conf`)
- `PermitRootLogin no` — Root login strictly disabled.
- `PasswordAuthentication no` — Key-based authentication mandatory (Ed25519 keys only).
- `MaxAuthTries 3` — Prevents brute-force attempts.
- `Port 22` (or custom hardened port).

---

## 3. DISK SPACE & STORAGE MANAGEMENT (LVM)

Docker runtime and MinIO data reside on a dedicated LVM logical volume:
- System Root (`/`): 100 GB NVMe
- Docker Root (`/var/lib/docker`): 800 GB LVM Logical Volume
- Backups (`/backups`): 100 GB LVM Logical Volume

To monitor disk usage and prevent fill-up:
```bash
# Check volume status
df -hT /var/lib/docker /backups

# Prune unused Docker build caches & images weekly via cron
0 3 * * 0 docker system prune -af --volumes > /var/log/docker-prune.log 2>&1
```

---

## 4. AUTOMATED PATCHING & UPDATES

Ubuntu Unattended-Upgrades (`unattended-upgrades`) handles security patches automatically:
- Security repositories enabled (`noble-security`).
- System reboot time window: `04:00 AM UTC` on Sundays if kernel updates require it.
- Automatic email alerts dispatched upon upgrade completion or package holding.

---

## 5. KERNEL PARAMS & PERFORMANCE TUNING (`/etc/sysctl.d/99-hexa-performance.conf`)

Optimized sysctl kernel parameters for high-throughput container networking:
```ini
# Network connection backlog & socket limits
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.ip_local_port_range = 1024 65535

# File descriptor limits
fs.file-max = 2097152

# Virtual memory swapping threshold
vm.swappiness = 10
vm.max_map_count = 262144
```

---

## 6. OPERATIONAL COMMANDS

```bash
# View system resource consumption
htop

# Check UFW firewall status
sudo ufw status verbose

# Inspect system log journal for errors
sudo journalctl -xeu docker.service --since "1 hour ago"

# Manually run unattended security updates
sudo unattended-upgrade --dry-run --debug
```

---

## 7. RELATED DOCUMENTATION

- [DOCKER.md](DOCKER.md)) — Docker service limits.
- [PASSWORD_ROTATION.md](PASSWORD_ROTATION.md)) — SSH key rotation procedures.
- [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md)) — System restoration runbook.
