import { Injectable, Logger, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { VectorService } from '../vector/vector.service';
import { Project } from '@hexastudio/types';
import { Env } from '../../config/env';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private openai: OpenAI | null = null;
  private readonly EMBEDDING_DIMENSIONS = 1536;

  constructor(
    @Inject(forwardRef(() => VectorService))
    private readonly vectorService: VectorService,
    private configService: ConfigService<Env>,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized — real embeddings enabled');
    } else {
      this.logger.warn('OPENAI_API_KEY not set — using placeholder embeddings (dev mode)');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (this.openai) {
      try {
        const response = await this.openai.embeddings.create({
          model: this.configService.get<string>('OPENAI_EMBEDDING_MODEL')!,
          input: text,
        });
        return response.data[0].embedding;
      } catch (error) {
        this.logger.error(`OpenAI embedding failed, falling back to placeholder: ${error}`);
        return this.generatePlaceholderVector(text);
      }
    }
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
      this.logger.error(`Failed to embed project ${project.slug}: ${error}`);
    }
  }

  private generatePlaceholderVector(text: string): number[] {
    const vector = new Array(this.EMBEDDING_DIMENSIONS).fill(0);
    for (let i = 0; i < text.length; i++) {
      vector[i % this.EMBEDDING_DIMENSIONS] += text.charCodeAt(i);
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
