import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getEnv } from '../../config/env';

interface MinioClient {
  presignedGetObject(bucket: string, objectName: string, expiry: number): Promise<string>;
  presignedPutObject(bucket: string, objectName: string, expiry: number): Promise<string>;
  putObject(bucket: string, objectName: string, stream: Buffer, size?: number, metadata?: Record<string, string>): Promise<void>;
  removeObject(bucket: string, objectName: string): Promise<void>;
  listObjects(bucket: string, prefix?: string, recursive?: boolean): AsyncIterable<{ name?: string }>;
}

const ALLOWED_BUCKETS = ['uploads', 'models', 'textures', 'videos', 'hdr', 'backups'] as const;

@Injectable()
export class MinioService {
  private client: MinioClient;

  constructor() {
    const env = getEnv();
    // Dynamic import to avoid ESM/CJS issues in NestJS build
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
    await this.client.putObject(bucket, objectName, buffer, undefined, metadata);
    return objectName;
  }

  async deleteFile(bucket: string, objectName: string): Promise<void> {
    this.validateBucket(bucket);
    this.validatePath(objectName);
    await this.client.removeObject(bucket, objectName);
  }

  async listFiles(bucket: string, prefix?: string): Promise<string[]> {
    this.validateBucket(bucket);
    if (prefix) this.validatePath(prefix);

    const objectsList: string[] = [];
    const objectsStream = this.client.listObjects(bucket, prefix, true);

    for await (const obj of objectsStream) {
      if (obj.name) {
        objectsList.push(obj.name);
      }
    }

    return objectsList;
  }
}
