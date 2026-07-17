{
    "name": "HEXA Studio Integration",
    "summary": "Custom fields, webhooks and automations bridging Odoo 17 to the HEXA Vision platform",
    "version": "17.0.1.0.0",
    "category": "Custom",
    "author": "HEXA Studio",
    "website": "https://hexastudio.net",
    "depends": [
        "base",
        "crm",
        "sale",
        "project",
        "account",
        "contacts"
    ],
    "external_dependencies": {
        "python": []
    },
    "data": [
        "security/ir.model.access.csv",
        "data/ir_cron.xml",
        "data/automated_actions.xml",
        "data/webhook_config.xml"
    ],
    "installable": true,
    "application": false,
    "auto_install": false
}
