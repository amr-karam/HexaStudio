import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/qdrant-js';

export interface QdrantSearchResult {
  id: string | number;
  score: number;
  payload: Record<string, unknown>;
  vector?: number[];
}

/**
 * Lightweight Qdrant client wrapper.
 *
 * Provides basic vector search and upsert capabilities
 * used by the Knowledge Agent for semantic search.
 */
@Injectable()
export class QdrantService {
  private readonly logger = new Logger(QdrantService.name);
  private client: QdrantClient | null = null;
  private readonly endpoint: string;
  private readonly apiKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = configService.get<string>('QDRANT_URL') ?? 'http://localhost:6333';
    this.apiKey = configService.get<string>('QDRANT_API_KEY');
  }

  private getClient(): QdrantClient {
    if (!this.client) {
      this.client = new QdrantClient({
        url: this.endpoint,
        apiKey: this.apiKey,
      });
    }
    return this.client;
  }

  /** Check if Qdrant is reachable */
  async isAvailable(): Promise<boolean> {
    try {
      const client = this.getClient();
      await client.getCollections();
      return true;
    } catch (error) {
      this.logger.warn(`Qdrant unavailable: ${(error as Error).message}`);
      return false;
    }
  }

  /** Search for similar vectors in a collection */
  async search(
    collection: string,
    queryText: string,
    limit: number = 5,
  ): Promise<QdrantSearchResult[]> {
    const client = this.getClient();
    // Note: In production, embed the query text using a model.
    // For now, we use Qdrant's query API with text search.
    const searchResult = await client.query(collection, {
      query: queryText,
      limit,
      with_payload: true,
      with_vector: false,
    });
    return searchResult.points.map((r: Record<string, unknown>) => ({
      id: r.id as string | number,
      score: r.score as number,
      payload: r.payload as Record<string, unknown>,
      vector: r.vector as number[] | undefined,
    }));
  }

  /** Upsert a vector point */
  async upsert(
    collection: string,
    points: Array<{
      id: string | number;
      vector: number[];
      payload: Record<string, unknown>;
    }>,
  ): Promise<void> {
    const client = this.getClient();
    await client.upsert(collection, {
      wait: true,
      points,
    });
  }

  /** Create a new collection */
  async createCollection(
    collection: string,
    vectorSize: number,
    distance: 'Cosine' | 'Euclid' | 'Dot' = 'Cosine',
  ): Promise<void> {
    const client = this.getClient();
    await client.createCollection(collection, {
      vectors: {
        size: vectorSize,
        distance,
      },
    });
  }
}
