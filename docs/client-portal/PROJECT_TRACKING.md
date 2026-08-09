# 🎯 PROJECT TRACKING & VISIBILITY SPECIFICATIONS

**Version:** 1.0.0 | **Scope:** Project Visibility | **Standard:** Real-Time Milestone Visibility

---

## 1. OVERVIEW & FEATURES

The Project Tracking module (`/portal/projects/:id`) presents clients with an at-a-glance dashboard of their active architectural project, current stage progress, assigned team members, and action items.

---

## 2. REAL-TIME DATA SYNC

- Project stage updates in Odoo ERP trigger WebSocket events via NestJS `RealtimeGateway`.
- Frontend updates progress bars and current phase labels dynamically without requiring page refreshes.

---

## 3. RELATED DOCUMENTATION

- [CLIENT_PORTAL.md](CLIENT_PORTAL.md)) — Portal strategy.
- [TIMELINE.md](TIMELINE.md)) — Timeline visualization.
