'use client';

import {
  Download,
  Share2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Eye,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';
import { ExecutiveReport } from '@/features/portal/types';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Mock Data for UI Development                                               */
/* -------------------------------------------------------------------------- */

const MOCK_REPORT: ExecutiveReport = {
  projectId: 101,
  projectName: 'Horizon Villa',
  generatedAt: new Date().toISOString(),
  executiveSummary: {
    narrative: 'Project Horizon Villa maintains a stable trajectory. Spatial synthesis of the primary façade is complete, and BIM synchronization with structural requirements is verified. Current focus is directed toward refining the interior material palette to align with the revised luxury specification.',
    sentiment: 'positive',
    confidenceScore: 94,
  },
  metrics: {
    timelineHealth: {
      status: 'on-track',
      currentPhase: 'Design Development',
      completionPercentage: 68,
      nextMilestone: 'Client Walkthrough',
      predictedCompletionDate: '2026-09-15',
    },
    budgetHealth: {
      status: 'on-track',
      totalAllocated: 1250000,
      totalSpent: 840000,
      burnRate: '12% / month',
      forecastedOverrun: 0,
    },
    qualityHealth: {
      status: 'excellent',
      approvedDeliverables: 14,
      pendingRevisions: 2,
      clientSatisfactionIndex: 96,
    },
  },
  highlights: [
    {
      title: 'Façade Synthesis',
      description: 'Successful integration of parametric shading elements with structural load requirements.',
      impact: 'high',
      category: 'technical',
    },
    {
      title: 'Material Palette Lock',
      description: 'Final approval of the Obsidian and Gold-Subtle palette for primary interior spaces.',
      impact: 'medium',
      category: 'design',
    },
    {
      title: 'BIM Coordination',
      description: 'Zero-clash report achieved for the primary mechanical systems integration.',
      impact: 'high',
      category: 'technical',
    },
  ],
  interventions: [
    {
      issue: 'Lighting fixture lead times',
      proposedSolution: 'Advance procurement for custom Italian imports to avoid Q4 delays.',
      urgency: 'medium',
      owner: 'Procurement Lead',
    },
  ],
  visualizationCues: [
    {
      elementId: 'facade-north',
      highlightColor: '#D4AF37',
      note: 'Optimized parametric shading',
    },
    {
      elementId: 'lobby-core',
      highlightColor: '#E5C76B',
      note: 'Material palette verified',
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Components                                                                 */
/* -------------------------------------------------------------------------- */

function MetricCard({ label, value, status, icon: Icon, subtext }: { label: string; value: string; status: string; icon: React.ComponentType<{ size?: number }>; subtext?: string }) {
  const statusColors = {
    'on-track': 'text-sl-gold-hover',
    'at-risk': 'text-amber-500',
    'delayed': 'text-danger',
    'excellent': 'text-sl-gold-hover',
    'good': 'text-sl-silver',
    'needs-attention': 'text-amber-500',
  } as const;

  return (
    <div className="sl-glass-border sl-specular-top rounded-2xl p-6 bg-sl-obsidian/40 backdrop-blur-xl transition-all hover:bg-sl-obsidian/60 group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-sl-gold-subtle/10 text-sl-gold-hover group-hover:bg-sl-gold-subtle/20 transition-colors">
          <Icon size={18} />
        </div>
        <span className={cn('text-[10px] uppercase tracking-widest font-mono font-medium', statusColors[status as keyof typeof statusColors])}>
          {status.replace('-', ' ')}
        </span>
      </div>
      <div className="text-2xl font-serif font-light text-sl-silver mb-1">{value}</div>
      <div className="text-[11px] uppercase tracking-widest font-mono text-sl-silver/40">{label}</div>
      {subtext && <div className="text-[10px] font-mono text-sl-silver/30 mt-2">{subtext}</div>}
    </div>
  );
}

export default function ExecutiveReportPage() {
  const report = MOCK_REPORT;

  return (
    <div className="relative min-h-screen w-full bg-sl-obsidian text-sl-silver p-6 lg:p-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-sl-gold-subtle/50" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-mono text-sl-gold-hover">
              Executive Intelligence
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-serif font-light tracking-tight text-sl-silver">
            {report.projectName} <span className="text-sl-gold-subtle/30">/</span> Report
          </h1>
          <div className="flex items-center gap-4 mt-4 text-[11px] font-mono text-sl-silver/40 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <Calendar size={12} /> {new Date(report.generatedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <Activity size={12} /> {report.metrics.timelineHealth.currentPhase}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-3 rounded-full sl-glass-border bg-sl-obsidian/50 hover:bg-sl-obsidian/80 transition-all text-sl-silver/60 hover:text-sl-gold-hover">
            <Share2 size={18} />
          </button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-full sl-glass-border bg-sl-obsidian/50 hover:bg-sl-obsidian/80 transition-all text-sl-silver/60 hover:text-sl-gold-hover font-mono text-[11px] uppercase tracking-widest">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Narratives & Analysis */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Summary Card */}
          <section className="sl-glass-border sl-specular-top rounded-3xl p-8 bg-sl-obsidian/40 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <TrendingUp size={120} className="text-sl-gold-hover" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-xs uppercase tracking-[0.3em] font-mono text-sl-gold-subtle/60 mb-6">Executive Summary</h2>
              <p className="text-xl lg:text-2xl font-serif font-light leading-relaxed text-sl-silver/90">
                &ldquo;{report.executiveSummary.narrative}&rdquo;
              </p>
              <div className="flex items-center gap-4 mt-8">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sl-gold-subtle/10 border border-sl-gold-subtle/20 text-sl-gold-hover font-mono text-[10px] uppercase tracking-widest">
                  <CheckCircle2 size={12} /> Confidence {report.executiveSummary.confidenceScore}%
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sl-silver/10 border border-sl-silver/20 text-sl-silver/60 font-mono text-[10px] uppercase tracking-widest">
                  <Eye size={12} /> Sentiment: {report.executiveSummary.sentiment}
                </div>
              </div>
            </div>
          </section>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard 
              label="Timeline" 
              value={`${report.metrics.timelineHealth.completionPercentage}%`} 
              status={report.metrics.timelineHealth.status} 
              icon={Calendar} 
              subtext={`Next: ${report.metrics.timelineHealth.nextMilestone}`}
            />
            <MetricCard 
              label="Budget" 
              value={`$${(report.metrics.budgetHealth.totalSpent / 1000000).toFixed(2)}M`} 
              status={report.metrics.budgetHealth.status} 
              icon={DollarSign} 
              subtext={`Burn: ${report.metrics.budgetHealth.burnRate}`}
            />
            <MetricCard 
              label="Quality" 
              value={`${report.metrics.qualityHealth.clientSatisfactionIndex}%`} 
              status={report.metrics.qualityHealth.status} 
              icon={Activity} 
              subtext={`${report.metrics.qualityHealth.approvedDeliverables} items approved`}
            />
          </div>

          {/* Highlights & Interventions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h3 className="text-xs uppercase tracking-[0.3em] font-mono text-sl-gold-subtle/60 mb-6">Impact Highlights</h3>
              <div className="space-y-4">
                {report.highlights.map((h, i) => (
                  <div key={i} className="p-5 rounded-2xl sl-glass-border bg-sl-obsidian/20 hover:bg-sl-obsidian/40 transition-all group">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-serif font-medium text-sl-silver group-hover:text-sl-gold-hover transition-colors">{h.title}</h4>
                      <span className={cn(
                        'text-[9px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-full',
                        h.impact === 'high' ? 'bg-sl-gold-subtle/20 text-sl-gold-hover' : 'bg-sl-silver/10 text-sl-silver/50'
                      )}>
                        {h.impact} impact
                      </span>
                    </div>
                    <p className="text-xs font-mono text-sl-silver/50 leading-relaxed">{h.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs uppercase tracking-[0.3em] font-mono text-danger/60 mb-6">Strategic Interventions</h3>
              <div className="space-y-4">
                {report.interventions.map((int, i) => (
                  <div key={i} className="p-5 rounded-2xl sl-glass-border bg-danger/5 border-danger/10 hover:bg-danger/10 transition-all group">
                    <div className="flex items-center gap-2 mb-2 text-danger">
                      <AlertCircle size={14} />
                      <h4 className="text-sm font-serif font-medium">{int.issue}</h4>
                    </div>
                    <p className="text-xs font-mono text-sl-silver/60 leading-relaxed mb-3">{int.proposedSolution}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-danger/10">
                      <span className="text-[9px] uppercase tracking-widest font-mono text-sl-silver/40">Owner: {int.owner}</span>
                      <span className="text-[9px] uppercase tracking-widest font-mono text-danger/60">{int.urgency} urgency</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Visualizer Placeholder */}
        <div className="lg:col-span-5 h-full min-h-[600px] relative">
          <div className="absolute inset-0 rounded-3xl overflow-hidden sl-glass-border sl-specular-top bg-sl-obsidian flex items-center justify-center">
            <div className="text-center">
              <div className="text-sl-gold-subtle/60 font-mono text-[10px] uppercase tracking-[0.3em] mb-2">Spatial State Sync Active</div>
              <div className="text-sl-silver/40 text-xs">3D visualizer placeholder</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
