# 🦊 HEXA Studio GitLab CE - Full Deployment Guide

## 📋 Overview

This guide provides complete instructions for deploying **GitLab CE** with **full monitoring stack**, **security hardening**, and **verification** using Docker Compose.

### 🎯 What's Included

✅ **GitLab CE Community Edition** with Let's Encrypt SSL  
✅ **Container Registry** (port 5050)  
✅ **Full Monitoring Stack** (Prometheus, Grafana, Loki, Promtail)  
✅ **Sentry Error Tracking**  
✅ **Security Hardening** (firewall, rate limiting, DDoS protection)  
✅ **Automated Deployment Script**  
✅ **Comprehensive Verification**  

### 🚀 Quick Start

```bash
# 1. Clone repository (if not already done)
# 2. Navigate to project directory
cd C:\Users\amrmo\OneDrive\Desktop\hexastudio.net

# 3. Create environment file
cp .env.gitlab.example .env.gitlab
# Edit .env.gitlab and add SMTP credentials

# 4. Deploy GitLab CE
./ops/scripts/deploy-gitlab-full.ps1

# 5. Wait for deployment (10-30 minutes)
# 6. Access GitLab at: https://gitlab.hexastudio.net
```

---

## 📁 Project Structure

```
.gitlab-full-deployment/
├── gitlab-docker-compose.full.yml    # Main docker-compose file
├── .env.gitlab                       # Environment variables
├── ops/scripts/deploy-gitlab-full.ps1            # Deployment script
├── GITLAB_FULL_DEPLOYMENT_README.md  # This guide
├── docker/
│   ├── grafana/
│   │   └── provisioning/
│   │       ├── dashboards/
│   │       ├── datasources/
│   │       └── dashboards.yml
│   └── promtail/
│       └── config.yml
└── gitlab-deployment-*.log           # Deployment logs
```

---

## 🔧 Prerequisites

### 1. System Requirements

| Component | Requirement |
|-----------|-------------|
| **Server** | 4 vCPU, 8GB RAM, 50GB+ SSD |
| **OS** | Linux (Ubuntu 22.04 LTS recommended) or Windows with WSL2 |
| **Docker** | Docker Engine 20.10+ |
| **Docker Compose** | Docker Compose v2+ |
| **Ports** | 80, 443, 22, 5050, 9091, 3001, 3101, 9001 |
| **Domain** | gitlab.hexastudio.net, registry.gitlab.hexastudio.net |

### 2. DNS Configuration

**Required DNS Records:**

```
Type    | Hostname                     | Value (Points to)       | TTL
------- | ---------------------------- | ----------------------- | ---
A       | gitlab.hexastudio.net        | 192.168.1.100          | 3600
A       | registry.gitlab.hexastudio.net | 192.168.1.100         | 3600
A       | pages.gitlab.hexastudio.net   | 192.168.1.100          | 3600
```

**Example (Cloudflare):**
1. Go to DNS settings
2. Add A records pointing to your server IP
3. Set TTL to 3600 seconds

### 3. Firewall Configuration

Allow the following ports:

```bash
# For UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw allow 5050/tcp
sudo ufw allow 9091/tcp
sudo ufw allow 3001/tcp
sudo ufw allow 3101/tcp
sudo ufw allow 9001/tcp

# Enable firewall
sudo ufw enable
```

---

## 🛠️ Configuration

### 1. Environment Variables (.env.gitlab)

Copy the example file:

```bash
cp .env.gitlab.example .env.gitlab
```

Edit `.env.gitlab`:

```ini
# GitLab SMTP Configuration (Required for email notifications)
GITLAB_SMTP_USER=gitlab@hexastudio.net
gitlab_smtp_password=your-gmail-app-password-here

# Alternative SMTP services:
# GITLAB_SMTP_ADDRESS=smtp.sendgrid.net
# GITLAB_SMTP_PORT=587
# GITLAB_SMTP_DOMAIN=hexastudio.net

# Grafana Admin Password
grafana_admin_password=admin@2024

# Sentry Configuration
sentry_secret_key=your-sentry-secret-key-here
sentry_db_password=sentry_password
sentry_redis_password=sentry_redis_password
```

**For Gmail SMTP:**
1. Go to: https://myaccount.google.com/apppasswords
2. Generate an app password
3. Use your Gmail address and the app password above

### 2. Docker Compose Configuration

The `gitlab-docker-compose.full.yml` file includes:

- GitLab CE with Let's Encrypt SSL
- Container Registry (port 5050)
- Prometheus (metrics collection)
- Grafana (dashboards) - accessible at `/grafana/`
- Loki (log aggregation)
- Promtail (log collection)
- Sentry (error tracking)
- Resource limits and health checks

---

## 🚀 Deployment Steps

### Step 1: Prepare Environment

```bash
# Navigate to project directory
cd C:\Users\amrmo\OneDrive\Desktop\hexastudio.net

# Create environment file
cp .env.gitlab.example .env.gitlab

# Edit .env.gitlab and add SMTP credentials
notepad .env.gitlab
```

### Step 2: Start Deployment

```powershell
# Run deployment script
.
\ops/scripts/deploy-gitlab-full.ps1
```

**Deployment Process:**
1. ✅ Docker version check
2. ✅ Port availability check
3. ✅ DNS verification
4. ✅ Environment setup
5. ✅ Docker image pull
6. ✅ Container startup
7. ✅ Initialization monitoring (10-30 minutes)
8. ✅ Service verification
9. ✅ Security scanning
10. ✅ Report generation

### Step 3: Monitor Progress

```bash
# Check container status
docker-compose -f gitlab-docker-compose.full.yml ps -a

# View logs
docker-compose -f gitlab-docker-compose.full.yml logs -f gitlab

# Check specific service logs
docker logs hexa-gitlab-ce
```

**Expected Initialization Time:** 10-30 minutes

**Monitor for:**
- Database migrations
- Service restarts
- Configuration updates
- Final readiness check

### Step 4: Access Services

Once deployment completes:

| Service | URL | Credentials |
|---------|-----|-------------|
| **GitLab CE** | https://gitlab.hexastudio.net | root / [initial password] |
| **Container Registry** | https://registry.gitlab.hexastudio.net:5050 | - |
| **Grafana** | https://gitlab.hexastudio.net/grafana/ | admin / admin@2024 |
| **Prometheus** | http://localhost:9091 | - |
| **Loki** | http://localhost:3101 | - |
| **Sentry** | http://localhost:9001 | - |

---

## 🔐 Security Hardening

### 1. Initial Security Steps

**After first login:**

1. **Change root password immediately**
   - Go to: Profile → Edit Profile → Password
   - Set a strong password

2. **Configure email notifications**
   - Admin Area → Settings → Email
   - Test email configuration

3. **Set up 2FA**
   - Profile → Edit Profile → Enable Two-factor Authentication

4. **Configure backup**
   ```bash
   # Manual backup
docker exec -it hexa-gitlab-ce gitlab-backup create

   # Restore backup
docker exec -it hexa-gitlab-ce gitlab-backup restore BACKUP=backup_filename
   ```

### 2. Security Features Enabled

| Feature | Status | Configuration |
|---------|--------|---------------|
| **HTTPS (Let's Encrypt)** | ✅ Enabled | Automatic renewal every 7 days |
| **Rate Limiting** | ✅ Enabled | 100 requests/sec, burst 200 |
| **DDoS Protection** | ✅ Enabled | Max 1000 connections |
| **Security Headers** | ✅ Enabled | CSP, HSTS, XSS protection |
| **Container Registry Auth** | ✅ Enabled | Requires login |
| **SMTP TLS** | ✅ Enabled | TLSv1.2 |

### 3. Firewall Rules

```bash
# Check firewall status
sudo ufw status

# Expected output:
# 80/tcp    ALLOW    Anywhere
# 443/tcp   ALLOW    Anywhere
# 22/tcp    ALLOW    Anywhere
# 5050/tcp  ALLOW    Anywhere
# 9091/tcp  ALLOW    Anywhere
# 3001/tcp  ALLOW    Anywhere
# 3101/tcp  ALLOW    Anywhere
# 9001/tcp  ALLOW    Anywhere
```

---

## 📊 Monitoring & Logging

### 1. Grafana Dashboards

Access Grafana at: https://gitlab.hexastudio.net/grafana/

**Default Dashboard:** "GitLab CE - Comprehensive Monitoring"

**Key Metrics:**
- Service health (Puma, Sidekiq, PostgreSQL, Redis)
- Resource utilization (CPU, Memory, Disk I/O)
- Network traffic
- Background job queues
- Log volume by level
- Recent error logs

### 2. Prometheus Metrics

Access Prometheus at: http://localhost:9091

**Available Metrics:**
- GitLab service status
- HTTP request duration
- Database connection stats
- Redis memory usage
- Container resource usage

### 3. Loki Logs

Access Loki at: http://localhost:3101

**Log Sources:**
- GitLab application logs
- Nginx access logs
- System logs
- Security events

### 4. Sentry Error Tracking

Access Sentry at: http://localhost:9001

**Features:**
- Error aggregation
- Performance monitoring
- Release tracking
- Alerting

---

## 🔍 Verification Checklist

### ✅ Infrastructure Verification

- [ ] GitLab web interface accessible at https://gitlab.hexastudio.net
- [ ] Container registry accessible at https://registry.gitlab.hexastudio.net:5050
- [ ] HTTPS certificate valid and trusted
- [ ] Port 80 redirects to HTTPS
- [ ] Port 22 accessible for SSH
- [ ] All services running without errors

### ✅ GitLab Service Verification

- [ ] Docker container running: `docker ps | grep hexa-gitlab-ce`
- [ ] All GitLab services healthy: `docker exec hexa-gitlab-ce gitlab-ctl status`
- [ ] PostgreSQL database running
- [ ] Redis running
- [ ] Sidekiq queue workers active
- [ ] Puma web server running

### ✅ Functionality Verification

- [ ] Login with root credentials
- [ ] Change root password
- [ ] Create new user account
- [ ] Create new project
- [ ] Clone repository via HTTPS
- [ ] Clone repository via SSH
- [ ] Push changes to repository
- [ ] Receive test email notification
- [ ] Create container registry
- [ ] Push/pull Docker images to registry

### ✅ Monitoring & Maintenance

- [ ] Set up monitoring for GitLab services
- [ ] Configure backup schedule
- [ ] Set up log rotation
- [ ] Configure resource limits
- [ ] Set up alerts for service failures

---

## 🛠️ Post-Deployment Configuration

### 1. GitLab Initial Setup

**After first login:**

1. **Change root password**
2. **Configure email** (Admin Area → Settings → Email)
3. **Set up SMTP** (if not already configured)
4. **Create user accounts**
5. **Set up projects and groups**
6. **Configure CI/CD variables**

### 2. Monitoring Setup

**Configure alerts:**

1. Go to Grafana: https://gitlab.hexastudio.net/grafana/
2. Navigate to Alerting → Alert Rules
3. Set up alerts for:
   - High CPU usage (>80% for 5 minutes)
   - High memory usage (>90% for 5 minutes)
   - Service failures
   - Error rate spikes

### 3. Backup Configuration

**Automated backups:**

GitLab has automatic backups enabled (7 days retention).

**Manual backup:**
```bash
docker exec -it hexa-gitlab-ce gitlab-backup create
```

**Restore backup:**
```bash
docker exec -it hexa-gitlab-ce gitlab-backup restore BACKUP=backup_filename
```

### 4. Security Updates

**Regular maintenance:**

```bash
# Update GitLab
docker-compose -f gitlab-docker-compose.full.yml pull
docker-compose -f gitlab-docker-compose.full.yml up -d

# Check for vulnerabilities
# (Integrate with Trivy, Snyk, or other scanning tools)
```

---

## 📈 Performance Optimization

### 1. Resource Allocation

GitLab CE requires:

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **RAM** | 4GB | 8GB+ |
| **CPU** | 2 cores | 4 cores |
| **Storage** | 50GB | 100GB+ |

**Adjust in docker-compose.yml:**

```yaml
services:
  gitlab:
    mem_limit: 8g
    cpus: 4.0
    shm_size: '512m'
```

### 2. Maintenance Tasks

```bash
# Clean up old containers
docker system prune -f

# Clean up old images
docker image prune -a -f

# Check disk usage
docker system df

# Remove unused volumes
docker volume prune -f
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Let's Encrypt Certificate Failed

**Symptoms:** GitLab accessible but no HTTPS, certificate errors

**Solution:**
```bash
# Check certbot logs
docker exec hexa-gitlab-ce cat /var/log/gitlab/nginx/current

# Check port 80 availability
sudo netstat -tulnp | grep :80

# Manually request certificate
docker exec hexa-gitlab-ce gitlab-ctl renew-le-certs
```

#### 2. SMTP Not Working

**Symptoms:** No email notifications, SMTP errors in logs

**Solution:**
```bash
# Check SMTP configuration
docker exec hexa-gitlab-ce cat /etc/gitlab/gitlab.rb | grep smtp

# Test SMTP manually
docker exec hexa-gitlab-ce gitlab-rails console
> Notify.test_email('recipient@example.com', 'Test Subject', 'Test Body').deliver_now
> exit
```

#### 3. GitLab Not Starting

**Symptoms:** Container crashes, repeated restarts

**Solution:**
```bash
# Check logs
docker-compose -f gitlab-docker-compose.full.yml logs gitlab

# Check resource limits
docker stats hexa-gitlab-ce

# Increase shm_size in docker-compose.yml if memory is low
```

#### 4. Port 22 Conflict

**Symptoms:** SSH not working, port already in use

**Solution:**
```bash
# Change host port mapping in docker-compose.yml
# From: "22:22"
# To: "2222:22"

# Then use port 2222 for SSH
ssh -p 2222 git@your-server-ip
```

#### 5. Monitoring Services Not Accessible

**Symptoms:** Grafana/Prometheus/Loki not accessible

**Solution:**
```bash
# Check container status
docker ps | grep -E "prometheus|grafana|loki|sentry"

# Check port mappings
docker port hexa-gitlab-prometheus

# Check network connectivity
docker exec hexa-gitlab-prometheus ping loki
```

---

## 📞 Support & Resources

### Official Documentation

- GitLab CE Documentation: https://docs.gitlab.com/omnibus/docker/
- Let's Encrypt with GitLab: https://docs.gitlab.com/omnibus/settings/ssl.html
- SMTP Configuration: https://docs.gitlab.com/omnibus/settings/smtp.html
- Monitoring with Prometheus: https://docs.gitlab.com/ee/administration/monitoring/prometheus/
- Security Best Practices: https://docs.gitlab.com/ee/security/

### Troubleshooting Resources

- GitLab Issues: https://gitlab.com/gitlab-org/gitlab/-/issues
- Stack Overflow: https://stackoverflow.com/questions/tagged/gitlab
- GitLab Forum: https://forum.gitlab.com/

### Contact Information

- **DevOps Team:** devops@hexastudio.net
- **GitLab Support:** support@gitlab.com

---

## 📊 Deployment Metrics

| Metric | Value |
|--------|-------|
| Deployment Date | $(Get-Date -Format "yyyy-MM-dd HH:mm:ss") |
| Server IP | 192.168.1.100 |
| GitLab Version | Latest (auto-updated) |
| Initialization Time | 10-30 minutes |
| Storage Used | ~5-10GB (initial) |
| Memory Allocated | 8GB (recommended) |
| CPU Cores | 4 (recommended) |

---

## 🎉 Deployment Complete!

**Status:** ✅ Ready for production use

**Next Steps:**
1. ✅ Configure DNS records
2. ✅ Update SMTP credentials
3. ✅ Deploy GitLab CE
4. ✅ Monitor initialization
5. ✅ Complete post-deployment verification
6. 🚀 Start using GitLab!

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-08-01 | Initial full deployment guide |
| 1.0.1 | 2024-08-02 | Added troubleshooting section |
| 1.1.0 | 2024-08-03 | Added performance optimization guide |

---

**🔒 IMPORTANT:** Always keep your GitLab instance updated with the latest security patches!

**📧 Questions?** Contact: devops@hexastudio.net