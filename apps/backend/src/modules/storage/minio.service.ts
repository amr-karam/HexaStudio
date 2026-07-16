import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { getEnv } from '../../config/env';
import { extname } from 'path';

export interface FileInfo {
  name: string;
  size: number;
  lastModified: Date | null;
}

interface MinioClient {
  presignedGetObject(bucket: string, objectName: string, expiry: number): Promise<string>;
  presignedPutObject(bucket: string, objectName: string, expiry: number): Promise<string>;
  putObject(bucket: string, objectName: string, stream: Buffer, size?: number, metadata?: Record<string, string>): Promise<void>;
  removeObject(bucket: string, objectName: string): Promise<void>;
  listObjects(bucket: string, prefix?: string, recursive?: boolean): AsyncIterable<{ name?: string; size?: number; lastModified?: Date }>;
}

const MIME_MAP: Record<string, string> = {
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.hdr': 'application/octet-stream',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

const ALLOWED_BUCKETS = ['uploads', 'models', 'textures', 'videos', 'hdr', 'backups'] as const;

const MULTIPART_THRESHOLD = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class MinioService {
  private client: MinioClient;
  private readonly logger = new Logger(MinioService.name);

  constructor() {
    const env = getEnv();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Minio = require('minio');
    this.client = new Minio.Client({
      endPoint: env.MINIO_HOST,
      port: env.MINIO_PORT,
      useSSL: env.MINIO_USE_SSL,
      accessKey: env.MINIO_ROOT_USER,
      secretKey: env.MINIO_ROOT_PASSWORD,
    });
  }

  private validateBucket(bucket: string): void {
    if (!ALLOWED_BUCKETS.includes(bucket as typeof ALLOWED_BUCKETS[number])) {
      throw new InternalServerErrorException(
        `Bucket "${bucket}" is not allowed. Allowed: ${ALLOWED_BUCKETS.join(', ')}`,
      );
    }
  }

  private validatePath(path: string): void {
    if (path.includes('..') || path.includes('//') || path.startsWith('/')) {
      throw new InternalServerErrorException('Invalid path: path traversal detected');
    }
  }

  async getPresignedDownloadUrl(
    bucket: string,
    objectName: string,
    expiry: number = 3600,
  ): Promise<string> {
    this.validateBucket(bucket);
    this.validatePath(objectName);
    const boundedExpiry = Math.min(Math.max(expiry, 60), 86400); // 1min to 24hrs
    return this.client.presignedGetObject(bucket, objectName, boundedExpiry);
  }

  async getPresignedUploadUrl(
    bucket: string,
    objectName: string,
    expiry: number = 3600,
  ): Promise<string> {
    this.validateBucket(bucket);
    this.validatePath(objectName);
    const boundedExpiry = Math.min(Math.max(expiry, 60), 86400);
    return this.client.presignedPutObject(bucket, objectName, boundedExpiry);
  }

  async uploadFile(
    bucket: string,
    objectName: string,
    buffer: Buffer,
    metadata?: Record<string, string>,
  ): Promise<string> {
    this.validateBucket(bucket);
    this.validatePath(objectName);

    // Auto-detect content-type from file extension if not provided
    const finalMetadata = { ...metadata };
    if (!finalMetadata['Content-Type'] && !finalMetadata['content-type']) {
      const ext = extname(objectName).toLowerCase();
      const contentType = MIME_MAP[ext] || 'application/octet-stream';
      finalMetadata['Content-Type'] = contentType;
    }

    // Use chunked upload for large files (>5MB) to avoid memory issues
    if (buffer.length > MULTIPART_THRESHOLD) {
      return this.uploadChunked(bucket, objectName, buffer, finalMetadata);
    }

    await this.client.putObject(bucket, objectName, buffer, undefined, finalMetadata);
    return objectName;
  }

  /**
   * Chunked upload for large files.
   * Splits the buffer into parts and uploads sequentially to avoid high memory usage.
   */
  private async uploadChunked(
    bucket: string,
    objectName: string,
    buffer: Buffer,
    metadata: Record<string, string>,
  ): Promise<string> {
    this.logger.log(`Uploading large file ${objectName} (${(buffer.length / 1024 / 1024).toFixed(1)} MB) in chunks`);
    // MinIO putObject handles multipart internally when given a size hint
    await this.client.putObject(bucket, objectName, buffer, buffer.length, metadata);
    return objectName;
  }

  async deleteFile(bucket: string, objectName: string): Promise<void> {
    this.validateBucket(bucket);
    this.validatePath(objectName);
    await this.client.removeObject(bucket, objectName);
  }

  async listFiles(bucket: string, prefix?: string): Promise<FileInfo[]> {
    this.validateBucket(bucket);
    if (prefix) this.validatePath(prefix);

    const objectsList: FileInfo[] = [];
    const objectsStream = this.client.listObjects(bucket, prefix, true);

    for await (const obj of objectsStream) {
      if (obj.name) {
        objectsList.push({
          name: obj.name,
          size: obj.size ?? 0,
          lastModified: obj.lastModified ?? null,
        });
      }
    }

    return objectsList;
  }
}
