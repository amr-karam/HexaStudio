import type { User } from '@hexastudio/types';
import type { AgentPersona } from '../modules/agents/agents.service';

export interface AgentsPort {
  createAgent(request: { name: string; type: string; config?: Record<string, unknown> }): Promise<{ id: string; name: string }>;
  getAgent(id: string): Promise<{ id: string; name: string; type: string; config: Record<string, unknown> } | null>;
  listAgents(): Promise<Array<{ id: string; name: string; type: string }>>;
  deleteAgent(id: string): Promise<boolean>;
  chat(message: string, persona?: AgentPersona, sessionId?: string, user?: User): Promise<{ response: string; toolCalls: number; sessionId: string }>;
}

export const AGENTS_PORT = Symbol('AGENTS_PORT');