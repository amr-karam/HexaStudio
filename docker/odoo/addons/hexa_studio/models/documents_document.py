from odoo import fields, models


class DocumentsDocument(models.Model):
    """Extend Odoo's documents.document with HEXA MinIO bridge fields."""

    _inherit = "documents.document"

    x_hexa_minio_path = fields.Char(
        string="MinIO Object Path",
        help="Full object path in the MinIO bucket",
    )
    x_hexa_minio_bucket = fields.Char(
        string="MinIO Bucket",
        help="MinIO bucket where the file is stored",
    )
    x_hexa_project_id = fields.Integer(
        string="HEXA Project ID",
        help="HEXA Vision platform project identifier",
    )
    x_hexa_file_size = fields.Integer(
        string="File Size (bytes)",
        help="Original file size in bytes",
    )
    x_hexa_mime_type = fields.Char(
        string="MIME Type",
        help="MIME type of the uploaded file",
    )
