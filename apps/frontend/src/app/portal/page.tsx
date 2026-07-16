'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TextReveal } from '@/components/ui/TextReveal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/inputs/Input';
import { portalService, type PortalData, type ProjectRequest } from '@/services/portal.service';
import { useAuth } from '@/features/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PhaseApprovalCard, RealtimePresence, AnnotationOverlay } from '@/features/portal';
import { useRealtime } from '@/features/realtime/useRealtime';

type PhaseStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'revision';

const DEMO_PHASES: Array<{ id: string; name: string; status: PhaseStatus; description: string }> = [
  { id: 'phase-1', name: 'Concept Design', status: 'approved' as const, description: 'Initial concept and mood boards' },
  { id: 'phase-2', name: '3D Modeling', status: 'submitted' as const, description: 'High-fidelity 3D model creation' },
  { id: 'phase-3', name: 'Texturing & Lighting', status: 'pending' as const, description: 'Material application and lighting setup' },
  { id: 'phase-4', name: 'Final Rendering', status: 'pending' as const, description: 'Final production renders' },
];

export default function PortalPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [phases, setPhases] = useState(DEMO_PHASES);
  const [annotations, setAnnotations] = useState<Array<{ id: string; type: 'text' | 'pin'; position: { x: number; y: number }; content: string; author: string; createdAt: string; resolved: boolean }>>([]);
  const [presenceUsers, setPresenceUsers] = useState<string[]>([]);
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as ProjectRequest['priority'],
  });

  const { sendApproval, sendAnnotation, resolveAnnotation, announcePresence, isConnected } = useRealtime('demo-project', {
    onApprovalUpdate: (data) => {
      const statusMap = { approve: 'approved' as const, reject: 'rejected' as const, revision: 'revision' as const, submit: 'submitted' as const };
      setPhases((prev) => prev.map((p) =>
        p.id === data.phaseId ? { ...p, status: statusMap[data.action] || p.status } : p
      ));
      toast.success(`Phase ${data.action === 'approve' ? 'approved' : data.action === 'reject' ? 'rejected' : 'updated'}`);
    },
    onAnnotationAdded: (annotation) => {
      setAnnotations((prev) => [...prev, { id: annotation.id, type: annotation.type as 'text' | 'pin', position: { x: annotation.position.x, y: annotation.position.y }, content: annotation.content, author: annotation.author, createdAt: annotation.createdAt, resolved: false }]);
    },
    onAnnotationResolved: (data) => {
      setAnnotations((prev) => prev.map((a) => a.id === data.annotationId ? { ...a, resolved: true } : a));
    },
    onPresenceJoined: (data) => {
      setPresenceUsers((prev) => [...new Set([...prev, data.user])]);
    },
    onPresenceLeft: (data) => {
      setPresenceUsers((prev) => prev.filter((u) => u !== data.id));
    },
    onConnected: () => {
      if (user?.email) announcePresence(user.email);
    },
  });

  const { data, isLoading } = useQuery<PortalData>({
    queryKey: ['portal-data'],
    queryFn: portalService.getDemoData,
    enabled: !!user,
  });

  const { data: requests, isLoading: requestsLoading } = useQuery<ProjectRequest[]>({
    queryKey: ['portal-requests', user?.id],
    queryFn: () => portalService.getClientRequests(user?.id || 'demo-client'),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<ProjectRequest>) => portalService.sendRequest(data),
    onSuccess: () => {
      toast.success('Request sent successfully. Our team will review it shortly.');
      queryClient.invalidateQueries({ queryKey: ['portal-requests'] });
      setIsRequestModalOpen(false);
      setRequestForm({ title: '', description: '', priority: 'medium' });
    },
    onError: () => {
      toast.error('Failed to send request. Please try again.');
    },
  });

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...requestForm,
      projectId: data?.project.title || 'default',
      clientId: user?.id || 'demo-client',
    });
  };

  const handlePhaseSubmit = useCallback((phaseId: string) => {
    setPhases((prev) => prev.map((p) => p.id === phaseId ? { ...p, status: 'submitted' } : p));
    sendApproval({ phaseId, action: 'submit', userId: user?.id || 'unknown' });
    toast.success('Phase submitted for approval');
  }, [sendApproval, user?.id]);

  const handlePhaseReview = useCallback((phaseId: string, action: 'approve' | 'reject' | 'revision', comment?: string) => {
    sendApproval({ phaseId, action, userId: user?.id || 'unknown', comment });
  }, [sendApproval, user?.id]);

  const handleAddAnnotation = useCallback((ann: { x: number; y: number; content: string }) => {
    const annotation = {
      id: `ann-${Date.now()}`,
      type: 'pin' as const,
      position: { x: ann.x, y: ann.y },
      content: ann.content,
      author: user?.email || 'Anonymous',
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    setAnnotations((prev) => [...prev, annotation]);
    sendAnnotation(annotation);
  }, [sendAnnotation, user?.email]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-xs uppercase tracking-[0.5em] text-neutral-500 font-mono"
        >
          Loading Gateway...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 mb-8 uppercase tracking-widest font-mono text-xs">Authentication Required</p>
          <Button variant="primary" onClick={() => router.push('/portal/login')}>
            Access Gateway
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-8 md:px-16">
      <div className="w-full">
        <header className="mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            Client Gateway
          </motion.span>
          <div className="flex items-start justify-between">
            <div className="text-5xl md:text-8xl font-serif font-light tracking-tighter text-foreground leading-tight">
              <TextReveal delay={0.1}>
                Welcome, <br />
                <span className="italic text-accent">Valued Client.</span>
              </TextReveal>
            </div>
            <RealtimePresence users={presenceUsers} isConnected={isConnected} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-surface border border-border/50 p-8 md:p-12 rounded-sm">
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-2xl font-serif font-light text-foreground">Project Status</h2>
                <span className="text-[10px] uppercase tracking-widest text-accent font-mono px-2 py-1 border border-accent/30 rounded-full bg-accent/10">
                  {data.project.status}
                </span>
              </div>
              <div className="space-y-4">
                {phases.map((phase) => (
                  <PhaseApprovalCard
                    key={phase.id}
                    phase={phase}
                    onSubmit={handlePhaseSubmit}
                    onReview={handlePhaseReview}
                    isAdmin={user?.role === 'admin'}
                  />
                ))}
              </div>
            </section>

            <section className="bg-surface border border-border/50 p-8 md:p-12 rounded-sm">
              <AnnotationOverlay
                annotations={annotations}
                onAddAnnotation={handleAddAnnotation}
                onResolveAnnotation={(id) => {
                  setAnnotations((prev) => prev.map((a) => a.id === id ? { ...a, resolved: true } : a));
                  resolveAnnotation(id);
                }}
                currentUser={user?.email || 'Anonymous'}
              />
            </section>

            <section className="bg-surface border border-border/50 p-8 md:p-12 rounded-sm">
              <h2 className="text-2xl font-serif font-light text-foreground mb-8">Document Vault</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-background border border-border/30 hover:border-accent/50 transition-colors duration-300 group cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-sm text-neutral-400 group-hover:text-foreground transition-colors duration-300">{doc.name}</span>
                      <span className="text-[10px] text-neutral-600 uppercase font-mono">{doc.size} • {doc.type}</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-[10px] uppercase tracking-widest">Download</Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-surface border border-border/50 p-8 md:p-12 rounded-sm">
              <h2 className="text-2xl font-serif font-light text-foreground mb-8">Request History</h2>
              {requestsLoading ? (
                <div className="text-center py-12">
                  <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Syncing requests...</span>
                </div>
              ) : requests && requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-background border border-border/30 rounded-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-foreground">{req.title}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">{req.createdAt}</span>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border rounded-full font-mono ${
                        req.status === 'completed' ? 'border-neutral-500 text-neutral-500' :
                        req.status === 'reviewed' ? 'border-accent text-accent' : 'border-neutral-700 text-neutral-600'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-500 text-sm font-light">No active requests found.</p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-12">
            <section className="bg-surface border border-border/50 p-8 md:p-12 rounded-sm">
              <h2 className="text-xl font-serif font-light text-foreground mb-6">Project Lead</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-neutral-800 border border-border/50 overflow-hidden">
                  <Image src={data.lead.avatar} alt={data.lead.name} width={48} height={48} className="w-full h-full object-cover opacity-60" onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48';
                  }} unoptimized />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{data.lead.name}</p>
                  <p className="text-xs text-neutral-500">{data.lead.role}</p>
                </div>
              </div>
              <Button variant="outline" size="lg" className="w-full">Schedule Call</Button>
            </section>

            <section className="bg-accent/10 border border-accent/20 p-8 md:p-12 rounded-sm">
              <h2 className="text-xl font-serif font-light text-accent mb-6">Direct Request</h2>
              <p className="text-neutral-400 text-sm font-light mb-8 leading-relaxed">
                Need a specific change or have a question about the current phase?
              </p>
              <Button variant="primary" size="lg" className="w-full" onClick={() => setIsRequestModalOpen(true)}>
                Send Request
              </Button>
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface border border-border/50 p-8 md:p-12 rounded-sm shadow-2xl"
            >
              <h2 className="text-3xl font-serif font-light text-foreground mb-8">Submit Request</h2>
              <form onSubmit={handleSendRequest} className="space-y-6">
                <Input
                  label="Request Title"
                  placeholder="e.g., Change living room lighting"
                  required
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
                />
                <div className="flex flex-col gap-2 w-full group">
                  <label className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-medium">Priority</label>
                  <select
                    className="w-full bg-transparent border-b border-border py-3 px-0 text-sm transition-all duration-500 outline-none focus:border-accent text-foreground placeholder:text-neutral-600"
                    value={requestForm.priority}
                    onChange={(e) => setRequestForm({...requestForm, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  >
                    <option value="low" className="bg-surface">Low</option>
                    <option value="medium" className="bg-surface">Medium</option>
                    <option value="high" className="bg-surface">High</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 w-full group">
                  <label className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-medium">Description</label>
                  <textarea
                    className="w-full bg-transparent border-b border-border py-3 px-0 text-sm transition-all duration-500 outline-none focus:border-accent text-foreground placeholder:text-neutral-600 resize-none h-32"
                    placeholder="Detail your request..."
                    required
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" size="lg" className="flex-1" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Sending...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
