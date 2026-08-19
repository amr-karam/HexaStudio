import { z } from 'zod';

// ─── Core Agent Types ───────────────────────────────────────────────────────

export type Role = 'user' | 'assistant' | 'system' | 'tool';

export interface ChatMessage {
  role: Role;
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  tool_call_id: string;
  role: 'tool';
  content: string;
}

export interface AgentMetadata {
  agentName: string;
  toolsUsed: string[];
  confidence: number;
  sources: string[];
  executionTimeMs: number;
}

export interface AgentResponse {
  content: string;
  metadata: AgentMetadata;
}

export interface AgentEvent {
  type: 'agent.start' | 'agent.end' | 'tool.start' | 'tool.result' | 'message.chunk' | 'error';
  agentName?: string;
  toolName?: string;
  content?: string;
  result?: string;
  error?: string;
}

// ─── Tool Definition ────────────────────────────────────────────────────────

export interface AgentTool {
  definition: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required: string[];
    };
  };
  handler: (args: Record<string, string>) => Promise<string>;
  schema?: z.ZodSchema;
}

// ─── Agent Context ──────────────────────────────────────────────────────────

export interface AgentContext {
  userId: string;
  projectId?: string;
  workspaceId?: string;
  channelId?: string;
  sessionId: string;
  conversationHistory: ChatMessage[];
}

// ─── Agent Persona ──────────────────────────────────────────────────────────

export interface AgentPersona {
  name: string;
  description: string;
  systemPrompt: string;
  color: string;
  icon: string;
  tools: string[];
}
