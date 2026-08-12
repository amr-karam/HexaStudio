# 🎯 GITLAB.HEXASTUDIO.NET - COMPLETE SETUP & CONFIGURATION GUIDE

## 📋 EXECUTIVE SUMMARY

**Status**: ✅ All configuration files created and ready for deployment  
**Location**: Server at `19.16.1.100`  
**Access**: `http://19.16.1.100:8929`  
**Fix Status**: ✅ Docker registry fix already merged to main branch  

---

## ✅ COMPLETED TASKS

### 1. **Root Cause Analysis**
- ✅ Identified pipeline #182 blocker: Docker-in-Docker registry HTTPS/HTTP mismatch
- ✅ Error: `Get "https://19.16.1.100:5050/v2/": http: server gave HTTP response to HTTPS client`
- ✅ Solution: Configure Docker daemon and dind services for insecure registry access

### 2. **Immediate Fix Applied**
- ✅ Updated `.gitlab-ci.yml` in branch `governance/initialization-gap-closure`
- ✅ Fixed all 4 image jobs (backend, frontend, cms, docs) with:
  ```yaml
  services:
    - name: docker:24-dind
      command: ["--insecure-registry=19.16.1.100:5050"]
  variables:
    DOCKER_TLS_CERTDIR: ""
    DOCKER_HOST: tcp://docker:2375
  ```
- ✅ Commit `8a71cf59`: "ci: configure dind for insecure HTTP registry"
- ✅ **Already merged to main** (commit `a5592653` on gitlab/main)

### 3. **Optimized Configuration Files Created**

#### 📁 File: `docker-compose.gitlab.optimized.yml`
**Purpose**: Production-ready GitLab CE with performance tuning

**Key Optimizations:**
- ✅ GitLab version pinned to `16.11.0-ce.0` for stability
- ✅ External URLs: `https://gitlab.hexastudio.net` + `https://registry.gitlab.hexastudio.net`
- ✅ Internal registry: `http://19.16.1.100:5050` with HTTP access
- ✅ **Performance**:
  - PostgreSQL: 1GB shared buffers, 2GB effective cache, 200 max connections
  - Sidekiq: 25 max concurrency, optimized queue ordering
  - Puma: 2 worker processes, 512MB max memory each
  - Gitaly: Pack objects cache (10GB)
- ✅ **Resource Limits**: 8GB RAM, 4 vCPU, 512MB shm
- ✅ **Backup**: 7-day retention, remote upload enabled
- ✅ **Monitoring**: Prometheus + Grafana enabled
- ✅ **Security**: Rate limiting, rack attack protection, housekeeping

#### 📁 File: `docker-compose.gitlab-runner.optimized.yml`
**Purpose**: High-performance GitLab Runner with Docker executor

**Key Optimizations:**
- ✅ Runner image: `gitlab/gitlab-runner:alpine-v16.11.0` (lightweight)
- ✅ **Concurrency**: 10 concurrent jobs maximum
- ✅ **Docker Executor**:
  - Image: `docker:24-dind`
  - Privileged: true
  - Network mode: `hexa-gitlab-net`
  - Insecure registry: `19.16.1.100:5050`
- ✅ **Caching**: `/cache` and `/builds` volumes
- ✅ **Resource Limits**: 8GB RAM, 4 vCPU
- ✅ **Metrics**: Prometheus metrics on port 9252

### 4. **Configuration Scripts Created**

#### 📁 Script: `scripts/configure-gitlab-best-settings.sh`
- ✅ Validates Docker environment
- ✅ Configures registry for HTTP access
- ✅ Configures Docker daemon for insecure registry
- ✅ Provides comprehensive configuration recommendations
- ✅ Manual configuration steps documented

#### 📁 Script: `scripts/deploy-gitlab-best-settings.sh`
- ✅ Backs up current configuration
- ✅ Deploys optimized GitLab configuration
- ✅ Deploys optimized Runner configuration
- ✅ Stops and restarts services
- ✅ Re-registers runner
- ✅ Verifies deployment

### 5. **Documentation Created**

#### 📁 Document: `docs/GITLAB_BEST_SETTINGS.md` (400+ lines)
- ✅ Complete infrastructure configuration guide
- ✅ Performance tuning details
- ✅ Security best practices
- ✅ Troubleshooting guide
- ✅ Maintenance checklist
- ✅ Deployment checklist

#### 📁 Document: `GITLAB_CONFIG_SUMMARY.md`
- ✅ Progress tracking
- ✅ Current status
- ✅ Next steps
- ✅ Quick commands reference

---

## ⏳ PENDING TASKS (Execute on Server 19.16.1.100)

### 🚀 PHASE 1: Deploy Optimized Configurations

#### Step 1: Transfer Files to Server
```bash
# From your local machine, copy files to server:
scp docker-compose.gitlab.optimized.yml root@19.16.1.100:/path/to/hexa-platform/
scp docker-compose.gitlab-runner.optimized.yml root@19.16.1.100:/path/to/hexa-platform/
scp scripts/deploy-gitlab-best-settings.sh root@19.16.1.100:/path/to/hexa-platform/scripts/
```

#### Step 2: Run Deployment Script
```bash
# SSH into server
ssh root@19.16.1.100

# Navigate to project
cd /path/to/hexa-platform

# Make script executable
chmod +x scripts/deploy-gitlab-best-settings.sh

# Run deployment
bash scripts/deploy-gitlab-best-settings.sh
```

**What this does:**
1. ✅ Backs up current configurations to `backups/gitlab_YYYYMMDD_HHMMSS/`
2. ✅ Deploys optimized `docker-compose.gitlab.yml`
3. ✅ Deploys optimized `docker-compose.gitlab-runner.yml`
4. ✅ Stops existing GitLab and Runner containers
5. ✅ Starts GitLab with new configuration
6. ✅ Waits for GitLab to be healthy (up to 10 minutes)
7. ✅ Displays root password
8. ✅ Starts Runner with new configuration
9. ✅ Provides runner registration instructions

#### Step 3: Re-register Runner
After deployment, you'll need to register the runner:

**Option A: Automated**
```bash
# Get registration token from Admin UI
RUNNER_TOKEN=<token-from-admin-runners-page>
bash scripts/register-gitlab-runner.sh
```

**Option B: Manual**
```bash
docker exec -it hexa-gitlab-runner gitlab-runner register \
  --non-interactive \
  --url http://19.16.1.100:8929 \
  --registration-token <TOKEN_FROM_ADMIN> \
  --executor docker \
  --docker-image docker:24-dind \
  --docker-privileged=true \
  --docker-volumes /var/run/docker.sock:/var/run/docker.sock \
  --docker-volumes /cache \
  --docker-network-mode hexa-gitlab-net \
  --tag-list docker,linux,hexa \
  --run-untagged=false \
  --locked=false \
  --access-level=not_protected
```

---

### 🔧 PHASE 2: Configure GitLab Instance Settings

#### Step 4: Instance-Level Configuration (Admin UI)
Access: `http://19.16.1.100:8929/admin`

**Settings > General:**
- [ ] Application title: `HEXA Studio GitLab`
- [ ] Default projects limit: `1000`
- [ ] Signup enabled: `❌ false` (admin creates users)
- [ ] Default branch protection: `2` (Maintainers)
- [ ] Visibility and access controls: `Private`
- [ ] Gravatar enabled: `✅ true`
- [ ] Timezone: `UTC`

**Settings > CI/CD:**
- [ ] Default git depth: `50`
- [ ] Auto cancel redundant pipelines: `✅ true`
- [ ] Auto retry failed jobs: `❌ false`
- [ ] Maximum artifacts size (MB): `100`
- [ ] Maximum attachment size (MB): `100`
- [ ] Maximum pages size (MB): `100`

**Settings > Registry:**
- [ ] Storage: `Filesystem`
- [ ] Garbage collection: `✅ Enabled`
- [ ] GC policy: `Keep last 10 tags`
- [ ] GC schedule: `Daily`

**Settings > Monitoring:**
- [ ] Prometheus: `✅ Enabled`
- [ ] Scrape interval: `15s`
- [ ] Scrape timeout: `5s`

---

### 🏗️ PHASE 3: Configure Project Settings

#### Step 5: Project-Level Configuration
Access: `http://19.16.1.100:8929/root/hexa-platform/-/settings`

**CI/CD > Variables:**
```
CI_REGISTRY = http://19.16.1.100:5050
CI_REGISTRY_IMAGE = ${CI_REGISTRY}/hexa-platform
BACKEND_IMAGE = ${CI_REGISTRY_IMAGE}/backend
FRONTEND_IMAGE = ${CI_REGISTRY_IMAGE}/frontend
CMS_IMAGE = ${CI_REGISTRY_IMAGE}/cms
DOCKER_DRIVER = overlay2
DOCKER_HOST = tcp://docker:2375
DOCKER_TLS_CERTDIR = ""
```

**Repository > Protected Branches:**
- **main**:
  - Allowed to merge: `Maintainers`
  - Allowed to push: `No one`
  - Require approvals: `✅ 1`
  - Remove approvals on new commits: `✅ true`
  - Merge method: `Merge commit`
  
- **develop**:
  - Allowed to push: `Maintainers`
  - Allowed to merge: `Maintainers`

**Merge Requests:**
- [ ] Approvals required: `1`
- [ ] Remove approvals when new commits are pushed: `✅ true`
- [ ] Merge method: `Merge commit`
- [ ] Enable merge request approvals: `✅ true`
- [ ] Require all discussions to be resolved: `✅ true`

**CI/CD > Runners:**
- [ ] Enable shared runners: `✅ true`
- [ ] Runner type: `Project`
- [ ] Tags: `docker, linux, hexa`

---

## 🎯 EXPECTED OUTCOMES

### After Phase 1 (Deployment):
✅ GitLab running with optimized performance settings  
✅ Container registry properly configured for HTTP access  
✅ GitLab Runner running with 10 concurrent job capacity  
✅ All services healthy and accessible  

### After Phase 2 (Instance Config):
✅ Security hardened (signup disabled, protection enabled)  
✅ Performance optimized (caching, concurrency, resource limits)  
✅ Monitoring enabled (Prometheus + Grafana)  
✅ Retention policies configured  

### After Phase 3 (Project Config):
✅ CI/CD variables properly set  
✅ Branch protection enforced  
✅ Merge request workflow configured  
✅ Pipeline will run with optimized settings  

---

## 📊 CURRENT STATUS TRACKER

| Task | Status | Location | Notes |
|------|--------|----------|-------|
| Root cause analysis | ✅ Done | Local | Registry HTTPS/HTTP mismatch identified |
| Fix committed | ✅ Done | gitlab/main | Commit a5592653 |
| Optimized GitLab config | ✅ Created | Local | docker-compose.gitlab.optimized.yml |
| Optimized Runner config | ✅ Created | Local | docker-compose.gitlab-runner.optimized.yml |
| Deployment script | ✅ Created | Local | deploy-gitlab-best-settings.sh |
| Configuration script | ✅ Created | Local | configure-gitlab-best-settings.sh |
| Documentation | ✅ Created | Local | docs/GITLAB_BEST_SETTINGS.md |
| **Deploy to server** | ⏳ Pending | Server | Run deploy script |
| **Re-register runner** | ⏳ Pending | Server | After deployment |
| **Instance settings** | ⏳ Pending | Admin UI | After deployment |
| **Project settings** | ⏳ Pending | Project UI | After deployment |
| **Verify pipeline** | ⏳ Pending | GitLab UI | Final check |

---

## 🚀 QUICK START (Minimal Steps)

If you just want to **unblock the current pipeline immediately**:

1. **The fix is already in main** (commit a5592653)
2. **Pipeline should auto-trigger** when main was updated
3. **Check pipeline status**: `http://19.16.1.100:8929/root/hexa-platform/-/pipelines`
4. **If pipeline is still blocked**, manually trigger from UI

If you want **full optimization**:

1. **Transfer files to server** (SCP the 3 files above)
2. **Run deployment script** on server
3. **Re-register runner**
4. **Configure settings** via Admin UI

---

## 📚 FILES CREATED SUMMARY

### Configuration Files (Ready to Deploy)
1. `docker-compose.gitlab.optimized.yml` - Optimized GitLab CE
2. `docker-compose.gitlab-runner.optimized.yml` - Optimized Runner
3. `.gitlab-ci.yml` - Fixed (already in main)

### Scripts (Ready to Run)
1. `scripts/deploy-gitlab-best-settings.sh` - Full deployment
2. `scripts/configure-gitlab-best-settings.sh` - Configuration guide
3. `scripts/register-gitlab-runner.sh` - Runner registration

### Documentation
1. `docs/GITLAB_BEST_SETTINGS.md` - Complete guide
2. `GITLAB_CONFIG_SUMMARY.md` - Progress tracker
3. This file: `FINAL_DEPLOYMENT_GUIDE.md`

---

## 🎉 SUCCESS CRITERIA

### ✅ Pipeline Unblocked
- [ ] Image-stage jobs pass (build-image-backend, build-image-frontend, build-image-cms)
- [ ] Pipeline proceeds to validate stage
- [ ] Publish stage jobs become available
- [ ] Manual trigger of publish-ui works

### ✅ Performance Improved
- [ ] Build times reduced by 40-60%
- [ ] Concurrent jobs supported: 10
- [ ] Registry access working without HTTPS errors
- [ ] Docker-in-Docker functioning properly

### ✅ Monitoring Active
- [ ] Prometheus metrics available at port 9091
- [ ] Grafana dashboards accessible at port 3001
- [ ] Runner metrics at port 9252

---

## 💬 COMMANDS QUICK REFERENCE

### Check Status
```bash
# GitLab health
docker exec hexa-gitlab curl -sf http://localhost/-/health

# Runner status
docker exec hexa-gitlab-runner gitlab-runner list
docker exec hexa-gitlab-runner gitlab-runner status

# Docker containers
docker ps

# Logs
docker logs hexa-gitlab
docker logs hexa-gitlab-runner
```

### Pipeline Management
```bash
# List pipelines
curl -H "PRIVATE-TOKEN: <PAT>" "http://19.16.1.100:8929/api/v4/projects/1/pipelines"

# Trigger manual job
curl -X POST -H "PRIVATE-TOKEN: <PAT>" "http://19.16.1.100:8929/api/v4/projects/1/jobs/<ID>/play"

# Get job trace
curl -H "PRIVATE-TOKEN: <PAT>" "http://19.16.1.100:8929/api/v4/projects/1/jobs/<ID>/trace"
```

---

## 🛠️ TROUBLESHOOTING

### Issue: Docker Login Fails
**Error**: `http: server gave HTTP response to HTTPS client`

**Solution**:
```bash
# On the server, ensure Docker daemon has insecure registry configured
cat > /etc/docker/daemon.json << EOF
{
  "insecure-registries": ["19.16.1.100:5050", "registry.gitlab.hexastudio.net:5050"]
}
EOF

# Restart Docker
docker restart
```

### Issue: Runner Not Picking Up Jobs
**Check**:
```bash
docker logs -f hexa-gitlab-runner
docker exec hexa-gitlab-runner gitlab-runner list
```

**Solution**:
- Verify runner is registered
- Check runner tags match job tags
- Verify CI_SERVER_URL is correct
- Check Docker socket permissions

### Issue: Pipeline Stuck in Created State
**Check**:
```bash
# List all jobs in latest pipeline
curl -H "PRIVATE-TOKEN: <PAT>" "http://19.16.1.100:8929/api/v4/projects/1/pipelines/latest/jobs"
```

**Solution**:
- Check if previous stage jobs failed
- Verify runner availability
- Check job dependencies

---

## 📞 SUPPORT & NEXT STEPS

### If You Need Help:
1. **Check this documentation** - All answers are here
2. **Review logs** - `docker logs hexa-gitlab` and `docker logs hexa-gitlab-runner`
3. **Consult GitLab docs** - https://docs.gitlab.com/
4. **Contact DevOps** - For server-specific issues

### Next Immediate Actions:
1. ✅ **Fix is already in main** - No action needed
2. ⏳ **Deploy optimized configs** - Run on server (5 minutes)
3. ⏳ **Re-register runner** - Run on server (2 minutes)
4. ⏳ **Configure settings** - Via Admin UI (10 minutes)

### Estimated Time to Complete:
- **Quick fix only**: 0 minutes (already done!)
- **Full optimization**: 20-30 minutes

---

## 📅 MAINTENANCE SCHEDULE

### Daily
- [ ] Check GitLab health: `http://19.16.1.100:8929/-/health`
- [ ] Monitor resource usage
- [ ] Review failed pipelines

### Weekly
- [ ] Review and clean up old artifacts
- [ ] Check registry storage usage
- [ ] Update Docker images (security patches)
- [ ] Review runner performance

### Monthly
- [ ] Verify backups are working
- [ ] Test disaster recovery procedure
- [ ] Review security settings
- [ ] Update GitLab version
- [ ] Rotate secrets and tokens

---

**Document Version**: 2.0  
**Last Updated**: August 10, 2026  
**Author**: HEXA Studio DevOps  
**Status**: Ready for Deployment ✅

---

## 🎯 FINAL CHECKLIST

Before declaring this complete:

- [x] Root cause identified and fixed
- [x] Fix committed to main branch
- [x] Optimized configuration files created
- [x] Deployment scripts created
- [x] Documentation created
- [ ] Optimized configurations deployed to server
- [ ] GitLab restarted with new settings
- [ ] Runner restarted with new settings
- [ ] Runner re-registered
- [ ] Instance settings configured
- [ ] Project settings configured
- [ ] Pipeline verified working

**Once all boxes are checked, the GitLab instance at gitlab.hexastudio.net will have the best possible settings!**
