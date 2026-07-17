# Email

**Last Updated:** 2026-07-16

---

## Outbound

Odoo sends transactional email (lead acknowledgements, invoice reminders) via its
built-in mail gateway. The NestJS BFF additionally dispatches notifications
through the Webhook Dispatcher (Slack) on `odoo:lead` / `odoo:invoice` events.

## Inbound

Contact-form submissions are captured by `ContactService`, written to Odoo as
`crm.lead`, and trigger the standard Odoo email sequence if configured.

## Configuration

Set Odoo `email_from`, SMTP relay, and catch-all in the Odoo mail settings.
The webhook secret for BFF callbacks lives in `data/webhook_config.xml`
(`__ODOO_WEBHOOK_SECRET__` → replaced by `ODOO_WEBHOOK_SECRET` at deploy).
