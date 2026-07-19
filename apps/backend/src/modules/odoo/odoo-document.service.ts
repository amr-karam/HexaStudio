import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MinioService } from '../storage/minio.service';
import { RedisService } from '../storage/redis.service';

export interface OdooDocumentRecord {
  id: string;
  name: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  projectId: number;
  createdAt: string;
  downloadUrl?: string;
}

const DOCUMENTS_BUCKET = 'portal';
const DOCUMENTS_PREFIX = 'odoo-documents';
const DOCUMENTS_REDIS_PREFIX = 'portal:documents';
const DOCUMENTS_INDEX_KEY = `${DOCUMENTS_REDIS_PREFIX}:index`;

@Injectable()
export class OdooDocumentService {
  private readonly logger = new Logger(OdooDocumentService.name);

  constructor(
    private readonly minioService: MinioService,
    private readonly redisService: RedisService,
  ) {}

  private documentRedisKey(projectId: string): string {
    return `${DOCUMENTS_REDIS_PREFIX}:${projectId}`;
  }

  /**
   * Upload a file to MinIO and store metadata in Redis.
   * Backwards-compatible with Odoo Community (no documents.document model).
   */
  async uploadAndLink(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    projectId: number,
  ): Promise<OdooDocumentRecord> {
    const docId = randomUUID();
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectPath = `${DOCUMENTS_PREFIX}/project-${projectId}/${timestamp}-${safeName}`;

    await this.minioService.uploadFile(DOCUMENTS_BUCKET, objectPath, file.buffer, {
      'Content-Type': file.mimetype,
    });
    this.logger.log(`Uploaded ${safeName} to MinIO bucket=${DOCUMENTS_BUCKET} path=${objectPath}`);

    const record: OdooDocumentRecord = {
      id: docId,
      name: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath: objectPath,
      projectId,
      createdAt: new Date().toISOString(),
    };

    await this.redisService.hset(this.documentRedisKey(String(projectId)), docId, record);
    await this.redisService.hset(DOCUMENTS_INDEX_KEY, docId, String(projectId));
    return record;
  }

  /**
   * Get all documents linked to a project, with MinIO signed URLs.
   */
  async getProjectDocuments(projectId: number): Promise<OdooDocumentRecord[]> {
    const key = this.documentRedisKey(String(projectId));
    const docsMap = await this.redisService.hgetall<OdooDocumentRecord>(key);
    const docs = Object.values(docsMap);

    const result: OdooDocumentRecord[] = [];
    for (const doc of docs) {
      let downloadUrl = '';
      try {
        downloadUrl = doc.filePath
          ? await this.minioService.getPresignedDownloadUrl(DOCUMENTS_BUCKET, doc.filePath, 3600)
          : '';
      } catch {
        this.logger.warn(`Failed to generate signed URL for ${doc.filePath}`);
      }

      result.push({
        ...doc,
        downloadUrl,
      });
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }

  /**
   * Delete a document from MinIO and its metadata from Redis.
   */
  async deleteDocument(projectId: number, documentId: string): Promise<void> {
    const key = this.documentRedisKey(String(projectId));
    const docsMap = await this.redisService.hgetall<OdooDocumentRecord>(key);
    const doc = docsMap[documentId];
    if (!doc) {
      throw new NotFoundException(`Document ${documentId} not found for project ${projectId}`);
    }

    try {
      await this.minioService.deleteFile(DOCUMENTS_BUCKET, doc.filePath);
      this.logger.log(`Deleted file portal/${doc.filePath} from MinIO`);
    } catch (err) {
      this.logger.warn(`Failed to delete file from MinIO: ${err}`);
    }

    await this.redisService.hdel(key, documentId);
    await this.redisService.hdel(DOCUMENTS_INDEX_KEY, documentId);
  }

  /**
   * Get a signed download URL for a specific document.
   */
  async getSignedUrl(documentId: string): Promise<string> {
    const projectId = await this.redisService.hgetall<string>(DOCUMENTS_INDEX_KEY);
    if (!projectId[documentId]) {
      throw new NotFoundException(`Document ${documentId} not found`);
    }

    const docsMap = await this.redisService.hgetall<OdooDocumentRecord>(
      this.documentRedisKey(projectId[documentId]),
    );
    const doc = docsMap[documentId];
    if (!doc?.filePath) {
      throw new NotFoundException(`Document ${documentId} has no file path`);
    }

    return this.minioService.getPresignedDownloadUrl(DOCUMENTS_BUCKET, doc.filePath, 3600);
  }
}
