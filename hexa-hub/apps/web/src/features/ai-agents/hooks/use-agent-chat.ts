// ─�── useAgentChat ──────────────────────────────────────────────────────────
// Streaming React hook for the Hermes multi-agent AI assistant.
// Uses Server-Sent Events (SSE) for real-time agent event streaming.
//
// Agent events: agent.start, tool.start, tool.result, message.chunk, agent.end, error
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { AgentMessage, AgentPersona, UseAgentChatResult } from '../types/agent';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

// Hardcoded fallback agent list (used when API is unreachable)
const FALLBACK_AGENTS: AgentPersona[] = [
  { name: 'knowledge-agent', description: 'Information retrieval and knowledge search', color: 'var(--color-metric-violet)', icon: '📚', tools: ['semantic_search', 'cms_search'] },
  { name: 'erp-analyst', description: 'Odoo ERP data and financial analysis', color: 'var(--color-metric-amber)', icon: '📊', tools: ['odoo_search_read', 'odoo_financial_query'] },
  { name: 'project-assistant', description: 'Project and task management', color: 'var(--color-info)', icon: '📋', tools: ['query_projects', 'query_tasks'] },
  { name: 'sales-agent', description: 'CRM and sales operations', color: 'var(--color-metric-emerald)', icon: '💼', tools: ['odoo_search_read', 'odoo_create_lead'] },
];

export function useAgentChat(): UseAgentChatResult {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [agents, setAgents] = useState<AgentPersona[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [toolCalls, setToolCalls] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // ── Fetch available agents on mount ──
  useEffect(() => {
    void fetchAvailableAgents();
  }, []);

  // ── Auto-scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  async function fetchAvailableAgents() {
    try {
      const res = await fetch(`${API_BASE}/ai/agents/list`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json() as { agents: AgentPersona[] };
        setAgents(data.agents);
      } else {
        setAgents(FALLBACK_AGENTS);
      }
    } catch {
      setAgents(FALLBACK_AGENTS);
    }
  }

  function getAuthHeaders(): Record<string, string> {
    const token = sessionStorage.getItem('hub_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Send a message via non-streaming POST endpoint.
   * Used as a fallback when SSE streaming fails.
   */
  async function sendMessageViaPost(message: string, agentToUse?: string | null) {
    const res = await fetch(`${API_BASE}/ai/agents/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        query: message,
        agentName: agentToUse ?? undefined,
        context: {},
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json() as {
      response: string;
      metadata: Record<string, unknown>;
    };

    const assistantMessage: AgentMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: data.response,
      agentName: (data.metadata?.agentName as string) ?? 'knowledge-agent',
      sources: (data.metadata?.sources as string[]) ?? [],
      confidence: (data.metadata?.confidence as number) ?? 0.9,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
  }

  /**
   * Send a message via SSE streaming endpoint.
   * Handles all event types: agent.start, tool.start, tool.result, message.chunk, agent.end, error
   */
  function sendMessageViaSSE(
    message: string,
    agentToUse?: string | null,
  ) {
    const agentName = agentToUse ?? '';
    const url = `${API_BASE}/ai/agents/stream?query=${encodeURIComponent(message)}&agentName=${encodeURIComponent(agentName)}`;

    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    let currentMessageId: string | null = null;
    let accumulatedContent = '';
    let currentAgentName = 'autodetected';
    let collectedSources: string[] = [];

    es.onmessage = (event) => {
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(event.data) as Record<string, unknown>;
      } catch {
        return;
      }

      const eventType = data.type as string;

      if (eventType === 'agent.start') {
        currentAgentName = (data.agentName as string) ?? 'autodetected';
      }

      if (eventType === 'tool.start') {
        const toolName = (data.toolName as string) ?? 'unknown';
        setToolCalls((prev) => [...prev, toolName]);
      }

      if (eventType === 'tool.result') {
        const toolName = (data.toolName as string) ?? 'unknown';
        setToolCalls((prev) => prev.filter((t) => t !== toolName));
        if (data.result) {
          collectedSources = [...collectedSources, toolName];
        }
      }

      if (eventType === 'message.chunk') {
        if (!currentMessageId) {
          currentMessageId = `ai-${Date.now()}`;
          accumulatedContent = '';
          setMessages((prev) => [
            ...prev,
            {
              id: currentMessageId!,
              role: 'assistant',
              content: '',
              agentName: currentAgentName,
              sources: [],
              timestamp: new Date(),
            },
          ]);
        }
        accumulatedContent += (data.content as string) ?? '';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === currentMessageId
              ? { ...m, content: accumulatedContent }
              : m,
          ),
        );
      }

      if (eventType === 'agent.end' || eventType === 'error') {
        // Update the message with final sources
        if (currentMessageId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === currentMessageId
                ? { ...m, sources: collectedSources }
                : m,
            ),
          );
        }
        es.close();
        setIsProcessing(false);
        setToolCalls([]);
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;

      // Fallback: try non-streaming POST endpoint
      void sendMessageViaPost(message, agentToUse).catch((error) => {
        console.error('Agent chat error:', error);
        toast.error('Failed to get AI response. Please try again.');
      }).finally(() => {
        setIsProcessing(false);
        setToolCalls([]);
      });
    };
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (message: string, agentName?: string) => {
      if (!message.trim() || isProcessing) return;

      const agentToUse = agentName ?? selectedAgent;
      const userMessage: AgentMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsProcessing(true);
      setToolCalls([]);

      sendMessageViaSSE(message, agentToUse);

      setCurrentQuery('');
    },
    [isProcessing, selectedAgent],
  );

  const selectAgent = useCallback((agentName: string | null) => {
    setSelectedAgent(agentName);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setSelectedAgent(null);
    setCurrentQuery('');
    setToolCalls([]);
    setIsProcessing(false);
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  const setQuery = useCallback((query: string) => {
    setCurrentQuery(query);
  }, []);

  return {
    messages,
    agents,
    selectedAgent,
    isProcessing,
    sendMessage,
    selectAgent,
    clearConversation,
    setQuery,
    currentQuery,
    toolCalls,
  };
}
