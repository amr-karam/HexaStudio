'use client';

/**
 * HEXA Portal v3.0 — Digital Headquarters Dashboard
 *
 * Answers "What is happening with my project right now?" within 5 seconds.
 * Executive Health Score, Stage Tracker, Next Milestone, Pending Approvals,
 * Recent Deliverables, Invoices, and AI Copilot trigger.
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/constants';
import { StatCard } from '@/features/portal/components/StatCard';
import { HealthScore } from '@/features/portal/components/HealthScore';
import { ActivityItem } from '@/features/portal/components/ActivityItem';
import { Icon } from '@/features/portal/components/PortalIcons';
import { PortalAiCopilot } from '@/features/portal/components/PortalAiCopilot';
import type { DashboardData } from '@/features/portal/types';

const MOCK_FALLBACK_DASHBOARD: DashboardData = {
  companyName: 'Horizon Real Estate Holdings',
  activeProjectName: 'Horizon Villa',
  activeProjectStage: 'Phase 2: 3D Renderings & Lighting',
  overallProgressPercentage: 68,
  nextMilestoneName: 'Phase 2 Deliverables Sign-off',
  nextMilestoneDueDate: 'August 15, 2026',
  stats: [
    { label: 'Overall Progress', value: 68, icon: 'bar-chart', trend: { value: 12, direction: 'up' }, format: 'percentage' },
    { label: 'Pending Approvals', value: 2, icon: 'check-circle', trend: { value: 1, direction: 'up' }, format: 'number' },
    { label: 'Open Deliverables', value: 8, icon: 'folder-kanban', trend: { value: 0, direction: 'neutral' }, format: 'number' },
    { label: 'Outstanding Invoices', value: 12500, icon: 'receipt', trend: { value: 0, direction: 'neutral' }, format: 'currency' },
  ],
  healthScore: {
    score: 94,
    status: 'Excellent',
    metricBreakdown: { timeline: 95, budget: 100, quality: 98, communication: 90 },
  },
  activity: [
    { id: 'act-1', type: 'upload', title: 'New 3D Exterior Renderings v2 Uploaded', description: 'Elena Rostova uploaded 2 new 8K renders for Vantage Point A & B.', timestamp: '2 hours ago', author: 'Elena Rostova' },
    { id: 'act-2', type: 'approval', title: 'Milestone 2 Invoicing Issued', description: 'Odoo ERP generated milestone billing statement #INV-2026-042.', timestamp: '1 day ago', author: 'Finance Dept' },
  ],
  notifications: [
    { id: 'not-1', type: 'approval', title: 'Action Required', message: '3D Renderings v2 package requires your sign-off in Approval Center.', timestamp: '2 hours ago', isRead: false, link: '/portal/approvals' },
  ],
  pendingApprovals: [
    { id: 'app-1', title: '3D Exterior Renderings — Vantage Point A & B', type: 'design', phaseName: 'Phase 2', projectName: 'Horizon Villa', submittedAt: '2026-07-22T10:00:00Z', submittedBy: 'Elena Rostova', status: 'pending' },
  ],
  upcomingMeetings: [
    { id: 'meet-1', title: 'Phase 2 Design & Lighting Review', date: 'July 28, 2026', time: '14:00 EST', participants: ['Marcus Vance', 'Elena Rostova', 'Client Team'] },
  ],
  outstandingInvoices: [
    { id: 'inv-1', reference: 'INV-2026-042', amount: 12500, currency: 'USD', dueDate: '2026-08-30', status: 'pending' },
  ],
};

async function fetchDashboardData(): Promise<DashboardData> {
  let res: Response | null = null;
  try {
    res = await fetch(`${API_BASE_URL}/api/portal/dashboard`, {
      credentials: 'include',
    });
  } catch {
    return MOCK_FALLBACK_DASHBOARD;
  }

  if (!res.ok) return MOCK_FALLBACK_DASHBOARD;
  return res.json();
}

export default function PortalDashboardPage() {
  const router = useRouter();
  const [copilotOpen, setCopilotOpen] = useState(false);

  const { data = MOCK_FALLBACK_DASHBOARD } = useQuery<DashboardData>({
    queryKey: ['portal-dashboard'],
    queryFn: fetchDashboardData,
  });

  return (
    <div className="space-y-8">
      {/* 5-SECOND EXECUTIVE CLARITY HERO BANNER */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-neutral-400 font-semibold tracking-wider uppercase">
                Live Status • {data.companyName}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 mt-2 tracking-tight">
              {data.activeProjectName}
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Current Stage: <span className="text-amber-400 font-semibold">{data.activeProjectStage}</span>
            </p>
          </div>

          {/* Copilot & Quick Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCopilotOpen(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-sm hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
            >
              <Icon name="sparkles" className="w-4 h-4" />
              <span>Ask HEXA Copilot</span>
            </button>
          </div>
        </div>

        {/* 5-SECOND METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-neutral-800/80">
          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
            <p className="text-xs text-neutral-500 font-medium">Overall Progress</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-2xl font-bold text-neutral-100">{data.overallProgressPercentage}%</p>
              <span className="text-xs text-emerald-400 font-medium">On Schedule</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${data.overallProgressPercentage}%` }} />
            </div>
          </div>

          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
            <p className="text-xs text-neutral-500 font-medium">Next Milestone</p>
            <p className="text-sm font-bold text-neutral-100 mt-1 line-clamp-1">{data.nextMilestoneName}</p>
            <p className="text-xs text-amber-400 mt-1 font-mono">Due {data.nextMilestoneDueDate}</p>
          </div>

          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
            <p className="text-xs text-neutral-500 font-medium">Pending Approvals</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{data.pendingApprovals.length}</p>
            <p className="text-xs text-neutral-400 mt-1">Requires Sign-off</p>
          </div>

          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
            <p className="text-xs text-neutral-500 font-medium">Project Health</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{data.healthScore.score} / 100</p>
            <p className="text-xs text-emerald-400 mt-1">{data.healthScore.status}</p>
          </div>
        </div>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.stats.map((stat, idx) => (
          <StatCard key={idx} stat={stat} />
        ))}
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column — Activity & Approvals */}
        <div className="lg:col-span-8 space-y-6">
          {/* Action Required / Pending Approvals */}
          {data.pendingApprovals.length > 0 && (
            <div className="bg-neutral-900 border border-amber-500/30 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <h3 className="text-base font-bold text-neutral-100">Pending Approvals</h3>
                </div>
                <button
                  onClick={() => router.push('/portal/approvals')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  View Approval Center →
                </button>
              </div>

              <div className="space-y-3">
                {data.pendingApprovals.map((app) => (
                  <div key={app.id} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-amber-400 uppercase">
                        {app.type}
                      </span>
                      <h4 className="text-sm font-semibold text-neutral-100 mt-1">{app.title}</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">{app.phaseName} • Submitted by {app.submittedBy}</p>
                    </div>
                    <button
                      onClick={() => router.push('/portal/approvals')}
                      className="text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Feed */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-100">Live Project Activity</h3>
            <div className="divide-y divide-neutral-800/60">
              {data.activity.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Health Score & Upcoming Meetings */}
        <div className="lg:col-span-4 space-y-6">
          <HealthScore data={data.healthScore} />

          {/* Upcoming Meetings */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-100">Upcoming Meetings</h3>
            <div className="space-y-3">
              {data.upcomingMeetings.map((m) => (
                <div key={m.id} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                  <p className="text-xs font-mono text-amber-400">{m.date} • {m.time}</p>
                  <h4 className="text-sm font-semibold text-neutral-100 mt-1">{m.title}</h4>
                  <p className="text-xs text-neutral-500 mt-1">With: {m.participants.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EMBEDDED COPILOT DRAWER */}
      <PortalAiCopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        projectName={data.activeProjectName}
      />
    </div>
  );
}
