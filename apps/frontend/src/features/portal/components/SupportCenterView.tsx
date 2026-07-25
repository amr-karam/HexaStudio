'use client';

import React, { useState } from 'react';
import { Icon } from './PortalIcons';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  messages: Array<{ id: string; sender: string; role: 'client' | 'support'; message: string; timestamp: string }>;
}

const TICKETS: Ticket[] = [
  {
    id: 'TCK-2026-089',
    subject: 'Request for 8K resolution render export',
    category: 'Asset Request',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-07-23T11:00:00Z',
    messages: [
      { id: 'm1', sender: 'Client User', role: 'client', message: 'Can we get an 8K resolution export of Vantage Point A?', timestamp: '2026-07-23T11:00:00Z' },
      { id: 'm2', sender: 'Elena Rostova', role: 'support', message: 'Rendering pipeline queued for 8K output. Estimated delivery in 4 hours.', timestamp: '2026-07-23T14:30:00Z' },
    ],
  },
];

export function SupportCenterView() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">Support & Assistance</h1>
          <p className="text-sm text-neutral-400">
            Dedicated client support SLA, ticket tracking, and direct project manager escalation.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20"
        >
          <Icon name="plus" className="w-4 h-4" />
          <span>Submit Support Request</span>
        </button>
      </div>

      {/* SLA Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Icon name="clock" className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400">Average Response Time</p>
            <p className="text-base font-bold text-neutral-100 mt-0.5">&lt; 15 Minutes</p>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Icon name="shield-check" className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400">Dedicated Account SLA</p>
            <p className="text-base font-bold text-neutral-100 mt-0.5">Enterprise Tier 1</p>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <Icon name="user" className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400">Assigned Manager</p>
            <p className="text-base font-bold text-neutral-100 mt-0.5">Marcus Vance</p>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-100">Active Tickets & Escalations</h3>
        <div className="space-y-3">
          {TICKETS.map((t) => (
            <div key={t.id} className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-amber-400 font-bold">{t.id}</span>
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    {t.priority}
                  </span>
                  <span className="text-xs capitalize px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-neutral-100 mt-1.5">{t.subject}</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Created {new Date(t.createdAt).toLocaleString()} • {t.messages.length} message(s)
                </p>
              </div>
              <button className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-700 transition-colors self-start sm:self-center">
                View Discussion
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-100">Submit Support Request</h3>
              <button onClick={() => setShowCreate(false)} className="text-neutral-400 hover:text-neutral-200">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-neutral-400">Your dedicated Project Manager will respond within your 15-minute SLA window.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Subject</label>
                <input type="text" placeholder="e.g. Export request, Material query..." className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Message</label>
                <textarea rows={3} placeholder="Provide details for your request..." className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200">
                Cancel
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs">
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
