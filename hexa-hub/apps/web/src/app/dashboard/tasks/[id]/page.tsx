'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import {
  Calendar, Clock, User, CheckCircle2,
  AlertCircle, ChevronLeft, Edit3, FolderKanban, Target,
} from 'lucide-react';

interface Task {
  id: number;
  name: string;
  project_id?: [number, string];
  user_ids?: [number, string][];
  stage_id?: [number, string];
  description?: string;
  date_deadline?: string;
  planned_hours?: number;
  priority?: string;
  create_date?: string;
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!token || !id) return;
    const api = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });
    api.get(`/odoo/tasks/${id}`)
      .then((res) => { setTask(Array.isArray(res.data) ? res.data[0] : res.data); setLoading(false); })
      .catch(() => { setError('Failed to load task.'); setLoading(false); });
  }, [token, id, API_URL]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center"><AlertCircle size={32} className="mx-auto text-error mb-3" /><p className="text-error">{error}</p></div>
    </div>
  );

  if (!task) return null;

  const stage = task.stage_id?.[1] || 'Unknown';
  const isDone = stage.toLowerCase() === 'done';
  const priorityColor: Record<string, string> = { '0': 'text-error', '1': 'text-amber-400', '2': 'text-info', '3': 'text-tertiary' };

  return (
    <div className="p-8 md:p-12 min-h-screen">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-tertiary hover:text-foreground mb-8 transition-colors">
        <ChevronLeft size={16} /> <span className="text-sm">Back to Tasks</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isDone && <CheckCircle2 size={20} className="text-success" />}
              <h1 className={`text-3xl font-serif font-light ${isDone ? 'text-tertiary line-through' : 'text-white'}`}>
                {task.name}
              </h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-tertiary">
              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${isDone ? 'bg-success/10 text-success' : 'bg-info/10 text-info'}`}>
                {stage}
              </span>
              {task.project_id && (
                <span className="flex items-center gap-1"><FolderKanban size={13} />{task.project_id[1]}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isDone && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-success/10 border border-emerald-500/20 text-success rounded-lg text-sm flex items-center gap-2">
                <CheckCircle2 size={14} /> Complete
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-white/5 border border-border text-foreground rounded-lg text-sm flex items-center gap-2">
              <Edit3 size={14} /> Edit
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Description */}
            {task.description && (
              <div className="p-6 bg-surface border border-border rounded-xl mb-6">
                <h3 className="text-sm font-serif text-foreground mb-3">Description</h3>
                <p className="text-sm text-tertiary font-light whitespace-pre-wrap">{task.description}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-surface border border-border rounded-xl">
              <h3 className="text-sm font-serif text-foreground mb-4">Task Info</h3>
              <div className="space-y-4">
                {task.user_ids?.length ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-tertiary mb-1">Assignees</p>
                    {task.user_ids.map((u, i) => (
                      <div key={i} className="flex items-center gap-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-[10px] text-tertiary">{u[1]?.[0] || '?'}</div>
                        <span className="text-sm text-foreground font-light">{u[1] || 'Unassigned'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-tertiary"><User size={14} /> Unassigned</div>
                )}

                {task.date_deadline && (
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-tertiary flex items-center gap-1.5"><Calendar size={12} /> Due Date</span>
                    <span className="text-sm text-foreground">{new Date(task.date_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}

                {task.planned_hours != null && (
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-tertiary flex items-center gap-1.5"><Clock size={12} /> Planned Hours</span>
                    <span className="text-sm text-foreground">{task.planned_hours}h</span>
                  </div>
                )}

                {task.priority && (
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-tertiary flex items-center gap-1.5"><Target size={12} /> Priority</span>
                    <span className={`text-sm font-medium ${priorityColor[task.priority] || 'text-white'}`}>{task.priority}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
