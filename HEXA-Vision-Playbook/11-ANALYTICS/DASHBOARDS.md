# 🖥️ GRAFANA & ANALYTICS DASHBOARD CONFIGURATION

**Version:** 1.0.0 | **Scope:** Grafana Dashboards | **Standard:** RED & USE Dashboard Specifications

---

## 1. OVERVIEW & PANELS

Grafana (`docker/grafana/provisioning/dashboards/`) hosts pre-configured dashboards for monitoring applications, databases, and business KPIs.

---

## 2. CORE DASHBOARDS

1. **`backend-red.json`**: NestJS BFF API Rate, Errors, and Duration (p50, p95, p99).
2. **`infra-overview.json`**: CPU, Memory, Disk I/O, Network traffic across Docker containers.
3. **`web-vitals.json`**: Real User Monitoring (RUM) Core Web Vitals metrics.

---

## 3. RELATED DOCUMENTATION

- [MONITORING.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/13-DEVOPS/MONITORING.md) — Monitoring setup.
