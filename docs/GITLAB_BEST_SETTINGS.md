# GitLab Best Settings Configuration for HEXA Studio

## 📋 Overview

This document describes the optimal configuration for the GitLab instance at `gitlab.hexastudio.net` (internal: `http://19.16.1.100:8929`).

## 🎯 Objectives

1. **Performance Optimization**: Maximize CI/CD pipeline speed and efficiency
2. **Reliability**: Ensure stable, consistent build environments
3. **Security**: Implement best security practices
4. **Scalability**: Support concurrent builds and team growth
5. **Maintainability**: Easy to update and manage

---

## 🏗️ Infrastructure Configuration

### Docker Compose Files

#### 1. `docker-compose.gitlab.optimized.yml`

**Key Optimizations:**

- **GitLab Version**: Pinned to `gitlab/gitlab-ce:16.11.0-ce.0` for stability
- **External URLs**: 
  - Primary: `https://gitlab.hexastudio.net`
  - Registry: `https://registry.gitlab.hexastudio.net`
  - Internal: `http://19.16.1.100:8929`

- **Container Registry Configuration**:
  ```yaml
  registry['enable'] = true
  registry['port'] = 5000
  registry['registry_http_addr'] = '0.0.0.0:5000'
  registry['storage'] = {
    'filesystem' => {
      'rootdirectory' => '/var/opt/gitlab/gitlab-rails/shared/registry'
    }
  }
  ```

- **Performance Tuning**:
  - PostgreSQL: 1GB shared buffers, 2GB effective cache
  - Sidekiq: 25 max concurrency, optimized queue ordering
  - Puma: 2 worker processes, 512MB max memory per worker
  - Gitaly: Pack objects cache enabled (10GB)

- **Resource Limits**:
  - Memory: 8GB limit, 4GB reservation
  - CPU: 4 vCPU limit, 2 vCPU reservation
  - Shared memory: 512MB

- **Backup Configuration**:
  - Retention: 7 days (604800 seconds)
  - Upload enabled for remote backups

- **Monitoring**:
  - Prometheus: Enabled with 15s scrape interval
  - Grafana: Enabled with admin password configuration

- **Security**:
  - Rate limiting enabled
  - Rack attack protection for Git operations
  - Housekeeping enabled with incremental cleanup

#### 2. `docker-compose.gitlab-runner.optimized.yml`

**Key Optimizations:**

- **Runner Image**: `gitlab/gitlab-runner:alpine-v16.11.0` (Alpine-based, lightweight)

- **Concurrency**: 10 concurrent jobs maximum

- **Docker Executor Configuration**:
  ```yaml
  RUNNER_EXECUTOR: "docker"
  DOCKER_IMAGE: "docker:24-dind"
  DOCKER_PRIVILEGED: "true"
  DOCKER_NETWORK_MODE: "hexa-gitlab-net"
  ```

- **Insecure Registry Support**:
  ```yaml
  DOCKER_OPTS: "--insecure-registry=19.16.1.100:5050 --insecure-registry=registry.gitlab.hexastudio.net:5050"
  ```

- **Caching**:
  - Cache directory: `/cache`
  - Builds directory: `/builds`
  - Separate volumes for persistence

- **Resource Limits**:
  - Memory: 8GB limit, 2GB reservation
  - CPU: 4 vCPU limit, 1 vCPU reservation

- **Metrics**: Prometheus metrics enabled on port 9252

---

## ⚙️ Container Registry Configuration

### Problem Solved

The original issue was that Docker clients (in Docker-in-Docker containers) were trying to access the registry via HTTPS, but the GitLab Container Registry was configured for HTTP only. This caused the error:

```
Error response from daemon: Get "https://19.16.1.100:5050/v2/": http: server gave HTTP response to HTTPS client
```

### Solution

1. **Registry Configuration**: The registry is configured to listen on `0.0.0.0:5000` and exposed on port `5050` externally.

2. **Docker Daemon Configuration**: Docker clients need to be configured to trust the insecure registry:
   ```json
   {
     "insecure-registries": ["19.16.1.100:5050", "registry.gitlab.hexastudio.net:5050"]
   }
   ```

3. **Docker-in-Docker Configuration**: In `.gitlab-ci.yml`, the dind service is configured with:
   ```yaml
   services:
     - name: docker:24-dind
       command: ["--insecure-registry=19.16.1.100:5050"]
   variables:
     DOCKER_HOST: tcp://docker:2375
     DOCKER_TLS_CERTDIR: ""
   ```

### Registry Storage

- **Location**: `/var/opt/gitlab/gitlab-rails/shared/registry`
- **Garbage Collection**: Enabled with delete policy
- **Cache**: In-memory blob descriptor cache

---

## 🚀 CI/CD Pipeline Best Practices

### `.gitlab-ci.yml` Optimizations

#### 1. **Stage Organization**

```yaml
stages:
  - quality      # Linting, type checking, security scans
  - build        # Application builds
  - image        # Docker image builds
  - validate     # E2E tests, Lighthouse, etc.
  - publish      # Storybook, docs, artifacts
  - deploy       # Production deployment
```

#### 2. **Caching Strategy**

```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .cache/
    - .npm/
  policy: pull-push
```

**Cache Types:**
- **npm cache**: `.npm/` directory
- **Docker layer cache**: Registry-based cache (`--cache-from` and `--cache-to`)
- **Build artifacts**: Shared between stages

#### 3. **Docker-in-Docker Configuration**

```yaml
build-image-backend:
  image: docker:24
  services:
    - name: docker:24-dind
      alias: docker
      command: ["--insecure-registry=19.16.1.100:5050"]
  variables:
    DOCKER_HOST: tcp://docker:2375
    DOCKER_TLS_CERTDIR: ""
```

#### 4. **Artifact Management**

```yaml
artifacts:
  paths:
    - dist/
    - .next/
  expire_in: 1 week
  when: on_success
  reports:
    lint: lint-report.json
```

#### 5. **Resource Limits**

```yaml
tags:
  - docker
  - linux
  - hexa

# Memory and CPU limits configured in runner
```

---

## 🔒 Security Best Practices

### 1. **Instance-Level Security**

- **Signup Disabled**: Prevent unauthorized account creation
- **Visibility**: Default to private projects
- **Rate Limiting**: Enabled to prevent abuse
- **DDoS Protection**: Enabled
- **Security Headers**: Enabled

### 2. **Project-Level Security**

- **Branch Protection**:
  - `main`: Require merge requests, 1 approval
  - `develop`: Allow push from maintainers

- **Merge Request Settings**:
  - Approvals required: 1
  - Remove approvals on new commits: Yes
  - Merge method: Merge commit (or Rebase)

- **CI/CD Variables**:
  - Mask sensitive variables
  - Protect variables (only available to protected branches)
  - Use file-type variables for certificates and keys

### 3. **Container Security**

- **Image Scanning**: Enable container scanning in CI/CD
- **Dependency Scanning**: Enable SAST and DAST
- **SBOM Generation**: Software Bill of Materials

### 4. **Network Security**

- **SSH Configuration**: Port 2222 (non-standard to avoid conflicts)
- **Firewall Rules**: Allow only necessary ports (80, 443, 22, 5050, etc.)
- **Internal Network**: Use Docker bridge network for inter-container communication

---

## ⚡ Performance Optimization

### 1. **PostgreSQL Tuning**

```ruby
postgresql['shared_buffers'] = '1GB'
postgresql['effective_cache_size'] = '2GB'
postgresql['work_mem'] = '16MB'
postgresql['maintenance_work_mem'] = '256MB'
postgresql['max_connections'] = 200
postgresql['max_worker_processes'] = 8
```

### 2. **Sidekiq Tuning**

```ruby
sidekiq['max_concurrency'] = 25
sidekiq['timeout'] = 3600
```

**Queue Priority Order:**
1. postgresql (database operations)
2. default
3. mailers
4. api
5. system_hook
6. webhook
7. gitlab_shell
8. import
9. export
10. repository
11. pages
12. chatops
13. ci
14. registry
15. service_desk

### 3. **Puma Tuning**

```ruby
puma['worker_processes'] = 2
puma['worker_timeout'] = 30
puma['worker_max_memory'] = 512
```

### 4. **Gitaly Tuning**

```ruby
gitaly['configuration'] = {
  'pack_objects_cache' => {
    'enabled' => true,
    'dir' => '/cache/gitlab/gitaly/pack-objects',
    'max_size' => '10.gb'
  }
}
```

---

## 📊 Monitoring & Observability

### 1. **Prometheus**

- **Enabled**: Yes
- **Port**: 9091
- **Scrape Interval**: 15 seconds
- **Scrape Timeout**: 5 seconds

**Metrics Available:**
- GitLab application metrics
- Database metrics
- Sidekiq metrics
- Runner metrics (port 9252)

### 2. **Grafana**

- **Enabled**: Yes
- **Port**: 3001
- **Admin Password**: Configured via `GRAFANA_ADMIN_PASSWORD`
- **Access URL**: `https://gitlab.hexastudio.net/grafana/`

**Recommended Dashboards:**
- GitLab Overview
- CI/CD Pipeline
- Runner Performance
- Database Performance

### 3. **Loki**

- **Port**: 3101
- **Purpose**: Log aggregation

---

## 🗑️ Retention & Cleanup Policies

### 1. **Backup Retention**

- **Duration**: 7 days (604800 seconds)
- **Storage**: Local filesystem + optional remote upload
- **Schedule**: Daily backups recommended

### 2. **Artifact Retention**

- **Maximum Size**: 100MB per job
- **Expiration**: 1 week (configurable per job)
- **Storage**: `/var/opt/gitlab/gitlab-rails/shared/artifacts`

### 3. **Job Trace Retention**

- **Maximum Size**: 10MB per job trace
- **Storage**: Database

### 4. **Registry Garbage Collection**

- **Enabled**: Yes
- **Policy**: Keep last 10 tags per repository
- **Schedule**: Daily

### 5. **Housekeeping**

- **Enabled**: Yes
- **Incremental**: Yes
- **Bitmap Cleanup**: Daily at 1 AM

---

## 🏃 Runner Configuration

### Runner Registration

```bash
docker exec -it hexa-gitlab-runner gitlab-runner register \
  --non-interactive \
  --url http://19.16.1.100:8929 \
  --registration-token <PROJECT_TOKEN> \
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

### Runner Configuration (config.toml)

```toml
[[runners]]
  name = "hexa-runner"
  url = "http://19.16.1.100:8929"
  token = "<RUNNER_TOKEN>"
  executor = "docker"
  [runners.docker]
    image = "docker:24-dind"
    privileged = true
    volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]
    network_mode = "hexa-gitlab-net"
    pull_policy = "if-not-present"
  [runners.cache]
    Dir = "/cache"
    Shared = true
  [runners.custom_build_dir]
    enabled = true
  [runners.docker.host]
    host = "unix:///var/run/docker.sock"
```

### Runner Settings

- **Concurrent Jobs**: 10 maximum
- **Check Interval**: 30 seconds
- **Output Limit**: 10MB
- **Tags**: docker, linux, hexa
- **Access Level**: Not protected
- **Locked**: No

---

## 🔧 Deployment Checklist

### Before Deployment

- [ ] Review and update `.env.gitlab` with actual values
- [ ] Generate `REGISTRY_HTTP_SECRET` (32 hex characters)
- [ ] Set `GITLAB_SMTP_*` variables for email notifications
- [ ] Set `GITLAB_ROOT_PASSWORD` or retrieve initial password
- [ ] Configure DNS: `gitlab.hexastudio.net` → `19.16.1.100`
- [ ] Configure DNS: `registry.gitlab.hexastudio.net` → `19.16.1.100`
- [ ] Open firewall ports: 80, 443, 22, 5050, 9091, 3001, 3101

### Deployment Steps

1. **Deploy GitLab**:
   ```bash
   docker compose -f docker-compose.gitlab.yml up -d
   ```

2. **Wait for Health**:
   ```bash
   docker exec hexa-gitlab curl -sf http://localhost/-/health
   ```

3. **Get Root Password**:
   ```bash
   docker exec hexa-gitlab cat /etc/gitlab/initial_root_password
   ```

4. **Deploy Runner**:
   ```bash
   docker compose -f docker-compose.gitlab-runner.yml up -d
   ```

5. **Register Runner**:
   ```bash
   bash scripts/register-gitlab-runner.sh
   ```

6. **Configure Instance**:
   ```bash
   bash scripts/configure-gitlab-best-settings.sh
   ```

### Post-Deployment

- [ ] Log in as root and change password
- [ ] Create HEXA Studio project
- [ ] Configure project CI/CD variables
- [ ] Set up protected branches
- [ ] Configure merge request approvals
- [ ] Test pipeline execution

---

## 🛠️ Troubleshooting

### Common Issues

#### 1. Docker Login Fails with HTTPS Error

**Error:**
```
Error response from daemon: Get "https://19.16.1.100:5050/v2/": http: server gave HTTP response to HTTPS client
```

**Solution:**
- Ensure Docker daemon is configured with insecure registry:
  ```json
  {"insecure-registries": ["19.16.1.100:5050"]}
  ```
- In CI jobs, use `--insecure-registry` flag with dind
- Set `DOCKER_TLS_CERTDIR=""` to disable TLS

#### 2. Runner Not Picking Up Jobs

**Check:**
```bash
docker logs -f hexa-gitlab-runner
docker exec hexa-gitlab-runner gitlab-runner list
docker exec hexa-gitlab-runner gitlab-runner status
```

**Solution:**
- Verify runner is registered
- Check runner tags match job tags
- Verify CI_SERVER_URL is correct
- Check Docker socket permissions

#### 3. Pipeline Stuck in Created State

**Check:**
```bash
# List all jobs
curl -H "PRIVATE-TOKEN: <PAT>" "http://19.16.1.100:8929/api/v4/projects/1/pipelines/<ID>/jobs"
```

**Solution:**
- Check if previous stage jobs failed
- Verify runner availability
- Check job dependencies

#### 4. GitLab Not Healthy

**Check:**
```bash
docker logs hexa-gitlab
docker exec hexa-gitlab curl -v http://localhost/-/health
```

**Solution:**
- Check resource usage (CPU, memory)
- Verify database connectivity
- Check disk space
- Review GitLab logs: `/var/log/gitlab`

---

## 📚 Additional Resources

- [GitLab Documentation](https://docs.gitlab.com/)
- [GitLab Runner Documentation](https://docs.gitlab.com/runner/)
- [GitLab Omnibus Configuration](https://docs.gitlab.com/omnibus/settings/configuration.html)
- [Docker Registry Configuration](https://docs.docker.com/registry/configuration/)

---

## 🔄 Maintenance Tasks

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

## 📞 Support

For issues with the GitLab configuration:

1. Check this documentation
2. Review logs: `docker logs hexa-gitlab`
3. Check runner logs: `docker logs hexa-gitlab-runner`
4. Consult GitLab documentation
5. Contact HEXA Studio DevOps team

---

*Last updated: August 10, 2026*
*Version: 1.0*
