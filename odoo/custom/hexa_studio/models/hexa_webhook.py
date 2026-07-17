import hmac
import hashlib
import json
import logging
from datetime import date, datetime

from odoo import models, fields, api

_logger = logging.getLogger(__name__)


class HexaWebhookConfig(models.Model):
    _name = "hexa.webhook.config"
    _description = "HEXA BFF Webhook Configuration"

    name = fields.Char(required=True)
    url = fields.Char(required=True)
    secret = fields.Char(required=True)
    active = fields.Boolean(default=True)


class HexaWebhook(models.Model):
    _name = "hexa.webhook"
    _description = "HEXA Webhook Dispatcher"

    @api.model
    def dispatch(self, record, action):
        """Called by Odoo automated actions. Posts a signed payload to the BFF."""
        configs = self.env["hexa.webhook.config"].search([("active", "=", True)])
        model = record._name
        payload = {
            "model": model,
            "id": record.id,
            "action": action,
            "data": self._serialize(record),
        }
        body = json.dumps(payload, default=str).encode("utf-8")
        for config in configs:
            try:
                signature = hmac.new(
                    config.secret.encode("utf-8"), body, hashlib.sha256
                ).hexdigest()
                self.env["hexa.webhook.log"].create(
                    {
                        "config_id": config.id,
                        "model": model,
                        "record_id": record.id,
                        "action": action,
                        "state": "pending",
                    }
                )
                # Fire-and-forget: rely on Odoo's out-of-band HTTP via urllib.
                self._post(config.url, body, signature)
            except Exception as exc:  # noqa: BLE001
                _logger.error("HEXA webhook dispatch failed: %s", exc)

    @api.model
    def ping_bff(self):
        """Scheduled sync ping so the BFF re-pulls recent changes."""
        configs = self.env["hexa.webhook.config"].search([("active", "=", True)])
        body = json.dumps({"model": "sync", "id": 0, "action": "sync"}).encode("utf-8")
        for config in configs:
            signature = hmac.new(
                config.secret.encode("utf-8"), body, hashlib.sha256
            ).hexdigest()
            self._post(config.url, body, signature)

    def _post(self, url, body, signature):
        import urllib.request

        req = urllib.request.Request(
            url,
            data=body,
            headers={
                "Content-Type": "application/json",
                "X-Odoo-Signature": signature,
            },
        )
        urllib.request.urlopen(req, timeout=10)

    def _serialize(self, record):
        try:
            fields = list(record._fields.keys())
            data = record.read(fields)[0]
            for k, v in list(data.items()):
                if isinstance(v, (datetime, date)):
                    data[k] = v.isoformat()
                elif isinstance(v, bytes):
                    data[k] = v.decode("utf-8", errors="replace")
            return data
        except Exception:
            return {}
