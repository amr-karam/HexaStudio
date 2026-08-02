/**
 * Executive Dashboard Quick Stats Grid Molecule
 * Premium responsive stats display grid
 */

import { MetricCard } from "../atoms/metric-card";
import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  Bot, 
  Activity,
} from "lucide-react";

export const QuickStatsGrid = () => {
  const { 
    formattedMetrics: metrics,
    isLoading,
    errors,
  } = useDashboardMetrics();

  if (errors.socket) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Active Users */}
      <MetricCard
        title="Active Users"
        value={metrics?.activeUsersCount || "--"}
        subtitle="Currently online"
        icon={<Users className="w-5 h-5" />}
        variant="primary"
        size="lg"
        isLoading={isLoading}
      />

      {/* Projects in Progress */}
      <MetricCard
        title="Projects Active"
        value={metrics?.projectsInProgress || "--"}
        subtitle="In progress"
        icon={<Briefcase className="w-5 h-5" />}
        variant="success"
        size="lg"
        isLoading={isLoading}
      />

      {/* Revenue Total */}
      <MetricCard
        title="Revenue Total"
        value={metrics?.revenueTotal || "--"}
        subtitle="All time revenue"
        icon={<DollarSign className="w-5 h-5" />}
        variant="info"
        size="lg"
        isLoading={isLoading}
      />

      {/* AI Copilot Usage */}
      <MetricCard
        title="AI Copilot Usage"
        value={metrics?.copilotDailyActive || "--"}
        subtitle="Daily active users"
        icon={<Bot className="w-5 h-5" />}
        variant="secondary"
        size="lg"
        isLoading={isLoading}
      />

      {/* Channel Activity */}
      <MetricCard
        title="Channel Activity"
        value={metrics?.channelActivityCount || "--"}
        subtitle="Active channels"
        icon={<Activity className="w-5 h-5" />}
        variant="warning"
        size="lg"
        isLoading={isLoading}
      />
    </div>
  );
};
