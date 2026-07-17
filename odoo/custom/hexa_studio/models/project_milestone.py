from odoo import fields, models


class ProjectMilestone(models.Model):
    _inherit = "project.milestone"

    x_hexa_client_viewable = fields.Boolean(
        string="Visible in Client Portal",
        default=True,
    )
    x_hexa_description = fields.Text(string="HEXA Description")
    x_hexa_order = fields.Integer(string="HEXA Display Order", default=10)
