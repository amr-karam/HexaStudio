# Odoo Document Integration

**Last Updated:** 2026-07-08

---

## Overview

Document management spans Odoo Documents and MinIO. Odoo manages metadata and access control; MinIO stores the actual files.

## Architecture

```
File Upload
    │
    ▼
NestJS
    │
    ├── Upload to MinIO (S3-compatible)
    ├── Create document record in Odoo (metadata + MinIO URL)
    └── Create link to project (many2many)
            │
            ▼
MinIO stores file
    │
    └── Signed URL for download (expiring)
```

## Document Types

| Type | Extension | Max Size | Storage | Client Accessible |
|------|-----------|----------|---------|------------------|
| Render Image | PNG, JPG, WebP | 50MB | MinIO | Yes |
| 3D Model | GLB | 500MB | MinIO | No |
| CAD File | DWG, DXF | 200MB | MinIO | No |
| Document | PDF, DOCX | 25MB | MinIO | Yes |
| Presentation | PPT, KEY | 100MB | MinIO | Yes |
| Spreadsheet | XLSX | 25MB | MinIO | No |

## Odoo Document Model

```xml
<record id="hexa_document" model="documents.document">
  <field name="name">Living_Room_Render_01.png</field>
  <field name="type">binary</field>
  <field name="mimetype">image/png</field>
  <field name="file_size">2450000</field>
  <field name="x_hexa_storage">minio</field>
  <field name="x_hexa_storage_path">projects/uuid/living-room-01.png</field>
  <field name="x_hexa_client_accessible">True</field>
  <field name="x_hexa_project_id" ref="project.project_42"/>
  <field name="partner_id" ref="res.partner_15"/>
</record>
```

## MinIO Bucket Structure

```
hexa-studio/
├── projects/
│   └── {project-uuid}/
│       ├── renders/
│       ├── models/
│       ├── documents/
│       └── client-uploads/
├── cms/
│   ├── projects/
│   ├── blog/
│   └── services/
├── users/
│   └── {user-uuid}/
│       └── avatars/
└── temp/
    └── uploads/
```

## Signed URL Generation

```typescript
async function getDownloadUrl(filePath: string, expiresIn = 3600): Promise<string> {
  const client = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
  });

  return client.presignedGetObject('hexa-studio', filePath, expiresIn);
}
```

## Quality Gate

- All files have matching records in Odoo and MinIO
- Download URLs expire after 1 hour
- File type validation on upload
- Max file size enforced (100MB for client uploads)
- Virus scanning on upload (ClamAV integration planned)
