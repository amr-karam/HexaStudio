/**
 * Executive Dashboard Type Definitions
 * Premium TypeScript types for the executive dashboard feature
 */

import { Socket } from "socket.io-client";

// ========== Real-time Metrics ==========
export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  lastActive: string;
  status: 'online' | 'idle' | 'offline';
  role: 'admin' | 'manager' | 'developer' | 'viewer';
}

export interface ActiveUsersResponse {
  total: number;
  users: ActiveUser[];
  activeInLastHour: number;
  peakToday: number;
}

// ========== Projects ==========
export interface OdooProject {
  id: string;
  name: string;
  client: string;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  progress: number;
  budget: number;
  revenue: number;
  startDate: string;
  deadline: string;
  teamSize: number;
  tags: string[];
}

export interface ProjectsResponse {
  inProgress: OdooProject[];
  totalProjects: number;
  completedThisMonth: number;
  revenueThisMonth: number;
}

// ========== Revenue ==========
export interface RevenueSummary {
  paid: number;
  pending: number;
  overdue: number;
  total: number;
  paidPercentage: number;
  pendingPercentage: number;
  currency: string;
}

export interface RevenueChartData {
  date: string;
  paid: number;
  pending: number;
  total: number;
}

// ========== AI Copilot ==========
export interface CopilotUsage {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  featuresUsed: string[];
  satisfactionScore: number;
}

export interface CopilotFeature {
  name: string;
  usageCount: number;
  satisfaction: number;
  lastUsed: string;
}

// ========== Channel Activity ==========
export interface ChannelActivity {
  channel: string;
  messages: number;
  reactions: number;
  members: number;
  activeNow: number;
  lastActivity: string;
}

export interface HeatmapData {
  date: string;
  hour: number;
  value: number;
}

// ========== Dashboard State ==========
export interface DashboardMetrics {
  activeUsers: ActiveUsersResponse;
  projects: ProjectsResponse;
  revenue: RevenueSummary;
  copilot: CopilotUsage;
  channelActivity: ChannelActivity[];
  lastUpdated: string;
}

export interface DashboardChartData {
  revenue: RevenueChartData[];
  projectsTimeline: {
    date: string;
    completed: number;
    inProgress: number;
  }[];
  copilotUsage: {
    date: string;
    sessions: number;
  }[];
  heatmap: HeatmapData[];
}

// ========== API Response Wrappers ==========
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

// ========== Socket Events ==========
export interface SocketEvents {
  'user:joined': (user: ActiveUser) => void;
  'user:left': (userId: string) => void;
  'user:status': (statusUpdate: { userId: string; status: ActiveUser['status'] }) => void;
  'metrics:updated': (metrics: DashboardMetrics) => void;
  'project:updated': (project: OdooProject) => void;
  'revenue:updated': (revenue: RevenueSummary) => void;
  'copilot:usage': (usage: CopilotUsage) => void;
  'error': (error: ErrorResponse) => void;
}

export type SocketEventName = keyof SocketEvents;

export interface SocketService {
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  on: <K extends SocketEventName>(event: K, callback: SocketEvents[K]) => void;
  off: <K extends SocketEventName>(event: K, callback: SocketEvents[K]) => void;
  emit: <K extends SocketEventName>(event: K, data: Parameters<SocketEvents[K]>[0]) => void;
}

// ========== Permissions ==========
export type UserRole = 'admin' | 'manager' | 'developer' | 'viewer';

export interface DashboardPermissions {
  canViewMetrics: boolean;
  canViewProjects: boolean;
  canViewRevenue: boolean;
  canViewCopilot: boolean;
  canExportData: boolean;
  canManageUsers: boolean;
}

// ========== Filter Options ==========
export interface DashboardFilters {
  timeRange: 'today' | 'week' | 'month' | 'quarter' | 'year';
  projectStatus: OdooProject['status'] | 'all';
  revenueType: 'all' | 'paid' | 'pending' | 'overdue';
  sortBy: 'name' | 'progress' | 'revenue' | 'deadline';
  sortDirection: 'asc' | 'desc';
}

// ========== Export Formats ==========
export type ExportFormat = 'csv' | 'json' | 'pdf' | 'png';

export interface ExportOptions {
  format: ExportFormat;
  includeCharts: boolean;
  includeTables: boolean;
  dateRange: string;
}
