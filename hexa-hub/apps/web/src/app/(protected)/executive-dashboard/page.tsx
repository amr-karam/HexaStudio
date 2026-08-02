/**
 * Executive Dashboard Page
 * Protected route for the executive dashboard
 */

import { ExecutiveDashboardPage } from "../../../features/executive-dashboard";
import { DashboardProvider } from "../../../features/executive-dashboard/services/dashboard-store";

const ExecutiveDashboard = () => {
  return (
    <DashboardProvider>
      <ExecutiveDashboardPage />
    </DashboardProvider>
  );
};

export default ExecutiveDashboard;
