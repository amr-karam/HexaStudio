'use client';

/**
 * HEXA Portal v3.0 — Project Workspace View
 *
 * Dedicated workspace tabs: Overview, Interactive Timeline, Kanban Tasks,
 * Deliverables, Approvals, Team Roster, and Change Requests.
 */

import React, { useState } from 'react';
import { Icon, type IconName } from './PortalIcons';
import { TimelineView } from '../TimelineView';
import { ApprovalCenterView } from './ApprovalCenterView';
import { DocumentCenterView } from './DocumentCenterView';
import { KanbanBoard } from './KanbanBoard';
import { TeamRoster } from './TeamRoster';

interface ProjectWorkspaceViewProps {
  projectId?: number;
}

const MOCK_TIMELINE_MILESTONES = [
  { id: 'm1', name: 'Phase 1: Research & Discovery', startDate: '2026-06-01', endDate: '2026-06-30', status: 'completed' as const },
  { id: 'm2', name: 'Phase 2: 3D Renderings & Lighting', startDate: '2026-07-01', endDate: '2026-08-15', status: 'in-progress' as const },
  { id: 'm3', name: 'Phase 3: VR Tour & Handover', startDate: '2026-08-16', endDate: '2026-10-15', status: 'pending' as const },
];

export function ProjectWorkspaceView({ projectId = 1 }: ProjectWorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'kanban' | 'deliverables' | 'approvals' | 'team'>('overview');

  return (
    <div className="space-y-6">
      {/* Workspace Hero */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold uppercase tracking-wider border border-amber-500/30">
                In Progress
              </span>
              <span className="text-neutral-500">•</span>
              <span className="text-neutral-400 font-mono">ID: PROJ-2026-088</span>
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-100 mt-2">Horizon Villa</h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Luxury oceanfront residential complex featuring high-end parametric facade design, custom landscape architecture, and interactive VR tours.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
            <div>
              <p className="text-[11px] text-neutral-500 font-medium">Estimated Handover</p>
              <p className="text-sm font-bold text-neutral-200 mt-0.5">October 15, 2026</p>
            </div>
            <div className="h-8 w-px bg-neutral-800" />
            <div>
              <p className="text-[11px] text-neutral-500 font-medium">Project Manager</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">Marcus Vance</p>
            </div>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="flex items-center space-x-1 mt-8 border-b border-neutral-800 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: 'grid' },
            { id: 'timeline', label: 'Timeline', icon: 'clock' },
            { id: 'kanban', label: 'Kanban Tasks', icon: 'kanban' },
            { id: 'deliverables', label: 'Deliverables', icon: 'file-text' },
            { id: 'approvals', label: 'Approvals', icon: 'check-circle' },
            { id: 'team', label: 'Project Team', icon: 'users' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon name={tab.icon as IconName} className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Breakdown */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-neutral-100">Milestone Progress Summary</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-neutral-300">Phase 2: 3D Renderings & Lighting Pass</span>
                  <span className="text-amber-400 font-bold">68% Complete</span>
                </div>
                <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '68%' }} />
                </div>
              </div>
            </div>

            {/* Change Requests */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-100">Change Requests & Scope Logs</h3>
                <button className="text-xs text-amber-400 font-semibold hover:underline">+ New Change Request</button>
              </div>
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-xs flex justify-between items-center">
                <div>
                  <p className="font-semibold text-neutral-200">CR-002: West Facade Glass Specification Upgrade</p>
                  <p className="text-neutral-500 mt-0.5">Approved on July 14 • Impact: +$3,200 USD</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Approved</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar — Team & Quick Stats */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-semibold text-neutral-100">Assigned Studio Team</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    MV
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-200">Marcus Vance</p>
                    <p className="text-neutral-500 text-[11px]">Senior Project Manager</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    ER
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-200">Elena Rostova</p>
                    <p className="text-neutral-500 text-[11px]">Lead 3D Visualization Artist</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && <TimelineView milestones={MOCK_TIMELINE_MILESTONES} />}
      {activeTab === 'deliverables' && <DocumentCenterView />}
      {activeTab === 'approvals' && <ApprovalCenterView />}
      {activeTab === 'kanban' && <KanbanBoard projectId={projectId} />}
      {activeTab === 'team' && <TeamRoster projectId={projectId} />}
    </div>
  );
}
