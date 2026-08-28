'use client';

/**
 * HEXA Portal v4.0 — Digital Headquarters Dashboard
 *
 * World-class premium dashboard answering "What is happening with my project
 * right now?" within 5 seconds.
 *
 * Architecture: Thin page-level composer that delegates to purpose-built
 * sub-components. All motion is gated by `useReducedMotion` (WCAG AA).
 * Data flows from TanStack Query → composed widgets; no mock fallbacks.
 *
 * Sub-components:
 * - DashboardHero        – Welcome + KPI strip
 * - DashboardStatsGrid   – Stat cards
 * - PendingApprovalsSection – Approval list / empty
 * - ActivityFeedSection  – Timeline
 * - QuickActionsGrid     – Action cards
 * - ProjectHealthSection – Health ring + metric bars + meetings
 */

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { DashboardHero } from '@/features/portal/components/DashboardHero';
import { DashboardStatsGrid } from '@/features/portal/components/DashboardStatsGrid';
import { PendingApprovalsSection } from '@/features/portal/components/PendingApprovalsSection';
import { ActivityFeedSection } from '@/features/portal/components/ActivityFeedSection';
import { QuickActionsGrid } from '@/features/portal/components/QuickActionsGrid';
import { ProjectHealthSection } from '@/features/portal/components/ProjectHealthSection';
import { DashboardSkeleton } from '@/features/portal/components/DashboardSkeleton';
import { DashboardError } from '@/features/portal/components/DashboardError';
import { createDynamicComponent } from '@/lib/dynamic-component';
import type { PortalAiCopilotProps } from '@/features/portal/components/PortalAiCopilot';

// Heavy AI copilot drawer (speech + image tooling) — lazy-loaded; only fetched
// when the user opens it, keeping the portal dashboard's initial bundle lean.
const PortalAiCopilot = createDynamicComponent<PortalAiCopilotProps>(
  () =>
    import('@/features/portal/components/PortalAiCopilot').then((m) => ({
      default: m.PortalAiCopilot,
    })),
  { ssr: false, loading: <span aria-hidden="true" /> },
);

import { portalApi } from '@/features/portal/api';
import { useAuth } from '@/features/auth';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { DashboardData } from '@/features/portal/types';

/* -------------------------------------------------------------------------- */
/*  Main Page Component                                                       */
/* -------------------------------------------------------------------------- */

export default function PortalDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const prefersReduced = useReducedMotion();
  const [copilotOpen, setCopilotOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !authLoading) {
      router.replace('/portal/login');
    }
  }, [user, authLoading, router]);

  const queryClient = useQueryClient();

  const {
    data: dashboardData,
    isLoading,
    isError,
    isFetching,
  } = useQuery<DashboardData>({
    queryKey: ['portal-dashboard'],
    queryFn: () => portalApi.getDashboard(),
    staleTime: 60_000, // 1 minute
    gcTime: 300_000,    // 5 minutes
  });

  /* Derived greeting — personalized by first name or username */
  const displayName = user?.username
    ? user.username.split(' ')[0]
    : user?.email
      ? user.email.split('@')[0]
      : 'there';

  /* ----------------------------------------------------------------------- */
  /*  State machine: loading → error → content                               */
  /* ----------------------------------------------------------------------- */

  // Still resolving auth or dashboard data — show skeleton
  if (authLoading || isLoading || !dashboardData) {
    return <DashboardSkeleton />;
  }

  // API error — honest error state (NO MOCK_FALLBACK_*)
  if (isError && !dashboardData) {
    return (
      <div className="pb-12">
        <DashboardError
          onRetry={() => void queryClient.refetchQueries({ queryKey: ['portal-dashboard'] })}
          isRetrying={isFetching}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12" role="main" aria-label="Portal Dashboard">
      {/* ================================================================ */}
      {/*  SECTION 1 — PREMIUM WELCOME HERO                               */}
      {/* ================================================================ */}
      <DashboardHero
        data={dashboardData}
        displayName={displayName}
        copilotOpen={copilotOpen}
        setCopilotOpen={setCopilotOpen}
        prefersReduced={prefersReduced}
      />

      {/* ================================================================ */}
      {/*  SECTION 2 — KPI STAT CARDS (Staggered fadeLift)                 */}
      {/* ================================================================ */}
      <DashboardStatsGrid stats={dashboardData.stats} />

      {/* ================================================================ */}
      {/*  SECTION 3 — MAIN TWO-COLUMN LAYOUT                              */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ---------------------------------------------------------------- */}
        {/*  LEFT COLUMN — Approvals + Activity + Quick Actions               */}
        {/* ---------------------------------------------------------------- */}
        <div className="lg:col-span-8 space-y-6">
          <PendingApprovalsSection
            approvals={dashboardData.pendingApprovals}
            prefersReduced={prefersReduced}
          />

          <ActivityFeedSection
            activities={dashboardData.activity}
            prefersReduced={prefersReduced}
          />

          <QuickActionsGrid prefersReduced={prefersReduced} />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/*  RIGHT COLUMN — Health Score + Meetings                          */}
        {/* ---------------------------------------------------------------- */}
        <div className="lg:col-span-4">
          <ProjectHealthSection data={dashboardData} prefersReduced={prefersReduced} />
        </div>
      </div>

      {/* ================================================================ */}
      {/*  AI COPILOT DRAWER                                               */}
      {/* ================================================================ */}
      <PortalAiCopilot
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        projectName={dashboardData.activeProjectName}
      />
    </div>
  );
}
