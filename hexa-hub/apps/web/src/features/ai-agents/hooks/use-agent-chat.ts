// ─── useAgentChat ──────────────────────────────────────────────────────────
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

export function useAgentChat(): UseAgentChatResult {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [agents, setAgents] = useState<AgentPersona[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch available agents on mount
  useEffect(() => {
    void fetchAvailableAgents();
  }, []);

  // Auto-scroll to bottom
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
      }
    } catch {
      // Fallback to hardcoded agent list if API is unavailable
      setAgents([
        { name: 'knowledge-agent', description: 'Information retrieval and knowledge search', color: 'var(--color-metric-violet)', icon: '📚', tools: ['semantic_search', 'cms_search'] },
        { name: 'erp-analyst', description: 'Odoo ERP data and financial analysis', color: 'var(--color-metric-amber)', icon: '📊', tools: ['odoo_search_read', 'odoo_financial_query'] },
        { name: 'project-assistant', description: 'Project and task management', color: 'var(--color-info)', icon: '📋', tools: ['query_projects', 'query_tasks'] },
        { name: 'sales-agent', description: 'CRM and sales operations', color: 'var(--color-metric-emerald)', icon: '💼', tools: ['odoo_search_read', 'odoo_create_lead'] },
      ]);
    }
  }

  function getAuthHeaders(): Record<string, string> {
    const token = sessionStorage.getItem('hub_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  const sendMessage = useCallback(async (message: string, agentName?: string) => {
    if (!message.trim() || isProcessing) return;

    const agentToUse = agentName ?? selectedAgent;
    const userMessage: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Build request — use SSE for real-time streaming
    const body = JSON.stringify({
      query: message,
      agentName: agentToUse ?? undefined,
      context: {},
    });

    const eventSource = new EventSource(
      `${API_BASE}/ai/agents/stream?query=${encodeURIComponent(message)}&agentName=${encodeURIComponent(agentToUse ?? '')}`,
      { withCredentials: true },
    );

    // For now, fallback to non-streaming POST if SSE endpoint is unavailable
    if (!agentToUse && !selectedAgent) {
      // Use non-streaming endpoint as fallback
      try {
        const res = await fetch(`${API_BASE}/ai/agents/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json() as { response: string; metadata: Record<string, unknown> };

        const assistantMessage: AgentMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          agentName: data.metadata?.agentName as string ?? 'knowledge-agent',
          sources: data.metadata?.sources as string[] ?? [],
          confidence: data.metadata?.confidence as number ?? 0.9,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
        void eventSource.close();
      } catch (error) {
        console.error('Agent chat error:', error);
        toast.error('Failed to get AI response. Please try again.');
        setIsProcessing(false);
      }
    } else {
      // Use SSE streaming
      let currentMessageId: string | null = null;
      let accumulatedContent = '';
      let currentAgentName = 'autodetected';

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data) as {
          type: string;
          agentName?: string;
          content?: string;
          toolName?: string;
          result?: string;
          sources?: string[];
          error?: string;
        };

        if (data.type === 'agent.start') {
          currentAgentName = data.agentName ?? 'autodetected';
        }

        if (data.type === 'message.chunk') {
          if (!currentMessageId) {
            currentMessageId = `ai-${Date.now()}`;
            accumulatedContent = '';
            setMessages(prev => [...prev, {
              id: currentMessageId!,
              role: 'assistant',
              content: '',
              agentName: currentAgentName,
              sources: [],
              timestamp: new Date(),
            }]);
          }
          accumulatedContent += data.content ?? '';
          setMessages(prev => prev.map(m =>
            m.id === currentMessageId ? { ...m, content: accumulatedContent } : m
          ));
        }

        if (data.type === 'tool.result' && data.result) {
          setMessages(prev => prev.map(m =>
            m.id === currentMessageId
              ? { ...m, sources: [...(m.sources ?? []), data.toolName ?? 'unknown'] }
              : m
          ));
        }

        if (data.type === 'agent.end' || data.type === 'error') {
          eventSource.close();
          setIsProcessing(false);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsProcessing(false);
        toast.error('Connection lost to AI agent stream.');
      };
    }

    setCurrentQuery('');
  }, [isProcessing, selectedAgent]);

  const selectAgent = useCallback((agentName: string | null) => {
    setSelectedAgent(agentName);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setSelectedAgent(null);
    setCurrentQuery('');
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
  };
}
