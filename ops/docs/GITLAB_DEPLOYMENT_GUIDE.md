# 🦊 GitLab CE Deployment Guide

## 📋 **Deployment Summary**

**Status:** ✅ Server Accessible - Proceeding with deployment
**Server IP:** 19.16.1.100
**Hostname:** gitlab.hexastudio.net

---

## ⚠️ **CRITICAL PRE-DEPLOYMENT REQUIREMENTS**

### **1. DNS Configuration (MUST BE COMPLETED BEFORE DEPLOYMENT)**

You MUST configure DNS records BEFORE deploying GitLab:

```
Type    | Hostname                     | Value (Points to)       | TTL
------- | ---------------------------- | ----------------------- | ---
A       | gitlab.hexastudio.net        | 19.16.1.100            | 3600
A       | registry.gitlab.hexastudio.net | 19.16.1.100           | 3600
A       | pages.gitlab.hexastudio.net   | 19.16.1.100            | 3600
```

**Action Required:**
```bash
# Update your DNS records with your DNS provider
# Example for Cloudflare:
# - Add A record for gitlab.hexastudio.net -> 19.16.1.100
# - Add A record for registry.gitlab.hexastudio.net -> 19.16.1.100
```

### **2. Port 80 Must Be Available**
GitLab requires port 80 for Let's Encrypt HTTP-01 challenge.

### **3. Firewall Rules**
Ensure your firewall allows:
- Inbound TCP ports: 80, 443, 22, 5050
- Outbound connections to SMTP servers (port 587 for Gmail)

---

## 📝 **DEPLOYMENT STEPS**

### **Step 1: Update Environment Variables**

Edit the docker-compose.yml file and update these critical values:

#### **SMTP Configuration** (Required for email notifications)
```yaml
# In the GITLAB_OMNIBUS_CONFIG section:
gitlab_rails['smtp_address'] = "smtp.gmail.com"
gitlab_rails['smtp_user_name'] = "your-email@gmail.com"
gitlab_rails['smtp_password'] = "your-app-password"
```

**For Gmail SMTP:**
1. Create an App Password: https://myaccount.google.com/apppasswords
2. Use your Gmail address and the app password above

**Alternative SMTP Services:**
- Mailgun
- SendGrid
- AWS SES
- Your company's SMTP server

#### **Email From Address**
```yaml
gitlab_rails['gitlab_email_from'] = 'gitlab@hexastudio.net'
gitlab_rails['gitlab_email_reply_to'] = 'noreply@hexastudio.net'
```

### **Step 2: Deploy GitLab CE**

```bash
# Navigate to the directory containing gitlab-docker-compose.yml
cd C:\Users\amrmo\OneDrive\Desktop\hexastudio.net

# Start GitLab container
docker compose -f gitlab-docker-compose.yml up -d

# Monitor deployment
docker compose -f gitlab-docker-compose.yml logs -f gitlab
```

### **Step 3: Wait for Initialization**

GitLab CE takes **10-30 minutes** to fully initialize. Monitor the logs:

```bash
# Check logs
docker compose -f gitlab-docker-compose.yml logs -f gitlab

# Expected output during initialization:
# - Database migrations
# - Service restarts
# - Configuration updates
# - Final readiness check
```

**Wait until you see:**
```
gitlab-ce  | GitLab is ready!
```

### **Step 4: Access GitLab Web Interface**

Once initialized, access:
- **Main GitLab:** https://gitlab.hexastudio.net
- **Container Registry:** https://registry.gitlab.hexastudio.net

### **Step 5: Retrieve Initial Admin Password**

```bash
# Get the initial root password
docker exec -it gitlab-ce grep 'Password:' /etc/gitlab/initial_root_password

# Output will show:
# Password: YOUR_INITIAL_PASSWORD
# This file will be automatically deleted in 24 hours
```

**Note:** The password file is temporary and expires after 24 hours.

### **Step 6: Complete Initial Setup**

1. Open browser: https://gitlab.hexastudio.net
2. Log in with:
   - Username: `root`
   - Password: (from Step 5)
3. Change the password immediately
4. Complete initial configuration

---

## 🔐 **POST-DEPLOYMENT CONFIGURATION**

### **1. Configure HTTPS (Let's Encrypt)**

GitLab will automatically request SSL certificates from Let's Encrypt.

**Verify SSL Certificate:**
```bash
# Check certificate status
openssl s_client -connect gitlab.hexastudio.net:443 -servername gitlab.hexastudio.net | openssl x509 -noout -dates

# Expected output:
# notBefore=Jan  1 00:00:00 2024 GMT
# notAfter=Jan  1 00:00:00 2025 GMT
```

**Auto-Renewal Check:**
```bash
# Test renewal process
sudo docker exec gitlab-ce gitlab-ctl renew-le-certs
```

### **2. Configure Email Notifications**

After logging in:
1. Go to **Admin Area** > **Settings** > **Email**
2. Test email configuration
3. Configure email notifications for:
   - New user sign-ups
   - Password resets
   - Project activities

### **3. Create Regular User Accounts**

1. Go to **Admin Area** > **Users** > **New User**
2. Create users with appropriate permissions
3. Assign users to projects

### **4. Configure Backup**

GitLab has automatic backups enabled (7 days retention).

**Manual Backup:**
```bash
# Create backup
docker exec -it gitlab-ce gitlab-backup create

# Restore backup
docker exec -it gitlab-ce gitlab-backup restore BACKUP=backup_filename
```

### **5. Configure SSH Access**

**Add SSH Key:**
```bash
# Generate SSH key (if needed)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitLab profile
# Profile > Preferences > SSH Keys
```

**Test SSH Connection:**
```bash
ssh -T git@gitlab.hexastudio.net
```

---

## 📊 **POST-DEPLOYMENT VERIFICATION CHECKLIST**

### **✅ Infrastructure Verification**

- [ ] GitLab web interface accessible at https://gitlab.hexastudio.net
- [ ] Container registry accessible at https://registry.gitlab.hexastudio.net
- [ ] HTTPS certificate valid and trusted
- [ ] Port 80 redirects to HTTPS
- [ ] Port 22 accessible for SSH
- [ ] All services running without errors

### **✅ GitLab Service Verification**

- [ ] Docker container running: `docker ps | grep gitlab-ce`
- [ ] All GitLab services healthy: `docker exec gitlab-ce gitlab-ctl status`
- [ ] PostgreSQL database running
- [ ] Redis running
- [ ] Sidekiq queue workers active
- [ ] Puma web server running

### **✅ Functionality Verification**

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

### **✅ Monitoring & Maintenance**

- [ ] Set up monitoring for GitLab services
- [ ] Configure backup schedule
- [ ] Set up log rotation
- [ ] Configure resource limits
- [ ] Set up alerts for service failures

---

## 🛠️ **TROUBLESHOOTING GUIDE**

### **Common Issues & Solutions**

#### **Issue 1: Let's Encrypt Certificate Failed**
**Symptoms:** GitLab accessible but no HTTPS, certificate errors
**Solution:**
```bash
# Check certbot logs
docker exec gitlab-ce cat /var/log/gitlab/nginx/current

# Check port 80 availability
sudo netstat -tulnp | grep :80

# Manually request certificate
docker exec gitlab-ce gitlab-ctl renew-le-certs
```

#### **Issue 2: SMTP Not Working**
**Symptoms:** No email notifications, SMTP errors in logs
**Solution:**
```bash
# Check SMTP configuration
docker exec gitlab-ce cat /etc/gitlab/gitlab.rb | grep smtp

# Test SMTP manually
docker exec gitlab-ce gitlab-rails console
> Notify.test_email('recipient@example.com', 'Test Subject', 'Test Body').deliver_now
> exit
```

#### **Issue 3: GitLab Not Starting**
**Symptoms:** Container crashes, repeated restarts
**Solution:**
```bash
# Check logs
docker compose -f gitlab-docker-compose.yml logs gitlab

# Check resource limits
docker stats gitlab-ce

# Increase shm_size in docker-compose.yml if memory is low
```

#### **Issue 4: Port 22 Conflict**
**Symptoms:** SSH not working, port already in use
**Solution:**
```bash
# Change host port mapping in docker-compose.yml
# From: "22:22"
# To: "2222:22"

# Then use port 2222 for SSH
ssh -p 2222 git@19.16.1.100
```

---

## 📈 **PERFORMANCE OPTIMIZATION**

### **Resource Allocation**

GitLab CE requires:
- **Minimum:** 4GB RAM, 2 CPU cores
- **Recommended:** 8GB RAM, 4 CPU cores
- **Storage:** 50GB+ for repositories and artifacts

**Adjust in docker-compose.yml:**
```yaml
services:
  gitlab:
    mem_limit: 8g
    cpus: 4.0
    shm_size: '1g'
```

### **Maintenance Tasks**

```bash
# Clean up old containers
docker system prune -f

# Clean up old images
docker image prune -a -f

# Check disk usage
docker system df
```

---

## 🔄 **UPGRADE PROCESS**

### **Upgrade GitLab CE**

```bash
# Stop GitLab
cd C:\Users\amrmo\OneDrive\Desktop\hexastudio.net
docker compose -f gitlab-docker-compose.yml down

# Update image version in docker-compose.yml
# Change: image: gitlab/gitlab-ce:latest
# To:     image: gitlab/gitlab-ce:16.11.x

# Pull new image
docker compose -f gitlab-docker-compose.yml pull

# Start with upgrade
# GitLab will automatically handle database migrations
docker compose -f gitlab-docker-compose.yml up -d

# Monitor upgrade
docker compose -f gitlab-docker-compose.yml logs -f gitlab
```

---

## 📞 **SUPPORT & RESOURCES**

### **Official Documentation**
- GitLab CE Documentation: https://docs.gitlab.com/omnibus/docker/
- Let's Encrypt with GitLab: https://docs.gitlab.com/omnibus/settings/ssl.html
- SMTP Configuration: https://docs.gitlab.com/omnibus/settings/smtp.html

### **Troubleshooting Resources**
- GitLab Issues: https://gitlab.com/gitlab-org/gitlab/-/issues
- Stack Overflow: https://stackoverflow.com/questions/tagged/gitlab
- GitLab Forum: https://forum.gitlab.com/

### **Contact Information**
- **DevOps Team:** devops@hexastudio.net
- **GitLab Support:** support@gitlab.com

---

## 📝 **DEPLOYMENT METRICS**

| Metric | Value |
|--------|-------|
| Deployment Date | $(date) |
| Server IP | 19.16.1.100 |
| GitLab Version | Latest (auto-updated) |
| Initialization Time | 10-30 minutes |
| Storage Used | ~5-10GB (initial) |
| Memory Allocated | 4GB (recommended minimum) |
| CPU Cores | 2 (minimum) |

---

## ✅ **DEPLOYMENT COMPLETE**

**Status:** Ready for execution

**Next Steps:**
1. ✅ Configure DNS records
2. ⏳ Update SMTP credentials in docker-compose.yml
3. ⏳ Deploy GitLab CE using the provided commands
4. ⏳ Monitor initialization (10-30 minutes)
5. ⏳ Complete post-deployment verification

**Important:** Do NOT proceed with deployment until DNS records are properly configured!
