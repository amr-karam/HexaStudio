// ─── HEXA Hub — AI Integration Hooks ──────────────────────────────────────
// React hooks for the Gemini-powered AI features.
// - useAiSummary: Generates contextual summaries via POST /ai/summarize.
// - useAiAssistant: Chat-like interaction via POST /ai/assist.
//
// Both hooks use @tanstack/react-query for automatic caching,
// loading/error state management, and background refetching.
// ───────────────────────────────────────────────────────────────────────────

'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { get, post } from '@/lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────

/** AI summary request payload */
export interface AiSummaryRequest {
  context: string;
  maxLength?: number;
  style?: 'concise' | 'detailed' | 'bullet-points';
}

/** AI summary response */
export interface AiSummaryResponse {
  summary: string;
  tokensUsed: number;
  processingTimeMs: number;
}

/** A single message in the assistant conversation */
export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

/** AI assistant request payload */
export interface AiAssistRequest {
  message: string;
  conversationHistory?: Omit<AssistantMessage, 'id' | 'timestamp'>[];
  context?: string;
}

/** AI assistant response */
export interface AiAssistResponse {
  id: string;
  message: AssistantMessage;
  tokensUsed: number;
}

/** Exposed state shape for useAiSummary */
export interface UseAiSummaryReturn {
  data: string | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  generateSummary: (context: string) => void;
  isPending: boolean;
}

/** Exposed state shape for useAiAssistant */
export interface UseAiAssistantReturn {
  messages: AssistantMessage[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  sendMessage: (content: string) => void;
  clearConversation: () => void;
  isPending: boolean;
}

// ─── Query Key Constants ──────────────────────────────────────────────────

const AI_KEYS = {
  summary: 'ai-summary',
  assistant: 'ai-assistant',
} as const;

// ─── useAiSummary ─────────────────────────────────────────────────────────

/**
 * Hook for generating AI summaries of the provided context.
 *
 * Uses a lazy query pattern: the summary is only fetched when
 * `generateSummary()` is called with a new context string.
 *
 * @param context — Optional initial context to summarize.
 * @returns Summary state and the generateSummary trigger.
 *
 * @example
 * ```tsx
 * const { data: summary, generateSummary, isLoading } = useAiSummary();
 *
 * // Trigger summary generation
 * <button onClick={() => generateSummary(longText)}>Summarize</button>
 *
 * {isLoading ? <Spinner /> : <p>{summary}</p>}
 * ```
 */
export function useAiSummary(context?: string): UseAiSummaryReturn {
  const queryClient = useQueryClient();
  const queryKey: QueryKey = [AI_KEYS.summary, context];

  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AiSummaryResponse, Error>({
    queryKey,
    queryFn: () =>
      post<AiSummaryResponse>('/ai/summarize', {
        context: context ?? '',
        maxLength: 200,
        style: 'concise',
      } satisfies AiSummaryRequest),
    enabled: false, // Lazy — only runs when explicitly triggered
    staleTime: 60_000,
    retry: 1,
  });

  const generateSummary = (newContext: string) => {
    queryClient.setQueryData([AI_KEYS.summary, newContext], undefined);
    queryClient.invalidateQueries({ queryKey: [AI_KEYS.summary, newContext] });
    queryClient.fetchQuery({
      queryKey: [AI_KEYS.summary, newContext],
      queryFn: () =>
        post<AiSummaryResponse>('/ai/summarize', {
          context: newContext,
          maxLength: 200,
          style: 'concise',
        } satisfies AiSummaryRequest),
      staleTime: 60_000,
    });
  };

  return {
    data: rawData?.summary ?? null,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
    generateSummary,
    isPending: isLoading,
  };
}

// ─── useAiAssistant ───────────────────────────────────────────────────────

/**
 * Hook for AI assistant chat interaction.
 *
 * Manages a local conversation history and sends messages to POST /ai/assist.
 * Uses useMutation for the send action while the message history lives in
 * component-local state (returned alongside the mutation).
 *
 * @returns Chat messages, loading state, sendMessage, and clearConversation.
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isLoading, clearConversation } = useAiAssistant();
 *
 * // Type and send
 * sendMessage("What's the status of Project Nexus?");
 *
 * // Messages accumulate: [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]
 * ```
 */
export function useAiAssistant(): UseAiAssistantReturn {
  const queryClient = useQueryClient();
  const conversationKey: QueryKey = [AI_KEYS.assistant];

  // Retrieve messages from query cache (acts as state store)
  const messages =
    queryClient.getQueryData<AssistantMessage[]>(conversationKey) ?? [];

  const mutation = useMutation<
    AiAssistResponse,
    Error,
    AiAssistRequest
  >({
    mutationFn: (payload) =>
      post<AiAssistResponse>('/ai/assist', payload),
    onSuccess: (response) => {
      // Append the assistant's response to the conversation history
      const currentMessages =
        queryClient.getQueryData<AssistantMessage[]>(conversationKey) ?? [];
      queryClient.setQueryData<AssistantMessage[]>(conversationKey, [
        ...currentMessages,
        response.message,
      ]);
    },
    retry: 1,
  });

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    // Append user message
    const currentMessages =
      queryClient.getQueryData<AssistantMessage[]>(conversationKey) ?? [];
    queryClient.setQueryData<AssistantMessage[]>(conversationKey, [
      ...currentMessages,
      userMessage,
    ]);

    // Build conversation history for context (last 20 messages)
    const allMessages =
      queryClient.getQueryData<AssistantMessage[]>(conversationKey) ?? [];
    const history = allMessages.slice(-20).map(({ role, content }) => ({
      role,
      content,
    }));

    mutation.mutate({
      message: content.trim(),
      conversationHistory: history,
    });
  };

  const clearConversation = () => {
    queryClient.setQueryData<AssistantMessage[]>(conversationKey, []);
  };

  return {
    messages,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ?? null,
    sendMessage,
    clearConversation,
    isPending: mutation.isPending,
  };
}
