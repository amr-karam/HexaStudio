'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import { LayoutDashboard, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  assignee?: { fullName: string };
}

interface Workspace {
  id: string;
  name: string;
  description: string;
}

export default function ProjectWorkspacePage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    const loadData = async () => {
      try {
        const api = axios.create({
          baseURL: API_URL,
          headers: { Authorization: `Bearer ${token}` }
        });

        const [wsRes, taskRes] = await Promise.all([
          api.get(`/workspaces/${params.id}`),
          api.get(`/workspaces/${params.id}/tasks`)
        ]);

        setWorkspace(wsRes.data);
        setTasks(taskRes.data);
      } catch (error) {
        console.error('Error loading workspace:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) loadData();
  }, [token, params.id, API_URL]);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Loading Workspace...</div>;

  return (
    <div className="p-8 md:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 text-neutral-500 text-xs uppercase tracking-widest mb-4">
          <LayoutDashboard size={14} />
          <span>Workspace / {workspace?.name}</span>
        </div>
        <h1 className="text-5xl font-serif font-light text-white mb-4">{workspace?.name}</h1>
        <p className="text-neutral-400 font-light text-lg max-w-3xl">{workspace?.description}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => (
          <div key={status} className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2 mb-4">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-medium">{status.replace('_', ' ')}</h3>
              <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            
            <div className="space-y-4 min-h-[500px] bg-surface/30 rounded-2xl p-4 border border-border/30">
              {tasks.filter(t => t.status === status).map((task) => (
                <motion.div 
                  key={task.id}
                  layoutId={task.id}
                  className="p-4 bg-surface border border-border rounded-xl shadow-sm hover:border-gold/30 transition-all duration-300 cursor-pointer group"
                >
                  <h4 className="text-sm text-white font-light mb-3 group-hover:text-gold transition-colors">{task.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-neutral-800 text-[8px] flex items-center justify-center text-neutral-400">
                        {task.assignee?.fullName?.[0] || 'U'}
                      </div>
                      <span className="text-[10px] text-neutral-500">{task.assignee?.fullName || 'Unassigned'}</span>
                    </div>
                    {status === 'DONE' ? <CheckCircle size={14} className="text-green-500" /> : 
                     status === 'REVIEW' ? <AlertCircle size={14} className="text-gold" /> :
                     <Clock size={14} className="text-neutral-600" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
