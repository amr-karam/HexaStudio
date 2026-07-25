'use client';

/**
 * HEXA Portal v3.0 — Approval Center View
 *
 * Audit-trailed approval workflows for wireframes, 3D renderings, contracts,
 * invoices, and scope change requests.
 */

import React, { useState } from 'react';
import { Icon } from './PortalIcons';
import type { PendingApproval } from '../types';

const INITIAL_APPROVALS: PendingApproval[] = [
  {
    id: 'app-1',
    title: '3D Exterior Renderings — Vantage Point A & B',
    type: 'design',
    phaseName: 'Phase 2: Architectural Visualization',
    projectName: 'Horizon Villa',
    submittedAt: '2026-07-22T10:00:00Z',
    submittedBy: 'Elena Rostova (Lead Architectural Artist)',
    status: 'pending',
    fileUrl: '/portal/documents/exterior-render-v1.pdf',
    auditTrail: [
      { timestamp: '2026-07-22T10:00:00Z', action: 'Submitted for Client Review', actor: 'Elena Rostova' },
    ],
  },
  {
    id: 'app-2',
    title: 'Milestone 2 Invoicing Estimate — $12,500 USD',
    type: 'invoice',
    phaseName: 'Phase 2 Payment Milestone',
    projectName: 'Horizon Villa',
    submittedAt: '2026-07-20T14:30:00Z',
    submittedBy: 'Finance Dept',
    status: 'pending',
    amount: 12500,
    currency: 'USD',
    auditTrail: [
      { timestamp: '2026-07-20T14:30:00Z', action: 'Invoice Issued', actor: 'Finance Dept' },
    ],
  },
];

export function ApprovalCenterView() {
  const [approvals, setApprovals] = useState<PendingApproval[]>(INITIAL_APPROVALS);
  const [selectedId, setSelectedId] = useState<string | null>(approvals[0]?.id || null);

  const activeApproval = approvals.find((a) => a.id === selectedId);

  const handleAction = (id: string, newStatus: 'approved' | 'revision_requested', notes?: string) => {
    setApprovals((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const now = new Date().toISOString();
        const actionLabel = newStatus === 'approved' ? 'Approved by Client' : 'Revision Requested by Client';
        return {
          ...item,
          status: newStatus,
          auditTrail: [
            ...(item.auditTrail || []),
            { timestamp: now, action: actionLabel, actor: 'Client User', notes },
          ],
        };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-100">Approval Center</h1>
        <p className="text-sm text-neutral-400">
          Review, sign, and authorize deliverables, scope changes, and milestone invoices with full audit logging.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Approvals List */}
        <div className="lg:col-span-5 space-y-3">
          {approvals.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedId === item.id
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-lg'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  {item.type}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                    item.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : item.status === 'revision_requested'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-neutral-100 mt-2 line-clamp-1">{item.title}</h3>
              <p className="text-xs text-neutral-400 mt-1">{item.phaseName}</p>
              <div className="flex items-center justify-between mt-3 text-[11px] text-neutral-500">
                <span>By: {item.submittedBy}</span>
                <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Detail & Audit Trail */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col justify-between">
          {activeApproval ? (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">{activeApproval.type}</span>
                <h2 className="text-xl font-bold text-neutral-100 mt-1">{activeApproval.title}</h2>
                <p className="text-xs text-neutral-400 mt-1">{activeApproval.projectName} • {activeApproval.phaseName}</p>
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-neutral-800 rounded-lg text-amber-400">
                    <Icon name="file-text" className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-200">Deliverable Package File</p>
                    <p className="text-xs text-neutral-500">PDF • Signed Presigned URL ready</p>
                  </div>
                </div>
                <button className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-medium px-3 py-1.5 rounded-lg border border-neutral-700 transition-colors flex items-center space-x-1.5">
                  <Icon name="eye" className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>

              {/* Action Buttons */}
              {activeApproval.status === 'pending' && (
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => handleAction(activeApproval.id, 'approved')}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    Approve Deliverable
                  </button>
                  <button
                    onClick={() => handleAction(activeApproval.id, 'revision_requested', 'Please adjust lighting angle')}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-medium text-sm transition-colors"
                  >
                    Request Revision
                  </button>
                </div>
              )}

              {/* Audit Trail */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Audit Trail Log</h4>
                <div className="space-y-3 font-mono text-xs border-l-2 border-neutral-800 pl-4">
                  {activeApproval.auditTrail?.map((log, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-amber-400" />
                      <p className="text-neutral-200 font-sans font-medium">{log.action}</p>
                      <p className="text-neutral-500 text-[11px]">{new Date(log.timestamp).toLocaleString()} • {log.actor}</p>
                      {log.notes && <p className="text-amber-300 text-[11px] mt-0.5 font-sans">"{log.notes}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-neutral-500 text-sm">
              Select an item to view approval details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
