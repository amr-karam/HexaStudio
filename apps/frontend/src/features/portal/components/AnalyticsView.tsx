'use client';

/**
 * HEXA Portal v3.0 — Client Analytics & Performance KPIs
 *
 * Visual KPI visualizations for project velocity, milestone completion rates,
 * file activity, and response times.
 */

import React from 'react';

export function AnalyticsView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">Project Performance Analytics</h1>
        <p className="text-sm text-neutral-400">
          Executive KPIs measuring project velocity, milestone accuracy, and team collaboration.
        </p>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <span className="text-xs text-neutral-400 font-medium">Milestone Accuracy</span>
          <p className="text-3xl font-bold text-neutral-100 mt-2">98.4%</p>
          <p className="text-xs text-emerald-400 mt-1">↑ +2.1% vs baseline target</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <span className="text-xs text-neutral-400 font-medium">Avg Review Velocity</span>
          <p className="text-3xl font-bold text-neutral-100 mt-2">4.2 Hrs</p>
          <p className="text-xs text-emerald-400 mt-1">Fast Approval Rate</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <span className="text-xs text-neutral-400 font-medium">Deliverables Approved</span>
          <p className="text-3xl font-bold text-neutral-100 mt-2">24 / 28</p>
          <p className="text-xs text-neutral-500 mt-1">4 Pending Final Review</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
          <span className="text-xs text-neutral-400 font-medium">Overall Health Score</span>
          <p className="text-3xl font-bold text-amber-400 mt-2">94 / 100</p>
          <p className="text-xs text-emerald-400 mt-1">Tier 1 Premier Status</p>
        </div>
      </div>

      {/* Velocity Progress Bars */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-5">
        <h3 className="text-sm font-semibold text-neutral-100">Phase Completion Breakdown</h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-neutral-200 font-medium">Phase 1: Discovery & Conceptual Research</span>
              <span className="text-emerald-400 font-bold">100%</span>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-neutral-200 font-medium">Phase 2: 3D Exterior & Interior Renderings</span>
              <span className="text-amber-400 font-bold">68%</span>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '68%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-neutral-200 font-medium">Phase 3: VR Interactive Tour & Handover</span>
              <span className="text-neutral-500 font-bold">0%</span>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div className="bg-neutral-700 h-full rounded-full" style={{ width: '0%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
