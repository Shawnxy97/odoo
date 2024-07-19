from odoo import api, fields, models

class Jobs(models.Model):
    _name = "amg.jobs"
    _inherit = ['mail.thread']
    _description = "Data Entry/Jobs"

    name = fields.Char(string="Name", required=True)
    project_id = fields.Many2one(string="Project", comodel_name="amg.projects")
    job_status = fields.Selection([
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('complete', 'Complete'),
    ], string="Status")


