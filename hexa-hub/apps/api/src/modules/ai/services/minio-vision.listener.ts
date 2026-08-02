import { Injectable, Logger } from '@nestjs/common';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { MinioService } from '@/modules/odoo/services/minio.service';
import { AIService } from './ai.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * MinIO Vision Listener — Listens for MinIO upload events and triggers
 * Gemini Vision analysis for architectural 3D models and renderings.
 */
@Injectable()
export class MinioVisionListener implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MinioVisionListener.name);
  private redisSubscriber: Redis;
  private isListening = false;

  constructor(
    private readonly minioService: MinioService,
    private readonly aiService: AIService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.redisSubscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async onModuleInit() {
    await this.startListening();
  }

  async onModuleDestroy() {
    await this.stopListening();
  }

  private async startListening() {
    if (this.isListening) return;

    try {
      // Subscribe to MinIO upload events via Redis pub/sub
      await this.redisSubscriber.subscribe('minio:upload');
      
      this.redisSubscriber.on('message', async (channel, message) => {
        if (channel !== 'minio:upload') return;

        try {
          const event = JSON.parse(message);
          await this.handleUploadEvent(event);
        } catch (error) {
          this.logger.error(`Failed to process MinIO upload event: ${error.message}`);
        }
      });

      this.isListening = true;
      this.logger.log('MinIO Vision Listener started and listening for upload events');
    } catch (error) {
      this.logger.error(`Failed to start MinIO Vision Listener: ${error.message}`);
      this.isListening = false;
    }
  }

  private async stopListening() {
    if (!this.isListening) return;

    try {
      await this.redisSubscriber.unsubscribe('minio:upload');
      await this.redisSubscriber.quit();
      this.isListening = false;
      this.logger.log('MinIO Vision Listener stopped');
    } catch (error) {
      this.logger.error(`Failed to stop MinIO Vision Listener: ${error.message}`);
    }
  }

  private async handleUploadEvent(event: { bucket: string; key: string; size: number; contentType: string }) {
    // Only process 3D model and rendering files
    const validExtensions = ['.glb', '.gltf', '.fbx', '.obj', '.png', '.jpg', '.jpeg', '.exr', '.hdr'];
    const hasValidExtension = validExtensions.some(ext => event.key.toLowerCase().endsWith(ext));

    if (!hasValidExtension) {
      this.logger.debug(`Skipping non-3D file: ${event.key}`);
      return;
    }

    this.logger.log(`Processing uploaded file for vision analysis: ${event.key}`);

    try {
      // Download the file from MinIO
      const fileBuffer = await this.minioService.getObject(event.bucket, event.key);
      const fileBase64 = fileBuffer.toString('base64');

      // Generate a unique analysis ID
      const analysisId = `vision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Cache the analysis request in Redis to prevent duplicates
      const cacheKey = `vision:pending:${analysisId}`;
      const cached = await this.redisSubscriber.get(cacheKey);
      if (cached) {
        this.logger.debug(`Skipping duplicate analysis request: ${analysisId}`);
        return;
      }

      await this.redisSubscriber.set(cacheKey, '1', 'EX', 300); // 5 minute expiry

      // Trigger Gemini Vision Analysis
      const analysisResult = await this.aiService.analyzeVision(fileBase64, event.key);

      // Store the result in Redis for the frontend to fetch
      const resultKey = `vision:result:${analysisId}`;
      await this.redisSubscriber.set(resultKey, JSON.stringify(analysisResult), 'EX', 86400); // 24 hour expiry

      // Emit event for the frontend to pick up
      this.eventEmitter.emit('vision:analysis:completed', {
        analysisId,
        fileKey: event.key,
        bucket: event.bucket,
        tags: analysisResult.tags,
        metadata: analysisResult.metadata,
      });

      this.logger.log(`Vision analysis completed for ${event.key}: ${analysisResult.tags.join(', ')}`);
    } catch (error) {
      this.logger.error(`Failed to process vision analysis for ${event.key}: ${error.message}`);
    }
  }

  /**
   * Get cached vision analysis result
   */
  async getAnalysisResult(analysisId: string) {
    try {
      const resultKey = `vision:result:${analysisId}`;
      const result = await this.redisSubscriber.get(resultKey);
      return result ? JSON.parse(result) : null;
    } catch (error) {
      this.logger.error(`Failed to get analysis result: ${error.message}`);
      return null;
    }
  }
}
