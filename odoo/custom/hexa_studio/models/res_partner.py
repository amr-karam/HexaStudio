from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    x_hexa_client = fields.Boolean(
        string="HEXA Client",
        default=False,
        help="Is this contact a HEXA Studio client?",
    )
    x_hexa_source = fields.Selection(
        [
            ("website", "Website"),
            ("referral", "Referral"),
            ("direct", "Direct"),
        ],
        string="HEXA Source",
    )
    x_hexa_website_user_id = fields.Integer(
        string="HEXA Website User ID",
        help="Link to the application user record",
    )
    x_hexa_project_ids = fields.One2many(
        "project.project",
        "partner_id",
        string="HEXA Projects",
    )
