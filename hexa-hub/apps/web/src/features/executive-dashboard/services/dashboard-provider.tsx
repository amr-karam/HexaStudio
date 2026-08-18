/**
 * Executive Dashboard Provider Component
 * Wraps the dashboard with all necessary providers
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDashboardStore } from "./dashboard-store";
import type { UserRole } from "../types/dashboard-types";
import { ReactNode, useEffect } from "react";

interface DashboardProviderProps {
  children: ReactNode;
}

// Create query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 2,
      staleTime: 5000,
      gcTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  // Initialize user role from localStorage or default to viewer
  const setUserRole = useDashboardStore((state) => state.setUserRole);

  // Load user role from localStorage on mount (client-only)
  useEffect(() => {
    const savedRole = localStorage.getItem("dashboardRole");
    if (savedRole) {
      setUserRole(savedRole as UserRole);
    }
  }, [setUserRole]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only include devtools in development */}
      {false}
    </QueryClientProvider>
  );
};
