'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { useLocale } from '@/i18n/LocaleProvider';
import { TextReveal } from '@/components/ui/TextReveal';
import { Button } from '@/components/ui/Button';
import { TimelineView, type TimelineMilestone } from '@/features/portal/TimelineView';
import { DocumentUpload } from '@/features/portal/DocumentUpload';
import { portalOdooApi, type PortalProject, type PortalDocumentRecord } from '@/features/odoo/api';

/* -------------------------------------------------------------------------- */
/*  Demo fallback data (when Odoo API unavailable)                            */
/* -------------------------------------------------------------------------- */

const DEMO_PROJECT: PortalProject = {
  id: 1,
  name: 'Villa Panorama',
  status: 'in-progress',
  type: 'Residential',
  startDate: '2026-04-01',
  endDate: '2026-12-15',
  milestones: [
    { id: 1, name: 'Concept Design', date: '2026-04-15', completed: true, description: 'Initial mood boards and concept sketches' },
    { id: 2, name: 'Schematic Design', date: '2026-05-30', completed: true, description: 'Floor plans and elevations' },
    { id: 3, name: 'Design Development', date: '2026-07-15', completed: true, description: 'Detailed drawings and material selection' },
    { id: 4, name: '3D Modeling', date: '2026-08-30', completed: false, description: 'High-fidelity 3D model creation' },
    { id: 5, name: 'Texturing & Lighting', date: '2026-10-01', completed: false, description: 'Material application and lighting setup' },
    { id: 6, name: 'Final Rendering', date: '2026-11-15', completed: false, description: 'Final production renders' },
    { id: 7, name: 'Client Review', date: '2026-12-01', completed: false, description: 'Final presentation and approval' },
  ],
};

const DEMO_TIMELINE: TimelineMilestone[] = [
  {
    id: 'ms-1',
    name: 'Concept Design',
    description: 'Initial mood boards and concept sketches',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    status: 'completed',
  },
  {
    id: 'ms-2',
    name: 'Schematic Design',
    description: 'Floor plans and elevations',
    startDate: '2026-05-01',
    endDate: '2026-06-15',
    status: 'completed',
  },
  {
    id: 'ms-3',
    name: 'Design Development',
    description: 'Detailed drawings and material selection',
    startDate: '2026-06-16',
    endDate: '2026-07-31',
    status: 'completed',
  },
  {
    id: 'ms-4',
    name: '3D Modeling',
    description: 'High-fidelity 3D model creation',
    startDate: '2026-08-01',
    endDate: '2026-09-15',
    status: 'in-progress',
  },
  {
    id: 'ms-5',
    name: 'Texturing & Lighting',
    description: 'Material application and lighting setup',
    startDate: '2026-09-16',
    endDate: '2026-10-31',
    status: 'pending',
  },
  {
    id: 'ms-6',
    name: 'Final Rendering',
    description: 'Final production renders',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    status: 'pending',
  },
  {
    id: 'ms-7',
    name: 'Client Review',
    description: 'Final presentation and approval',
    startDate: '2026-12-01',
    endDate: '2026-12-15',
    status: 'pending',
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function calculateProgress(milestones: TimelineMilestone[]): number {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter((m) => m.status === 'completed').length;
  const inProgress = milestones.filter((m) => m.status === 'in-progress').length;
  return Math.round(((completed + inProgress * 0.5) / milestones.length) * 100);
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLocale();

  const projectId = typeof params.id === 'string' ? params.id : '';

  // Try to fetch Odoo project data, fall back to demo
  const { data: odooProject, isLoading: projectLoading } = useQuery<PortalProject>({
    queryKey: ['portal-odoo-project', projectId],
    queryFn: () => portalOdooApi.getProjects().then((projects) => {
      const project = projects.find((p) => String(p.id) === projectId);
      if (!project) throw new Error('Project not found');
      return project;
    }),
    enabled: !!user && !!projectId,
    retry: false,
  });

  const projectIdNum = parseInt(projectId, 10);

  const { data: odooDocuments, isLoading: docsLoading } = useQuery<PortalDocumentRecord[]>({
    queryKey: ['portal-documents', projectIdNum],
    queryFn: () => portalOdooApi.getDocuments(projectIdNum),
    enabled: !!user && !isNaN(projectIdNum),
    retry: false,
  });

  const [documents, setDocuments] = useState<PortalDocumentRecord[]>(odooDocuments ?? []);

  useEffect(() => {
    if (odooDocuments) setDocuments(odooDocuments);
  }, [odooDocuments]);

  // Convert Odoo milestones to TimelineMilestone format
  const timelineMilestones: TimelineMilestone[] = useMemo(() => {
    if (odooProject?.milestones && odooProject.milestones.length > 0) {
      return odooProject.milestones.map((m) => ({
        id: String(m.id),
        name: m.name,
        description: m.description,
        startDate: m.date || odooProject.startDate || new Date().toISOString(),
        endDate: m.completed ? m.date : undefined,
        status: m.completed ? 'completed' as const : 'pending' as const,
      }));
    }
    return DEMO_TIMELINE;
  }, [odooProject]);

  const project = odooProject || DEMO_PROJECT;
  const progress = calculateProgress(timelineMilestones);

  if (authLoading || projectLoading || docsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-xs uppercase tracking-[0.5em] text-neutral-500 font-mono"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 mb-8 uppercase tracking-widest font-mono text-xs">
            {t('portal.authRequired')}
          </p>
          <Button variant="primary" onClick={() => router.push('/portal/login')}>
            {t('portal.accessGateway')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-32 pb-24 px-8 md:px-16">
      <div className="mx-auto max-w-5xl">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/portal')}
            className="group flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-500 hover:text-accent transition-colors duration-300"
          >
            <svg className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7l-7-7 7-7" />
            </svg>
            {t('portal.nav.dashboard')}
          </button>
        </motion.div>

        {/* Project Header */}
        <header className="mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10px] uppercase tracking-[0.5em] text-neutral-500 mb-6 block font-mono"
          >
            {t('portal.projectStatus')}
          </motion.span>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="text-4xl md:text-7xl font-serif font-light text-foreground leading-tight">
                <TextReveal delay={0.1}>
                  {project.name}
                </TextReveal>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-xs text-neutral-500 uppercase tracking-wider font-mono">
                  {project.type}
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-700" />
                <span className="text-xs text-neutral-500 font-mono">
                  {project.startDate?.slice(0, 10) ?? '—'} &mdash; {project.endDate?.slice(0, 10) ?? '—'}
                </span>
              </div>
            </div>

            {/* Overall progress ring */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="3" className="text-neutral-800" />
                  <motion.circle
                    cx="32" cy="32" r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-accent"
                    strokeDasharray={2 * Math.PI * 28}
                    initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - progress / 100) }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-accent">
                  {progress}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
                  Complete
                </span>
                <span className="text-xs text-neutral-400">
                  {timelineMilestones.filter((m) => m.status === 'completed').length}/{timelineMilestones.length} milestones
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Timeline Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <TimelineView
            milestones={timelineMilestones}
            projectStartDate={project.startDate}
            projectEndDate={project.endDate}
          />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              label: 'Completed',
              count: timelineMilestones.filter((m) => m.status === 'completed').length,
              color: 'text-accent',
              border: 'border-accent/20 bg-accent/5',
            },
            {
              label: 'In Progress',
              count: timelineMilestones.filter((m) => m.status === 'in-progress').length,
              color: 'text-amber-400',
              border: 'border-amber-500/20 bg-amber-500/5',
            },
            {
              label: 'Pending',
              count: timelineMilestones.filter((m) => m.status === 'pending').length,
              color: 'text-neutral-500',
              border: 'border-neutral-700 bg-neutral-800/30',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`p-5 rounded-sm border ${stat.border} backdrop-blur-sm`}
            >
              <span className={`text-3xl font-serif font-light ${stat.color}`}>{stat.count}</span>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Documents */}
        {!isNaN(projectIdNum) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            <DocumentUpload
              projectId={projectIdNum}
              documents={documents}
              onDocumentsChange={setDocuments}
            />
          </motion.div>
        )}
      </div>
    </main>
  );
}
