import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OdooService } from './odoo.service';
import { MinioService } from '../storage/minio.service';

export interface OdooDocumentRecord {
  id: number;
  name: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  projectId: number;
  createdAt: string;
}

const DOCUMENTS_BUCKET = 'uploads';
const DOCUMENTS_PREFIX = 'odoo-documents';

@Injectable()
export class OdooDocumentService {
  private readonly logger = new Logger(OdooDocumentService.name);

  constructor(
    private readonly odooService: OdooService,
    private readonly minioService: MinioService,
  ) {}

  /**
   * Upload a file to MinIO and create a linked document record in Odoo.
   */
  async uploadAndLink(
    file: { buffer: Buffer; originalName: string; mimetype: string; size: number },
    projectId: number,
  ): Promise<OdooDocumentRecord> {
    // 1. Upload to MinIO
    const timestamp = Date.now();
    const safeName = file.originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectPath = `${DOCUMENTS_PREFIX}/project-${projectId}/${timestamp}-${safeName}`;

    await this.minioService.uploadFile(DOCUMENTS_BUCKET, objectPath, file.buffer, {
      'Content-Type': file.mimetype,
    });
    this.logger.log(`Uploaded ${safeName} to MinIO bucket=${DOCUMENTS_BUCKET} path=${objectPath}`);

    // 2. Create document record in Odoo
    try {
      const docId = await this.odooService.create('documents.document', {
        name: file.originalName,
        x_hexa_minio_path: objectPath,
        x_hexa_minio_bucket: DOCUMENTS_BUCKET,
        x_hexa_project_id: projectId,
        x_hexa_file_size: file.size,
        x_hexa_mime_type: file.mimetype,
      });

      return {
        id: docId,
        name: file.originalName,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: objectPath,
        projectId,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      this.logger.error(`Failed to create Odoo document record: ${err}`);
      // File is in MinIO but Odoo record failed — return partial info
      return {
        id: 0,
        name: file.originalName,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: objectPath,
        projectId,
        createdAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Get all documents linked to a project, with MinIO signed URLs.
   */
  async getProjectDocuments(projectId: number): Promise<(OdooDocumentRecord & { downloadUrl: string })[]> {
    const docs = await this.odooService.execute<Record<string, unknown>[]>(
      'documents.document',
      'search_read',
      [
        [['x_hexa_project_id', '=', projectId]],
        ['id', 'name', 'x_hexa_minio_path', 'x_hexa_minio_bucket', 'x_hexa_file_size', 'x_hexa_mime_type', 'create_date'],
        0, 100,
        'create_date desc',
      ],
    );

    const result: (OdooDocumentRecord & { downloadUrl: string })[] = [];
    for (const doc of docs) {
      const filePath = (doc.x_hexa_minio_path as string) || '';
      const bucket = (doc.x_hexa_minio_bucket as string) || DOCUMENTS_BUCKET;
      let downloadUrl = '';
      try {
        downloadUrl = filePath
          ? await this.minioService.getPresignedDownloadUrl(bucket, filePath, 3600)
          : '';
      } catch {
        this.logger.warn(`Failed to generate signed URL for ${filePath}`);
      }

      result.push({
        id: doc.id as number,
        name: (doc.name as string) || 'Unknown',
        mimeType: (doc.x_hexa_mime_type as string) || 'application/octet-stream',
        fileSize: (doc.x_hexa_file_size as number) || 0,
        filePath,
        projectId,
        createdAt: (doc.create_date as string) || '',
        downloadUrl,
      });
    }

    return result;
  }

  /**
   * Get a signed download URL for a specific document.
   */
  async getSignedUrl(documentId: number): Promise<string> {
    const results = await this.odooService.execute<Record<string, unknown>[]>(
      'documents.document',
      'search_read',
      [
        [['id', '=', documentId]],
        ['x_hexa_minio_path', 'x_hexa_minio_bucket'],
      ],
    );

    if (!results.length) throw new NotFoundException(`Document #${documentId} not found`);

    const filePath = (results[0].x_hexa_minio_path as string) || '';
    const bucket = (results[0].x_hexa_minio_bucket as string) || DOCUMENTS_BUCKET;

    if (!filePath) throw new NotFoundException(`No file path for document #${documentId}`);

    return this.minioService.getPresignedDownloadUrl(bucket, filePath, 3600);
  }
}
