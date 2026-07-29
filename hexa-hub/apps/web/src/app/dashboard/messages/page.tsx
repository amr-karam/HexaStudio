'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { useSocket } from '@/providers/SocketProvider';
import axios from 'axios';
import {
  Send,
  Search,
  User as UserIcon,
  Hash,
  Inbox,
  AtSign,
  Users,
  MessageCircle,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { PresenceIndicator, TypingIndicator } from '@/components/PresenceTypingIndicators';
import { MentionSuggestions, useMentions } from '@/components/MentionSuggestions';
import { ThreadPanel } from '@/components/ThreadPanel';
import { usePresence } from '@/lib/hooks/use-presence';
import { useTypingIndicator } from '@/lib/hooks/use-typing';
import { Tooltip } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonAvatar, SkeletonText } from '@/components/Skeleton';
import { cn } from '@/components/ui/cn';
import type { ChatMessage as ChatMsg } from '@hexa-hub/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender?: { fullName: string; id: string };
}

interface Contact {
  id: string;
  fullName: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface ChannelItem {
  id: string;
  type: 'channel';
  name: string;
  description: string;
  memberCount: number;
  unreadCount?: number;
}

type InboxTab = 'all' | 'dms' | 'channels' | 'mentions';

const TABS: { id: InboxTab; label: string; icon: typeof Inbox }[] = [
  { id: 'all', label: 'All', icon: Inbox },
  { id: 'dms', label: 'Messages', icon: UserIcon },
  { id: 'channels', label: 'Channels', icon: Hash },
  { id: 'mentions', label: 'Mentions', icon: AtSign },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function highlightMentions(text: string): React.ReactNode {
  const parts = text.split(/(@[a-zA-Z0-9_.-]+(?::[a-zA-Z0-9_.-]+)?)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const n = part.slice(1);
      const special = ['all', 'here', 'everyone', 'channel'].includes(n.toLowerCase());
      return (
        <span
          key={i}
          className={`font-medium ${
            special
              ? 'text-[#D4A843] bg-[#D4A843]/10 px-1 rounded'
              : 'text-[#D4A843]'
          }`}
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function formatTime(isoStr: string): string {
  const date = new Date(isoStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatLastSeen(isoStr: string): string {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function MessagesSkeleton() {
  return (
    <div className="flex h-[calc(100vh-8rem)] bg-[#141414] border border-[#1F1F1F] rounded-2xl overflow-hidden">
      {/* Sidebar skeleton */}
      <div className="w-72 border-r border-[#1F1F1F] flex flex-col bg-black/20 shrink-0">
        {/* Tab bar skeleton */}
        <div className="p-2 border-b border-[#1F1F1F] flex gap-0.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={32} className="flex-1 rounded-md" />
          ))}
        </div>
        {/* Search bar skeleton */}
        <div className="p-3 border-b border-[#1F1F1F]">
          <Skeleton variant="rectangular" height={34} className="rounded-lg" />
        </div>
        {/* Connection status skeleton */}
        <div className="px-3 py-1.5 border-b border-[#1F1F1F]/50 flex items-center gap-1.5">
          <Skeleton variant="circular" width={6} height={6} />
          <SkeletonText width="60px" className="h-2.5" />
        </div>
        {/* Section header skeleton */}
        <div className="px-3 py-2">
          <SkeletonText width="60px" className="h-2.5" />
        </div>
        {/* Contact list skeleton */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 mx-2 px-3 py-3">
            <SkeletonAvatar size={32} />
            <div className="flex-1 space-y-1.5">
              <SkeletonText width={`${55 + i * 5}%`} className="h-3.5" />
              <SkeletonText width={`${70 + i * 3}%`} className="h-2.5" />
            </div>
          </div>
        ))}
      </div>
      {/* Main skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <SkeletonAvatar size={64} />
          <SkeletonText width="200px" className="h-5 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// ─── Active Contact Header ──────────────────────────────────────────────────

function ChatHeader({
  contact,
  isOnline,
}: {
  contact: Contact;
  isOnline: boolean;
}) {
  return (
    <div className="px-5 py-3.5 border-b border-[#1F1F1F] flex items-center justify-between bg-[#0A0A0A]/20 shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-white">
            <UserIcon size={15} />
          </div>
          <PresenceIndicator
            isOnline={isOnline}
            size="sm"
            className="absolute -bottom-0.5 -right-0.5"
          />
        </div>
        <div>
          <h3 className="text-sm font-serif font-light text-white">
            {contact.fullName}
          </h3>
          <PresenceIndicator isOnline={isOnline} showLabel />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Tooltip content="Voice Call">
          <button className="p-2 rounded-lg text-[#555] hover:text-white hover:bg-white/[0.05] transition-colors">
            <Phone size={16} />
          </button>
        </Tooltip>
        <Tooltip content="Video Call">
          <button className="p-2 rounded-lg text-[#555] hover:text-white hover:bg-white/[0.05] transition-colors">
            <Video size={16} />
          </button>
        </Tooltip>
        <Tooltip content="More">
          <button className="p-2 rounded-lg text-[#555] hover:text-white hover:bg-white/[0.05] transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

// ─── Contact List Item ──────────────────────────────────────────────────────

function ContactItem({
  contact,
  isSelected,
  isOnline,
  onClick,
}: {
  contact: Contact;
  isSelected: boolean;
  isOnline: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
      onClick={onClick}
      className={cn(
        'mx-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group',
        isSelected
          ? 'bg-[#D4A843]/10 text-[#D4A843]'
          : 'hover:bg-white/5 text-neutral-400',
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-white">
            <UserIcon size={15} />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5">
            <PresenceIndicator isOnline={isOnline} size="sm" />
          </span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex items-center justify-between">
            <p
              className={cn(
                'text-xs font-medium truncate',
                isSelected ? 'text-[#D4A843]' : 'text-white',
              )}
            >
              {contact.fullName}
            </p>
            {contact.lastMessageTime && (
              <span className="text-[9px] text-[#444] ml-2 shrink-0">
                {formatTime(contact.lastMessageTime)}
              </span>
            )}
          </div>
          <p className="text-[10px] truncate mt-0.5">
            <span className={isOnline ? 'text-emerald-500/60' : 'text-neutral-600'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {contact.lastMessage && (
              <>
                <span className="text-[#444] mx-1">·</span>
                <span className="text-neutral-600">{contact.lastMessage}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Channel List Item ──────────────────────────────────────────────────────

function ChannelListItem({
  channel,
  isSelected,
  onClick,
}: {
  channel: ChannelItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
      onClick={onClick}
      className={cn(
        'mx-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
        isSelected
          ? 'bg-[#D4A843]/10 text-[#D4A843]'
          : 'text-neutral-400 hover:bg-white/5',
      )}
    >
      <div className="flex items-center gap-2">
        <Hash size={13} className="text-[#555] shrink-0" />
        <span className="text-xs font-medium truncate">{channel.name}</span>
        {channel.unreadCount ? (
          <span className="ml-auto text-[9px] bg-[#D4A843] text-[#0A0A0A] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

// ─── Message Bubble ─────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isOwn,
  onReply,
}: {
  message: Message;
  isOwn: boolean;
  onReply: (m: Message) => void;
}) {
  return (
    <div className="group">
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-0.5`}>
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isOwn
              ? 'bg-[#D4A843] text-[#0A0A0A] rounded-tr-none'
              : 'bg-[#1A1A1A] text-neutral-300 rounded-tl-none border border-[#1F1F1F]',
          )}
        >
          {highlightMentions(message.content)}
        </motion.div>
      </div>
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-center gap-1`}>
        <span className="text-[9px] text-[#444] opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(message.createdAt)}
        </span>
        <button
          onClick={() => onReply(message)}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-[#555] hover:text-[#D4A843] py-0.5"
        >
          <MessageCircle size={10} />
          <span>Reply</span>
        </button>
      </div>
    </div>
  );
}

// ─── Empty Chat View ────────────────────────────────────────────────────────

function EmptyChatView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex items-center justify-center text-[#555]"
    >
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-5">
          <Users size={32} className="text-[#444]" />
        </div>
        <p className="text-lg font-serif font-light text-white mb-2">Your Messages</p>
        <p className="text-sm font-light text-[#555] max-w-xs">
          Select a conversation from the sidebar to start messaging.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Error State ────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex items-center justify-center"
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <p className="text-sm text-white font-light mb-1">Failed to load</p>
        <p className="text-xs text-[#555] font-light mb-4">Could not load your messages.</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4A843] text-[#0A0A0A] rounded-lg text-sm font-medium hover:bg-[#D4A843]/90 transition-colors"
        >
          <RefreshCw size={13} />
          Retry
        </button>
      </div>
    </motion.div>
  );
}

// ─── MessagesPage ───────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChannelItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<InboxTab>('all');
  const [activeThread, setActiveThread] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // ── Hooks ─────────────────────────────────────────────────────────────────

  const { isUserOnline, isConnected: isSocketConnected } = usePresence();
  const conversationId = selectedContact?.id;
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(conversationId);
  const { mention, suggestions, selectMention, handleInputChange } = useMentions({ inputRef });

  // ── Fetch initial data ────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const [inboxRes, channelsRes] = await Promise.allSettled([
        axios.get(`${API_URL}/messages/inbox`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/messages/unified-inbox`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Process inbox contacts
      if (inboxRes.status === 'fulfilled') {
        const contactMap = new Map<string, Contact>();
        const data = Array.isArray(inboxRes.value.data)
          ? inboxRes.value.data
          : [];
        data.forEach((msg: Record<string, unknown>) => {
          const sender = msg.sender as Record<string, unknown> | undefined;
          if (sender && typeof sender.id === 'string' && !contactMap.has(sender.id)) {
            contactMap.set(sender.id, {
              id: sender.id,
              fullName: String(sender.fullName || 'Unknown'),
              lastMessage: String(msg.content || ''),
              lastMessageTime: String(msg.createdAt || ''),
            });
          }
        });
        setContacts(Array.from(contactMap.values()));
      }

      // Process channels
      if (channelsRes.status === 'fulfilled') {
        const sections = channelsRes.value.data?.sections;
        const channelItems = sections?.channels?.items ?? sections?.channels ?? [];
        setChannels(Array.isArray(channelItems) ? channelItems : []);
      }
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [token, API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Real-time message listener ────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (m: Message) => {
      if (
        selectedContact &&
        (m.senderId === selectedContact.id || m.receiverId === selectedContact.id)
      ) {
        setMessages((prev) => [...prev, m]);
      }
      // Refresh contacts list to update last message
      fetchData();
    };

    socket.on('new_message', handleNewMessage);
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, selectedContact, fetchData]);

  // ── Scroll to bottom on new messages ──────────────────────────────────────

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ── Fetch conversation messages ───────────────────────────────────────────

  const fetchMessages = useCallback(
    async (contactId: string) => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/messages/conversation/${contactId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setMessages(data);
      } catch {
        setMessages([]);
      }
    },
    [token, API_URL],
  );

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMsg = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || !selectedContact || isSending) return;

      setIsSending(true);
      try {
        await axios.post(
          `${API_URL}/messages/send`,
          { receiverId: selectedContact.id, content: trimmed },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setInput('');
        stopTyping();
        await fetchMessages(selectedContact.id);
      } catch {
        // Silently fail, user can retry
      } finally {
        setIsSending(false);
      }
    },
    [input, selectedContact, isSending, token, API_URL, stopTyping, fetchMessages],
  );

  // ── Handle typing signal ──────────────────────────────────────────────────

  const handleInputValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInput(value);
      handleInputChange();
      if (value.length > input.length) {
        startTyping();
      } else if (value.length === 0) {
        stopTyping();
      }
    },
    [input, handleInputChange, startTyping, stopTyping],
  );

  // ── Derived data ──────────────────────────────────────────────────────────

  const filteredContacts = searchQuery
    ? contacts.filter((c) =>
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : contacts;

  const showChannels = activeTab === 'all' || activeTab === 'channels';
  const showDMs = activeTab === 'all' || activeTab === 'dms' || activeTab === 'mentions';

  // Typing users excluding self
  const typers = typingUsers.filter((t) => t.userId !== user?.id);

  // ── Select contact ────────────────────────────────────────────────────────

  const selectContact = useCallback(
    (contact: Contact) => {
      setSelectedContact(contact);
      setSelectedChannel(null);
      setActiveThread(null);
      fetchMessages(contact.id);
    },
    [fetchMessages],
  );

  // ── Loading State ─────────────────────────────────────────────────────────

  if (isLoading) {
    return <MessagesSkeleton />;
  }

  // ── Error State (full page) ───────────────────────────────────────────────

  if (isError && contacts.length === 0 && channels.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8rem)] bg-[#141414] border border-[#1F1F1F] rounded-2xl overflow-hidden">
        <ErrorState onRetry={fetchData} />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-[#141414] border border-[#1F1F1F] rounded-2xl overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="w-72 border-r border-[#1F1F1F] flex flex-col bg-black/20 shrink-0">
        {/* Tabs */}
        <div className="p-2 border-b border-[#1F1F1F] flex gap-0.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-[11px] font-medium transition-all duration-200',
                  active
                    ? 'bg-[#D4A843]/10 text-[#D4A843]'
                    : 'text-[#555] hover:text-[#888]',
                )}
              >
                <Icon size={12} />
                <span className="hidden xl:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="p-3 border-b border-[#1F1F1F]">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#555]"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg py-1.5 pl-7 pr-3 text-xs text-white placeholder-[#555] outline-none focus:border-[#D4A843]/50 transition-all"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Socket Connection Status */}
        <div className="px-3 py-1.5 border-b border-[#1F1F1F]/50 flex items-center gap-1.5">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isSocketConnected ? 'bg-emerald-400' : 'bg-amber-400',
            )}
          />
          <span className="text-[9px] text-[#444] uppercase tracking-wider font-medium">
            {isSocketConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>

        {/* Channels */}
        {showChannels && channels.length > 0 && (
          <>
            <div className="px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-[#444] font-medium">
              Channels
            </div>
            {channels.map((ch) => (
              <ChannelListItem
                key={ch.id}
                channel={ch}
                isSelected={selectedChannel?.id === ch.id}
                onClick={() => {
                  setSelectedChannel(ch);
                  setSelectedContact(null);
                  setActiveThread(null);
                }}
              />
            ))}
          </>
        )}

        {/* Direct Messages */}
        {showDMs && (
          <div className="flex-1 overflow-y-auto">
            {channels.length > 0 && showChannels && filteredContacts.length > 0 && (
              <div className="px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-[#444] font-medium">
                Direct Messages
              </div>
            )}
            {filteredContacts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[11px] text-[#555] font-light">
                  {searchQuery
                    ? 'No contacts match your search.'
                    : 'No conversations yet.'}
                </p>
              </div>
            ) : (
              filteredContacts.map((c) => (
                <ContactItem
                  key={c.id}
                  contact={c}
                  isSelected={selectedContact?.id === c.id}
                  isOnline={isUserOnline(c.id)}
                  onClick={() => selectContact(c)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Main Chat Area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-black/10 relative">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              contact={selectedContact}
              isOnline={isUserOnline(selectedContact.id)}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-3">
                      <MessageCircle size={22} className="text-[#444]" />
                    </div>
                    <p className="text-sm text-[#555] font-light">
                      No messages yet. Say hello!
                    </p>
                  </div>
                </motion.div>
              ) : (
                messages.map((m, i) => (
                  <MessageBubble
                    key={m.id || i}
                    message={m}
                    isOwn={m.senderId === user?.id}
                    onReply={setActiveThread}
                  />
                ))
              )}
              <div ref={messagesEndRef} />

              {/* Typing Indicator */}
              <AnimatePresence>
                {typers.length > 0 && (
                  <TypingIndicator users={typers} />
                )}
              </AnimatePresence>
            </div>

            {/* Message Input */}
            <form
              onSubmit={sendMsg}
              className="px-4 py-3 border-t border-[#1F1F1F] flex items-end gap-2.5 relative bg-[#0A0A0A]/10"
            >
              <button
                type="button"
                className="p-2 rounded-lg text-[#555] hover:text-[#888] transition-colors"
              >
                <Paperclip size={17} />
              </button>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputValueChange}
                  onBlur={stopTyping}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') stopTyping();
                  }}
                  placeholder={`Message ${selectedContact.fullName}... @ to mention`}
                  className="w-full bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder-[#555] outline-none focus:border-[#D4A843]/50 transition-all font-light"
                  disabled={isSending}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#555] hover:text-[#888] transition-colors"
                >
                  <Smile size={16} />
                </button>
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-200 shrink-0',
                  input.trim() && !isSending
                    ? 'bg-[#D4A843] text-[#0A0A0A] hover:bg-[#D4A843]/90'
                    : 'bg-[#1A1A1A] text-[#444]',
                )}
              >
                {isSending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>

              {/* Mention Suggestions */}
              <MentionSuggestions
                suggestions={suggestions}
                isActive={mention.isActive}
                onSelect={(u) => {
                  selectMention(u);
                  setInput(inputRef.current?.value ?? input);
                }}
              />
            </form>

            {/* Thread Panel */}
            <AnimatePresence>
              {activeThread && (
                <ThreadPanel
                  parentMessage={
                    {
                      ...activeThread,
                      replyCount: 0,
                      sender: activeThread.sender ?? { id: '', fullName: '' },
                      isRead: true,
                      type: 'text' as const,
                      receiver: { id: '', fullName: '' },
                    } as ChatMsg
                  }
                  onClose={() => setActiveThread(null)}
                />
              )}
            </AnimatePresence>
          </>
        ) : selectedChannel ? (
          /* Channel View (read-only preview) */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Hash size={48} className="text-[#333] mx-auto mb-4" />
              <h2 className="text-xl font-serif font-light text-white mb-2">
                #{selectedChannel.name}
              </h2>
              <p className="text-[#555] text-sm">
                {selectedChannel.memberCount} members
              </p>
              <p className="text-[#444] text-xs mt-4">
                Open in{' '}
                <a
                  href="/dashboard/channels"
                  className="text-[#D4A843] hover:underline"
                >
                  Channels
                </a>{' '}
                for full messaging
              </p>
            </div>
          </div>
        ) : (
          <EmptyChatView />
        )}
      </div>
    </div>
  );
}
