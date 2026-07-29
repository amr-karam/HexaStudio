// ─── HEXA Hub — Channel Query Hooks ─────────────────────────────────────────
// React Query hooks for the channels module (REST endpoints).
// Supports listing, creating, deleting channels, sending messages, and replies.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';
import type { User } from '@hexa-hub/types';

// ─── Channel Types ───────────────────────────────────────────────────────────

export interface Channel {
  id: string;
  name: string;
  description?: string | null;
  type: 'public' | 'private' | 'dm';
  workspaceId?: string | null;
  createdBy: Pick<User, 'id' | 'fullName'>;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelMember {
  id: string;
  userId: string;
  channelId: string;
  role: 'owner' | 'admin' | 'member';
  user: Pick<User, 'id' | 'fullName' | 'email'>;
  joinedAt: string;
}

export interface ChannelMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'system';
  replyTo?: string | null;
  fileUrl?: string | null;
  sender: Pick<User, 'id' | 'fullName'>;
  replyCount?: number;
  createdAt: string;
}

// ─── Response Envelope ───────────────────────────────────────────────────────

interface EnvelopeResponse<T> {
  data: T;
}

// ─── Query Key Constants ───────────────────────────────────────────────────

export const CHANNELS_KEYS = {
  all: 'channels',
  detail: 'channel',
  members: 'channel-members',
  messages: 'channel-messages',
} as const;

// ─── useChannels ─────────────────────────────────────────────────────────────

/**
 * Fetch all channels.
 * GET /channels — returns { data: Channel[] }.
 */
export function useChannels() {
  const queryKey: QueryKey = [CHANNELS_KEYS.all];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EnvelopeResponse<Channel[]>, Error>({
    queryKey,
    queryFn: () => get<EnvelopeResponse<Channel[]>>('/channels'),
    staleTime: 30_000,
    retry: 1,
  });

  const channels = data?.data ?? [];

  return {
    data: channels,
    isLoading,
    isError,
    error: error ?? null,
    isEmpty: !isLoading && !isError && channels.length === 0,
    refetch,
  };
}

// ─── useChannel ──────────────────────────────────────────────────────────────

/**
 * Fetch a single channel by ID.
 * GET /channels/:id — returns { data: Channel }.
 *
 * @param id — The channel UUID.
 */
export function useChannel(id?: string) {
  const queryKey: QueryKey = [CHANNELS_KEYS.detail, id];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EnvelopeResponse<Channel>, Error>({
    queryKey,
    queryFn: () => get<EnvelopeResponse<Channel>>(`/channels/${id}`),
    staleTime: 30_000,
    retry: 1,
    enabled: !!id,
  });

  return {
    data: data?.data ?? null,
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}

// ─── useChannelMembers ───────────────────────────────────────────────────────

/**
 * Fetch members of a channel.
 * GET /channels/:channelId/members — returns { data: ChannelMember[] }.
 *
 * @param channelId — The channel UUID.
 */
export function useChannelMembers(channelId?: string) {
  const queryKey: QueryKey = [CHANNELS_KEYS.members, channelId];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EnvelopeResponse<ChannelMember[]>, Error>({
    queryKey,
    queryFn: () =>
      get<EnvelopeResponse<ChannelMember[]>>(`/channels/${channelId}/members`),
    staleTime: 30_000,
    retry: 1,
    enabled: !!channelId,
  });

  const members = data?.data ?? [];

  return {
    data: members,
    isLoading,
    isError,
    error: error ?? null,
    isEmpty: !isLoading && !isError && members.length === 0,
    refetch,
  };
}

// ─── useChannelMessages ──────────────────────────────────────────────────────

/**
 * Fetch messages for a channel.
 * GET /channels/:channelId/messages — returns { data: ChannelMessage[] }.
 *
 * @param channelId — The channel UUID.
 */
export function useChannelMessages(channelId?: string) {
  const queryKey: QueryKey = [CHANNELS_KEYS.messages, channelId];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<EnvelopeResponse<ChannelMessage[]>, Error>({
    queryKey,
    queryFn: () =>
      get<EnvelopeResponse<ChannelMessage[]>>(`/channels/${channelId}/messages`),
    staleTime: 10_000,
    retry: 1,
    enabled: !!channelId,
  });

  const messages = data?.data ?? [];

  return {
    data: messages,
    isLoading,
    isError,
    error: error ?? null,
    isEmpty: !isLoading && !isError && messages.length === 0,
    refetch,
  };
}

// ─── Mutation Payloads ───────────────────────────────────────────────────────

interface CreateChannelPayload {
  name: string;
  description?: string;
  type?: 'public' | 'private';
  workspaceId?: string;
}

interface SendChannelMessagePayload {
  content: string;
  type?: 'text' | 'file' | 'system';
  replyTo?: string;
}

interface ReplyToMessagePayload {
  content: string;
  type?: 'text' | 'file' | 'system';
}

interface AddMemberPayload {
  userId: string;
  role: 'owner' | 'admin' | 'member';
}

// ─── useCreateChannel ────────────────────────────────────────────────────────

/**
 * Create a new channel.
 * POST /channels — returns { data: Channel }.
 * Invalidates the channels list on success.
 */
export function useCreateChannel() {
  const queryClient = useQueryClient();

  return useMutation<EnvelopeResponse<Channel>, Error, CreateChannelPayload>({
    mutationFn: (payload) =>
      post<EnvelopeResponse<Channel>>('/channels', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHANNELS_KEYS.all] });
    },
  });
}

// ─── useUpdateChannel ────────────────────────────────────────────────────────

/**
 * Update a channel.
 * PUT /channels/:id — returns { data: Channel }.
 * Invalidates the channel detail and list queries on success.
 */
export function useUpdateChannel() {
  const queryClient = useQueryClient();

  return useMutation<
    EnvelopeResponse<Channel>,
    Error,
    { id: string } & Partial<CreateChannelPayload>
  >({
    mutationFn: ({ id, ...payload }) =>
      put<EnvelopeResponse<Channel>>(`/channels/${id}`, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [CHANNELS_KEYS.all] });
      queryClient.invalidateQueries({
        queryKey: [CHANNELS_KEYS.detail, variables.id],
      });
    },
  });
}

// ─── useDeleteChannel ────────────────────────────────────────────────────────

/**
 * Delete a channel.
 * DELETE /channels/:id — returns { id, deleted: true }.
 * Invalidates the channels list on success.
 */
export function useDeleteChannel() {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; deleted: boolean },
    Error,
    string
  >({
    mutationFn: (id) =>
      del<{ id: string; deleted: boolean }>(`/channels/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHANNELS_KEYS.all] });
    },
  });
}

// ─── useAddChannelMember ─────────────────────────────────────────────────────

/**
 * Add a member to a channel.
 * POST /channels/:channelId/members — returns { data: ChannelMember }.
 * Invalidates the members list on success.
 */
export function useAddChannelMember() {
  const queryClient = useQueryClient();

  return useMutation<
    EnvelopeResponse<ChannelMember>,
    Error,
    { channelId: string } & AddMemberPayload
  >({
    mutationFn: ({ channelId, ...payload }) =>
      post<EnvelopeResponse<ChannelMember>>(
        `/channels/${channelId}/members`,
        payload,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CHANNELS_KEYS.members, variables.channelId],
      });
    },
  });
}

// ─── useSendChannelMessage ───────────────────────────────────────────────────

/**
 * Send a message to a channel.
 * POST /channels/:channelId/messages — returns { data: ChannelMessage }.
 *
 * @param channelId — The channel to send the message to.
 */
export function useSendChannelMessage(channelId?: string) {
  const queryClient = useQueryClient();

  return useMutation<
    EnvelopeResponse<ChannelMessage>,
    Error,
    SendChannelMessagePayload
  >({
    mutationFn: (payload) =>
      post<EnvelopeResponse<ChannelMessage>>(
        `/channels/${channelId}/messages`,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CHANNELS_KEYS.messages, channelId],
      });
    },
  });
}

// ─── useReplyToMessage ───────────────────────────────────────────────────────

/**
 * Reply to a message in a channel.
 * POST /channels/:channelId/messages/:messageId/reply
 * returns { data: ChannelMessage }.
 *
 * @param channelId — The channel UUID.
 * @param messageId — The parent message UUID.
 */
export function useReplyToMessage(channelId?: string, messageId?: string) {
  const queryClient = useQueryClient();

  return useMutation<
    EnvelopeResponse<ChannelMessage>,
    Error,
    ReplyToMessagePayload
  >({
    mutationFn: (payload) =>
      post<EnvelopeResponse<ChannelMessage>>(
        `/channels/${channelId}/messages/${messageId}/reply`,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CHANNELS_KEYS.messages, channelId],
      });
    },
  });
}
