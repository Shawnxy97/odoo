from odoo import models, fields

class ResPartner(models.Model):
    _inherit = 'res.partner'

    organization_level = fields.Selection(
        selection=[('developer', 'Developer'), ('builder', 'Builder'), ('site', 'Site')],
        string='Organization Level',
        help='Specify the level of the organization'
    )


