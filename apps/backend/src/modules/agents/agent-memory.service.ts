import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../storage/redis.service';
import { VectorMemoryService } from '../memory/vector/vector-memory.service';

export interface MemoryMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
}

export interface AgentMemory {
  getHistory(persona: string, sessionId: string, limit?: number): Promise<MemoryMessage[]>;
  append(persona: string, sessionId: string, message: MemoryMessage): Promise<void>;
  clear(persona: string, sessionId: string): Promise<void>;
  remember(persona: string, sessionId: string, key: string, value: unknown, ttl?: number): Promise<void>;
  recall(persona: string, sessionId: string, key: string): Promise<unknown>;
  recallSemantic(persona: string, sessionId: string, query: string, limit?: number): Promise<any[]>;
  forget(persona: string, sessionId: string, key: string): Promise<void>;
}

/**
 * Hybrid memory system for HEXA agent personas.
 * 
 * Uses Redis for short-term conversation transcripts and durable facts,
 * and Qdrant (via VectorMemoryService) for long-term semantic recall.
 */
@Injectable()
export class AgentMemoryService implements AgentMemory {
  private readonly logger = new Logger(AgentMemoryService.name);

  private static readonly MEMORY_TTL_SECONDS = 24 * 60 * 60; // 24h
  private static readonly DEFAULT_HISTORY_LIMIT = 40;
  private static readonly FACT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7d

  constructor(
    private readonly redis: RedisService,
    private readonly vectorMemory: VectorMemoryService,
  ) {}

  private memoryKey(persona: string, sessionId: string): string {
    return `agent:memory:${persona}:${sessionId}`;
  }

  private factsKey(persona: string, sessionId: string): string {
    return `agent:facts:${persona}:${sessionId}`;
  }

  /** Return recent conversation messages in chronological order. */
  async getHistory(persona: string, sessionId: string, limit = AgentMemoryService.DEFAULT_HISTORY_LIMIT): Promise<MemoryMessage[]> {
    try {
      const key = this.memoryKey(persona, sessionId);
      const raw = await this.redis.lrange<MemoryMessage>(key, 0, limit - 1);
      const messages = raw.filter((m) => m && typeof m === 'object');
      messages.reverse();
      return messages;
    } catch (err) {
      this.logger.warn(`getHistory failed for ${persona}/${sessionId}: ${err}`);
      return [];
    }
  }

  /** Recall a stored fact/context value for the session via exact key. */
  async recall(persona: string, sessionId: string, key: string): Promise<unknown> {
    return this.redis.hget(this.factsKey(persona, sessionId), key);
  }

  /** Semantic recall using vector embeddings to find relevant historical facts. */
  async recallSemantic(persona: string, sessionId: string, query: string, limit = 5): Promise<any[]> {
    return this.vectorMemory.recallSemantic(persona, sessionId, query, limit);
  }

  /** Store a durable fact in both Redis (exact) and Qdrant (semantic) stores. */
  async remember(persona: string, sessionId: string, key: string, value: unknown, ttl = AgentMemoryService.FACT_TTL_SECONDS): Promise<void> {
    await this.redis.hset(this.factsKey(persona, sessionId), key, value);
    await this.redis.expire(this.factsKey(persona, sessionId), ttl);
    
    // Mirror to vector store for semantic retrieval
    await this.vectorMemory.storeFact(persona, sessionId, key, value);
  }

  /** Append a single message to the conversation transcript. */
  async append(persona: string, sessionId: string, message: MemoryMessage): Promise<void> {
    const key = this.memoryKey(persona, sessionId);
    await this.redis.lpush(key, message);
    await this.redis.expire(key, AgentMemoryService.MEMORY_TTL_SECONDS);
  }

  async appendMany(persona: string, sessionId: string, messages: MemoryMessage[]): Promise<void> {
    for (const message of messages) {
      await this.append(persona, sessionId, message);
    }
  }

  async clear(persona: string, sessionId: string): Promise<void> {
    await this.redis.del(this.memoryKey(persona, sessionId));
    await this.redis.del(this.factsKey(persona, sessionId));
    this.logger.log(`Cleared agent memory for ${persona}/${sessionId}`);
  }

  async forget(persona: string, sessionId: string, key: string): Promise<void> {
    await this.redis.hdel(this.factsKey(persona, sessionId), key);
  }
}
