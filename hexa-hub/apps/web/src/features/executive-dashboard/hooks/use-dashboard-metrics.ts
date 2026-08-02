/**
 * Executive Dashboard Metrics Hook
 * Real-time metrics with premium error handling and performance optimization
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { useShallow } from "zustand/react/shallow";
import { useDashboardStore } from "../services/dashboard-store";
import { 
  ActiveUsersResponse, 
  ProjectsResponse, 
  RevenueSummary, 
  CopilotUsage, 
  DashboardMetrics,
  SocketEvents,
  SocketEventName,
  ErrorResponse,
  ApiResponse
} from "../types/dashboard-types";
import { POLLING_INTERVALS, REALTIME_UPDATE_INTERVAL } from "../config/dashboard-config";
import { formatCurrency, formatNumber, formatPercentage } from "../utils/formatters";

// ========== API Endpoints ==========
const API_ENDPOINTS = {
  activeUsers: "/api/dashboard/active-users",
  projects: "/api/dashboard/projects",
  revenue: "/api/dashboard/revenue",
  copilot: "/api/dashboard/copilot",
  heatmap: "/api/dashboard/heatmap",
};

// ========== Metrics Service ==========
const fetchActiveUsers = async (): Promise<ActiveUsersResponse> => {
  const response = await fetch(API_ENDPOINTS.activeUsers);
  if (!response.ok) {
    throw new Error("Failed to fetch active users");
  }
  const data: ApiResponse<ActiveUsersResponse> = await response.json();
  return data.data;
};

const fetchProjects = async (): Promise<ProjectsResponse> => {
  const response = await fetch(API_ENDPOINTS.projects);
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  const data: ApiResponse<ProjectsResponse> = await response.json();
  return data.data;
};

const fetchRevenue = async (): Promise<RevenueSummary> => {
  const response = await fetch(API_ENDPOINTS.revenue);
  if (!response.ok) {
    throw new Error("Failed to fetch revenue");
  }
  const data: ApiResponse<RevenueSummary> = await response.json();
  return data.data;
};

const fetchCopilotUsage = async (): Promise<CopilotUsage> => {
  const response = await fetch(API_ENDPOINTS.copilot);
  if (!response.ok) {
    throw new Error("Failed to fetch copilot usage");
  }
  const data: ApiResponse<CopilotUsage> = await response.json();
  return data.data;
};

// ========== Socket Service ==========
const createSocketService = (url: string): Socket => {
  const socket = io(url, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: false,
    transports: ["websocket"],
    withCredentials: true,
  });

  return socket;
};

// ========== Hook Implementation ==========
export const useDashboardMetrics = () => {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
  // Zustand store
  const {
    metrics,
    setMetrics,
    setActiveUsers,
    setProjects,
    setRevenue,
    setCopilotUsage,
    setChannelActivity,
    setLastUpdated,
    setError,
    resetMetrics,
    permissions,
    filters,
    setFilters,
  } = useDashboardStore(
    useShallow((state) => ({
      metrics: state.metrics,
      setMetrics: state.setMetrics,
      setActiveUsers: state.setActiveUsers,
      setProjects: state.setProjects,
      setRevenue: state.setRevenue,
      setCopilotUsage: state.setCopilot,
      setChannelActivity: state.setChannelActivity,
      setLastUpdated: state.setLastUpdated,
      setError: state.setError,
      resetMetrics: state.resetMetrics,
      permissions: state.permissions,
      filters: state.filters,
      setFilters: state.setFilters,
    }))
  );

  // ========== Real-time Socket Connection ==========
  useEffect(() => {
    const socketInstance = createSocketService(
      process.env.NEXT_PUBLIC_SOCKET_IO_URL || "http://localhost:3001"
    );

    const handleConnect = () => {
      setIsSocketConnected(true);
      console.log("✅ Socket connected");
    };

    const handleDisconnect = () => {
      setIsSocketConnected(false);
      console.log("❌ Socket disconnected");
    };

    const handleError = (error: ErrorResponse) => {
      setError(error.error.message);
      console.error("Socket error:", error);
    };

    const handleMetricsUpdate = (updatedMetrics: DashboardMetrics) => {
      setMetrics(updatedMetrics);
      setLastUpdated(new Date().toISOString());
    };

    const handleUserJoined = (user: ActiveUsersResponse["users"][0]) => {
      setActiveUsers((prev) => ({
        ...prev,
        users: [...prev.users, user],
        total: prev.total + 1,
      }));
    };

    const handleUserLeft = (userId: string) => {
      setActiveUsers((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== userId),
        total: prev.total - 1,
      }));
    };

    const handleProjectUpdated = (project: ProjectsResponse["inProgress"][0]) => {
      setProjects((prev) => {
        const existingIndex = prev.inProgress.findIndex((p) => p.id === project.id);
        let updatedProjects;

        if (existingIndex >= 0) {
          updatedProjects = [...prev.inProgress];
          updatedProjects[existingIndex] = project;
        } else {
          updatedProjects = [project, ...prev.inProgress];
        }

        return {
          ...prev,
          inProgress: updatedProjects,
          totalProjects: prev.totalProjects + (existingIndex < 0 ? 1 : 0),
        };
      });
    };

    const handleRevenueUpdated = (updatedRevenue: RevenueSummary) => {
      setRevenue(updatedRevenue);
    };

    const handleCopilotUsage = (usage: CopilotUsage) => {
      setCopilotUsage(usage);
    };

    // Register event listeners
    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("error", handleError);
    socketInstance.on("metrics:updated", handleMetricsUpdate);
    socketInstance.on("user:joined", handleUserJoined);
    socketInstance.on("user:left", handleUserLeft);
    socketInstance.on("project:updated", handleProjectUpdated);
    socketInstance.on("revenue:updated", handleRevenueUpdated);
    socketInstance.on("copilot:usage", handleCopilotUsage);

    // Connect socket
    socketInstance.connect();
    setSocket(socketInstance);

    // Cleanup
    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("error", handleError);
      socketInstance.off("metrics:updated", handleMetricsUpdate);
      socketInstance.off("user:joined", handleUserJoined);
      socketInstance.off("user:left", handleUserLeft);
      socketInstance.off("project:updated", handleProjectUpdated);
      socketInstance.off("revenue:updated", handleRevenueUpdated);
      socketInstance.off("copilot:usage", handleCopilotUsage);
      socketInstance.disconnect();
    };
  }, [setMetrics, setActiveUsers, setProjects, setRevenue, setCopilotUsage, setLastUpdated, setError]);

  // ========== Polling Queries ==========
  const {
    data: activeUsersData,
    error: activeUsersError,
    isLoading: isLoadingActiveUsers,
  } = useQuery<ActiveUsersResponse, Error>({
    queryKey: ["dashboard", "active-users"],
    queryFn: fetchActiveUsers,
    staleTime: POLLING_INTERVALS.metrics,
    refetchInterval: POLLING_INTERVALS.metrics,
    refetchOnWindowFocus: true,
    retry: 3,
    onSuccess: (data) => {
      setActiveUsers(data);
    },
    onError: (error) => {
      setError(`Failed to load active users: ${error.message}`);
    },
  });

  const {
    data: projectsData,
    error: projectsError,
    isLoading: isLoadingProjects,
  } = useQuery<ProjectsResponse, Error>({
    queryKey: ["dashboard", "projects"],
    queryFn: fetchProjects,
    staleTime: POLLING_INTERVALS.projects,
    refetchInterval: POLLING_INTERVALS.projects,
    refetchOnWindowFocus: true,
    retry: 3,
    onSuccess: (data) => {
      setProjects(data);
    },
    onError: (error) => {
      setError(`Failed to load projects: ${error.message}`);
    },
  });

  const {
    data: revenueData,
    error: revenueError,
    isLoading: isLoadingRevenue,
  } = useQuery<RevenueSummary, Error>({
    queryKey: ["dashboard", "revenue"],
    queryFn: fetchRevenue,
    staleTime: POLLING_INTERVALS.revenue,
    refetchInterval: POLLING_INTERVALS.revenue,
    refetchOnWindowFocus: true,
    retry: 3,
    onSuccess: (data) => {
      setRevenue(data);
    },
    onError: (error) => {
      setError(`Failed to load revenue: ${error.message}`);
    },
  });

  const {
    data: copilotData,
    error: copilotError,
    isLoading: isLoadingCopilot,
  } = useQuery<CopilotUsage, Error>({
    queryKey: ["dashboard", "copilot"],
    queryFn: fetchCopilotUsage,
    staleTime: POLLING_INTERVALS.copilot,
    refetchInterval: POLLING_INTERVALS.copilot,
    refetchOnWindowFocus: true,
    retry: 3,
    onSuccess: (data) => {
      setCopilotUsage(data);
    },
    onError: (error) => {
      setError(`Failed to load copilot usage: ${error.message}`);
    },
  });

  // ========== Computed Metrics ==========
  const computedMetrics = useMemo(() => {
    if (!metrics) return null;

    const totalRevenue = metrics.revenue.total;
    const paidRevenue = metrics.revenue.paid;
    const pendingRevenue = metrics.revenue.pending;

    return {
      activeUsersCount: metrics.activeUsers.total,
      projectsInProgress: metrics.projects.inProgress.length,
      totalProjects: metrics.projects.totalProjects,
      completedThisMonth: metrics.projects.completedThisMonth,
      revenueTotal: totalRevenue,
      revenuePaid: paidRevenue,
      revenuePending: pendingRevenue,
      revenuePaidPercentage: totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0,
      revenuePendingPercentage: totalRevenue > 0 ? (pendingRevenue / totalRevenue) * 100 : 0,
      copilotDailyActive: metrics.copilot.dailyActiveUsers,
      copilotMonthlyActive: metrics.copilot.monthlyActiveUsers,
      copilotTotalSessions: metrics.copilot.totalSessions,
      channelActivityCount: metrics.channelActivity.length,
    };
  }, [metrics]);

  // ========== Formatted Metrics ==========
  const formattedMetrics = useMemo(() => {
    if (!computedMetrics) return null;

    return {
      revenueTotal: formatCurrency(computedMetrics.revenueTotal),
      revenuePaid: formatCurrency(computedMetrics.revenuePaid),
      revenuePending: formatCurrency(computedMetrics.revenuePending),
      activeUsersCount: formatNumber(computedMetrics.activeUsersCount),
      projectsInProgress: formatNumber(computedMetrics.projectsInProgress),
      totalProjects: formatNumber(computedMetrics.totalProjects),
      completedThisMonth: formatNumber(computedMetrics.completedThisMonth),
      copilotDailyActive: formatNumber(computedMetrics.copilotDailyActive),
      copilotMonthlyActive: formatNumber(computedMetrics.copilotMonthlyActive),
      copilotTotalSessions: formatNumber(computedMetrics.copilotTotalSessions),
      revenuePaidPercentage: formatPercentage(computedMetrics.revenuePaidPercentage, { decimals: 1 }),
      revenuePendingPercentage: formatPercentage(computedMetrics.revenuePendingPercentage, { decimals: 1 }),
    };
  }, [computedMetrics]);

  // ========== Loading States ==========
  const isLoading = useMemo(() => {
    return isLoadingActiveUsers || isLoadingProjects || isLoadingRevenue || isLoadingCopilot;
  }, [isLoadingActiveUsers, isLoadingProjects, isLoadingRevenue, isLoadingCopilot]);

  const isError = useMemo(() => {
    return !!(
      activeUsersError ||
      projectsError ||
      revenueError ||
      copilotError ||
      metrics?.error
    );
  }, [activeUsersError, projectsError, revenueError, copilotError, metrics?.error]);

  // ========== Refresh All Data ==========
  const refreshAllData = useCallback(async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard", "active-users"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "projects"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "revenue"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "copilot"] }),
      ]);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      setError("Failed to refresh all data");
    }
  }, [queryClient, setError, setLastUpdated]);

  // ========== Auto-refresh on Focus ==========
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshAllData();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshAllData]);

  // ========== Cleanup on Unmount ==========
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
      resetMetrics();
    };
  }, [socket, resetMetrics]);

  return {
    // State
    metrics,
    computedMetrics,
    formattedMetrics,
    isLoading,
    isError,
    isSocketConnected,
    permissions,
    filters,
    
    // Actions
    setFilters,
    refreshAllData,
    
    // Errors
    errors: {
      activeUsers: activeUsersError?.message,
      projects: projectsError?.message,
      revenue: revenueError?.message,
      copilot: copilotError?.message,
      socket: metrics?.error,
    },
    
    // Metadata
    lastUpdated: metrics?.lastUpdated,
    isStale: 
      activeUsersData?.lastUpdated !== metrics?.activeUsers.lastUpdated ||
      projectsData?.lastUpdated !== metrics?.projects.lastUpdated ||
      revenueData?.lastUpdated !== metrics?.revenue.lastUpdated ||
      copilotData?.lastUpdated !== metrics?.copilot.lastUpdated,
  };
};

export type UseDashboardMetricsReturn = ReturnType<typeof useDashboardMetrics>;
