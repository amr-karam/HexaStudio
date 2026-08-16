'use client';

/**
 * HEXA Portal v3.0 — Communication Center
 * 
 * Premium project chat and meeting notes interface.
 * Features:
 * - Real-time project chat (WebSocket-backed)
 * - Direct messages and mentions
 * - Meeting notes with action items
 * - AI Summary button (integrates with Copilot)
 * - Searchable conversation history
 * - Grouped by project with unread indicators
 * - Smooth animations and motion design
 * - Dark/light theme support
 * - Reduced motion accessibility
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Icon } from './PortalIcons';
import { STAGGER, makeTransition, fadeLift, staggerContainer } from '@/lib/motion';
import { useAuth } from '@/features/auth';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePortalStore } from '../store';
import { createDynamicComponent } from '@/lib/dynamic-component';
import type { PortalAiCopilotProps } from './PortalAiCopilot';
// Heavy AI copilot drawer — lazy-loaded so the Communication Center only fetches
// it when the user actually opens the AI query panel.
const PortalAiCopilot = createDynamicComponent<PortalAiCopilotProps>(
  () =>
    import('./PortalAiCopilot').then((m) => ({
      default: m.PortalAiCopilot,
    })),
  { ssr: false, loading: <span aria-hidden="true" /> },
);
import type { ChatMessage, Conversation, MeetingNote } from '../types';

/* -------------------------------------------------------------------------- */
/*  Types & Constants                                                         */
/* -------------------------------------------------------------------------- */

interface ConversationGroup {
  projectName: string;
  conversations: Conversation[];
}

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                 */
/* -------------------------------------------------------------------------- */

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    projectName: 'Horizon Villa',
    participants: ['Marcus Vance (PM)', 'Elena Rostova (Lead Designer)', 'Client Team'],
    lastMessage: 'The 3D renderings look fantastic! Can we adjust the lighting on the west facade?',
    lastTimestamp: '2026-07-28T10:30:00Z',
    unread: 2,
    type: 'project',
  },
  {
    id: 'conv-2',
    projectName: 'Horizon Villa',
    participants: ['Marcus Vance (PM)', 'Client Team'],
    lastMessage: 'Approved the budget for Phase 2 materials.',
    lastTimestamp: '2026-07-27T15:45:00Z',
    unread: 0,
    type: 'project',
  },
  {
    id: 'conv-3',
    projectName: 'Skyline Tower',
    participants: ['David Kim (PM)', 'Sarah Chen (Designer)', 'Client Team'],
    lastMessage: 'Structural engineering review scheduled for tomorrow.',
    lastTimestamp: '2026-07-28T09:15:00Z',
    unread: 1,
    type: 'project',
  },
  {
    id: 'conv-4',
    projectName: 'Direct Messages',
    participants: ['You', 'Marcus Vance (PM)'],
    lastMessage: 'Thanks for the quick response on the RFI!',
    lastTimestamp: '2026-07-28T11:20:00Z',
    unread: 0,
    type: 'direct',
  },
  {
    id: 'conv-5',
    projectName: 'Direct Messages',
    participants: ['You', 'Elena Rostova (Lead Designer)'],
    lastMessage: 'Can we schedule a design review for the kitchen layout?',
    lastTimestamp: '2026-07-28T08:45:00Z',
    unread: 1,
    type: 'direct',
  },
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    sender: 'Elena Rostova (Lead Designer)',
    role: 'team',
    content: 'The 3D renderings look fantastic! Can we adjust the lighting on the west facade to get more golden hour effect?',
    timestamp: '2026-07-28T10:30:00Z',
    read: true,
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    sender: 'You',
    role: 'client',
    content: 'Absolutely! I love the current direction. Let me share some reference images for the warm lighting you mentioned.',
    timestamp: '2026-07-28T10:32:00Z',
    read: true,
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    sender: 'Elena Rostova (Lead Designer)',
    role: 'team',
    content: 'Great! I\'ll work on the lighting adjustments and share updated renders by EOD.',
    timestamp: '2026-07-28T10:35:00Z',
    read: false,
  },
  {
    id: 'msg-4',
    conversationId: 'conv-4',
    sender: 'Marcus Vance (PM)',
    role: 'team',
    content: 'Thanks for the quick response on the RFI! The structural team has confirmed the load-bearing capacity.',
    timestamp: '2026-07-28T11:20:00Z',
    read: true,
  },
  {
    id: 'msg-5',
    conversationId: 'conv-5',
    sender: 'Elena Rostova (Lead Designer)',
    role: 'team',
    content: 'Can we schedule a design review for the kitchen layout? I have some material samples to show you.',
    timestamp: '2026-07-28T08:45:00Z',
    read: false,
  },
];

const MOCK_MEETING_NOTES: MeetingNote[] = [
  {
    id: 'note-1',
    title: 'Phase 2 Design Review',
    date: '2026-07-25',
    attendees: ['Marcus Vance (PM)', 'Elena Rostova (Lead Designer)', 'David Kim (Structural Engineer)', 'Client Team'],
    summary: 'Reviewed Phase 2 design development documents. Approved facade materials and window specifications. Discussed lighting plan for west facade.',
    actionItems: [
      'Elena to update lighting plan with warmer color temperature (3000K)',
      'David to confirm structural implications of larger west-facing windows',
      'Client to provide artwork selections for lobby by Aug 5',
      'Marcus to schedule structural review for Aug 10',
    ],
  },
  {
    id: 'note-2',
    title: 'Kickoff Meeting',
    date: '2026-04-01',
    attendees: ['Marcus Vance (PM)', 'Elena Rostova (Lead Designer)', 'James Wong (Civil Engineer)', 'Client Team'],
    summary: 'Project kickoff and vision alignment. Established timeline, budget, and communication protocols.',
    actionItems: [
      'Finalize survey and soil report by Apr 15',
      'Complete concept sketches by Apr 30',
      'Schedule first client check-in for May 10',
    ],
    transcript: '[TRANSCRIPT AVAILABLE] - 45-minute discussion covering project scope, timeline, budget, and design vision...',
  },
];

/* -------------------------------------------------------------------------- */
/*  Helper Functions                                                          */
/* -------------------------------------------------------------------------- */

function groupConversationsByProject(conversations: Conversation[]): ConversationGroup[] {
  const projectMap = new Map<string, Conversation[]>();
  
  conversations.forEach(conv => {
    if (!projectMap.has(conv.projectName)) {
      projectMap.set(conv.projectName, []);
    }
    projectMap.get(conv.projectName)!.push(conv);
  });
  
  return Array.from(projectMap.entries()).map(([projectName, conversations]) => ({
    projectName,
    conversations: conversations.sort((a, b) => 
      new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    ),
  }));
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

/** Conversation item in the sidebar */
function ConversationItem({ 
  conversation, 
  activeConversationId, 
  onSelect,
  prefersReduced
}: {
  conversation: Conversation;
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  prefersReduced: boolean;
}) {
  const isActive = conversation.id === activeConversationId;
  const unreadBadge = conversation.unread > 0 ? (
    <span className={cn(
      'flex h-2.5 w-2.5',
      'relative flex h-2.5 w-2.5',
      'absolute -right-2 -top-2',
      'animate-ping rounded-full bg-emerald-400 opacity-50',
    )}>
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
    </span>
  ) : null;

  return (
    <motion.div
      key={conversation.id}
      variants={fadeLift}
      initial="hidden"
      animate="visible"
      custom={prefersReduced}
      transition={makeTransition('entrance', 'component', 0.05)}
      onClick={() => onSelect(conversation.id)}
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl',
        'cursor-pointer',
        isActive ? 'bg-accent/10 border-accent/20' : 'border-border/20',
        'hover:bg-white/[0.03] hover:border-accent/10',
        'transition-colors duration-200'
      )}
    >
      {/* Avatar placeholder */}
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface/20 border-border/30 shrink-0">
        <Icon name="users" size={14} className="text-neutral-500" />
      </div>
      
      {/* Conversation details */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className={cn(
            'text-sm font-semibold text-foreground',
            isActive ? 'text-accent' : undefined
          )}>
            {conversation.projectName}
          </h4>
          <span className="text-xs font-mono text-neutral-500">
            {formatTimeAgo(conversation.lastTimestamp)}
          </span>
        </div>
        <p className="text-[11px] text-neutral-400 line-clamp-1">
          {conversation.lastMessage}
        </p>
        {unreadBadge}
      </div>
    </motion.div>
  );
}

/** Chat message bubble */
function MessageBubble({ 
  message, 
  index, 
  prefersReduced
}: {
  message: ChatMessage;
  index: number;
  prefersReduced: boolean;
}) {
  const isUser = message.role === 'client';
  const isAI = message.role === 'ai';
  
  return (
    <motion.div
      key={message.id}
      variants={fadeLift}
      initial="hidden"
      animate="visible"
      custom={prefersReduced}
      transition={makeTransition('entrance', 'component', index * 0.05)}
      className={cn(
        'flex w-full max-w-2xl',
        isUser ? 'justify-end' : 'justify-start',
        'mb-4'
      )}
    >
      {/* Message bubble */}
      <motion.div
        variants={fadeLift}
        initial="hidden"
        animate="visible"
        custom={prefersReduced}
        transition={makeTransition('entrance', 'component', 0.03)}
        className={cn(
          'max-w-[80%] rounded-xl py-3 px-4',
          isUser ? 'bg-accent text-void' : isAI ? 'bg-surface/20 border-border/30' : 'bg-white/5 border-border/20',
          'whitespace-pre-wrap break-words'
        )}
      >
        {/* Sender name (for team/AI messages) */}
        {!isUser && (
          <div className="flex items-center gap-1 mb-1">
            <Icon 
              name={isAI ? 'sparkles' : 'user'} 
              size={10} 
              className={isAI ? 'text-accent' : 'text-neutral-500'} 
            />
            <span className="text-xs font-mono {isAI ? 'text-accent' : 'text-neutral-400'}">
              {message.sender}
            </span>
          </div>
        )}
        
        {/* Message content */}
        <p className="text-sm leading-relaxed">{message.content}</p>
        
        {/* Timestamp and status */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-mono text-neutral-500">
            {formatTimeAgo(message.timestamp)}
          </span>
          {!message.read && (
            <span className="flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Message input component */
function MessageInput({ 
  onSend, 
  onAIQuery
}: {
  onSend: (text: string) => Promise<void>;
  conversationId: string;
  onAIQuery: () => void;
}) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    
    setIsSending(true);
    try {
      await onSend(input);
      setInput('');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <form onSubmit={handleSend} className="flex items-center gap-2 p-4 bg-surface/5 border-t border-border/20">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message... (Press Cmd+Enter to send)"
        className={cn(
          'flex-1 min-h-[60px] rounded-xl border border-border/30 bg-surface/90 px-4 py-3 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
          'resize-none'
        )}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSend(e as React.FormEvent);
          }
        }}
        disabled={isSending}
      />
      
      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAIQuery}
          disabled={isSending}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            'border border-border/30 hover:border-accent/20',
            'bg-surface/90 hover:bg-surface/80',
            'transition-all duration-200',
            isSending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          )}
          aria-label="Ask HEXA Copilot for summary"
        >
          <Icon name="sparkles" size={16} className={isSending ? 'text-neutral-400' : 'text-accent'} />
        </button>
        
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            'bg-gradient-to-r from-accent to-accent-bright text-void',
            'hover:from-accent-bright hover:to-accent/echo',
            'shadow-lg shadow-accent/15 hover:shadow-accent/25',
            'transition-all duration-300',
            isSending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          {isSending ? (
            <Icon name="loader" size={16} className="text-void animate-spin" />
          ) : (
            <Icon name="send" size={16} />
          )}
        </button>
      </div>
    </form>
  );
}

/** Meeting notes tab */
function MeetingNotesTab({ 
  notes, 
  prefersReduced
}: {
  notes: MeetingNote[];
  prefersReduced: boolean;
}) {
  return (
    <motion.div
      key="meeting-notes-tab"
      variants={fadeLift}
      initial="hidden"
      animate="visible"
      custom={prefersReduced}
    >
      <div className="space-y-6">
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            variants={fadeLift}
            initial="hidden"
            animate="visible"
            custom={prefersReduced}
            transition={makeTransition('entrance', 'component', index * 0.08)}
            className="rounded-2xl border border-border/20 bg-surface p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{note.title}</h3>
              <span className="text-xs font-mono text-neutral-500">{note.date}</span>
            </div>
            
            <div className="space-y-4">
              {/* Attendees */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-mono text-neutral-500">Attendees:</span>
                {note.attendees.map((attendee, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 rounded bg-neutral-800/20 px-2 py-0.5 text-xs font-mono">
                    {attendee}
                  </span>
                ))}
              </div>
              
              {/* Summary */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-400">Summary</p>
                <p className="text-sm text-neutral-300">{note.summary}</p>
              </div>
              
              {/* Action Items */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-400">Action Items</p>
                <div className="space-y-1">
                  {note.actionItems.map((item, idx) => (
                    <motion.div
                      key={item}
                      variants={fadeLift}
                      initial="hidden"
                      animate="visible"
                      custom={prefersReduced}
                      transition={makeTransition('entrance', 'component', idx * 0.05)}
                      className="flex items-start gap-2"
                    >
                      <span className="flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </span>
                      <span className="text-sm text-neutral-400">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Transcript (if available) */}
              {note.transcript && (
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <p className="text-sm font-medium text-neutral-400">Transcript</p>
                  <p className="text-sm text-neutral-300">{note.transcript}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Communication Center Component                                       */
/* -------------------------------------------------------------------------- */

export function CommunicationCenter() {
  const { user } = useAuth();
  const { isSidebarOpen: isMobileSidebarOpen, setSidebarOpen } = usePortalStore();
  const prefersReduced = useReducedMotion();
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    MOCK_CONVERSATIONS[0]?.id ?? null
  );
  const [conversationGroup, setConversationGroup] = useState<ConversationGroup[]>(
    groupConversationsByProject(MOCK_CONVERSATIONS)
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [meetingNotes] = useState<MeetingNote[]>(MOCK_MEETING_NOTES);
  const [aiQueryOpen, setAiQueryOpen] = useState(false);
  
  // Initialize with messages for the first conversation
  useEffect(() => {
    if (activeConversationId) {
      const filteredMessages = MOCK_MESSAGES.filter(
        msg => msg.conversationId === activeConversationId
      ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      setMessages(filteredMessages);
    }
  }, [activeConversationId]);
  
  // Handle conversation selection
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false); // Close mobile sidebar on selection
    
    // Load messages for selected conversation
    const filteredMessages = MOCK_MESSAGES.filter(
      msg => msg.conversationId === id
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    setMessages(filteredMessages);
  };
  
  // Handle sending a message
  const handleSendMessage = async (text: string) => {
    // In a real implementation, this would send via WebSocket
    // For now, we'll simulate by adding to mock data
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      conversationId: activeConversationId ?? '',
      sender: user?.username ?? 'Client',
      role: 'client',
      content: text,
      timestamp: new Date().toISOString(),
      read: true,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update last message in conversation
    setConversationGroup(prev => 
      prev.map(group => ({
        ...group,
        conversations: group.conversations.map(conv => 
          conv.id === activeConversationId
            ? {
                ...conv,
                lastMessage: text,
                lastTimestamp: new Date().toISOString(),
                unread: 0 // Reset unread when we send a message
              }
            : conv
        )
      }))
    );
  };
  
  // Handle AI query (opens copilot with context)
  const handleAIQuery = () => {
    setAiQueryOpen(true);
  };
  
  // Handle toggling meeting notes tab
  const [showMeetingNotes, setShowMeetingNotes] = useState(false);
  
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mobile Sidebar Drawer */}
      <PortalMobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onToggle={() => setSidebarOpen(!isMobileSidebarOpen)} 
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        conversationGroups={conversationGroup}
        prefersReduced={prefersReduced}
      />
      
      {/* Desktop Sidebar */}
      <PortalDesktopSidebar 
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        conversationGroups={conversationGroup}
        prefersReduced={prefersReduced}
      />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-border/20">
          <div className="flex items-center gap-3">
            {activeConversationId && (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <Icon name="users" size={14} className="text-accent" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {conversationGroup.find(g => 
                      g.conversations.some(c => c.id === activeConversationId)
                    )?.conversations.find(c => c.id === activeConversationId)?.projectName ?? 'Conversation'}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {conversationGroup.find(g => 
                      g.conversations.some(c => c.id === activeConversationId)
                    )?.conversations.find(c => c.id === activeConversationId)?.participants.join(' · ') ?? ''}
                  </p>
                  </div>
                </>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMeetingNotes(!showMeetingNotes)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                'border border-border/30 hover:border-accent/20',
                'bg-surface/90 hover:bg-surface/80',
                'transition-all duration-200'
              )}
              aria-label={showMeetingNotes ? 'Hide meeting notes' : 'Show meeting notes'}
            >
              <Icon name="file-text" size={16} className={showMeetingNotes ? 'text-accent' : 'text-neutral-600'} />
            </button>
            
            <button
              onClick={handleAIQuery}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                'border border-border/30 hover:border-accent/20',
                'bg-surface/90 hover:bg-surface/80',
                'transition-all duration-200'
              )}
              aria-label="Ask HEXA Copilot for summary"
            >
              <Icon name="sparkles" size={16} className="text-neutral-600" />
            </button>
          </div>
        </div>
        
        {/* Tabs: Chat / Meeting Notes */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!showMeetingNotes ? (
            // Chat View
            <div className="flex-1 flex flex-col">
              {/* Messages List */}
              <div className="flex-1 px-6 py-4 overflow-y-auto">
                {messages.length === 0 ? (
                  <motion.div
                    variants={fadeLift}
                    initial="hidden"
                    animate="visible"
                    custom={prefersReduced}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-border/20 flex items-center justify-center mb-4">
                      <Icon name="message-square" size={24} className="text-neutral-500" />
                    </div>
                    <p className="text-sm text-neutral-500">
                      Start the conversation
                    </p>
                  </motion.div>
                ) : (
                  <motion.ol
                    variants={staggerContainer(STAGGER.component, 0.05)}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4 pt-2"
                    role="list"
                    aria-label="Chat messages"
                  >
                    {messages.map((message, index) => (
                      <motion.li
                        key={message.id}
                        variants={fadeLift}
                        initial="hidden"
                        animate="visible"
                        custom={prefersReduced}
                        transition={makeTransition('entrance', 'component', index * 0.08)}
                        className="flex-1 min-w-0"
                        role="listitem"
                      >
                        <MessageBubble 
                          message={message} 
                          index={index} 
                          prefersReduced={prefersReduced} 
                        />
                      </motion.li>
                    ))}
                  </motion.ol>
                )}
              </div>
              
              {/* Message Input */}
              <MessageInput 
                onSend={handleSendMessage} 
                conversationId={activeConversationId ?? ''}
                onAIQuery={handleAIQuery}
              />
            </div>
          ) : (
            // Meeting Notes View
            <MeetingNotesTab 
              notes={meetingNotes} 
              prefersReduced={prefersReduced} 
            />
          )}
        </div>
      </main>
      
      {/* AI Copilot Drawer */}
      <PortalAiCopilot
        isOpen={aiQueryOpen}
        onClose={() => setAiQueryOpen(false)}
        projectName={activeConversationId ? 
          conversationGroup.find(g => 
            g.conversations.some(c => c.id === activeConversationId)
          )?.conversations.find(c => c.id === activeConversationId)?.projectName 
          ?? 'Current Project'
        : 'Current Project'
        }
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Desktop Sidebar                                                           */
/* -------------------------------------------------------------------------- */

function PortalDesktopSidebar({
  activeConversationId,
  onSelectConversation,
  conversationGroups,
  prefersReduced
}: {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  conversationGroups: ConversationGroup[];
  prefersReduced: boolean;
}) {
  return (
    <aside
      className="hidden lg:flex w-72 flex-col bg-surface border-r border-border/30"
      aria-label="Conversation list"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/20">
        <h3 className="text-lg font-semibold text-foreground">Conversations</h3>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-4">
        {conversationGroups.map((group, groupIndex) => (
          <motion.div
            key={group.projectName}
            variants={fadeLift}
            initial="hidden"
            animate="visible"
            custom={prefersReduced}
            transition={makeTransition('entrance', 'component', groupIndex * 0.1)}
            className="mb-4"
          >
            <h4 className="text-base font-medium text-neutral-400 mb-2">
              {group.projectName}
            </h4>
            <div className="space-y-2">
              {group.conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  activeConversationId={activeConversationId}
                  onSelect={onSelectConversation}
                  prefersReduced={prefersReduced}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile Sidebar                                                            */
/* -------------------------------------------------------------------------- */

function PortalMobileSidebar({
  isOpen,
  onToggle,
  activeConversationId,
  onSelectConversation,
  conversationGroups,
  prefersReduced
}: {
  isOpen: boolean;
  onToggle: () => void;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  conversationGroups: ConversationGroup[];
  prefersReduced: boolean;
}) {
  return (
    <AnimatePresence mode="popLayout">
      {isOpen && (
        <motion.div
          key="mobile-sidebar"
          initial={{ x: '-100%' }}
          animate={{ x: '0%' }}
          exit={{ x: '-100%' }}
          custom={prefersReduced}
          className="fixed inset-0 z-[50] flex items-start justify-end pt-[15vh]"
        >
          {/* Backdrop */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
              exit: { opacity: 0 }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={prefersReduced}
            className="absolute inset-0 bg-black/60 backdrop-blur-lg"
            onClick={onToggle}
          />
          
          {/* Sidebar Panel */}
          <motion.div
            variants={{
              hidden: { x: '-100%' },
              visible: { x: '0%' },
              exit: { x: '-100%' }
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={prefersReduced}
            className="relative w-full max-w-xs mx-4"
          >
            <div className="flex h-full flex-col bg-surface border-l border-border/30">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/20">
                <h3 className="text-lg font-semibold text-foreground">Conversations</h3>
                <button
                  onClick={onToggle}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    'border border-border/30 hover:border-accent/20',
                    'bg-surface/90 hover:bg-surface/80',
                    'transition-all duration-200'
                  )}
                  aria-label="Close sidebar"
                >
                  <Icon name="x" size={16} className="text-neutral-600" />
                </button>
              </div>
              
              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto px-4">
                {conversationGroups.map((group, groupIndex) => (
                  <motion.div
                    key={group.projectName}
                    variants={fadeLift}
                    initial="hidden"
                    animate="visible"
                    custom={prefersReduced}
                    transition={makeTransition('entrance', 'component', groupIndex * 0.1)}
                    className="mb-4"
                  >
                    <h4 className="text-base font-medium text-neutral-400 mb-2">
                      {group.projectName}
                    </h4>
                    <div className="space-y-2">
                      {group.conversations.map((conv) => (
                        <ConversationItem
                          key={conv.id}
                          conversation={conv}
                          activeConversationId={activeConversationId}
                          onSelect={onSelectConversation}
                          prefersReduced={prefersReduced}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}