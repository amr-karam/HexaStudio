/**
 * Executive Dashboard Provider Component
 * Wraps the dashboard with all necessary providers
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useDashboardStore } from "./dashboard-store";

interface DashboardProviderProps {
  children: React.ReactNode;
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

  // Load user role from localStorage on initial render
  if (typeof window !== "undefined") {
    const savedRole = localStorage.getItem("dashboardRole");
    if (savedRole) {
      setUserRole(savedRole as any);
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only include devtools in development */}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
