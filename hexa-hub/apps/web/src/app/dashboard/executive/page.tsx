'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import { TrendingUp, Users, CheckCircle, AlertCircle, BrainCircuit } from 'lucide-react';

export default function ExecutiveDashboard() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState({
    revenue: '€1.2M',
    activeProjects: 14,
    pendingApprovals: 6,
    employeeEfficiency: '94%'
  });
  const [aiInsights, setAiInsights] = useState('Analyzing current project trends...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExecutiveData = async () => {
      try {
        const api = axios.create({
          baseURL: 'http://localhost:3000/api',
          headers: { Authorization: `Bearer ${token}` }
        });

        // In a real app, these would be separate endpoints
        const [projectsRes] = await Promise.all([
          api.get('/workspaces')
        ]);

        // Simulated AI insight generation based on project data
        const summaryRes = await api.post('/ai/summarize', { 
          tasks: projectsRes.data.map(p => ({ title: p.name })) 
        });

        setAiInsights(summaryRes.data.summary);
      } catch (e) {
        setAiInsights('AI insight generation unavailable. Please check system status.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) loadExecutiveData();
  }, [token]);

  return (
    <div className="p-8 md:p-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-serif font-light text-white mb-4">Executive <span className="text-gold">Overview</span></h1>
        <p className="text-neutral-500 font-light text-lg">Real-time operational health of HEXA Studio.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {[
          { label: 'Annual Revenue', value: metrics.revenue, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Active Projects', value: metrics.activeProjects, icon: FolderKanban, color: 'text-blue-400' },
          { label: 'Pending Approvals', value: metrics.pendingApprovals, icon: AlertCircle, color: 'text-gold' },
          { label: 'Studio Efficiency', value: metrics.employeeEfficiency, icon: Users, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="p-8 bg-surface border border-border rounded-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon size={64} />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 mb-4 block font-medium">{stat.label}</span>
            <div className={`text-4xl font-serif font-light ${stat.color}`}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 bg-surface border border-border rounded-3xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <BrainCircuit className="text-gold" size={24} />
            <h2 className="text-xl font-serif font-light text-white">AI Operational Insights</h2>
          </div>
          <div className="text-neutral-400 font-light leading-relaxed text-lg italic">
            {isLoading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-800 rounded"></div>
                  <div className="h-4 bg-neutral-800 rounded w-5/6"></div>
                </div>
              </div>
            ) : (
              `"${aiInsights}"`
            )}
          </div>
        </div>

        <div className="p-8 bg-surface border border-border rounded-3xl">
          <h3 className="text-lg font-serif font-light text-white mb-6">Critical Alerts</h3>
          <div className="space-y-4">
            {[
              { msg: 'Project "Azure Heights" delayed by 2 days', type: 'warning' },
              { msg: 'New lead from Website: "Global Tech Corp"', type: 'info' },
              { msg: 'Client approval pending for "Obsidian Villa"', type: 'urgent' },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${
                  alert.type === 'urgent' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-gold' : 'bg-blue-500'
                }`} />
                <p className="text-xs text-neutral-400 font-light">{alert.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderKanban({ size, className }: { size?: number, className?: string }) {
  return <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>;
}
