import React from 'react';
import { TelemetryDashboard } from '@/features/admin';

export const metadata = {
  title: 'System Telemetry | HEXA Admin',
  description: 'Real-time microservice health and telemetry command center.',
};

export default function AdminTelemetryPage() {
  return (
    <div className="space-y-8 p-6 md:p-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-light tracking-tight">System Telemetry & Health</h1>
        <p className="text-sm text-neutral-400">
          Live operational status of backend microservices, database clusters, Redis cache, and AI token utilization.
        </p>
      </div>

      <TelemetryDashboard />
    </div>
  );
}
