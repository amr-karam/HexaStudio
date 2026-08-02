/**
 * Executive Dashboard Real-time Metrics Panel Organism
 * Premium real-time metrics display with premium styling
 */

import { motion } from "framer-motion";
import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";
import { QuickStatsGrid } from "../molecules/quick-stats-grid";
import { LoadingSpinner } from "../atoms/loading-spinner";
import { ErrorMessage } from "../atoms/error-message";
import { Users, Briefcase, DollarSign, Bot, Activity } from "lucide-react";

export const RealTimeMetricsPanel = () => {
  const { 
    metrics,
    isLoading,
    isError,
    errors,
    isSocketConnected,
    lastUpdated,
  } = useDashboardMetrics();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Real-time Metrics</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-3 h-3 rounded-full ${isSocketConnected ? "bg-emerald-400" : "bg-rose-400"}`}
            />
            <span className="text-white/80">
              {isSocketConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          {lastUpdated && (
            <span className="text-xs text-white/60">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-24 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <ErrorMessage
          message={errors.socket || "Failed to load metrics"}
          onRetry={() => window.location.reload()}
        />
      ) : (
        <QuickStatsGrid />
      )}

      {/* Detailed Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Users Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Active Users</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Total Active</span>
              <span className="text-xl font-bold text-white">
                {metrics?.activeUsers.total || "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Active in Last Hour</span>
              <span className="text-lg text-white">
                {metrics?.activeUsers.activeInLastHour || "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Peak Today</span>
              <span className="text-lg text-white">
                {metrics?.activeUsers.peakToday || "--"}
              </span>
            </div>
          </div>

          {metrics?.activeUsers.users && metrics.activeUsers.users.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-white/80">Recent Activity</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {metrics.activeUsers.users
                  .slice(0, 5)
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-medium text-white"
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-white/60 truncate">{user.email}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Projects Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Briefcase className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Projects</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">In Progress</span>
              <span className="text-xl font-bold text-white">
                {metrics?.projects.inProgress.length || "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Total Projects</span>
              <span className="text-lg text-white">
                {metrics?.projects.totalProjects || "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Completed This Month</span>
              <span className="text-lg text-white">
                {metrics?.projects.completedThisMonth || "--"}
              </span>
            </div>
          </div>

          {metrics?.projects.inProgress && metrics.projects.inProgress.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-white/80">Active Projects</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {metrics.projects.inProgress
                  .slice(0, 5)
                  .map((project) => (
                    <div
                      key={project.id}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <p className="text-sm font-medium text-white truncate">{project.name}</p>
                      <p className="text-xs text-white/60 truncate">{project.client}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Revenue Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Revenue</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Total</span>
              <span className="text-xl font-bold text-white">
                {metrics?.revenue.total ? metrics.revenue.currency + metrics.revenue.total.toLocaleString() : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Paid</span>
              <span className="text-lg text-white">
                {metrics?.revenue.paid ? metrics.revenue.currency + metrics.revenue.paid.toLocaleString() : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Pending</span>
              <span className="text-lg text-white">
                {metrics?.revenue.pending ? metrics.revenue.currency + metrics.revenue.pending.toLocaleString() : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Overdue</span>
              <span className="text-lg text-white">
                {metrics?.revenue.overdue ? metrics.revenue.currency + metrics.revenue.overdue.toLocaleString() : "--"}
              </span>
            </div>
          </div>

          {metrics?.revenue && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Paid Percentage</span>
                <span className="text-xs font-medium text-white">
                  {metrics.revenue.paidPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div
                  className="bg-emerald-400 h-2 rounded-full"
                  style={{ width: `${metrics.revenue.paidPercentage}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Copilot Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Bot className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">AI Copilot Analytics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Daily Active Users</span>
              <span className="text-xl font-bold text-white">
                {metrics?.copilot.dailyActiveUsers || "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Monthly Active Users</span>
              <span className="text-lg text-white">
                {metrics?.copilot.monthlyActiveUsers || "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Total Sessions</span>
              <span className="text-lg text-white">
                {metrics?.copilot.totalSessions || "--"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Avg Session Duration</span>
              <span className="text-lg text-white">
                {metrics?.copilot.avgSessionDuration ? metrics.copilot.avgSessionDuration.toFixed(1) + "s" : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">Satisfaction Score</span>
              <span className="text-lg text-white">
                {metrics?.copilot.satisfactionScore ? metrics.copilot.satisfactionScore.toFixed(1) : "--"}/10
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Channel Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <Activity className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Channel Activity</h3>
        </div>

        {metrics?.channelActivity && metrics.channelActivity.length > 0 ? (
          <div className="space-y-3">
            {metrics.channelActivity.slice(0, 5).map((channel) => (
              <motion.div
                key={channel.channel}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-xs font-medium text-white">
                      {channel.channel.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{channel.channel}</p>
                      <p className="text-xs text-white/60">{channel.members} members</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {channel.activeNow} active now
                    </p>
                    <p className="text-xs text-white/60">
                      {channel.messages} messages
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-white/60">No channel activity data available</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
