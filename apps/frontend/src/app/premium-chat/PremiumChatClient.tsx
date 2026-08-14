'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PremiumChat from '@/components/chat/PremiumChat';
import { useAuth } from '@/features/auth';
import { EASE } from '@/lib/motion';

/** Chat participant — matches the PremiumChat component contract. */
interface ChatUser {
  id: string;
  name: string;
  avatar: string;
}

interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  preview?: string;
}

interface ChatReaction {
  emoji: string;
  users: string[];
}

interface ChatMessage {
  id: string;
  sender: ChatUser;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  reactions?: ChatReaction[];
  attachments?: ChatAttachment[];
}

/** Neutral fallback identity — never fabricates an authenticated user. */
const GUEST_USER: ChatUser = {
  id: 'guest',
  name: 'Guest',
  avatar: '/logo-icon.svg',
};

const CONCIERGE: ChatUser = {
  id: 'hexa-concierge',
  name: 'Hexa Concierge',
  avatar: '/logo-icon.svg',
};

function createWelcomeMessage(): ChatMessage {
  return {
    id: 'welcome',
    sender: CONCIERGE,
    content:
      'Welcome to Premium Chat. This is your private line to the HEXA Studio atelier — share a project, ask about visualization, or begin a new collaboration.',
    timestamp: new Date(),
    status: 'read',
  };
}

export default function PremiumChatClient() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage()]);

  /** Derive the chat identity from the real authenticated user when available. */
  const currentUser = useMemo<ChatUser>(() => {
    if (!user) return GUEST_USER;
    return {
      id: user.id,
      name: user.username || 'Guest',
      avatar: '/logo-icon.svg',
    };
  }, [user]);

  const handleSendMessage = useCallback(
    (content: string, attachments?: ChatAttachment[]) => {
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        sender: currentUser,
        content,
        timestamp: new Date(),
        status: 'sent',
        attachments,
      };
      setMessages((prev) => [...prev, message]);
    },
    [currentUser],
  );

  /** Toggle the current user's participation in a reaction. */
  const handleReaction = useCallback(
    (messageId: string, reaction: ChatReaction) => {
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id !== messageId) return message;
          const reactions = message.reactions ?? [];
          const existing = reactions.find((r) => r.emoji === reaction.emoji);

          if (!existing) {
            return {
              ...message,
              reactions: [...reactions, { emoji: reaction.emoji, users: [currentUser.id] }],
            };
          }

          const hasUser = existing.users.includes(currentUser.id);
          const updated: ChatReaction = {
            ...existing,
            users: hasUser
              ? existing.users.filter((id) => id !== currentUser.id)
              : [...existing.users, currentUser.id],
          };

          const next = updated.users.length > 0
            ? reactions.map((r) => (r.emoji === reaction.emoji ? updated : r))
            : reactions.filter((r) => r.emoji !== reaction.emoji);

          return { ...message, reactions: next };
        }),
      );
    },
    [currentUser.id],
  );

  return (
    /* NOTE: <main id="main-content"> is rendered by LayoutShell in the root
       layout — this section is a labelled region inside that landmark, which
       keeps the document to a single <main> (HTML spec requirement). */
    <section
      aria-labelledby="premium-chat-title"
      className="min-h-screen pt-28 pb-16 bg-background relative overflow-hidden"
    >
      {/* Ambient gold aura */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[45%] h-[35%] bg-accent/3 blur-[180px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[35%] h-[30%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* ── Atelier Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE.entrance }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />
            <span className="font-mono text-[0.5625rem] uppercase tracking-[0.35em] text-neutral-500">
              § Concierge
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />
          </div>

          <h1
            id="premium-chat-title"
            className="font-serif text-4xl md:text-5xl font-light tracking-tight text-foreground"
          >
            Premium <span className="italic text-accent">Chat</span>
          </h1>

          <p className="text-neutral-400 font-light mt-3 max-w-xl leading-relaxed">
            A private line to the atelier. Bespoke conversations on architecture,
            visualization, and spatial intelligence — whenever you need them.
          </p>

          <button
            type="button"
            onClick={() => setMessages([createWelcomeMessage()])}
            aria-label="Start a new conversation"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-xs font-mono uppercase tracking-[0.1em] text-background transition-all duration-300 hover:bg-accent-light active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Start a new conversation
          </button>
        </motion.div>

        {/* ── Chat Surface ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE.entrance, delay: 0.15 }}
          className="h-[560px] md:h-[600px] overflow-hidden rounded-2xl border border-border/20 shadow-2xl"
        >
          <PremiumChat
            currentUser={currentUser}
            messages={messages}
            onSendMessage={handleSendMessage}
            onReaction={handleReaction}
          />
        </motion.div>
      </div>
    </section>
  );
}
