/**
 * Executive Dashboard Layout Template
 * Premium responsive dashboard layout with sidebar
 */

import { motion } from "framer-motion";
import { useDashboardMetrics } from "../hooks/use-dashboard-metrics";
import { LayoutDashboard, Users, Briefcase, DollarSign, Bot, Activity, Settings, HelpCircle } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  permissions: string[];
}

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { permissions } = useDashboardMetrics();

  // Navigation items
  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      href: "/executive-dashboard",
      permissions: ["admin", "manager", "developer", "viewer"],
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Active Users",
      href: "/executive-dashboard/users",
      permissions: ["admin", "manager"],
    },
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: "Projects",
      href: "/executive-dashboard/projects",
      permissions: ["admin", "manager", "developer"],
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: "Revenue",
      href: "/executive-dashboard/revenue",
      permissions: ["admin", "manager"],
    },
    {
      icon: <Bot className="w-5 h-5" />,
      label: "AI Copilot",
      href: "/executive-dashboard/copilot",
      permissions: ["admin", "manager"],
    },
    {
      icon: <Activity className="w-5 h-5" />,
      label: "Activity",
      href: "/executive-dashboard/activity",
      permissions: ["admin", "manager"],
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      href: "/executive-dashboard/settings",
      permissions: ["admin"],
    },
  ];

  // Filter navigation items by permissions
  const filteredNavItems = navItems.filter((item) => 
    item.permissions.includes("viewer") || 
    (permissions.canViewMetrics && item.label === "Dashboard") ||
    (permissions.canViewProjects && item.label === "Projects") ||
    (permissions.canViewRevenue && item.label === "Revenue") ||
    (permissions.canViewCopilot && item.label === "AI Copilot") ||
    permissions.canManageUsers
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-blue-400" />
              </div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Quick actions */}
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Refresh data">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M22 11.5a10 10 0 0 1-14.14 9.08" />
                  <path d="M10.5 2.5v6H5M22 12.5a10 10 0 0 0-14.14-9.08" />
                  <path d="M13.5 21.5v-6h6" />
                </svg>
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Help">
                <HelpCircle className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-64 bg-gray-900/50 backdrop-blur-md border-r border-white/10 min-h-screen sticky top-16 z-40"
        >
          <div className="p-4">
            <h3 className="text-sm font-medium text-white/60 mb-4 px-2">Navigation</h3>
            <nav className="space-y-1">
              {filteredNavItems.map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </motion.a>
              ))}
            </nav>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
