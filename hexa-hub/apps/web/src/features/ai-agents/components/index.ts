// ─── index ─────────────────────────────────────────────────────────────────
// Public API for the ai-agents feature module.

export { useAgentChat } from '../hooks/use-agent-chat';
export { AgentSelector } from './AgentSelector';
export { ToolCallIndicator } from './ToolCallIndicator';
export { AgentBadge } from './AgentBadge';
export { FollowUpSuggestions } from './FollowUpSuggestions';
export type {
  AgentMessage,
  AgentPersona,
  AgentEvent,
  AgentToolCall,
  UseAgentChatResult,
} from '../types/agent';
