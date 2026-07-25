/**
 * Dashboard aggregation types for the Client Portal.
 *
 * All response shapes for GET /api/portal/dashboard live here so that
 * controller, service, and frontend can share a single source of truth.
 */

// ── Project Health ────────────────────────────────────────────────────────────

export type ProjectHealthStatus = 'excellent' | 'good' | 'attention' | 'critical';

export interface ProjectHealth {
  /** 0-100 computed health score */
  score: number;
  status: ProjectHealthStatus;
  activeProjects: number;
  completedProjects: number;
  totalProjects: number;
}

// ── KPIs ──────────────────────────────────────────────────────────────────────

export interface DashboardKpis {
  activeProjects: number;
  pendingTasks: number;
  outstandingInvoices: number;
  totalOutstandingAmount: number;
  pendingApprovals: number;
  openSupportTickets: number;
}

// ── Recent Activity ───────────────────────────────────────────────────────────

export type ActivityType =
  | 'milestone_completed'
  | 'document_uploaded'
  | 'invoice_sent'
  | 'status_update'
  | 'comment_added'
  | 'approval_requested';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  projectId?: number;
  projectName?: string;
}

// ── Upcoming Items ────────────────────────────────────────────────────────────

export type MeetingType = 'call' | 'review' | 'presentation';

export interface UpcomingMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  type: MeetingType;
}

export interface UpcomingMilestone {
  id: string;
  name: string;
  dueDate: string;
  projectName: string;
  progress: number;
}

export interface UpcomingItems {
  meetings: UpcomingMeeting[];
  milestones: UpcomingMilestone[];
}

// ── Pending Approvals ─────────────────────────────────────────────────────────

export type ApprovalType = 'design' | 'invoice' | 'contract' | 'deliverable';
export type ApprovalPriority = 'low' | 'medium' | 'high';

export interface PendingApproval {
  id: string;
  type: ApprovalType;
  title: string;
  submittedAt: string;
  projectName: string;
  priority: ApprovalPriority;
}

// ── Notifications Summary ─────────────────────────────────────────────────────

export interface NotificationSummaryItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationsSummary {
  unread: number;
  total: number;
  recent: NotificationSummaryItem[];
}

// ── Workspace & Kanban Types ──────────────────────────────────────────────────

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

// ── Aggregate Dashboard Response ──────────────────────────────────────────────

export interface PortalDashboardData {
  projectHealth: ProjectHealth;
  kpis: DashboardKpis;
  recentActivity: ActivityItem[];
  upcoming: UpcomingItems;
  pendingApprovals: PendingApproval[];
  notifications: NotificationsSummary;
}
