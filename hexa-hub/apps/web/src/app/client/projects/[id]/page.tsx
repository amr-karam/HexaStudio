'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import { CheckCircle, Clock, AlertCircle, ChevronLeft, Loader2 } from 'lucide-react';

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
  tasks: Task[];
}

export default function ClientProjectPage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_URL}/client/workspaces/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWorkspace(res.data);
      } catch (err) {
        console.error('Failed to fetch project data', err);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [token, params.id, API_URL]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <Loader2 className="text-gold animate-spin" size={48} />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-red-500">
        {error || 'Project not found.'}
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 text-sm uppercase tracking-widest"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </button>
        <h1 className="text-4xl font-serif font-light text-white mb-4">{workspace.name}</h1>
        <p className="text-neutral-400 font-light text-lg">{workspace.description}</p>
      </motion.div>

      <div className="space-y-8">
        <h2 className="text-2xl font-serif text-white">Project Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const).map((status) => (
            <div key={status} className="flex flex-col gap-4">
              <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-medium px-2">
                {status.replace('_', ' ')}
              </h3>
              <div className="space-y-4 min-h-[400px] bg-surface/30 rounded-2xl p-4 border border-border/30">
                {workspace.tasks
                  .filter(t => t.status === status)
                  .map((task) => (
                    <motion.div 
                      key={task.id}
                      layoutId={task.id}
                      className="p-4 bg-surface border border-border rounded-xl shadow-sm"
                    >
                      <h4 className="text-sm text-white font-light mb-3">{task.title}</h4>
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
    </div>
  );
}
