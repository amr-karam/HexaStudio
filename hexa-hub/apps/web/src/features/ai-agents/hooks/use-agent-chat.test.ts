/**
 * Tests for the useAgentChat hook.
 * Verifies agent fetching, message handling, and SSE streaming behavior.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAgentChat } from './use-agent-chat';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockAgentsResponse = {
  agents: [
    {
      name: 'knowledge-agent',
      description: 'Information retrieval and knowledge search',
      color: 'var(--color-metric-violet)',
      icon: '📚',
      tools: ['semantic_search', 'cms_search'],
    },
    {
      name: 'erp-analyst',
      description: 'Odoo ERP data and financial analysis',
      color: 'var(--color-metric-amber)',
      icon: '📊',
      tools: ['odoo_search_read', 'odoo_financial_query'],
    },
  ],
};

const mockChatResponse = {
  ok: true,
  json: async () => ({
    response: 'Q3 revenue was €1.2M',
    metadata: {
      agentName: 'erp-analyst',
      toolsUsed: ['odoo_search_read'],
      confidence: 0.95,
      sources: ['odoo'],
      executionTimeMs: 150,
    },
  }),
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('useAgentChat', () => {
  let mockEventSource: {
    close: ReturnType<typeof vi.fn>;
    onmessage: ((e: MessageEvent) => void) | null;
    onerror: ((e: Event) => void) | null;
  };

  beforeEach(() => {
    mockEventSource = {
      close: vi.fn(),
      onmessage: null,
      onerror: null,
    };

    global.EventSource = vi.fn(() => mockEventSource) as unknown as typeof EventSource;

    // Mock sessionStorage
    const mockStorage: Storage = {
      getItem: vi.fn().mockReturnValue('test-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch agents on mount', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockAgentsResponse,
    });

    const { result } = renderHook(() => useAgentChat());

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(2);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/ai/agents/list'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
  });

  it('should add user message when sendMessage is called', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAgentsResponse,
      })
      .mockResolvedValueOnce(mockChatResponse);

    const { result } = renderHook(() => useAgentChat());

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(2);
    });

    act(() => {
      result.current.sendMessage('Hello, agent');
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('Hello, agent');
    expect(result.current.isProcessing).toBe(true);
  });

  it('should select agent when selectAgent is called', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockAgentsResponse,
    });

    const { result } = renderHook(() => useAgentChat());

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(2);
    });

    act(() => {
      result.current.selectAgent('erp-analyst');
    });

    expect(result.current.selectedAgent).toBe('erp-analyst');
  });

  it('should clear conversation when clearConversation is called', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAgentsResponse,
      })
      .mockResolvedValueOnce(mockChatResponse);

    const { result } = renderHook(() => useAgentChat());

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(2);
    });

    act(() => {
      result.current.sendMessage('Hello');
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    act(() => {
      result.current.clearConversation();
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.selectedAgent).toBeNull();
    expect(result.current.isProcessing).toBe(false);
  });

  it('should handle SSE message chunks correctly', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockAgentsResponse,
    });

    const { result } = renderHook(() => useAgentChat());

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(2);
    });

    act(() => {
      result.current.sendMessage('Hello', 'erp-analyst');
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(true);
    });

    // Simulate agent.start event
    act(() => {
      mockEventSource.onmessage!({
        data: JSON.stringify({ type: 'agent.start', agentName: 'erp-analyst' }),
      } as MessageEvent);
    });

    // Simulate first message.chunk
    act(() => {
      mockEventSource.onmessage!({
        data: JSON.stringify({ type: 'message.chunk', content: 'Hello ' }),
      } as MessageEvent);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });

    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toBe('Hello ');
    expect(result.current.messages[1].agentName).toBe('erp-analyst');

    // Simulate final chunk
    act(() => {
      mockEventSource.onmessage!({
        data: JSON.stringify({ type: 'message.chunk', content: 'world!' }),
      } as MessageEvent);
    });

    await waitFor(() => {
      expect(result.current.messages[1].content).toBe('Hello world!');
    });

    // Simulate agent.end
    act(() => {
      mockEventSource.onmessage!({
        data: JSON.stringify({ type: 'agent.end' }),
      } as MessageEvent);
    });

    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
    });

    expect(mockEventSource.close).toHaveBeenCalled();
  });

  it('should fallback to hardcoded agents when API is unavailable', async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAgentsResponse,
      });

    const { result } = renderHook(() => useAgentChat());

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(4);
    });
  });

  it('should not send empty message', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockAgentsResponse,
    });

    const { result } = renderHook(() => useAgentChat());

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(2);
    });

    act(() => {
      result.current.sendMessage('   ');
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.isProcessing).toBe(false);
  });

  it('should update currentQuery when setQuery is called', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockAgentsResponse,
    });

    const { result } = renderHook(() => useAgentChat());

    await waitFor(() => {
      expect(result.current.agents).toHaveLength(2);
    });

    act(() => {
      result.current.setQuery('Test query');
    });

    expect(result.current.currentQuery).toBe('Test query');
  });
});
