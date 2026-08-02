import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../storage/redis.service';

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
  forget(persona: string, sessionId: string, key: string): Promise<void>;
}

/**
 * Redis-backed conversation memory for HEXA agent personas.
 *
 * Each (persona, sessionId) pair owns a Redis list (`agent:memory:{persona}:{sessionId}`)
 * storing the recent conversation transcript, plus a hash (`agent:facts:{persona}:{sessionId}`)
 * storing durable facts/context learned during the conversation (e.g. project ids, user prefs).
 *
 * Lists are capped on read (most recent `limit` messages in chronological order) and
 * expire via TTL so stale sessions are reclaimed automatically.
 */
@Injectable()
export class AgentMemoryService implements AgentMemory {
  private readonly logger = new Logger(AgentMemoryService.name);

  private static readonly MEMORY_TTL_SECONDS = 24 * 60 * 60; // 24h
  private static readonly DEFAULT_HISTORY_LIMIT = 40;
  private static readonly FACT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7d

  constructor(private readonly redis: RedisService) {}

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
      // lpush stores newest-first; reverse for chronological order.
      const raw = await this.redis.lrange<MemoryMessage>(key, 0, limit - 1);
      const messages = raw.filter((m) => m && typeof m === 'object');
      messages.reverse();
      return messages;
    } catch (err) {
      this.logger.warn(`getHistory failed for ${persona}/${sessionId}: ${err}`);
      return [];
    }
  }

  /** Append a single message to the conversation transcript. */
  async append(persona: string, sessionId: string, message: MemoryMessage): Promise<void> {
    const key = this.memoryKey(persona, sessionId);
    await this.redis.lpush(key, message);
    // Refresh TTL so active sessions never expire mid-conversation.
    await this.redis.expire(key, AgentMemoryService.MEMORY_TTL_SECONDS);
  }

  /** Append a batch of messages (used to persist an entire assistant turn + tool results). */
  async appendMany(persona: string, sessionId: string, messages: MemoryMessage[]): Promise<void> {
    for (const message of messages) {
      await this.append(persona, sessionId, message);
    }
  }

  /** Wipe the conversation transcript for a session. */
  async clear(persona: string, sessionId: string): Promise<void> {
    await this.redis.del(this.memoryKey(persona, sessionId));
    await this.redis.del(this.factsKey(persona, sessionId));
    this.logger.log(`Cleared agent memory for ${persona}/${sessionId}`);
  }

  /** Store a durable fact/context value for the session. */
  async remember(persona: string, sessionId: string, key: string, value: unknown, ttl = AgentMemoryService.FACT_TTL_SECONDS): Promise<void> {
    await this.redis.hset(this.factsKey(persona, sessionId), key, value);
    await this.redis.expire(this.factsKey(persona, sessionId), ttl);
  }

  /** Recall a stored fact/context value for the session. */
  async recall(persona: string, sessionId: string, key: string): Promise<unknown> {
    return this.redis.hget(this.factsKey(persona, sessionId), key);
  }

  /** Remove a stored fact/context value for the session. */
  async forget(persona: string, sessionId: string, key: string): Promise<void> {
    await this.redis.hdel(this.factsKey(persona, sessionId), key);
  }
}
