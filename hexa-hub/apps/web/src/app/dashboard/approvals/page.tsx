'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import {
  CheckCircle2, XCircle, Clock, FileText, Plus, Filter, ChevronRight, ShieldCheck,
  FileSignature, Receipt, ClipboardCheck, AlertTriangle,
} from 'lucide-react';
import { SkeletonCard, SkeletonText, SkeletonPageHeader } from '@/components/Skeleton';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Approval {
  id: string; title: string; description?: string; type: string; status: string;
  requestedBy?: { fullName: string }; reviewer?: { fullName: string };
  reviewerNote?: string; dueDate?: string; createdAt: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

// ─── Config ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', bg: 'bg-amber-500/10', text: 'text-amber-400', icon: Clock },
  approved: { label: 'Approved', bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle2 },
  rejected: { label: 'Rejected', bg: 'bg-red-500/10', text: 'text-red-400', icon: XCircle },
  cancelled: { label: 'Cancelled', bg: 'bg-neutral-500/10', text: 'text-neutral-500', icon: XCircle },
};

const TYPE_CONFIG: Record<string, { label: string; icon: typeof FileText }> = {
  contract: { label: 'Contract', icon: FileSignature },
  quotation: { label: 'Quotation', icon: FileText },
  invoice: { label: 'Invoice', icon: Receipt },
  deliverable: { label: 'Deliverable', icon: ClipboardCheck },
  scope_change: { label: 'Scope Change', icon: AlertTriangle },
  other: { label: 'Other', icon: FileText },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ─── Component ──────────────────────────────────────────────────────────────

export default function ApprovalsPage() {
  const { token, user } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('other');
  const [newDesc, setNewDesc] = useState('');

  const api = useCallback(() => axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchApprovals = async () => {
    try { const r = await api().get('/approvals'); setApprovals(r.data); } catch {} finally { setIsLoading(false); }
  };

  useEffect(() => { if (token) fetchApprovals(); }, [token]);

  const handleApprove = async (id: string) => {
    await api().put(`/approvals/${id}/approve`);
    fetchApprovals();
  };

  const handleReject = async (id: string) => {
    await api().put(`/approvals/${id}/reject`, { note: 'Rejected' });
    fetchApprovals();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await api().post('/approvals', { title: newTitle, type: newType, description: newDesc, status: 'pending', requestedBy: { id: user?.id } });
    setShowCreate(false); setNewTitle(''); setNewDesc('');
    fetchApprovals();
  };

  const filtered = filter === 'all' ? approvals : approvals.filter(a => a.status === filter);
  const pending = approvals.filter(a => a.status === 'pending').length;
  const approved = approvals.filter(a => a.status === 'approved').length;
  const rejected = approvals.filter(a => a.status === 'rejected').length;

  const FILTERS: { id: StatusFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: approvals.length },
    { id: 'pending', label: 'Pending', count: pending },
    { id: 'approved', label: 'Approved', count: approved },
    { id: 'rejected', label: 'Rejected', count: rejected },
  ];

  return (
    <div className="p-8 md:p-10 lg:p-12 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#666] mb-4">
          <ShieldCheck size={13} />
          <span>Approval Center</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-white mb-1">Approvals</h1>
            <p className="text-[13px] text-[#666] font-light">Digital sign-off for contracts, deliverables, and changes</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#D4A843] text-[#0A0A0A] rounded-lg text-sm font-medium hover:shadow-[0_0_20px_rgba(212,168,67,0.15)] transition-all">
            <Plus size={16} /> New Approval
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending', count: pending, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
          { label: 'Approved', count: approved, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
          { label: 'Rejected', count: rejected, color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`p-5 ${s.bg} border ${s.border} rounded-2xl`}>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#555]">{s.label}</span>
            <p className={`text-3xl font-serif font-light mt-1 ${s.color}`}>{s.count}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${filter === f.id ? 'bg-[#D4A843]/10 text-[#D4A843]' : 'text-[#555] hover:text-white hover:bg-white/[0.03]'}`}>
            {f.label} <span className="text-[#444] ml-1">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Approvals List */}
      {isLoading ? (
        <div className="space-y-6">
          {/* Header skeleton */}
          <SkeletonPageHeader />

          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 bg-[#141414] border border-[#1F1F1F] rounded-2xl space-y-2">
                <SkeletonText width="60px" className="h-3" />
                <SkeletonText width="40px" className="h-8" />
              </div>
            ))}
          </div>

          {/* Filter tabs skeleton */}
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonText key={i} width="80px" className="h-8 rounded-lg" />
            ))}
          </div>

          {/* List items skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <SkeletonText width="40px" className="h-10 rounded-xl" />
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <SkeletonText width="180px" className="h-4" />
                      <SkeletonText width="70px" className="h-5 rounded-full" />
                      <SkeletonText width="60px" className="h-3" />
                    </div>
                    <SkeletonText width="70%" className="h-3" />
                    <div className="flex items-center gap-4">
                      <SkeletonText width="120px" className="h-3" />
                      <SkeletonText width="100px" className="h-3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center"><ShieldCheck size={40} className="text-[#333] mx-auto mb-3" /><p className="text-[#555] text-sm">No approvals found.</p><button onClick={() => setShowCreate(true)} className="mt-3 text-xs text-[#D4A843] hover:underline">Create one</button></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => {
            const s = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.pending;
            const t = TYPE_CONFIG[a.type] ?? TYPE_CONFIG.other;
            const StatusIcon = s.icon;
            const TypeIcon = t.icon;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5 hover:border-[#1F1F1F] transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg} ${s.text}`}><TypeIcon size={18} /></div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-light">{a.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.text}`}>
                          <StatusIcon size={11} />{s.label}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-[#555]">{t.label}</span>
                      </div>
                      {a.description && <p className="text-[12px] text-[#666] font-light mb-2">{a.description}</p>}
                      <div className="flex items-center gap-4 text-[11px] text-[#555]">
                        {a.requestedBy && <span>Requested by {a.requestedBy.fullName}</span>}
                        {a.reviewer && <span>· Reviewed by {a.reviewer.fullName}</span>}
                        {a.dueDate && <span>· Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                        {a.reviewerNote && <span className="text-amber-400/80">· &ldquo;{a.reviewerNote}&rdquo;</span>}
                      </div>
                    </div>
                  </div>
                  {a.status === 'pending' && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleApprove(a.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors"><CheckCircle2 size={13} /> Approve</button>
                      <button onClick={() => handleReject(a.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"><XCircle size={13} /> Reject</button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#141414] border border-[#1F1F1F] rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-lg font-serif font-light text-white mb-4">New Approval Request</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title" className="w-full bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#D4A843]/50 transition-all" required autoFocus />
                <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#D4A843]/50 transition-all cursor-pointer">
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={3} className="w-full bg-[#1A1A1A] border border-[#1F1F1F] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#D4A843]/50 transition-all resize-none" />
                <button type="submit" className="w-full py-3 bg-[#D4A843] text-[#0A0A0A] rounded-lg text-sm font-medium">Submit for Approval</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}