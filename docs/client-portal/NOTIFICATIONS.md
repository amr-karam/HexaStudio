# 🔔 CLIENT NOTIFICATION & REALTIME ALERT SPECIFICATIONS

**Version:** 1.0.0 | **Scope:** Client Alerts | **Standard:** Real-Time Push & Email Notifications

---

## 1. OVERVIEW & CHANNELS

The Notification module manages real-time alerts across 3 delivery channels:
1. **In-App Toast & Header Center**: WebSocket push via `RealtimeGateway`.
2. **Email Alerts**: Automatic HTML emails dispatched by NestJS `EmailAssistant`.
3. **Slack Webhooks**: Internal notifications dispatched to firm management.

---

## 2. NOTIFICATION PREFERENCE TOGGLES

Clients can customize notification frequency in portal settings (`/portal/settings`):
- Immediate email on milestone deliverable upload.
- Daily summary digest of team comments.

---

## 3. RELATED DOCUMENTATION

- [CLIENT_PORTAL.md](.docs/client-portal/CLIENT_PORTAL.md) — Portal architecture.
- [EMAIL_ASSISTANT.md](.docs/ai/EMAIL_ASSISTANT.md) — Email assistant.
