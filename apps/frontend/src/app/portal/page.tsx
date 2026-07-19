'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TextReveal } from '@/components/ui/TextReveal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/inputs/Input';
import { portalService, type PortalData, type ProjectRequest } from '@/services/portal.service';
import { portalOdooApi, type PortalProject, type PortalInvoice } from '@/features/odoo/api';
import { useAuth } from '@/features/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PhaseApprovalCard, RealtimePresence, AnnotationOverlay } from '@/features/portal';
import { TimelineView, type TimelineMilestone } from '@/features/portal/TimelineView';
import { useRealtime } from '@/features/realtime/useRealtime';
import { useAnalytics } from '@/lib/analytics';
import { useLocale } from '@/i18n/LocaleProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type PhaseStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'revision';

const DEMO_PHASES: Array<{ id: string; name: string; status: PhaseStatus; description: string }> = [
  { id: 'phase-1', name: 'Concept Design', status: 'approved' as const, description: 'Initial concept and mood boards' },
  { id: 'phase-2', name: '3D Modeling', status: 'submitted' as const, description: 'High-fidelity 3D model creation' },
  { id: 'phase-3', name: 'Texturing & Lighting', status: 'pending' as const, description: 'Material application and lighting setup' },
  { id: 'phase-4', name: 'Final Rendering', status: 'pending' as const, description: 'Final production renders' },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function transformMilestone(
  m: PortalProject['milestones'][number],
  project: PortalProject,
): TimelineMilestone {
  const endDate = m.completed ? m.date : undefined;
  return {
    id: String(m.id),
    name: m.name,
    description: m.description,
    startDate: m.date || project.startDate || new Date().toISOString(),
    endDate,
    status: (m.completed ? 'completed' : 'pending') as TimelineMilestone['status'],
  };
}

type ViewMode = 'gantt' | 'list';

export default function PortalPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { track } = useAnalytics();
  const { t } = useLocale();
  const prefersReduced = useReducedMotion();
  const queryClient = useQueryClient();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('gantt');
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
      toast.success(t('portal.phaseApproved'));
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

  const { data: requestsResponse, isLoading: requestsLoading } = useQuery<{ data: ProjectRequest[] }>({
    queryKey: ['portal-requests', user?.id],
    queryFn: () => portalService.getClientRequests(user?.id || 'demo-client'),
    enabled: !!user,
  });

  const requests = requestsResponse?.data;

  // Odoo client-scoped data
  const { data: odooProjects } = useQuery<PortalProject[]>({
    queryKey: ['portal-odoo-projects'],
    queryFn: portalOdooApi.getProjects,
    enabled: !!user,
  });

  const { data: odooInvoices } = useQuery<PortalInvoice[]>({
    queryKey: ['portal-odoo-invoices'],
    queryFn: portalOdooApi.getInvoices,
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<ProjectRequest>) => portalService.sendRequest(data),
    onSuccess: () => {
      toast.success(t('portal.requestSent'));
      queryClient.invalidateQueries({ queryKey: ['portal-requests'] });
      setIsRequestModalOpen(false);
      setRequestForm({ title: '', description: '', priority: 'medium' });
    },
    onError: () => {
      toast.error(t('portal.requestFailed'));
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
    toast.success(t('portal.phaseSubmitted'));
    track('portal_phase_submit', { phaseId });
  }, [sendApproval, user?.id, track]);

  const handlePhaseReview = useCallback((phaseId: string, action: 'approve' | 'reject' | 'revision', comment?: string) => {
    sendApproval({ phaseId, action, userId: user?.id || 'unknown', comment });
    track('portal_phase_review', { phaseId, action });
  }, [sendApproval, user?.id, track]);

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
    track('portal_annotation_add', { contentLength: ann.content.length });
  }, [sendAnnotation, user?.email, track]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-xs uppercase tracking-[0.5em] text-neutral-500 font-mono"
        >
          {t('portal.loading')}
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 mb-8 uppercase tracking-widest font-mono text-xs">{t('portal.authRequired')}</p>
          <Button variant="primary" onClick={() => router.push('/portal/login')}>
            {t('portal.accessGateway')}
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
            {t('portal.clientGateway')}
          </motion.span>
          <div className="flex items-start justify-between">
            <div className="text-5xl md:text-8xl font-serif font-light tracking-tighter text-foreground leading-tight">
              <TextReveal delay={0.1}>
                {t('portal.welcome')} <br />
                <span className="italic text-accent">{t('portal.valuedClient')}</span>
              </TextReveal>
            </div>
            <RealtimePresence users={presenceUsers} isConnected={isConnected} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-surface border border-border/50 p-8 md:p-12 rounded-sm">
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-2xl font-serif font-light text-foreground">{t('portal.projectStatus')}</h2>
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
              <h2 className="text-2xl font-serif font-light text-foreground mb-8">{t('portal.documentVault')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-background border border-border/30 hover:border-accent/50 transition-colors duration-300 group cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-sm text-neutral-400 group-hover:text-foreground transition-colors duration-300">{doc.name}</span>
                      <span className="text-[10px] text-neutral-600 uppercase font-mono">{doc.size} • {doc.type}</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-[10px] uppercase tracking-widest">{t('common.download')}</Button>
                  </div>
                ))}
              </div>
            </section>

            {/* Odoo Projects Section */}
            {odooProjects && odooProjects.length > 0 && (
              <section className="bg-surface border border-border/50 p-8 md:p-12 rounded-sm">
                {/* Section header with toggle */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-serif font-light text-foreground">
                    {t('portal.activeProjects') || 'Active Projects'}
                  </h2>
                  {/* View toggle */}
                  <div
                    className="flex items-center gap-1 rounded-full border border-border/30 p-0.5 bg-background/50"
                    role="radiogroup"
                    aria-label={t('portal.timeline.viewToggle') || 'View mode'}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={viewMode === 'gantt'}
                      onClick={() => setViewMode('gantt')}
                      className={cn(
                        'relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all duration-500',
                        viewMode === 'gantt'
                          ? 'text-accent shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-400',
                      )}
                    >
                      {viewMode === 'gantt' && (
                        <motion.span
                          layoutId="view-toggle-bg"
                          className="absolute inset-0 rounded-full bg-accent/10 border border-accent/30"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <svg className="relative w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="relative">{t('portal.timeline.gantt') || 'Timeline'}</span>
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={viewMode === 'list'}
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all duration-500',
                        viewMode === 'list'
                          ? 'text-accent shadow-sm'
                          : 'text-neutral-600 hover:text-neutral-400',
                      )}
                    >
                      {viewMode === 'list' && (
                        <motion.span
                          layoutId="view-toggle-bg"
                          className="absolute inset-0 rounded-full bg-accent/10 border border-accent/30"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <svg className="relative w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span className="relative">{t('portal.timeline.list') || 'List'}</span>
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {viewMode === 'gantt' ? (
                    /* ========== GANTT VIEW ========== */
                    <motion.div
                      key="gantt-view"
                      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-8"
                    >
                      {odooProjects.map((project) => {
                        const timelineMilestones = project.milestones.map((m) =>
                          transformMilestone(m, project),
                        );
                        const total = project.milestones.length;
                        const completed = project.milestones.filter((m) => m.completed).length;
                        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                        return (
                          <div key={project.id}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-accent/60" />
                                <h3 className="text-base font-medium text-foreground tracking-wide">
                                  {project.name}
                                </h3>
                                <span className="text-[10px] text-neutral-600 font-mono">
                                  {project.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] uppercase tracking-widest text-accent font-mono">
                                  {progress}%
                                </span>
                                <span className={cn(
                                  'text-[9px] uppercase tracking-widest px-2 py-0.5 border rounded-full font-mono',
                                  project.status === 'in-progress'
                                    ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                                    : project.status === 'completed'
                                      ? 'border-accent/30 text-accent bg-accent/10'
                                      : 'border-neutral-700 text-neutral-500',
                                )}>
                                  {project.status}
                                </span>
                              </div>
                            </div>
                            <TimelineView
                              milestones={timelineMilestones}
                              projectStartDate={project.startDate}
                              projectEndDate={project.endDate}
                            />
                          </div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    /* ========== LIST VIEW ========== */
                    <motion.div
                      key="list-view"
                      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-6"
                    >
                      {odooProjects.map((project) => {
                        const totalMilestones = project.milestones.length;
                        const completedMilestones = project.milestones.filter((m) => m.completed).length;
                        const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
                        return (
                          <div key={project.id} className="p-6 bg-background border border-border/30 rounded-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-medium text-foreground">{project.name}</h3>
                                <p className="text-xs text-neutral-500 mt-1">{project.type} &middot; {project.status}</p>
                              </div>
                              <span className="text-[10px] uppercase tracking-widest text-accent font-mono px-2 py-1 border border-accent/30 rounded-full bg-accent/10">
                                {progress}%
                              </span>
                            </div>
                            {/* Milestone progress bar */}
                            <div className="mb-4">
                              <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                                <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
                              </div>
                              <p className="text-[10px] text-neutral-600 mt-1 font-mono">{completedMilestones}/{totalMilestones} milestones</p>
                            </div>
                            {/* Milestone list */}
                            {project.milestones.length > 0 && (
                              <div className="space-y-2">
                                {project.milestones.map((ms) => (
                                  <div key={ms.id} className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${ms.completed ? 'bg-accent' : 'bg-neutral-700'}`} />
                                    <span className={`text-sm ${ms.completed ? 'text-neutral-500 line-through' : 'text-foreground'}`}>{ms.name}</span>
                                    {ms.date && <span className="text-[10px] text-neutral-600 font-mono ml-auto">{ms.date.slice(0, 10)}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}

            {/* Odoo Invoices Section */}
            {odooInvoices && odooInvoices.length > 0 && (
              <section className="bg-surface border border-border/50 p-8 md:p-12 rounded-sm">
                <h2 className="text-2xl font-serif font-light text-foreground mb-8">Invoices</h2>
                <div className="space-y-3">
                  {odooInvoices.map((inv) => {
                    const statusColor = inv.paymentState === 'paid'
                      ? 'border-green-500/30 text-green-400 bg-green-500/10'
                      : inv.paymentState === 'partial'
                        ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                        : 'border-red-500/30 text-red-400 bg-red-500/10';
                    const statusLabel = inv.paymentState === 'paid' ? 'Paid' : inv.paymentState === 'partial' ? 'Partial' : 'Unpaid';
                    return (
                      <div key={inv.id} className="flex items-center justify-between p-4 bg-background border border-border/30 rounded-sm">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{inv.name || `Invoice #${inv.id}`}</span>
                          <span className="text-[10px] text-neutral-600 font-mono">{inv.date?.slice(0, 10) ?? '—'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-neutral-400">${Math.round(inv.amount).toLocaleString()}</span>
                          <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border rounded-full font-mono ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="bg-surface border border-border/50 p-8 md:p-12 rounded-sm">
              <h2 className="text-2xl font-serif font-light text-foreground mb-8">{t('portal.requestHistory')}</h2>
              {requestsLoading ? (
                <div className="text-center py-12">
                  <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">{t('portal.syncingRequests')}</span>
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
                  <p className="text-neutral-500 text-sm font-light">{t('portal.noRequests')}</p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-12">
            <section className="bg-surface border border-border/50 p-8 md:p-12 rounded-sm">
              <h2 className="text-xl font-serif font-light text-foreground mb-6">{t('portal.projectLead')}</h2>
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
              <Button variant="outline" size="lg" className="w-full">{t('portal.scheduleCall')}</Button>
            </section>

            <section className="bg-accent/10 border border-accent/20 p-8 md:p-12 rounded-sm">
              <h2 className="text-xl font-serif font-light text-accent mb-6">{t('portal.directRequest')}</h2>
              <p className="text-neutral-400 text-sm font-light mb-8 leading-relaxed">
                {t('portal.requestDescription')}
              </p>
              <Button variant="primary" size="lg" className="w-full" onClick={() => setIsRequestModalOpen(true)}>
                {t('portal.sendRequest')}
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
              <h2 className="text-3xl font-serif font-light text-foreground mb-8">{t('portal.submitRequest')}</h2>
              <form onSubmit={handleSendRequest} className="space-y-6">
                <Input
                  label={t('portal.requestTitle')}
                  placeholder={t('portal.requestPlaceholder')}
                  required
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
                />
                <div className="flex flex-col gap-2 w-full group">
                  <label className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-medium">{t('portal.priority')}</label>
                  <select
                    className="w-full bg-transparent border-b border-border py-3 px-0 text-sm transition-all duration-500 outline-none focus:border-accent text-foreground placeholder:text-neutral-600"
                    value={requestForm.priority}
                    onChange={(e) => setRequestForm({...requestForm, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  >
                    <option value="low" className="bg-surface">{t('portal.low')}</option>
                    <option value="medium" className="bg-surface">{t('portal.medium')}</option>
                    <option value="high" className="bg-surface">{t('portal.high')}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 w-full group">
                  <label className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-medium">{t('portal.description')}</label>
                  <textarea
                    className="w-full bg-transparent border-b border-border py-3 px-0 text-sm transition-all duration-500 outline-none focus:border-accent text-foreground placeholder:text-neutral-600 resize-none h-32"
                    placeholder={t('portal.detailPlaceholder')}
                    required
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setIsRequestModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button variant="primary" size="lg" className="flex-1" disabled={mutation.isPending}>
                    {mutation.isPending ? t('portal.sending') : t('portal.submitRequest')}
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
