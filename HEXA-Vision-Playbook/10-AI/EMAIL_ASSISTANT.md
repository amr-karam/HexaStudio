# ✉️ EMAIL ASSISTANT SPECIFICATION & AGENT ROLE

**Version:** 1.0.0 | **Scope:** Email Communication Agent | **Standard:** Automated Contextual Email Generation

---

## 1. ROLE & OBJECTIVES

The **Email Assistant** (`email-assistant.service.ts`) drafts client onboarding emails, project delivery notifications, milestone update alerts, and handles automated follow-up sequences.

---

## 2. AGENT CAPABILITIES & TOOL REGISTRY

- **`draft_welcome_email`**: Generates portal credentials & onboarding guide email for new clients.
- **`draft_milestone_notification`**: Creates clear notification email when a 3D visual render is ready for review.
- **`draft_inquiry_response`**: Drafts immediate warm response to website contact form submissions.

---

## 3. API ENDPOINTS

```
POST /api/v1/assistants/email/draft — Generate structured HTML/text email body
```

---

## 4. RELATED DOCUMENTATION

- [EMAIL.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/09-ODOO/EMAIL.md) — Odoo email integration.
- [NOTIFICATIONS.md](file:///c:/Users/amrmo/OneDrive/Desktop/hexastudio.net/HEXA-Vision-Playbook/12-CLIENT-PORTAL/NOTIFICATIONS.md) — Notification systems.
