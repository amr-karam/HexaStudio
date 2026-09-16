import type { MemoryMessage } from '../modules/agents/agent-memory.service';

export const AGENT_MEMORY_PORT = Symbol('AGENT_MEMORY_PORT');

/**
 * Port abstraction over AgentMemoryService (ADR-018).
 * RealtimeModule consumes this token instead of the concrete class, so the
 * Agents ↔ Realtime edge depends on an abstraction, not an implementation.
 * Bound in AgentsModule via `{ provide: AGENT_MEMORY_PORT, useExisting: AgentMemoryService }`.
 */
export interface AgentMemoryPort {
  getHistory(persona: string, sessionId: string, limit?: number): Promise<MemoryMessage[]>;
  append(persona: string, sessionId: string, message: MemoryMessage): Promise<void>;
  clear(persona: string, sessionId: string): Promise<void>;
  remember(persona: string, sessionId: string, key: string, value: unknown, ttl?: number): Promise<void>;
  recall(persona: string, sessionId: string, key: string): Promise<unknown>;
  forget(persona: string, sessionId: string, key: string): Promise<void>;
}
