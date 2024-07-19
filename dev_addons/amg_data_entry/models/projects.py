from odoo import api, fields, models


class Projects(models.Model):
    _name = "amg.projects"
    _inherit = ['mail.thread']
    _description = "Data Entry / Projects"

    # Project / Account Info Fields
    name = fields.Char(string="Name", required=True)

    builder = fields.Char(string="Builder")

    project_type = fields.Selection([
        ('High Rise', 'High Rise'),
        ('Low Rise', 'Low Rise'),
        ('Custom', 'Custom'),
    ], index=True, string="Project Type", required=True, tracking=True)

    install_type = fields.Selection([
        ('5 Days', '5 Days'),
        ('7 Days', '7 Days'),
        ('10 Days', '10 Days'),
    ], string="Install Type", required=True)

    project_location = fields.Selection([
        ('North', 'North'),
        ('East', 'East'),
        ('South', 'South'),
        ('West', 'West'),
    ], string="Project Location")

    fabricator = fields.Selection([
        ('AMG', 'AMG'),
        ('Other', 'Other'),
    ], string="Fabricator", required=True)

    job_ids = fields.One2many('amg.jobs', string="Job List", inverse_name="project_id")




