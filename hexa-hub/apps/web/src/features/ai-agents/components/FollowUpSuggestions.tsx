// ─── FollowUpSuggestions ───────────────────────────────────────────────────
// Dynamic follow-up question chips based on agent response.

'use client';

import { motion } from 'framer-motion';

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSelect: (prompt: string) => void;
}

export function FollowUpSuggestions({ suggestions, onSelect }: FollowUpSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 mt-3"
    >
      {suggestions.map((suggestion, i) => (
        <motion.button
          key={suggestion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.05 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1.5 rounded-full text-xs text-tertiary bg-surface border border-border hover:border-gold/50 hover:text-gold transition-all"
        >
          {suggestion}
        </motion.button>
      ))}
    </motion.div>
  );
}
