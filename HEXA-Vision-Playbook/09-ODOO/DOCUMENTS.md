# Documents

**Last Updated:** 2026-07-16

---

## Architecture

Files live in MinIO (`hexa-studio` bucket); Odoo `documents.document` holds the
metadata + access control. The NestJS `StorageModule` is the upload path.

| Type | Extension | Max Size | Client Accessible |
|------|-----------|----------|-------------------|
| Render Image | PNG, JPG, WebP | 50MB | Yes |
| 3D Model | GLB | 500MB | No |
| CAD File | DWG, DXF | 200MB | No |
| Document | PDF, DOCX | 25MB | Yes |
| Presentation | PPT, KEY | 100MB | Yes |
| Spreadsheet | XLSX | 25MB | No |

## Custom Fields (planned on `documents.document`)

| Field | Purpose |
|-------|---------|
| `x_hexa_storage` | minio / odoo |
| `x_hexa_storage_path` | object key in MinIO |
| `x_hexa_client_accessible` | portal visibility |
| `x_hexa_project_id` | link to `project.project` |

## Signed URLs

Downloads use MinIO presigned GET URLs (1h expiry) generated in `StorageModule`.
Client uploads land in `projects/{uuid}/client-uploads/`.
