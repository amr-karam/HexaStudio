/**
 * Executive Dashboard Page Template
 * Main page component for the executive dashboard
 */

import { motion } from "framer-motion";
import { DashboardLayout } from "./dashboard-layout";
import { RealTimeMetricsPanel } from "../organisms/real-time-metrics-panel";
import { RevenueChart } from "../molecules/revenue-chart";
import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";

const ExecutiveDashboardPage = () => {
  const { permissions } = useDashboardMetrics();

  return (
    <DashboardLayout title="Executive Dashboard">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-white">Executive Overview</h1>
          <p className="text-white/60">Real-time business metrics and analytics</p>
        </motion.div>

        {/* Real-time Metrics Panel */}
        <RealTimeMetricsPanel />

        {/* Charts Section */}
        {permissions.canViewRevenue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <RevenueChart timeRange="month" />
            </div>
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              {/* Placeholder for other charts */}
              <div className="h-full flex items-center justify-center">
                <p className="text-white/60">Additional charts coming soon</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Additional sections based on permissions */}
        {permissions.canViewProjects && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Project Analytics</h3>
            {/* Project analytics content would go here */}
            <div className="h-64 flex items-center justify-center">
              <p className="text-white/60">Project analytics visualization</p>
            </div>
          </motion.div>
        )}

        {permissions.canViewCopilot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4">AI Copilot Insights</h3>
            {/* AI copilot insights content would go here */}
            <div className="h-64 flex items-center justify-center">
              <p className="text-white/60">AI copilot usage analytics</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ExecutiveDashboardPage;
