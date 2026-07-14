import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { getEnv } from '../../config/env';
import { VectorEmbedding, SemanticSearchRequest, SemanticSearchResponse } from '@hexastudio/types';

@Injectable()
export class VectorService implements OnModuleInit {
  private readonly logger = new Logger(VectorService.name);
  private client: QdrantClient;

  constructor() {
    const env = getEnv();
    this.client = new QdrantClient({
      host: env.VECTOR_HOST,
      port: env.VECTOR_PORT,
      apiKey: env.VECTOR_API_KEY,
    });
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
      // In a real implementation, this would call an embedding service first.
      // For MVP, we assume vector is passed or we placeholder here.
      // For demo, we'll mock the vector generation.
      const dummyVector = new Array(1536).fill(0).map(() => Math.random());

      const result = await this.client.search(collectionName, {
        vector: dummyVector,
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

  async delete(collectionName: string, id: string): Promise<void> {
    try {
      await this.client.delete(collectionName, { points: [id] });
    } catch (error) {
      this.logger.error(`Vector delete error: ${error}`);
      throw error;
    }
  }
}
