/**
 * Executive Dashboard Zustand Store
 * Centralized state management with premium TypeScript typing
 */

import { create } from "zustand";
import { 
  DashboardMetrics, 
  ActiveUsersResponse, 
  ProjectsResponse, 
  RevenueSummary, 
  CopilotUsage,
  ChannelActivity,
  DashboardFilters,
  DashboardPermissions,
  UserRole,
  ErrorResponse,
} from "../types/dashboard-types";
import { ROLE_PERMISSIONS } from "../config/dashboard-config";

// ========== Initial State ==========
const initialMetrics: DashboardMetrics = {
  activeUsers: {
    total: 0,
    users: [],
    activeInLastHour: 0,
    peakToday: 0,
  },
  projects: {
    inProgress: [],
    totalProjects: 0,
    completedThisMonth: 0,
    revenueThisMonth: 0,
  },
  revenue: {
    paid: 0,
    pending: 0,
    overdue: 0,
    total: 0,
    paidPercentage: 0,
    pendingPercentage: 0,
    currency: "USD",
  },
  copilot: {
    dailyActiveUsers: 0,
    monthlyActiveUsers: 0,
    totalSessions: 0,
    avgSessionDuration: 0,
    featuresUsed: [],
    satisfactionScore: 0,
  },
  channelActivity: [],
  lastUpdated: new Date().toISOString(),
};

const initialFilters: DashboardFilters = {
  timeRange: "month",
  projectStatus: "all",
  revenueType: "all",
  sortBy: "name",
  sortDirection: "desc",
};

// ========== Store State ==========
interface DashboardState {
  // Metrics
  metrics: DashboardMetrics;
  
  // Filters
  filters: DashboardFilters;
  
  // Permissions
  permissions: DashboardPermissions;
  
  // Error state
  error: string | null;
  
  // Actions
  setMetrics: (metrics: DashboardMetrics) => void;
  setActiveUsers: (users: ActiveUsersResponse) => void;
  setProjects: (projects: ProjectsResponse) => void;
  setRevenue: (revenue: RevenueSummary) => void;
  setCopilot: (copilot: CopilotUsage) => void;
  setChannelActivity: (activity: ChannelActivity[]) => void;
  setLastUpdated: (timestamp: string) => void;
  setError: (error: string | null) => void;
  
  // Filter actions
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  
  // Permission actions
  setUserRole: (role: UserRole) => void;
  
  // Utility actions
  resetMetrics: () => void;
  clearError: () => void;
}

// ========== Store Creator ==========
export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial state
  metrics: initialMetrics,
  filters: initialFilters,
  permissions: ROLE_PERMISSIONS.viewer,
  error: null,

  // ========== Metrics Setters ==========
  setMetrics: (metrics) => set({ metrics }),

  setActiveUsers: (activeUsers) =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        activeUsers,
        lastUpdated: new Date().toISOString(),
      },
    })),

  setProjects: (projects) =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        projects,
        lastUpdated: new Date().toISOString(),
      },
    })),

  setRevenue: (revenue) =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        revenue,
        lastUpdated: new Date().toISOString(),
      },
    })),

  setCopilot: (copilot) =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        copilot,
        lastUpdated: new Date().toISOString(),
      },
    })),

  setChannelActivity: (channelActivity) =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        channelActivity,
        lastUpdated: new Date().toISOString(),
      },
    })),

  setLastUpdated: (timestamp) =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        lastUpdated: timestamp,
      },
    })),

  // ========== Error Management ==========
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // ========== Filter Management ==========
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () => set({ filters: initialFilters }),

  // ========== Permission Management ==========
  setUserRole: (role) =>
    set({
      permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer,
    }),

  // ========== Utility Actions ==========
  resetMetrics: () => set({ metrics: initialMetrics, error: null }),
}));

// ========== Selectors ==========
export const selectActiveUsers = (state: DashboardState) => state.metrics.activeUsers;
export const selectProjects = (state: DashboardState) => state.metrics.projects;
export const selectRevenue = (state: DashboardState) => state.metrics.revenue;
export const selectCopilot = (state: DashboardState) => state.metrics.copilot;
export const selectChannelActivity = (state: DashboardState) => state.metrics.channelActivity;
export const selectLastUpdated = (state: DashboardState) => state.metrics.lastUpdated;
export const selectFilters = (state: DashboardState) => state.filters;
export const selectPermissions = (state: DashboardState) => state.permissions;
export const selectError = (state: DashboardState) => state.error;

// ========== Store Exports ==========
export type DashboardStore = ReturnType<typeof useDashboardStore>;
export type DashboardStateSelector<T> = (state: DashboardState) => T;
