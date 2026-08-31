'use client';

import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { TextReveal } from '@/components/ui/TextReveal';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/constants';
import { ProjectRequest } from '@/services/portal.service';

export default function AdminRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requestsResponse, isLoading } = useQuery<{ data: ProjectRequest[] }>({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/requests/admin`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    },
  });

  const requests = requestsResponse?.data;

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: ProjectRequest['status'] }) => {
      const response = await fetch(`${API_BASE_URL}/api/requests/${id}/status`, {
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
      <div className="min-h-screen bg-sl-void flex items-center justify-center">
        <span className="text-xs uppercase tracking-[0.5em] text-sl-mist/60 font-mono">Loading Admin Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sl-void pt-32 pb-24 px-8 md:px-16">
      <div className="w-full">
        <header className="mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs uppercase tracking-[0.5em] text-sl-mist/60 mb-6 block font-mono"
          >
            Internal Management
          </motion.span>
          <div className="text-5xl md:text-7xl font-serif font-light tracking-tight text-sl-alabaster leading-tight">
            <TextReveal delay={0.1}>
              Client <span className="italic text-sl-gold-hover">Requests</span>
            </TextReveal>
          </div>
        </header>

        <div className="bg-sl-obsidian border border-sl-silver/20 rounded-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sl-silver/20 bg-sl-void/50">
                <th className="p-6 text-[10px] uppercase tracking-widest text-sl-mist/60 font-mono">Request</th>
                <th className="p-6 text-[10px] uppercase tracking-widest text-sl-mist/60 font-mono">Priority</th>
                <th className="p-6 text-[10px] uppercase tracking-widest text-sl-mist/60 font-mono">Status</th>
                <th className="p-6 text-[10px] uppercase tracking-widest text-sl-mist/60 font-mono text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests && requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req.id} className="border-b border-sl-silver/20 hover:bg-sl-obsidian/30 transition-colors">
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-sl-alabaster">{req.title}</span>
                        <span className="text-xs text-sl-mist/60 font-light">{req.description}</span>
                      </div>
                    </td>
                      <td className="p-6">
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-mono ${
                          req.priority === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                          req.priority === 'medium' ? 'bg-sl-gold-subtle/10 text-sl-gold-hover border border-sl-gold-subtle/20' : 
                          'bg-sl-obsidian text-sl-mist/60 border border-neutral-700'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="text-xs text-sl-mist/60 font-mono">{req.status}</span>
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
                    <td colSpan={4} className="p-12 text-center text-sl-mist/60 font-light">
                      No active requests to manage.
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
