import { Injectable, Logger } from '@nestjs/common';
import { MinioService } from '../storage/minio.service';
import { RedisService } from '../storage/redis.service';
import { AutoTagVisionService, VisionTagResult } from './auto-tag-vision.service';
import { MultimodalService } from './multimodal.service';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import { get } from 'node:https';
import { request } from 'node:http';
import { URL } from 'node:url';

/**
 * Result of a vision analysis pipeline on a MinIO-stored file.
 */
export interface VisionAnalysisResult {
  /** SHA-256 hash (first 16 hex chars) of the file content */
  fileHash: string;
  /** Object key in the MinIO bucket */
  objectName: string;
  /** MinIO bucket name */
  bucket: string;
  /** Generated vision tags (may be empty if analysis fails) */
  tags: VisionTagResult[];
  /** Raw architectural analysis from MultimodalService */
  rawAnalysis: Record<string, unknown>;
  /** ISO-8601 timestamp of processing */
  processedAt: string;
}

/** Image MIME types that can be processed by Gemini Vision. */
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']);

/** MIME type lookup for supported image extensions. */
const MIME_TYPE_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
};

/**
 * MinIOVisionService
 *
 * Post-upload processor that downloads newly uploaded rendering/preview images
 * from MinIO and runs them through the Gemini Vision analysis pipeline.
 *
 * Because NestJS cannot natively subscribe to MinIO bucket notification events,
 * this service is designed to be called programmatically by the upload flow
 * (e.g. from PortalController, StorageController, or a dedicated upload
 * handler) after a file has been written to MinIO.
 *
 * Workflow:
 *   1. Download file from MinIO via presigned URL
 *   2. Compute content hash for caching/deduplication
 *   3. Check Redis cache (key: `vision:analysis:<hash>`, TTL: 24h)
 *   4. Run Gemini Vision analysis (AutoTagVisionService + MultimodalService)
 *   5. Cache results in Redis
 *   6. Return structured tags and metadata
 *
 * Gracefully degrades when:
 *   - The file is not a supported image → returns null
 *   - Gemini Vision is unavailable → returns null
 *   - Analysis fails → logs error, returns null
 */
@Injectable()
export class MinIOVisionService {
  private readonly logger = new Logger(MinIOVisionService.name);
  private readonly cacheTtl = 86_400; // 24 hours

  constructor(
    private readonly minioService: MinioService,
    private readonly redisService: RedisService,
    private readonly autoTagVisionService: AutoTagVisionService,
    private readonly multimodalService: MultimodalService,
  ) {}

  /**
   * Process an uploaded file through the Gemini Vision analysis pipeline.
   *
   * @param bucket         - MinIO bucket name
   * @param objectName     - Object key within the bucket
   * @param projectContext - Optional project title/description for fallback tagging
   * @returns VisionAnalysisResult with tags, or null when the file is not an
   *          image or analysis cannot be performed
   */
  async processUploadedFile(
    bucket: string,
    objectName: string,
    projectContext?: { title?: string; description?: string },
  ): Promise<VisionAnalysisResult | null> {
    if (!this.isImageFile(objectName)) {
      this.logger.debug(`Skipping non-image file: ${objectName}`);
      return null;
    }

    // Check Gemini availability early
    if (!this.autoTagVisionService.isAvailable && !this.multimodalService.isAvailable) {
      this.logger.warn('Gemini Vision unavailable — skipping vision analysis pipeline');
      return null;
    }

    const mimeType = this.getMimeType(objectName);

    try {
      // ----- Step 1: Download file content -----
      const presignedUrl = await this.minioService.getPresignedDownloadUrl(bucket, objectName, 120);
      const fileBuffer = await this.downloadFromUrl(presignedUrl);
      const fileHash = this.computeFileHash(fileBuffer);

      // ----- Step 2: Check Redis cache -----
      const cacheKey = `vision:analysis:${fileHash}`;
      const cached = await this.redisService.get<VisionAnalysisResult>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for vision analysis: ${objectName} (hash: ${fileHash})`);
        return cached;
      }

      // ----- Step 3: Run vision analysis -----
      const base64Data = fileBuffer.toString('base64');
      const result = await this.analyze(base64Data, mimeType, objectName, bucket, fileHash, projectContext);

      // ----- Step 4: Cache in Redis -----
      if (result) {
        await this.redisService.set(cacheKey, result, this.cacheTtl);
        this.logger.log(`Vision analysis cached for ${objectName} (hash: ${fileHash}, ${result.tags.length} tags)`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to process file ${objectName} for vision analysis: ${(error as any).message}`);
      return null;
    }
  }

  /**
   * Return a previously cached vision analysis for a given file hash.
   */
  async getCachedAnalysis(fileHash: string): Promise<VisionAnalysisResult | null> {
    return this.redisService.get<VisionAnalysisResult>(`vision:analysis:${fileHash}`);
  }

  /**
   * Invalidate cached vision analysis for a given file hash.
   */
  async invalidateCache(fileHash: string): Promise<void> {
    await this.redisService.del(`vision:analysis:${fileHash}`);
    this.logger.debug(`Invalidated cache for hash: ${fileHash}`);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Run the full analysis pipeline on a base64-encoded image.
   */
  private async analyze(
    base64Data: string,
    mimeType: string,
    objectName: string,
    bucket: string,
    fileHash: string,
    projectContext?: { title?: string; description?: string },
  ): Promise<VisionAnalysisResult | null> {
    let tags: VisionTagResult[] = [];
    let rawAnalysis: Record<string, unknown> = {};

    // Primary path: AutoTagVisionService for targeted tagging
    if (this.autoTagVisionService.isAvailable) {
      try {
        tags = await this.autoTagVisionService.generateVisionTags(base64Data, mimeType, projectContext);
      } catch (error) {
        this.logger.warn(`AutoTagVisionService failed, falling back: ${(error as any).message}`);
      }

      try {
        const archAnalysis = await this.multimodalService.analyzeArchitecturalImage(base64Data, mimeType);
        rawAnalysis = archAnalysis as unknown as Record<string, unknown>;
      } catch (error) {
        this.logger.warn(`Detailed architectural analysis unavailable: ${(error as any).message}`);
        rawAnalysis = { note: 'Detailed architectural analysis failed' };
      }
    } else if (this.multimodalService.isAvailable) {
      // Fallback: use MultimodalService directly
      try {
        const archAnalysis = await this.multimodalService.analyzeArchitecturalImage(base64Data, mimeType);
        rawAnalysis = archAnalysis as unknown as Record<string, unknown>;
        tags = this.mapAnalysisToTags(archAnalysis);
      } catch (error) {
        this.logger.warn(`MultimodalService analysis failed: ${(error as any).message}`);
        return null;
      }
    }

    return {
      fileHash,
      objectName,
      bucket,
      tags,
      rawAnalysis,
      processedAt: new Date().toISOString(),
    };
  }

  /**
   * Map the structured architectural analysis response to VisionTagResult items.
   */
  private mapAnalysisToTags(analysis: {
    style: string;
    materials: string[];
    lighting: string;
    spatialComposition: string;
    confidence: number;
  }): VisionTagResult[] {
    const tags: VisionTagResult[] = [];

    tags.push({
      tag: analysis.style.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim(),
      confidence: analysis.confidence,
      category: 'style',
    });

    for (const material of analysis.materials) {
      tags.push({
        tag: material.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim(),
        confidence: Math.round(analysis.confidence * 0.85 * 100) / 100,
        category: 'material',
      });
    }

    tags.push({
      tag: analysis.lighting.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim(),
      confidence: Math.round(analysis.confidence * 0.9 * 100) / 100,
      category: 'lighting',
    });

    tags.push({
      tag: analysis.spatialComposition.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim(),
      confidence: Math.round(analysis.confidence * 0.9 * 100) / 100,
      category: 'spatial',
    });

    tags.sort((a, b) => b.confidence - a.confidence);
    return tags.slice(0, 10);
  }

  /**
   * Check whether the file name has a supported image extension.
   */
  private isImageFile(objectName: string): boolean {
    const ext = extname(objectName).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext);
  }

  /**
   * Derive a MIME type string from the file extension.
   */
  private getMimeType(objectName: string): string {
    const ext = extname(objectName).toLowerCase();
    return MIME_TYPE_MAP[ext] ?? 'image/jpeg';
  }

  /**
   * Compute a short content hash for caching / deduplication.
   */
  private computeFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  }

  /**
   * Download file content from a presigned MinIO URL.
   * Handles both HTTP and HTTPS URLs.
   */
  private downloadFromUrl(urlString: string): Promise<Buffer> {
    const url = new URL(urlString);
    const httpModule = url.protocol === 'https:' ? get : request;

    return new Promise<Buffer>((resolve, reject) => {
      const req = httpModule(urlString, (res) => {
        if (res.statusCode === undefined || res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Download failed with status ${res.statusCode ?? 'unknown'}`));
          return;
        }

        // Follow redirects (MinIO may return 307 for temporary redirects)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(this.downloadFromUrl(res.headers.location));
          return;
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      });

      req.on('error', reject);
      req.end();
    });
  }
}
