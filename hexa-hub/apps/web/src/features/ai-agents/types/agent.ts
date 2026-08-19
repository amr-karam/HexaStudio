// ─── AI Agent Types ─────────────────────────────────────────────────────────

export type AgentRole = 'user' | 'assistant';

export interface AgentToolCall {
  name: string;
  arguments: string;
}

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  agentName?: string;
  toolCalls?: AgentToolCall[];
  sources?: string[];
  confidence?: number;
  timestamp: Date;
}

export interface AgentPersona {
  name: string;
  description: string;
  color: string;
  icon: string;
  tools: string[];
}

export interface AgentEvent {
  type: 'agent.start' | 'agent.end' | 'tool.start' | 'tool.result' | 'message.chunk' | 'error';
  agentName?: string;
  toolName?: string;
  content?: string;
  result?: string;
  error?: string;
}

export interface UseAgentChatResult {
  messages: AgentMessage[];
  agents: AgentPersona[];
  selectedAgent: string | null;
  isProcessing: boolean;
  sendMessage: (message: string, agentName?: string) => Promise<void>;
  selectAgent: (agentName: string | null) => void;
  clearConversation: () => void;
  setQuery: (query: string) => void;
  currentQuery: string;
}
