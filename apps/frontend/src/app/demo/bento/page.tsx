import type { Metadata } from 'next';
import { BentoGrid, BentoCard } from '@/features/portal/components/BentoGrid';

export const metadata: Metadata = {
  title: 'Bento Grid System | HEXA Studio',
  description: 'HEXA Studio Bento Grid component showcase — variants, spans, and layouts.',
};

const SAMPLE_STATS = [
  {
    label: 'Active Projects',
    value: 12,
    icon: 'layers',
    trend: { value: 12, direction: 'up' },
    format: 'number' as const,
  },
  {
    label: 'Revenue This Month',
    value: 284500,
    icon: 'dollar-sign',
    trend: { value: 18.4, direction: 'up' },
    format: 'currency' as const,
  },
  {
    label: 'Client Satisfaction',
    value: 96,
    icon: 'star',
    trend: { value: 3.2, direction: 'up' },
    format: 'percentage' as const,
  },
  {
    label: 'Open Tasks',
    value: 23,
    icon: 'check-square',
    trend: { value: 8, direction: 'down' },
    format: 'number' as const,
  },
];

const SAMPLE_HEALTH = {
  score: 87,
  status: 'Excellent',
  sentiment: 'positive' as const,
  metricBreakdown: {
    timeline: 92,
    budget: 85,
    quality: 95,
    communication: 76,
  },
};

const SAMPLE_APPROVALS = [
  {
    id: 'a1',
    title: 'Contract Sign-Off - Horizon Villa',
    type: 'contract' as const,
    phaseName: 'Design Development',
    projectName: 'Horizon Villa',
    submittedAt: '2026-08-26T10:00:00Z',
    submittedBy: 'Marco Bellini',
    status: 'pending' as const,
    amount: 125000,
    currency: 'USD',
  },
  {
    id: 'a2',
    title: 'Final Deliverables Review',
    type: 'deliverable' as const,
    phaseName: 'Pre-Construction',
    projectName: 'Seaside Retreat',
    submittedAt: '2026-08-25T14:30:00Z',
    submittedBy: 'Elena Marchetti',
    status: 'pending' as const,
    amount: 85000,
    currency: 'USD',
  },
];

const SAMPLE_ACTIVITY = [
  {
    id: '1',
    type: 'approval' as const,
    title: 'Design Review Approved',
    description: 'The Horizon Villa facade study received full approval from the review board.',
    projectName: 'Horizon Villa',
    timestamp: '2026-08-27T14:30:00Z',
    author: 'Elena Marchetti',
  },
  {
    id: '2',
    type: 'upload' as const,
    title: 'BIM Model v3 Uploaded',
    description: 'Updated BIM model with revised structural elements uploaded to the project.',
    projectName: 'Horizon Villa',
    timestamp: '2026-08-27T11:15:00Z',
    author: 'James Chen',
  },
  {
    id: '3',
    type: 'milestone' as const,
    title: 'Design Development Complete',
    description: 'Design Development phase has been marked as complete. Moving to Construction Documents.',
    projectName: 'Horizon Villa',
    timestamp: '2026-08-26T16:00:00Z',
    author: 'Sofia Andersson',
  },
];

const SAMPLE_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'approval' as const,
    title: 'New Approval Request',
    message: 'Contract sign-off for Horizon Villa is awaiting your review.',
    timestamp: '2026-08-27T15:00:00Z',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'info' as const,
    title: 'BIM Sync Complete',
    message: 'Project model synchronized with Odoo successfully.',
    timestamp: '2026-08-27T12:00:00Z',
    isRead: true,
  },
];

const SAMPLE_MEETINGS = [
  {
    id: 'm1',
    title: 'Client Walkthrough - Horizon Villa',
    date: '2026-09-15',
    time: '10:00 AM',
    participants: ['Elena Marchetti', 'James Chen', 'Clara Novak'],
    link: 'https://meet.hexastudio.net/horizon',
  },
  {
    id: 'm2',
    title: 'Finance Review - Seaside Retreat',
    date: '2026-09-14',
    time: '2:00 PM',
    participants: ['Marco Bellini', 'Sofia Andersson'],
  },
];

const SAMPLE_INVOICES = [
  {
    id: 'inv1',
    reference: 'INV-0041',
    amount: 18500,
    currency: 'USD',
    dueDate: '2026-09-01',
    status: 'pending' as const,
  },
  {
    id: 'inv2',
    reference: 'INV-0038',
    amount: 32000,
    currency: 'USD',
    dueDate: '2026-08-20',
    status: 'overdue' as const,
  },
];

export default function BentoDemoPage() {
  return (
    <div className="min-h-screen bg-sl-void text-sl-alabaster p-8">
      <header className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-serif font-light text-foreground tracking-tight mb-2">
          Bento Grid System
        </h1>
        <p className="text-sm font-mono text-neutral-500 uppercase tracking-wider">
          HEXA Studio — Component Showcase
        </p>
      </header>

      <div className="max-w-7xl mx-auto space-y-16">
        {/* ─── Variant Showcase ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Variants</h2>
          <div className="flex flex-wrap gap-4">
            {(['default', 'elevated', 'glass', 'accent', 'interactive', 'skeleton'] as const).map((variant) => (
              <BentoCard
                key={variant}
                variant={variant}
                span="1x1"
                aria-label={`${variant} variant demo`}
                className="flex items-center justify-center min-h-[120px]"
              >
                <span className="text-sm font-mono uppercase tracking-wider text-neutral-400">
                  {variant}
                </span>
              </BentoCard>
            ))}
          </div>
        </section>

        {/* ─── Span Showcase ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Span Configurations</h2>
          <div className="space-y-4">
            <p className="text-sm font-mono text-neutral-500">1x1 cards (4 columns)</p>
            <BentoGrid>
              {(['1x1', '1x1', '1x1', '1x1'] as const).map((span, i) => (
                <BentoCard
                  key={i}
                  span={span}
                  variant="default"
                  aria-label={`1x1 span demo ${i + 1}`}
                  className="flex items-center justify-center min-h-[100px]"
                >
                  <span className="text-sm font-mono text-neutral-400">{span}</span>
                </BentoCard>
              ))}
            </BentoGrid>

            <p className="text-sm font-mono text-neutral-500">2x1 cards (half-width)</p>
            <BentoGrid>
              {(['2x1', '2x1'] as const).map((span, i) => (
                <BentoCard
                  key={i}
                  span={span}
                  variant="elevated"
                  aria-label={`2x1 span demo ${i + 1}`}
                  className="flex items-center justify-center min-h-[100px]"
                >
                  <span className="text-sm font-mono text-neutral-400">{span}</span>
                </BentoCard>
              ))}
            </BentoGrid>

            <p className="text-sm font-mono text-neutral-500">Mixed spans</p>
            <BentoGrid>
              <BentoCard span="2x1" variant="accent" aria-label="2x1 accent span" className="flex items-center justify-center min-h-[100px]">
                <span className="text-sm font-mono text-accent">2x1 accent</span>
              </BentoCard>
              <BentoCard span="1x1" variant="glass" aria-label="1x1 glass span" className="flex items-center justify-center min-h-[100px]">
                <span className="text-sm font-mono text-neutral-400">1x1 glass</span>
              </BentoCard>
              <BentoCard span="1x1" variant="default" aria-label="1x1 default span" className="flex items-center justify-center min-h-[100px]">
                <span className="text-sm font-mono text-neutral-400">1x1 default</span>
              </BentoCard>
            </BentoGrid>
          </div>
        </section>

        {/* ─── Full Dashboard Layout ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Full Dashboard Layout</h2>
          <BentoGrid aria-label="Demo dashboard">
            {/* Health Score - spans 2 columns */}
            <BentoCard variant="elevated" span="2x1" aria-label="Health score demo">
              <div className="flex flex-col h-full justify-center">
                <div className="text-center">
                  <p className="text-5xl font-serif font-light text-accent mb-2">
                    {SAMPLE_HEALTH.score}
                  </p>
                  <p className="text-sm font-mono text-neutral-500">/ 100</p>
                  <p className="text-xs font-mono uppercase tracking-wider text-emerald-400 mt-2">
                    {SAMPLE_HEALTH.status}
                  </p>
                </div>
              </div>
            </BentoCard>

            {/* Approvals - spans 2 columns */}
            <BentoCard variant="accent" span="2x1" aria-label="Pending approvals demo">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">Pending Approvals</h3>
                {SAMPLE_APPROVALS.map((approval) => (
                  <div
                    key={approval.id}
                    className="p-3 rounded-lg bg-white/[0.02] border border-border/20"
                  >
                    <p className="text-sm font-medium text-foreground truncate">
                      {approval.title}
                    </p>
                    <p className="text-xs font-mono text-neutral-500 mt-1">
                      {approval.projectName} · {approval.submittedBy}
                    </p>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Activity Feed */}
            <BentoCard variant="glass" span="2x1" aria-label="Activity feed demo">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
                {SAMPLE_ACTIVITY.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-neutral-500">{item.projectName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* KPI Stats Grid */}
            <BentoCard variant="default" span="1x1" aria-label="KPI stats demo">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-responsive="stack">
                {SAMPLE_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3 rounded-lg bg-white/[0.02] border border-border/20"
                  >
                    <p className="text-xs font-mono text-neutral-500">{stat.label}</p>
                    <p className="text-xl font-serif font-light text-foreground mt-1">
                      {stat.format === 'currency' ? `$${stat.value.toLocaleString()}` : stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Notifications */}
            <BentoCard variant="interactive" span="1x1" aria-label="Notifications demo">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                <div className="space-y-2">
                  {SAMPLE_NOTIFICATIONS.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-2 rounded border ${
                        notification.isRead
                          ? 'bg-white/[0.02] border-border/20'
                          : 'bg-accent/[0.04] border-accent/10'
                      }`}
                    >
                      <p className="text-xs text-foreground truncate">{notification.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>

            {/* Meetings */}
            <BentoCard variant="default" span="1x1" aria-label="Meetings demo">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground">Upcoming</h3>
                {SAMPLE_MEETINGS.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-2 rounded-lg bg-white/[0.02] border border-border/20"
                  >
                    <p className="text-xs font-medium text-foreground truncate">{meeting.title}</p>
                    <p className="text-[10px] font-mono text-neutral-500">{meeting.date}</p>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Invoices */}
            <BentoCard variant="default" span="1x1" aria-label="Invoices demo">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground">Invoices</h3>
                {SAMPLE_INVOICES.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-border/20"
                  >
                    <span className="text-xs font-mono text-accent/80">{invoice.reference}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-foreground">
                        {invoice.currency} {invoice.amount.toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                          invoice.status === 'overdue'
                            ? 'bg-danger/10 text-danger'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </BentoGrid>
        </section>

        {/* ─── Interactive Card Demo ─── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Interactive</h2>
          <BentoGrid>
            <BentoCard
              variant="interactive"
              span="2x1"
              aria-label="Interactive card demo"
              className="flex items-center justify-center min-h-[120px]"
            >
              <span className="text-sm font-mono text-neutral-400">
                Hover card (interactive variant)
              </span>
            </BentoCard>
            <BentoCard
              variant="skeleton"
              span="2x1"
              aria-label="Skeleton loading demo"
              className="flex items-center justify-center min-h-[120px]"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                <span className="text-sm font-mono text-neutral-500">Loading...</span>
              </div>
            </BentoCard>
          </BentoGrid>
        </section>
      </div>
    </div>
  );
}
