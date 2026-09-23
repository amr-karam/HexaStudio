import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VectorStoreClient } from './vector-store.client';
import { EmbeddingService } from '../../ai/embedding.service';

export interface VectorMemoryEntry {
  id: string;
  vector: number[];
  payload: {
    persona: string;
    sessionId: string;
    key: string;
    value: unknown;
    timestamp: number;
  };
}

export interface MemorySearchResult {
  content: string;
  score: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class VectorMemoryService {
  private readonly logger = new Logger(VectorMemoryService.name);
  private readonly vectorStore: VectorStoreClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly embeddingService: EmbeddingService,
  ) {
    this.vectorStore = new VectorStoreClient({
      url: this.configService.get('QDRANT_URL') || '',
      apiKey: this.configService.get('QDRANT_API_KEY') || '',
    });
  }

  async storeFact(persona: string, sessionId: string, key: string, value: unknown): Promise<void> {
    try {
      const textToEmbed = `${key}: ${JSON.stringify(value)}`;
      const vector = await this.embeddingService.generateEmbedding(textToEmbed);

      await this.vectorStore.upsert({
        id: `${persona}:${sessionId}:${key}`,
        vector,
        payload: { persona, sessionId, key, value, timestamp: Date.now() },
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to store vector memory: ${err.message}`);
    }
  }

  async recallSemantic(persona: string, sessionId: string, query: string, limit = 5): Promise<unknown[]> {
    try {
      const queryVector = await this.embeddingService.generateEmbedding(query);
      const results = await this.vectorStore.search({
        filter: { persona, sessionId },
        vector: queryVector,
        limit,
      });

      return results.map((r) => r.payload.value as unknown);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to recall vector memory: ${err.message}`);
      return [];
    }
  }

  /**
   * Search vector memory by text query (for DesignAuditService).
   * Returns matching memory entries ranked by similarity score.
   */
  async search(query: string, options: { limit?: number } = {}): Promise<MemorySearchResult[]> {
    try {
      const vector = await this.embeddingService.generateEmbedding(query);
      const results = await this.vectorStore.search({
        vector,
        limit: options.limit || 5,
      });

      return results.map((r) => ({
        content: r.payload.content as string ?? JSON.stringify(r.payload),
        score: r.score,
        metadata: r.payload.metadata as Record<string, unknown> | undefined,
      }));
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to search vector memory: ${err.message}`);
      return [];
    }
  }

  /**
   * Add a memory entry to vector store (for DesignAuditService).
   */
  async add(title: string, content: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const textToEmbed = `${title}: ${content}`;
      const vector = await this.embeddingService.generateEmbedding(textToEmbed);

      await this.vectorStore.upsert({
        id: `audit:${Date.now()}`,
        vector,
        payload: {
          title,
          content,
          metadata,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to add vector memory: ${err.message}`);
    }
  }
}