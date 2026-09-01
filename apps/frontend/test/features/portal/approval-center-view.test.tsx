/**
 * ApprovalCenterView — regression tests for decision persistence.
 *
 * Contract under test:
 *  1. Live registry decisions are persisted via portalApi.reviewApproval.
 *  2. A failed persist reverts the optimistic update AND surfaces an honest
 *     role="alert" error — a decision is never silently lost or faked.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/portal/api', () => ({
  portalApi: {
    getDashboard: vi.fn(),
    reviewApproval: vi.fn(),
  },
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

import { ApprovalCenterView } from '@/features/portal/components/ApprovalCenterView';
import { portalApi } from '@/features/portal/api';

const getDashboard = portalApi.getDashboard as ReturnType<typeof vi.fn>;
const reviewApproval = portalApi.reviewApproval as ReturnType<typeof vi.fn>;

// framer-motion needs a real rAF in jsdom for entrance variants to settle.
beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
  getDashboard.mockReset();
  reviewApproval.mockReset();
  reviewApproval.mockResolvedValue({ id: 'app-1', status: 'approved' });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
}

const LIVE_DASHBOARD = {
  companyName: 'HEXA Studio',
  activeProjectName: 'Horizon Villa',
  activeProjectStage: 'Phase 2',
  overallProgressPercentage: 42,
  nextMilestoneName: '3D Modeling',
  nextMilestoneDueDate: '2026-08-30',
  stats: [],
  healthScore: { score: 94, status: 'Excellent' },
  activity: [],
  notifications: [],
  upcomingMeetings: [],
  outstandingInvoices: [],
  pendingApprovals: [
    {
      id: 'app-1',
      title: '3D Exterior Renderings — Vantage Point A & B',
      type: 'design',
      phaseName: 'Phase 2: Architectural Visualization',
      projectName: 'Horizon Villa',
      submittedAt: '2026-07-22T10:00:00Z',
      submittedBy: 'Elena Rostova (Lead Architectural Artist)',
      status: 'pending',
      auditTrail: [
        { timestamp: '2026-07-22T10:00:00Z', action: 'Submitted for Client Review', actor: 'Elena Rostova' },
      ],
    },
  ],
};

function renderView(): ReturnType<typeof render> {
  const client = makeClient();
  return render(
    <QueryClientProvider client={client}>
      <ApprovalCenterView />
    </QueryClientProvider>,
  );
}

/**
 * Wait for the signing desk detail panel (AnimatePresence mode="wait" delays
 * its entrance after the empty state exits) and click the approve button.
 */
async function approveFirstDeliverable(user: UserEvent): Promise<void> {
  const approveButton = await screen.findByRole('button', { name: 'Approve this deliverable' });
  await user.click(approveButton);
}

describe('ApprovalCenterView — persistence', () => {
  it('renders the live registry badge when the dashboard API returns approvals', async () => {
    getDashboard.mockResolvedValue(LIVE_DASHBOARD);

    renderView();

    await waitFor(() => {
      expect(screen.getByText('Live Registry')).toBeInTheDocument();
    });
  });

  it('persists an approval decision to the backend on the live registry', async () => {
    getDashboard.mockResolvedValue(LIVE_DASHBOARD);

    renderView();
    const user = userEvent.setup();
    await approveFirstDeliverable(user);

    await waitFor(() => {
      expect(reviewApproval).toHaveBeenCalledWith('app-1', 'approved', undefined);
    });
  });

  it('reverts the optimistic update and alerts when the backend persist fails', async () => {
    getDashboard.mockResolvedValue(LIVE_DASHBOARD);
    reviewApproval.mockRejectedValue(new Error('network down'));

    renderView();
    const user = userEvent.setup();
    await approveFirstDeliverable(user);

    // Wait for all state updates to settle — promise rejection triggers
    // setState in .catch() which requires act() wrapping.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Honest failure: role=alert message + status pill returns to Awaiting Signature.
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /decision could not be recorded/i,
    );
    await waitFor(() => {
      expect(screen.getAllByText('Awaiting Signature').length).toBeGreaterThan(0);
    });
    expect(screen.queryByText('Record sealed in the ledger')).not.toBeInTheDocument();
  });
});
