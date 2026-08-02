'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import {
  FileText, CheckCircle2, XCircle, Clock, User,
  Download, Upload, ExternalLink,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Deliverable {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  fileSize: string;
  fileUrl: string;
  reviewerComment?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_DELIVERABLES: Deliverable[] = [
  {
    id: '1',
    title: 'Homepage Mockups v2',
    description: 'High-fidelity designs for the main homepage with responsive variations',
    projectId: 'proj-1',
    projectName: 'Website Redesign',
    status: 'approved',
    uploadedAt: '2026-07-10',
    fileSize: '2.4 MB',
    fileUrl: '#',
    reviewerComment: 'Great work! The new hero section captures the brand vision perfectly.',
  },
  {
    id: '2',
    title: 'Brand Guidelines v2',
    description: 'Updated brand guidelines including new color palette, typography, and logo usage',
    projectId: 'proj-1',
    projectName: 'Website Redesign',
    status: 'pending',
    uploadedAt: '2026-07-15',
    fileSize: '1.8 MB',
    fileUrl: '#',
  },
  {
    id: '3',
    title: 'API Documentation',
    description: 'Complete technical documentation for the REST API endpoints',
    projectId: 'proj-2',
    projectName: 'Mobile App',
    status: 'pending',
    uploadedAt: '2026-07-12',
    fileSize: '3.2 MB',
    fileUrl: '#',
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function PortalDeliverablesPage() {
  const { token } = useAuth();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const api = useCallback(() => axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api().get('/portal/deliverables');
        setDeliverables(res.data);
      } catch {
        setDeliverables(MOCK_DELIVERABLES);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchData();
  }, [token, api]);

  const handleApprove = async (id: string) => {
    try {
      await api().put(`/portal/deliverables/${id}/approve`);
      setDeliverables(prev => prev.map(d => 
        d.id === id ? { ...d, status: 'approved' } : d
      ));
    } catch {}
  };

  const handleReject = async (id: string) => {
    try {
      await api().put(`/portal/deliverables/${id}/reject`);
      setDeliverables(prev => prev.map(d => 
        d.id === id ? { ...d, status: 'rejected' } : d
      ));
    } catch {}
  };

  const getStatusColor = (status: Deliverable['status']) => {
    if (status === 'approved') return 'bg-emerald-500/10 text-emerald-400';
    if (status === 'rejected') return 'bg-red-500/10 text-red-400';
    return 'bg-amber-500/10 text-amber-400';
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#555] mb-3">
          <FileText size={13} />
          <span>Deliverables</span>
        </div>
        <h1 className="text-2xl font-serif font-light text-white mb-1">
          Pending Approvals
        </h1>
        <p className="text-[13px] text-[#666]">
          Review and approve deliverables from your projects
        </p>
      </motion.div>

      {/* Deliverables List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
        </div>
      ) : deliverables.filter(d => d.status === 'pending').length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-serif font-light text-white mb-2">All caught up!</h3>
          <p className="text-[13px] text-[#666]">No pending deliverables to review.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {deliverables.filter(d => d.status === 'pending').map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-4 md:p-5 hover:border-[#D4A843]/20 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#D4A843]/10 flex-shrink-0">
                  <FileText size={18} className="text-[#D4A843]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-serif font-light text-white">{d.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(d.status)}`}>
                      {d.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666] mb-3">{d.description}</p>
                  
                  <div className="flex items-center gap-4 text-[11px] text-[#555] mb-4">
                    <span>Project: <span className="text-white font-light">{d.projectName}</span></span>
                    <span>Uploaded: <span className="text-white font-light">{d.uploadedAt}</span></span>
                    <span>Size: <span className="text-white font-light">{d.fileSize}</span></span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[#1F1F1F] first:border-0">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {}}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                    >
                      <CheckCircle2 size={12} />
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {}}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                    >
                      <XCircle size={12} />
                      Reject
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1F1F1F] text-[#555] rounded-lg text-xs font-medium hover:bg-white/[0.03] transition-colors ml-auto"
                    >
                      <Download size={12} />
                      Download
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}