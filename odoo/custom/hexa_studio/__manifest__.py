{
    "name": "HEXA Studio Integration",
    "summary": "Custom fields, webhooks and automations bridging Odoo 18 to the HEXA Vision platform",
    "version": "18.0.1.0.0",
    "category": "Custom",
    "author": "HEXA Studio",
    "website": "https://hexastudio.net",
    "depends": [
        "base",
        "crm",
        "sale",
        "project",
        "account",
        "contacts",
        "base_automation",
        "documents"
    ],
    "data": [
        "security/ir.model.access.csv",
        "data/ir_cron.xml",
        "data/automated_actions.xml",
        "data/webhook_config.xml"
    ],
    "installable": True,
    "application": False,
    "auto_install": False,
    "license": "LGPL-3"
}
