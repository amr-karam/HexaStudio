from odoo import fields, models


class ProjectProject(models.Model):
    _inherit = "project.project"

    x_slug = fields.Char(
        string="HEXA Slug",
        index=True,
        help="URL slug linking this project to the website portfolio",
    )
    x_hexa_type = fields.Selection(
        [
            ("residential", "Residential"),
            ("commercial", "Commercial"),
            ("interior", "Interior"),
            ("urban", "Urban"),
        ],
        string="HEXA Project Type",
    )
    x_hexa_status = fields.Selection(
        [
            ("inquiry", "Inquiry"),
            ("consultation", "Consultation"),
            ("proposal", "Proposal"),
            ("active", "Active"),
            ("on_hold", "On Hold"),
            ("completed", "Completed"),
            ("archived", "Archived"),
        ],
        string="HEXA Project Status",
        default="inquiry",
    )
    x_hexa_client_portal_active = fields.Boolean(
        string="Visible in Client Portal",
        default=False,
    )
    x_hexa_budget_amount = fields.Float(
        string="HEXA Budget Amount",
        digits="Account",
    )
    x_hexa_milestone_ids = fields.One2many(
        "project.milestone",
        "project_id",
        string="HEXA Milestones",
    )
