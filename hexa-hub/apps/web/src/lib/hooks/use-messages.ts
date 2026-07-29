// ─── HEXA Hub — Messages Query Hooks ───────────────────────────────────────
// React Query hooks for the messages/chat module (REST + Socket.IO).
// Socket.IO integration invalidates queries on new_message events.
// ───────────────────────────────────────────────────────────────────────────

'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { get, post } from '@/lib/api';
import type { ChatMessage } from '@hexa-hub/types';

// ─── Response Envelope Type ─────────────────────────────────────────────────

interface EnvelopeResponse<T> {
  data: T;
}

// ─── Query Key Constants ───────────────────────────────────────────────────

export const MESSAGES_KEYS = {
  inbox: 'messages-inbox',
  conversation: 'messages-conversation',
} as const;

// ─── useInbox ───────────────────────────────────────────────────────────────

/**
 * Fetch the current user's inbox (latest messages from each contact).
 * GET /messages/inbox — returns { data: ChatMessage[] }.
 */
export function useInbox() {
  const queryKey: QueryKey = [MESSAGES_KEYS.inbox];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EnvelopeResponse<ChatMessage[]>, Error>({
    queryKey,
    queryFn: () => get<EnvelopeResponse<ChatMessage[]>>('/messages/inbox'),
    staleTime: 15_000,
    retry: 1,
  });

  return {
    data: data?.data ?? [],
    isLoading,
    isError,
    error: error ?? null,
    isEmpty: !isLoading && !isError && (data?.data?.length ?? 0) === 0,
    refetch,
  };
}

// ─── useConversation ────────────────────────────────────────────────────────

/**
 * Fetch the conversation between the current user and another user.
 * GET /messages/conversation/:userId — returns { data: ChatMessage[] }.
 *
 * @param otherUserId — The other participant's user ID.
 */
export function useConversation(otherUserId?: string) {
  const queryKey: QueryKey = [MESSAGES_KEYS.conversation, otherUserId];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EnvelopeResponse<ChatMessage[]>, Error>({
    queryKey,
    queryFn: () =>
      get<EnvelopeResponse<ChatMessage[]>>(`/messages/conversation/${otherUserId}`),
    staleTime: 10_000,
    retry: 1,
    enabled: !!otherUserId,
  });

  return {
    data: data?.data ?? [],
    isLoading,
    isError,
    error: error ?? null,
    isEmpty: !isLoading && !isError && (data?.data?.length ?? 0) === 0,
    refetch,
  };
}

// ─── useSendMessage ─────────────────────────────────────────────────────────

interface SendMessagePayload {
  receiverId: string;
  content: string;
}

/**
 * Send a message to another user.
 * POST /messages/send — returns { data: ChatMessage }.
 * Invalidates inbox and conversation queries on success.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<EnvelopeResponse<ChatMessage>, Error, SendMessagePayload>({
    mutationFn: (payload) =>
      post<EnvelopeResponse<ChatMessage>>('/messages/send', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MESSAGES_KEYS.inbox] });
      queryClient.invalidateQueries({
        queryKey: [MESSAGES_KEYS.conversation],
      });
    },
  });
}