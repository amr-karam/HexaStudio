{
    'name': 'HEXA Studio Custom Module',
    'version': '1.0.0',
    'category': 'Sales/CRM',
    'summary': 'HEXA Studio automations, custom fields, and webhook integration',
    'description': """
        Custom Odoo module for HEXA Studio.
        - Adds custom fields (x_hexa_*) on res.partner, crm.lead, project.project, project.milestone
        - Lead-to-project onboarding automation
        - Milestone completion workflows
        - Email templates for client communication
        - Webhook integration with HEXA Hub backend
    """,
    'author': 'HEXA Studio',
    'website': 'https://hexastudio.net',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'crm',
        'project',
        'sale_management',
        'account',
        'mail',
    ],
    'data': [
        'security/ir.model.access.csv',
        'data/onboarding_workflow.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
