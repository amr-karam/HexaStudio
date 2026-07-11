'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { TextReveal } from '@/components/ui/TextReveal';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/constants';
import { ProjectRequest } from '@/services/portal.service';

export default function AdminRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery<ProjectRequest[]>({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/requests/admin`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: ProjectRequest['status'] }) => {
      const response = await fetch(`${API_BASE_URL}/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      toast.success('Request status updated.');
    },
    onError: () => {
      toast.error('Failed to update status.');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-xs uppercase tracking-[0.5em] text-neutral-500 font-mono">Loading Admin Dashboard...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            Internal Management
          </motion.span>
          <div className="text-5xl md:text-7xl font-serif font-light tracking-tight text-foreground leading-tight">
            <TextReveal delay={0.1}>
              Client <span className="italic text-accent">Requests</span>
            </TextReveal>
          </div>
        </header>

        <div className="bg-surface border border-border/50 rounded-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-neutral-900/50">
                <th className="p-6 text-[10px] uppercase tracking-widest text-neutral-500 font-mono">Request</th>
                <th className="p-6 text-[10px] uppercase tracking-widest text-neutral-500 font-mono">Priority</th>
                <th className="p-6 text-[10px] uppercase tracking-widest text-neutral-500 font-mono">Status</th>
                <th className="p-6 text-[10px] uppercase tracking-widest text-neutral-500 font-mono text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests && requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req.id} className="border-b border-border/30 hover:bg-neutral-800/30 transition-colors">
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{req.title}</span>
                        <span className="text-xs text-neutral-500 font-light">{req.description}</span>
                      </div>
                    </td>
                      <td className="p-6">
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-mono ${
                          req.priority === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                          req.priority === 'medium' ? 'bg-accent/10 text-accent border border-accent/20' : 
                          'bg-neutral-800 text-neutral-500 border border-neutral-700'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="text-xs text-neutral-400 font-mono">{req.status}</span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[10px] uppercase tracking-widest"
                            onClick={() => mutation.mutate({ id: req.id, status: 'reviewed' })}
                            disabled={req.status === 'reviewed'}
                          >
                            Review
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[10px] uppercase tracking-widest"
                            onClick={() => mutation.mutate({ id: req.id, status: 'completed' })}
                            disabled={req.status === 'completed'}
                          >
                            Complete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-neutral-500 font-light">
                      No active requests to manage.
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
