from odoo import fields, models


class CrmLead(models.Model):
    _inherit = "crm.lead"

    x_hexa_source = fields.Selection(
        [
            ("website", "Website"),
            ("referral", "Referral"),
            ("direct", "Direct"),
        ],
        string="HEXA Source",
    )
    x_hexa_service = fields.Selection(
        [
            ("residential", "Residential"),
            ("commercial", "Commercial"),
            ("interior", "Interior"),
        ],
        string="HEXA Service",
    )
    x_hexa_budget = fields.Selection(
        [
            ("under_50k", "Under $50K"),
            ("50k_100k", "$50K - $100K"),
            ("100k_500k", "$100K - $500K"),
            ("500k_plus", "$500K+"),
        ],
        string="HEXA Budget",
    )
    x_hexa_referral_code = fields.Char(string="HEXA Referral Code")
    x_hexa_website_contact_id = fields.Char(string="HEXA Website Contact ID")
