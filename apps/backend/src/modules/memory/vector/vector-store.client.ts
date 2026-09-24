import { Injectable, Logger } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

export interface VectorStoreOptions {
  url: string;
  apiKey: string;
}

export type VectorFilter = Record<string, unknown>;

export interface VectorSearchRequest {
  vector: number[];
  filter?: VectorFilter;
  limit?: number;
}

export interface VectorSearchResponse {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
  score: number;
}

@Injectable()
export class VectorStoreClient {
  private readonly logger = new Logger(VectorStoreClient.name);
  private readonly client: QdrantClient;
  private readonly collectionName = 'memory';

  constructor(private options: VectorStoreOptions) {
    const { host, port, https } = this.parseUrl(options.url);
    this.client = new QdrantClient({
      host,
      port,
      https,
      apiKey: options.apiKey || undefined,
      timeout: 10000,
    });
  }

  private parseUrl(url: string): { host: string; port: number; https: boolean } {
    if (!url) {
      return { host: 'localhost', port: 6333, https: false };
    }
    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname,
        port: parseInt(parsed.port, 10) || (parsed.protocol === 'https:' ? 443 : 80),
        https: parsed.protocol === 'https:',
      };
    } catch {
      this.logger.warn(`Invalid QDRANT_URL: ${url}, using defaults`);
      return { host: 'localhost', port: 6333, https: false };
    }
  }

  async upsert(entry: { id: string; vector: number[]; payload: Record<string, unknown> }): Promise<void> {
    try {
      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: entry.id,
            vector: entry.vector,
            payload: entry.payload,
          },
        ],
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to upsert vector memory point ${entry.id}: ${err.message}`);
      throw error;
    }
  }

  async search(request: VectorSearchRequest): Promise<VectorSearchResponse[]> {
    try {
      const results = await this.client.search(this.collectionName, {
        vector: request.vector,
        filter: request.filter,
        limit: request.limit || 5,
        with_payload: true,
        with_vector: false,
      });

      return results.map((r) => ({
        id: r.id.toString(),
        vector: r.vector as number[] || [],
        payload: (r.payload ?? {}) as Record<string, unknown>,
        score: r.score,
      }));
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to search vector memory: ${err.message}`);
      return [];
    }
  }
}
