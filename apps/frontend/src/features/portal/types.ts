/**
 * HEXA Portal v3.0 — Shared TypeScript Interfaces
 *
 * All portal-related types live here for strict type-safety across
 * components, hooks, and services. No `any` types allowed.
 */

/* -------------------------------------------------------------------------- */
/*  Dashboard & Executive Clarity                                             */
/* -------------------------------------------------------------------------- */

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatTrend {
  value: number;
  direction: TrendDirection;
}

export interface StatItem {
  label: string;
  value: number;
  icon: string;
  trend: StatTrend;
  format?: 'number' | 'currency' | 'percentage';
}

export interface HealthScoreData {
  score: number;
  status: string;
  metricBreakdown?: {
    timeline: number;
    budget: number;
    quality: number;
    communication: number;
  };
}

export type ActivityType =
  | 'approval'
  | 'upload'
  | 'comment'
  | 'milestone'
  | 'invoice'
  | 'message'
  | 'update';

export interface ActivityItemData {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  projectName?: string;
  timestamp: string;
  author?: string;
}

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'approval';

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface PendingApproval {
  id: string;
  title: string;
  type: 'design' | 'wireframe' | 'contract' | 'quotation' | 'invoice' | 'deliverable' | 'scope_change';
  phaseName: string;
  projectName: string;
  submittedAt: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  fileUrl?: string;
  amount?: number;
  currency?: string;
  auditTrail?: {
    timestamp: string;
    action: string;
    actor: string;
    notes?: string;
  }[];
}

export interface UpcomingMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: string[];
  link?: string;
}

export interface OutstandingInvoice {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'pending' | 'overdue' | 'partial' | 'paid';
  downloadUrl?: string;
}

export interface DashboardData {
  companyName: string;
  activeProjectName: string;
  activeProjectStage: string;
  overallProgressPercentage: number;
  nextMilestoneName: string;
  nextMilestoneDueDate: string;
  stats: StatItem[];
  healthScore: HealthScoreData;
  activity: ActivityItemData[];
  notifications: NotificationData[];
  pendingApprovals: PendingApproval[];
  upcomingMeetings: UpcomingMeeting[];
  outstandingInvoices: OutstandingInvoice[];
}

/* -------------------------------------------------------------------------- */
/*  Document Center v3.0                                                      */
/* -------------------------------------------------------------------------- */

export interface DocumentItem {
  id: string;
  name: string;
  folder: 'design' | 'contracts' | 'deliverables' | 'reports' | 'blueprints';
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
  version: string;
  downloadUrl: string;
  status: 'approved' | 'in_review' | 'draft';
  tags: string[];
}

/* -------------------------------------------------------------------------- */
/*  Finance Center v3.0                                                        */
/* -------------------------------------------------------------------------- */

export interface InvoiceItem {
  id: string;
  number: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  items: {
    description: string;
    amount: number;
  }[];
  downloadUrl: string;
}

/* -------------------------------------------------------------------------- */
/*  Support & Help Center v3.0                                                */
/* -------------------------------------------------------------------------- */

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'general' | 'technical' | 'billing' | 'feature_request';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    sender: string;
    role: 'client' | 'support' | 'ai';
    message: string;
    timestamp: string;
  }[];
}

/* -------------------------------------------------------------------------- */
/*  AI Copilot v3.0                                                            */
/* -------------------------------------------------------------------------- */

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  /** Base64 data URL of an attached image to display in the message bubble */
  imageUrl?: string;
  /** Whether this message is in a processing/streaming state */
  isProcessing?: boolean;
  suggestedActions?: {
    label: string;
    action: string;
    payload?: Record<string, unknown>;
  }[];
}

/* -------------------------------------------------------------------------- */
/*  Command Palette & Nav                                                     */
/* -------------------------------------------------------------------------- */

export type CommandCategory = 'projects' | 'documents' | 'invoices' | 'messages' | 'settings';

export interface CommandItem {
  id: string;
  category: CommandCategory;
  label: string;
  description?: string;
  href: string;
  icon: string;
}

export interface PortalNavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

/* -------------------------------------------------------------------------- */
/*  Workspace & Kanban v3.0                                                   */
/* -------------------------------------------------------------------------- */

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface PortalTask {
  id: string;
  projectId: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeName?: string;
  assigneeAvatar?: string;
  dueDate?: string;
  createdAt: string;
}

export interface PortalTeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
}

export interface PortalProjectDetail {
  id: number;
  name: string;
  type: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  description?: string;
  team: PortalTeamMember[];
  milestones: Array<{
    id: number;
    name: string;
    date: string;
    completed: boolean;
    description: string;
  }>;
  budgetSummary?: {
    total: number;
    invoiced: number;
    remaining: number;
  };
}

/* -------------------------------------------------------------------------- */
/*  Communication Center v3.0                                                  */
/* -------------------------------------------------------------------------- */

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: string;
  role: 'client' | 'team' | 'ai';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  projectName: string;
  participants: string[];
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
  type: 'project' | 'direct';
}

export interface MeetingNote {
  id: string;
  title: string;
  date: string;
  attendees: string[];
  summary: string;
  actionItems: string[];
  transcript?: string;
}
