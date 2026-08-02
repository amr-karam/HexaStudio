import { Injectable, Logger, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { VectorService } from '../vector/vector.service';
import type { Project } from '@hexastudio/types';
import { Env } from '../../config/env';

type EmbeddingSource = 'local' | 'openai' | 'placeholder';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private local: OpenAI | null = null;
  private openai: OpenAI | null = null;
  private readonly LOCAL_DIMENSIONS = 768; // text-embedding-nomic-embed-text-v1.5
  private readonly OPENAI_DIMENSIONS = 1536; // text-embedding-3-small
  private activeSource: EmbeddingSource = 'placeholder';
  private activeDimensions = 1536;

  constructor(
    @Inject(forwardRef(() => VectorService))
    private readonly vectorService: VectorService,
    private configService: ConfigService<Env>,
  ) {}

  onModuleInit() {
    const localBaseUrl = this.configService.get('LM_STUDIO_BASE_URL');
    this.local = new OpenAI({ apiKey: 'lm-studio', baseURL: localBaseUrl });
    this.activeSource = 'local';
    this.activeDimensions = this.LOCAL_DIMENSIONS;
    this.logger.log(
      `LM Studio embeddings enabled (${this.configService.get('LM_STUDIO_EMBEDDING_MODEL')}, ${this.LOCAL_DIMENSIONS}-dim)`,
    );

    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI embeddings available as fallback');
    } else {
      this.logger.warn('OPENAI_API_KEY not set — OpenAI embedding fallback unavailable');
    }
  }

  getDimensions(): number {
    return this.activeDimensions;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // 1. Prefer local (free, self-hosted, no rate limits)
    if (this.local) {
      try {
        const response = await this.local.embeddings.create({
          model: this.configService.get('LM_STUDIO_EMBEDDING_MODEL')!,
          input: text,
        });
        return response.data[0].embedding;
      } catch (error) {
        this.logger.error(`Local embedding failed, trying OpenAI fallback: ${(error as Error).message}`);
      }
    }

    // 2. OpenAI fallback
    if (this.openai) {
      try {
        const response = await this.openai.embeddings.create({
          model: this.configService.get<string>('OPENAI_EMBEDDING_MODEL')!,
          input: text,
        });
        return response.data[0].embedding;
      } catch (error) {
        this.logger.error(`OpenAI embedding failed, falling back to placeholder: ${(error as Error).message}`);
      }
    }

    // 3. Placeholder (dev mode) — matches active dimensions
    return this.generatePlaceholderVector(text);
  }

  async embedProject(project: Project): Promise<void> {
    try {
      const text = `${project.title}\n${project.description}\n${(project.services || []).join(', ')}`;
      const vector = await this.generateEmbedding(text);
      await this.vectorService.upsert('projects', [
        {
          id: project.id,
          vector,
          payload: {
            slug: project.slug,
            title: project.title,
            category: project.category?.name,
            text,
          },
        },
      ]);
      this.logger.log(`Embedded project ${project.slug}`);
    } catch (error) {
      this.logger.error(`Failed to embed project ${project.slug}: ${(error as Error).message}`);
    }
  }

  private generatePlaceholderVector(text: string): number[] {
    const dims = this.activeDimensions;
    const vector = new Array(dims).fill(0);
    for (let i = 0; i < text.length; i++) {
      vector[i % dims] += text.charCodeAt(i);
    }
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= magnitude;
      }
    }
    return vector;
  }
}
