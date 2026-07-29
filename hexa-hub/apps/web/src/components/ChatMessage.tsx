'use client';

// ─── HEXA Hub — Chat Message Component ────────────────────────────────────
// Reusable chat message bubble for the AI Assistant interface.
//
// Features:
// - User messages: right-aligned, dark bg, gold text
// - AI messages: left-aligned, gold-tinted bg, with avatar
// - Markdown rendering: **bold**, `code`, *italic*, bullet lists
// - Timestamp display on hover
// - Framer Motion entrance animation
//
// Design: Premium dark theme with gold (#D4A843) accent.
// ───────────────────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { cn } from '@/components/ui/cn';

// ─── Props ─────────────────────────────────────────────────────────────────

export interface ChatMessageProps {
  /** The role of the message sender */
  role: 'user' | 'assistant';
  /** The message content (supports basic markdown) */
  content: string;
  /** ISO timestamp string */
  timestamp?: string;
  /** Optional custom class for the wrapper */
  className?: string;
}

// ─── Animation Variants ────────────────────────────────────────────────────

const messageVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// ─── Markdown Renderer ─────────────────────────────────────────────────────

/**
 * Simple regex-based markdown renderer for AI responses.
 * Supports: **bold**, *italic*, `inline code`, bullet lists, numbered lists.
 * Does NOT use dangerouslySetInnerHTML — renders React nodes directly.
 */
function renderMarkdown(text: string): React.ReactNode {
  // Split into lines for block-level processing
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block fence: ``` or ```lang
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
        codeContent = '';
        continue;
      } else {
        // End of code block
        inCodeBlock = false;
        result.push(
          <pre
            key={`code-${i}`}
            className="my-2 p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] overflow-x-auto"
          >
            <code className="text-xs font-mono text-[#D4A843]/80 leading-relaxed whitespace-pre-wrap">
              {codeContent.trim()}
            </code>
          </pre>,
        );
        codeContent = '';
        codeLanguage = '';
        continue;
      }
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      result.push(<div key={`spacer-${i}`} className="h-2" />);
      continue;
    }

    // Bullet list: "- item" or "* item"
    const bulletMatch = line.match(/^[\s]*[-*]\s+(.+)/);
    if (bulletMatch) {
      result.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 ml-1 my-0.5">
          <span className="text-[#D4A843]/50 mt-0.5 shrink-0">•</span>
          <span className="text-sm font-light leading-relaxed">
            {renderInlineMarkdown(bulletMatch[1])}
          </span>
        </div>,
      );
      continue;
    }

    // Numbered list: "1. item"
    const numberedMatch = line.match(/^[\s]*(\d+)[.)]\s+(.+)/);
    if (numberedMatch) {
      result.push(
        <div key={`num-${i}`} className="flex items-start gap-2 ml-1 my-0.5">
          <span className="text-[#D4A843]/50 text-xs mt-0.5 shrink-0 min-w-[1.2em]">
            {numberedMatch[1]}.
          </span>
          <span className="text-sm font-light leading-relaxed">
            {renderInlineMarkdown(numberedMatch[2])}
          </span>
        </div>,
      );
      continue;
    }

    // Heading: ## Heading
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[0].match(/^#+/)?.[0].length ?? 2;
      const sizeClass =
        level === 1
          ? 'text-base font-medium'
          : level === 2
            ? 'text-sm font-medium'
            : 'text-xs font-medium';
      result.push(
        <div
          key={`h-${i}`}
          className={cn('text-white mt-3 mb-1', sizeClass)}
        >
          {renderInlineMarkdown(headingMatch[1])}
        </div>,
      );
      continue;
    }

    // Regular paragraph
    result.push(
      <p key={`p-${i}`} className="text-sm font-light leading-relaxed my-0.5">
        {renderInlineMarkdown(line)}
      </p>,
    );
  }

  // Unclosed code block
  if (inCodeBlock && codeContent.trim()) {
    result.push(
      <pre
        key="code-unclosed"
        className="my-2 p-3 rounded-lg bg-[#0A0A0A] border border-[#1F1F1F] overflow-x-auto"
      >
        <code className="text-xs font-mono text-[#D4A843]/80 leading-relaxed whitespace-pre-wrap">
          {codeContent.trim()}
        </code>
      </pre>,
    );
  }

  return result;
}

/**
 * Renders inline markdown: **bold**, *italic*, `code`, links.
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Split by patterns: **bold**, *italic*, `code`, [link](url)
  const pattern = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++}>{text.slice(lastIndex, match.index)}</span>,
      );
    }

    if (match[1]) {
      // **bold**
      parts.push(
        <strong key={key++} className="font-medium text-white">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={key++} className="italic text-[#D4A843]/80">
          {match[4]}
        </em>,
      );
    } else if (match[5]) {
      // `code`
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded bg-[#0A0A0A] border border-[#1F1F1F] text-xs font-mono text-[#D4A843]/80"
        >
          {match[6]}
        </code>,
      );
    } else if (match[7]) {
      // [link](url)
      parts.push(
        <a
          key={key++}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D4A843] underline underline-offset-2 hover:text-[#D4A843]/80 transition-colors"
        >
          {match[8]}
        </a>,
      );
    }

    lastIndex = pattern.lastIndex;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

// ─── Time Formatter ────────────────────────────────────────────────────────

function formatTime(isoStr: string): string {
  const date = new Date(isoStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ChatMessage({
  role,
  content,
  timestamp,
  className,
}: ChatMessageProps) {
  const isUser = role === 'user';

  const renderedContent = useMemo(
    () => (isUser ? content : renderMarkdown(content)),
    [content, isUser],
  );

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      layout
      className={cn(
        'flex gap-3 group',
        isUser ? 'justify-end' : 'justify-start',
        className,
      )}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#D4A843]/10 border border-[#D4A843]/10 flex items-center justify-center shrink-0 mt-0.5">
          <Bot size={15} className="text-[#D4A843]" strokeWidth={1.5} />
        </div>
      )}

      {/* Message bubble */}
      <div className="flex flex-col max-w-[78%]">
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-[#D4A843] text-[#0A0A0A] rounded-tr-md'
              : 'bg-[#141414] border border-[#1F1F1F] text-[#E5E5E5] rounded-tl-md',
          )}
        >
          {renderedContent}
        </div>

        {/* Timestamp — visible on hover */}
        {timestamp && (
          <span
            className={cn(
              'text-[10px] text-[#444] mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              isUser ? 'text-right' : 'text-left',
            )}
          >
            {formatTime(timestamp)}
          </span>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center shrink-0 mt-0.5">
          <User size={14} className="text-[#888]" strokeWidth={1.5} />
        </div>
      )}
    </motion.div>
  );
}

export default ChatMessage;
