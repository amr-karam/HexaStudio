// ─── HEXA Hub — Threads Query Hooks ────────────────────────────────────────
// React Query hooks for thread replies (DM and channel threads).
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

// ─── Response Envelope ──────────────────────────────────────────────────────

interface EnvelopeResponse<T> {
  data: T;
}

interface ThreadContext {
  parent: ChatMessage;
  replies: ChatMessage[];
  replyCount: number;
}

// ─── Query Key Constants ───────────────────────────────────────────────────

export const THREAD_KEYS = {
  thread: 'thread',
  threadReplies: 'thread-replies',
  channelThread: 'channel-thread',
} as const;

// ─── useThread (DM messages) ─────────────────────────────────────────────────

/**
 * Fetch a DM thread context (parent + replies).
 * GET /messages/thread/:messageId
 */
export function useThread(messageId?: string, _channelId?: string) {
  const queryKey: QueryKey = [THREAD_KEYS.thread, messageId];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EnvelopeResponse<ThreadContext | null>, Error>({
    queryKey,
    queryFn: () =>
      get<EnvelopeResponse<ThreadContext | null>>(`/messages/thread/${messageId}`),
    staleTime: 5_000,
    retry: 1,
    enabled: !!messageId,
  });

  return {
    data: data?.data,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}

// ─── useSendThreadReply (DM) ────────────────────────────────────────────────

interface ThreadReplyPayload {
  content: string;
  type?: 'text' | 'file' | 'system';
}

/**
 * Send a reply in a DM thread.
 * POST /messages/thread/:messageId/reply
 */
export function useSendThreadReply(parentMessageId?: string, _channelId?: string) {
  const queryClient = useQueryClient();

  return useMutation<
    EnvelopeResponse<ChatMessage>,
    Error,
    ThreadReplyPayload
  >({
    mutationFn: (payload) =>
      post<EnvelopeResponse<ChatMessage>>(
        `/messages/thread/${parentMessageId}/reply`,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [THREAD_KEYS.thread, parentMessageId],
      });
      queryClient.invalidateQueries({
        queryKey: ['messages-inbox'],
      });
    },
  });
}

// ─── useChannelThread ───────────────────────────────────────────────────────

/**
 * Fetch a channel thread context.
 * GET /channels/:channelId/messages/:messageId/thread
 */
export function useChannelThread(channelId?: string, messageId?: string) {
  const queryKey: QueryKey = [THREAD_KEYS.channelThread, channelId, messageId];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EnvelopeResponse<ThreadContext | null>, Error>({
    queryKey,
    queryFn: () =>
      get<EnvelopeResponse<ThreadContext | null>>(
        `/channels/${channelId}/messages/${messageId}/thread`,
      ),
    staleTime: 5_000,
    retry: 1,
    enabled: !!channelId && !!messageId,
  });

  return {
    data: data?.data,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
