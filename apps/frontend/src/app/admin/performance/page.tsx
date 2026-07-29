import React from 'react';
import { PerformanceDashboard } from '@/features/admin/components/PerformanceDashboard';

export const metadata = {
  title: 'Performance & Error Budgets | HEXA Admin',
  description: 'Core Web Vitals and Sentry error tracking telemetry.',
};

export default function AdminPerformancePage() {
  return (
    <div className="space-y-8 p-6 md:p-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-light tracking-tight">Performance & Error Budgets</h1>
        <p className="text-sm text-neutral-400">
          Continuous tracking of frontend render performance and runtime exception rates.
        </p>
      </div>

      <PerformanceDashboard />
    </div>
  );
}
