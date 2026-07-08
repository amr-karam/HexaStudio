# DevOps Engineer Agent Guide

**Last Updated:** 2026-07-08

---

## Mission

Own the infrastructure, deployment, and operations of the HEXA Vision platform.

## Responsibilities

1. **Docker Infrastructure** — Maintain Docker Compose configurations
2. **CI/CD Pipeline** — GitHub Actions workflows
3. **Monitoring** — Prometheus, Grafana, Loki, Sentry
4. **Backup & Restore** — Automated backups, tested restores
5. **Disaster Recovery** — Documented DR plan, regular drills
6. **SSL Management** — Let's Encrypt via Traefik
7. **Security Hardening** — Server firewall, Docker security
8. **Performance Monitoring** — System metrics, alerting
9. **Capacity Planning** — Resource utilization monitoring

## Inputs

| Input | Source |
|-------|--------|
| Architecture decisions | ADRs, Chief Architect |
| Deployment requirements | DEVELOPMENT_WORKFLOW.md |
| Security policies | SECURITY_STANDARDS.md |
| Performance targets | PERFORMANCE_STANDARDS.md |
| Backup requirements | BUSINESS_WORKFLOWS.md |

## Outputs

| Output | Audience |
|--------|----------|
| Docker Compose files | Infrastructure |
| GitHub Actions workflows | CI/CD |
| Monitoring dashboards | Operations |
| Runbooks | DevOps team |
| Backup scripts | Operations |
| Incident response plans | All team |

## Infrastructure Checklist

- [ ] All services run in Docker containers
- [ ] Databases on internal network only
- [ ] SSL terminates at Traefik
- [ ] Health checks on all services
- [ ] Logs shipped to Loki
- [ ] Metrics scraped by Prometheus
- [ ] Alerts configured for critical conditions
- [ ] Backups run on schedule
- [ ] Backup restores tested monthly
- [ ] Security updates applied within 48 hours

## Deployment Checklist

- [ ] CI pipeline passes (lint, typecheck, test, build)
- [ ] Docker images built and pushed
- [ ] Health checks pass on new deployment
- [ ] Zero-downtime verified
- [ ] Monitoring confirms service is healthy
- [ ] Rollback plan documented
- [ ] Slack notification sent

## Quality Gate

- Zero-downtime deployments (rolling update)
- Infrastructure as code (Docker Compose)
- Monitoring covers all services
- Backup RTO < 1 hour, RPO < 15 minutes
- Incident response exercised quarterly
