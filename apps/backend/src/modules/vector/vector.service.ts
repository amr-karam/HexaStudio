import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { Env } from '../../config/env';
import type { VectorEmbedding, SemanticSearchRequest, SemanticSearchResponse } from '@hexastudio/types';
import { EmbeddingService } from '../ai/embedding.service';
import { ToolDefinition } from '../agents/decorators/tool-definition.decorator';
import { ToolAuthorization } from '../agents/decorators/tool-authorization.decorator';

@Injectable()
export class VectorService implements OnModuleInit {
  private readonly logger = new Logger(VectorService.name);
  private client: QdrantClient;

  constructor(
    @Inject(forwardRef(() => EmbeddingService))
    private readonly embeddingService: EmbeddingService,
    private configService: ConfigService<Env>,
  ) {
    this.client = new QdrantClient({
      host: this.configService.get('VECTOR_HOST'),
      port: this.configService.get('VECTOR_PORT'),
      apiKey: this.configService.get('VECTOR_API_KEY'),
    });
  }

  @ToolDefinition({
    name: 'search_projects',
    description: 'Search architecture projects by keyword query',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Max results (default 5)' },
      },
      required: ['query'],
    },
  })
  @ToolAuthorization({ requiresAuth: true, requiresHitl: false })
  async searchProjectsTool(params: { query: string; limit?: number }) {
    const result = await this.search('projects', {
      query: params.query,
      limit: params.limit ?? 5,
    });
    return result.results.map(r => ({
      slug: r.payload?.slug,
      title: r.payload?.title,
      score: r.score,
    }));
  }

  async onModuleInit() {
    try {
      await this.client.getCollections();
      this.logger.log('Connected to Vector Store (Qdrant)');
    } catch (error) {
      this.logger.error(`Failed to connect to Vector Store: ${error}`);
    }
  }

  async upsert(collectionName: string, points: { id: string; vector: number[]; payload: Record<string, unknown> }[]): Promise<void> {
    try {
      await this.client.upsert(collectionName, {
        wait: true,
        points: points.map(p => ({
          id: p.id,
          vector: p.vector,
          payload: p.payload,
        })),
      });
    } catch (error) {
      this.logger.error(`Vector upsert error: ${error}`);
      throw error;
    }
  }

  async search(collectionName: string, request: SemanticSearchRequest): Promise<SemanticSearchResponse> {
    try {
      const { limit = 10 } = request;
      const vector = await this.embeddingService.generateEmbedding(request.query || '');

      const result = await this.client.search(collectionName, {
        vector,
        limit,
        with_payload: true,
      });

      return {
        results: result.map(r => ({
          id: r.id.toString(),
          vector: (r.vector as number[]) ?? [],
          payload: (r.payload as Record<string, unknown>) ?? {},
          score: r.score,
        })) as VectorEmbedding[],
        total: result.length,
      };
    } catch (error) {
      this.logger.error(`Vector search error: ${error}`);
      throw error;
    }
  }

  async searchByVector(collectionName: string, vector: number[], limit = 10): Promise<SemanticSearchResponse> {
    try {
      const result = await this.client.search(collectionName, {
        vector,
        limit,
        with_payload: true,
      });

      return {
        results: result.map(r => ({
          id: r.id.toString(),
          vector: (r.vector as number[]) ?? [],
          payload: (r.payload as Record<string, unknown>) ?? {},
          score: r.score,
        })) as VectorEmbedding[],
        total: result.length,
      };
    } catch (error) {
      this.logger.error(`Vector search by vector error: ${error}`);
      throw error;
    }
  }

  async delete(collectionName: string, id: string): Promise<void> {
    try {
      await this.client.delete(collectionName, { points: [id] });
    } catch (error) {
      this.logger.error(`Vector delete error: ${error}`);
      throw error;
    }
  }
}
