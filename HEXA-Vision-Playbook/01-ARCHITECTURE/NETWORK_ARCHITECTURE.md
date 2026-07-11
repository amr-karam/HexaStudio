# 🌐 NETWORK ARCHITECTURE: DNS MAPPING

This document serves as the Single Source of Truth (SSOT) for the HEXA Studio domain ecosystem.

## 1. SUBDOMAIN REGISTRY

| Subdomain | Service | Description |
|-----------|---------|-------------|
| `hexastudio.net` | **Website** | Main landing page & Public Portfolio |
| `odoo.hexastudio.net` | **Odoo ERP** | Enterprise Resource Planning & Business Logic |
| `hub.hexastudio.net` | **Comm Hub** | Internal/Client communication gateway |
| `api.hexastudio.net` | **Backend API** | NestJS BFF / Orchestration Layer |
| `cms.hexastudio.net` | **CMS** | Strapi 5 Headless CMS |
| `docs.hexastudio.net` | **Docs** | Project Playbook & Technical Documentation |
| `status.hexastudio.net` | **Status** | Real-time system health & incident reports |
| `monitor.hexastudio.net` | **Monitoring** | Grafana / Prometheus Observability |
| `uptime.hexastudio.net` | **Uptime** | Uptime Kuma heartbeat monitoring |
| `ai.hexastudio.net` | **AI Services** | Dedicated LLM & Agent endpoints |
| `auth.hexastudio.net` | **Auth** | Centralized Identity & Access Management |
| `files.hexastudio.net` | **Storage** | MinIO S3 Compatible Object Storage |
| `analytics.hexastudio.net` | **BI** | Business Intelligence & Data Dashboards |

## 2. TRAEFIK ROUTING LOGIC

All traffic is routed through Traefik v3 using the following logic:
- **TLS Termination**: ACME/Let's Encrypt via Cloudflare DNS challenge.
- **Path-Based Routing**: Applied to `api.hexastudio.net` for versioning (`/v1/`, `/v2/`).
- **Internal Network**: Subdomains are mapped to Docker service names internally (e.g., `cms.hexastudio.net` $\rightarrow$ `cms:1337`).

## 3. SECURITY POLICIES

- **WAF**: Cloudflare WAF protects all public endpoints.
- **CORS**: Restricted to `https://hexastudio.net` and `https://*.hexastudio.net`.
- **Rate Limiting**: Applied at the Edge (Cloudflare) and the BFF (`api.hexastudio.net`).
