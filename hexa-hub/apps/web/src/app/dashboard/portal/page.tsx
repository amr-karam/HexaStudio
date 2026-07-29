'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import {
  FolderKanban, Calendar, CheckCircle2, Clock, User, MessageCircle, FileText, Download,
  AlertCircle, TrendingUp,
} from 'lucide-react';
import PortalProjectCard from '@/components/PortalProjectCard';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'review' | 'completed';
  progress: number;
  startDate: string;
  deadline: string;
  nextMilestone: string;
  milestoneDate: string;
  budget: number;
  spent: number;
}

interface Deliverable {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  fileSize: string;
  url: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_PROJECTS: Project[] = [
  {
    id: '1', name: 'Website Redesign', status: 'active', progress: 75,
    startDate: '2026-06-01', deadline: '2026-09-01',
    nextMilestone: 'Client Review v2', milestoneDate: '2026-08-20',
    budget: 25000, spent: 18750,
  },
  {
    id: '2', name: 'Brand Identity', status: 'review', progress: 90,
    startDate: '2026-05-15', deadline: '2026-08-15',
    nextMilestone: 'Final Delivery', milestoneDate: '2026-08-15',
    budget: 15000, spent: 13500,
  },
  {
    id: '3', name: 'Mobile App', status: 'planning', progress: 15,
    startDate: '2026-07-01', deadline: '2026-12-01',
    nextMilestone: 'Discovery Workshop', milestoneDate: '2026-07-15',
    budget: 45000, spent: 6750,
  },
];

const MOCK_DELIVERABLES: Deliverable[] = [
  { id: '1', title: 'Homepage Mockups', description: 'High-fidelity designs for the homepage', status: 'approved', uploadedAt: '2026-07-10', fileSize: '2.4 MB', url: '#' },
  { id: '2', title: 'Brand Guidelines v2', description: 'Updated brand guidelines document', status: 'pending', uploadedAt: '2026-07-15', fileSize: '1.8 MB', url: '#' },
  { id: '3', title: 'API Documentation', description: 'Technical documentation for the REST API', status: 'pending', uploadedAt: '2026-07-12', fileSize: '3.2 MB', url: '#' },
];

// ─── Components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config = {
    planning: { label: 'Planning', color: 'bg-blue-500/10 text-blue-400' },
    active: { label: 'Active', color: 'bg-emerald-500/10 text-emerald-400' },
    review: { label: 'In Review', color: 'bg-amber-500/10 text-amber-400' },
    completed: { label: 'Completed', color: 'bg-purple-500/10 text-purple-400' },
  };
  const c = config[status as keyof typeof config] || config.planning;
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.color}`}>{c.label}</span>;
}

function BudgetProgress({ budget, spent }: { budget: number; spent: number }) {
  const pct = (spent / budget) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-[#888]">Budget: ${budget.toLocaleString()}</span>
        <span className="text-[#888]">Spent: ${spent.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
        />
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function PortalPage() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const api = useCallback(() => axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, deliverablesRes] = await Promise.all([
          api().get('/portal/projects'),
          api().get('/portal/deliverables'),
        ]);
        setProjects(projectsRes.data || MOCK_PROJECTS);
        setDeliverables(deliverablesRes.data || MOCK_DELIVERABLES);
      } catch {
        // Fallback to mock data
        setProjects(MOCK_PROJECTS);
        setDeliverables(MOCK_DELIVERABLES);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  return (
    <div className="p-4 md:p-8 lg:p-10 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#666] mb-3">
          <FolderKanban size={13} />
          <span>Client Portal</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-light text-white mb-1">
          Welcome, valued client
        </h1>
        <p className="text-[13px] text-[#666] font-light">
          Here&rsquo;s an overview of your active projects and recent deliverables.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8"
          >
            {[
              { icon: MessageCircle, label: 'Message Team', color: 'bg-[#D4A843]/10 text-[#D4A843]' },
              { icon: FileText, label: 'View Invoices', color: 'bg-blue-500/10 text-blue-400' },
              { icon: CheckCircle2, label: 'Approve Deliverables', color: 'bg-emerald-500/10 text-emerald-400' },
              { icon: Calendar, label: 'Upcoming Meetings', color: 'bg-purple-500/10 text-purple-400' },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-center gap-2 p-3 bg-[#141414] border border-[#1F1F1F] rounded-xl text-sm font-light hover:border-[#D4A843]/20 transition-all"
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${action.color}`}>
                    <Icon size={14} />
                  </span>
                  {action.label}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Active Projects */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-light text-white">Your Projects</h2>
              <span className="text-[11px] text-[#555]">{projects.length} active</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <PortalProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Deliverables */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-light text-white">Recent Deliverables</h2>
              <a href="/dashboard/portal/deliverables" className="text-[11px] text-[#D4A843] hover:underline">
                View all →
              </a>
            </div>
            <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1F1F1F]">
                    <th className="text-left text-[10px] uppercase tracking-wider text-[#555] font-medium pb-2.5 px-4 first:pl-4">Title</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-[#555] font-medium pb-2.5">Status</th>
                    <th className="text-left text-[10px] uppercase tracking-wider text-[#555] font-medium pb-2.5">Date</th>
                    <th className="text-right text-[10px] uppercase tracking-wider text-[#555] font-medium pb-2.5 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliverables.map((d, i) => (
                    <motion.tr
                      key={d.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="border-b border-[#1F1F1F] last:border-0"
                    >
                      <td className="px-4 py-3 first:pl-4">
                        <p className="text-sm text-white font-light">{d.title}</p>
                        <p className="text-[11px] text-[#555]">{d.description}</p>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          d.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : d.status === 'rejected'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 text-[11px] text-[#666]">{d.uploadedAt}</td>
                      <td className="py-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-[#555] hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors">
                            <Download size={14} />
                          </button>
                          {d.status === 'pending' && (
                            <button className="px-2.5 py-1 text-[10px] bg-[#D4A843] text-[#0A0A0A] rounded-lg font-medium">
                              Review
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
