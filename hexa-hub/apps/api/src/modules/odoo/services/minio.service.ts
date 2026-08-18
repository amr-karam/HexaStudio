import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

/**
 * MinIO client service for S3-compatible object storage.
 * Used by the vision analysis pipeline to fetch uploaded 3D models
 * and renderings for AI analysis.
 */
@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client;

  constructor(private readonly configService: ConfigService) {
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
    const port = parseInt(this.configService.get<string>('MINIO_PORT') || '9000', 10);
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin';
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin';

    this.client = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    this.logger.log(`MinIO client initialized: ${endPoint}:${port} (SSL: ${useSSL})`);
  }

  /**
   * Fetches an object from MinIO and returns it as a Buffer.
   */
  async getObject(bucket: string, key: string): Promise<Buffer> {
    const stream = this.client.getObject(bucket, key) as unknown as NodeJS.ReadableStream;
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /**
   * Checks if an object exists in MinIO.
   */
  async objectExists(bucket: string, key: string): Promise<boolean> {
    try {
      await this.client.statObject(bucket, key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the size of an object in bytes.
   */
  async getObjectSize(bucket: string, key: string): Promise<number> {
    const stat = await this.client.statObject(bucket, key);
    return stat.size;
  }
}
