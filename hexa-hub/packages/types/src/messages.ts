// ─── HEXA Hub — Message Types ──────────────────────────────────────────────
// Types for the local messages/socket-io chat system.
// ───────────────────────────────────────────────────────────────────────────

import type { User } from './user';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  type: 'text' | 'file' | 'system';
  fileUrl?: string;
  sender: Pick<User, 'id' | 'fullName'>;
  receiver: Pick<User, 'id' | 'fullName'>;
  createdAt: string;
}

export interface InboxContact {
  id: string;
  fullName: string;
  lastMessage?: string;
}