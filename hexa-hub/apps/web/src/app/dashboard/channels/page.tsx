'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/providers/SocketProvider';
import { useQueryClient } from '@tanstack/react-query';
import {
  ChannelList,
  ChannelHeader,
  ChannelMessageList,
  ChannelMessageInput,
  ChannelMembersPanel,
  CreateChannelModal,
} from '@/components/channels';
import { ThreadPanel } from '@/components/ThreadPanel';
import {
  useChannels,
  useChannel,
  useChannelMembers,
  useChannelMessages,
  useCreateChannel,
  useSendChannelMessage,
  type Channel,
  type ChannelMessage,
} from '@/lib/hooks/use-channels';
import type { ChatMessage } from '@hexa-hub/types';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ChannelsPage() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Active channel state
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<ChannelMessage[]>([]);
  const [activeThread, setActiveThread] = useState<ChannelMessage | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Queries
  const {
    data: channels,
    isLoading: channelsLoading,
  } = useChannels();

  const {
    data: activeChannel,
    isLoading: channelLoading,
  } = useChannel(activeChannelId ?? undefined);

  const {
    data: members,
    isLoading: membersLoading,
  } = useChannelMembers(activeChannelId ?? undefined);

  const {
    data: messages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useChannelMessages(activeChannelId ?? undefined);

  // Mutations
  const createChannelMutation = useCreateChannel();
  const sendMessageMutation = useSendChannelMessage(activeChannelId ?? undefined);

  // Sync remote messages into local state
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // ─── Socket.IO integration ──────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !activeChannelId) return;

    const handleNewChannelMessage = (newMessage: ChannelMessage) => {
      if (newMessage.channelId === activeChannelId) {
        setLocalMessages((prev) => [...prev, newMessage]);
      }
      // Refresh channel list to update memberCount etc
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    };

    socket.on('channel:new_message', handleNewChannelMessage);

    return () => {
      socket.off('channel:new_message', handleNewChannelMessage);
    };
  }, [socket, activeChannelId, queryClient]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectChannel = useCallback(
    (channel: Channel) => {
      setActiveChannelId(channel.id);
      setActiveThread(null);
      setInput('');
      refetchMessages();
    },
    [refetchMessages],
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChannelId) return;

    try {
      await sendMessageMutation.mutateAsync({ content: input });
      setInput('');
    } catch {
      // Silent
    }
  };

  const handleCreateChannel = async (data: {
    name: string;
    description?: string;
    type: 'public' | 'private';
  }) => {
    const result = await createChannelMutation.mutateAsync(data);
    // Auto-select the newly created channel
    setActiveChannelId(result.data.id);
  };

  const handleOpenThread = (message: ChannelMessage) => {
    setActiveThread(message);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-0px)] bg-[#141414] border border-[#1F1F1F] rounded-2xl overflow-hidden">
      {/* Channel Sidebar */}
      <ChannelList
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={handleSelectChannel}
        onCreateChannel={() => setShowCreateModal(true)}
        isLoading={channelsLoading}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black/10 relative">
        {activeChannelId ? (
          <>
            <ChannelHeader
              channel={activeChannel}
              isLoading={channelLoading}
            />

            <ChannelMessageList
              messages={localMessages}
              isLoading={messagesLoading}
              onOpenThread={handleOpenThread}
            />

            <ChannelMessageInput
              value={input}
              onChange={setInput}
              onSend={handleSendMessage}
              isPending={sendMessageMutation.isPending}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-gold"
                >
                  <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9" />
                  <path d="M16 3H21V8" />
                  <path d="M21 3L12 12" />
                </svg>
              </div>
              <p className="text-neutral-500 font-light text-sm">
                Select a channel to start chatting
              </p>
              <p className="text-[11px] text-neutral-700 font-light">
                Or create a new channel to get started
              </p>
            </motion.div>
          </div>
        )}

        {/* Thread Panel */}
        <AnimatePresence>
          {activeThread && activeChannelId && (
            <ThreadPanel
              parentMessage={
                {
                  ...activeThread,
                  // Map ChannelMessage fields to ChatMessage (ThreadPanel contract)
                  receiverId: '',
                  isRead: true,
                  receiver: { id: '', fullName: '' },
                  replyCount: activeThread.replyCount ?? 0,
                } as ChatMessage & { replyCount?: number }
              }
              channelId={activeChannelId}
              onClose={() => setActiveThread(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Members Panel */}
      {activeChannelId && (
        <ChannelMembersPanel
          members={members}
          isLoading={membersLoading}
        />
      )}

      {/* Create Channel Modal */}
      <CreateChannelModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateChannel}
      />
    </div>
  );
}
