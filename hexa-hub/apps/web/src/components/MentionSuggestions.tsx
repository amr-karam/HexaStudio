'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { get } from '@/lib/api';
import { AtSign, Users, Shield } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface UserResult {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  label?: string;
}

interface MentionState {
  isActive: boolean;
  query: string;
  startIndex: number;
}

interface MentionHookProps {
  inputRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
  onMentionSelect?: (user: UserResult, mentionText: string) => void;
}

// ─── Special Mentions ───────────────────────────────────────────────────────

const SPECIAL_MENTIONS: (UserResult & { isSpecial: true })[] = [
  { id: '__all__', fullName: 'everyone', email: '', role: 'everyone', label: 'Notify everyone', isSpecial: true },
  { id: '__here__', fullName: 'here', email: '', role: 'here', label: 'Notify active members', isSpecial: true },
];

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMentions({ inputRef, onMentionSelect }: MentionHookProps) {
  const [mention, setMention] = useState<MentionState>({
    isActive: false,
    query: '',
    startIndex: -1,
  });

  const { data: users = [] } = useQuery<UserResult[]>({
    queryKey: ['users-search', mention.query],
    queryFn: () => get<UserResult[]>(`/users/search?q=${encodeURIComponent(mention.query)}`),
    enabled: mention.isActive && mention.query.length > 0,
    staleTime: 30_000,
  });

  const handleInputChange = useCallback(() => {
    const input = inputRef?.current;
    if (!input) return;

    const text = input.value;
    const cursorPos = input.selectionStart ?? 0;

    // Find @ before cursor
    const textBeforeCursor = text.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const query = textBeforeCursor.slice(atIndex + 1);
      // Only activate if @ is at word boundary or start
      const charBeforeAt = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' ';
      const isValidStart = charBeforeAt === ' ' || charBeforeAt === '\n' || atIndex === 0;

      if (isValidStart && !query.includes(' ')) {
        setMention({
          isActive: true,
          query,
          startIndex: atIndex,
        });
        return;
      }
    }

    setMention({ isActive: false, query: '', startIndex: -1 });
  }, [inputRef]);

  const selectMention = useCallback(
    (selection: UserResult) => {
      const input = inputRef?.current;
      if (!input || mention.startIndex === -1) return;

      const mentionText = `@${selection.fullName.toLowerCase().replace(/\s+/g, '.')}`;
      const before = input.value.slice(0, mention.startIndex);
      const after = input.value.slice(input.selectionStart ?? 0);
      input.value = `${before}${mentionText} ${after}`;

      // Place cursor after the inserted mention
      const newCursorPos = mention.startIndex + mentionText.length + 1;
      input.setSelectionRange(newCursorPos, newCursorPos);
      input.focus();

      setMention({ isActive: false, query: '', startIndex: -1 });
      onMentionSelect?.(selection, mentionText);
    },
    [inputRef, mention.startIndex, onMentionSelect],
  );

  // Combine special mentions with user search results
  const suggestions: (UserResult & { isSpecial?: boolean })[] = mention.query
    ? [
        ...SPECIAL_MENTIONS.filter((s) =>
          s.fullName.toLowerCase().includes(mention.query.toLowerCase()),
        ),
        ...users,
      ]
    : SPECIAL_MENTIONS;

  return { mention, suggestions, selectMention, handleInputChange };
}

// ─── MentionSuggestions Component ───────────────────────────────────────────

interface MentionSuggestionsProps {
  suggestions: (UserResult & { isSpecial?: boolean })[];
  isActive: boolean;
  onSelect: (user: UserResult) => void;
  highlightIndex?: number;
}

export function MentionSuggestions({
  suggestions,
  isActive,
  onSelect,
  highlightIndex = 0,
}: MentionSuggestionsProps) {
  return (
    <AnimatePresence>
      {isActive && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-full left-0 mb-2 w-72 bg-[#141414] border border-[#1F1F1F] rounded-xl shadow-2xl overflow-hidden z-50"
        >
          <div className="p-2">
            {suggestions.map((user, i) => {
              const isSpecial = user.isSpecial === true;
              const isHighlighted = i === highlightIndex;
              return (
                <button
                  key={user.id}
                  onClick={() => onSelect(user)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-150 ${
                    isHighlighted
                      ? 'bg-[#D4A843]/10 text-[#D4A843]'
                      : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                      isSpecial
                        ? 'bg-[#D4A843]/20 text-[#D4A843]'
                        : 'bg-[#1F1F1F] text-[#888]'
                    }`}
                  >
                    {isSpecial ? (
                      <Users size={14} />
                    ) : (
                      user.fullName[0]?.toUpperCase() ?? '?'
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        @{user.fullName}
                      </span>
                      {isSpecial && (
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-[#D4A843]/10 text-[#D4A843] rounded font-medium">
                          {user.role}
                        </span>
                      )}
                    </div>
                    {isSpecial ? (
                      <span className="text-[11px] text-[#555]">
                        {user.label ?? `@${user.fullName}`}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#555] truncate">
                        {user.email}
                      </span>
                    )}
                  </div>

                  {isHighlighted && (
                    <span className="text-[9px] text-[#555] font-mono">↩</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-2 border-t border-[#1F1F1F]/50 flex items-center gap-2 text-[10px] text-[#444]">
            <Shield size={10} />
            <span>Use @all, @here, or @role:admin for group mentions</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}