'use client';

import React, { useRef } from 'react';
import { Send } from 'lucide-react';
import { MentionSuggestions, useMentions } from '@/components/MentionSuggestions';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  isPending?: boolean;
}

export function ChannelMessageInput({ value, onChange, onSend, isPending }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mention, suggestions, selectMention, handleInputChange } = useMentions({ inputRef });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    handleInputChange();
  };

  return (
    <form onSubmit={onSend} className="p-4 border-t border-border flex gap-3 relative">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          placeholder="Message #channel... @ to mention"
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-gold/50 transition-all"
        />
        <MentionSuggestions
          suggestions={suggestions}
          isActive={mention.isActive}
          onSelect={(user) => {
            selectMention(user);
            onChange(inputRef.current?.value ?? value);
          }}
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !value.trim()}
        className="bg-gold text-void-deep p-3 rounded-xl hover:bg-gold/90 transition-all disabled:opacity-40"
      >
        <Send size={18} />
      </button>
    </form>
  );
}
