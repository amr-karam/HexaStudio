from odoo import fields, models


class HexaWebhookLog(models.Model):
    _name = "hexa.webhook.log"
    _description = "HEXA Webhook Delivery Log"
    _order = "create_date desc"

    config_id = fields.Many2one("hexa.webhook.config", string="Config")
    model = fields.Char(string="Model")
    record_id = fields.Integer(string="Record ID")
    action = fields.Char(string="Action")
    state = fields.Char(string="State", default="pending")
    response = fields.Text(string="Response")
    create_date = fields.Datetime(string="Created", readonly=True)
