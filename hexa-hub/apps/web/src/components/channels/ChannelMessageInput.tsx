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
    <form onSubmit={onSend} className="p-4 border-t border-[#1F1F1F] flex gap-3 relative">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          placeholder="Message #channel... @ to mention"
          className="w-full bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#D4A843]/50 transition-all"
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
        className="bg-[#D4A843] text-[#0A0A0A] p-3 rounded-xl hover:bg-[#D4A843]/90 transition-all disabled:opacity-40"
      >
        <Send size={18} />
      </button>
    </form>
  );
}