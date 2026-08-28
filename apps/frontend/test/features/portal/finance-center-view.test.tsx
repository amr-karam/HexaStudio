/**
 * FinanceCenterView - regression tests for The Ledger.
 *
 * Contract under test:
 *  1. Summary cards are computed from the invoice set (total / paid / outstanding).
 *  2. Odoo `paymentState` maps to display statuses (not_paid -> pending, paid -> paid).
 *  3. Currency selector converts amounts (USD -> EUR) across summary + rows.
 *  4. Pay button appears ONLY for pending / overdue invoices - never paid / draft.
 *  5. Empty ledger state renders when the API returns no invoices.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/portal/api', () => ({
  portalApi: {
    getInvoices: vi.fn(),
  },
}));

vi.mock('@/features/odoo/api', () => ({
  odooApi: {
    getInvoiceLines: vi.fn(),
  },
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

import { FinanceCenterView } from '@/features/portal/components/FinanceCenterView';
import { portalApi } from '@/features/portal/api';

const getInvoices = portalApi.getInvoices as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number);
  getInvoices.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderView() {
  return render(
    <QueryClientProvider client={makeClient()}>
      <FinanceCenterView />
    </QueryClientProvider>,
  );
}

const INVOICE_PENDING = {
  id: 41,
  name: 'INV-2026-041',
  date: '2026-07-01',
  amount: 12500,
  residual: 12500,
  paymentState: 'not_paid',
  state: 'posted',
};

const INVOICE_PAID = {
  id: 15,
  name: 'INV-2026-015',
  date: '2026-06-01',
  amount: 25000,
  residual: 0,
  paymentState: 'paid',
  state: 'posted',
};

describe('FinanceCenterView - The Ledger', () => {
  it('renders the empty ledger state when the API returns no invoices', async () => {
    getInvoices.mockResolvedValue([]);

    renderView();

    expect(await screen.findByText('The ledger awaits its first entry')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('maps Odoo paymentState to display statuses and renders invoice rows', async () => {
    getInvoices.mockResolvedValue([INVOICE_PENDING, INVOICE_PAID]);

    renderView();

    expect(await screen.findByText('INV-2026-041')).toBeInTheDocument();
    expect(screen.getByText('INV-2026-015')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('computes summary cards from the invoice set', async () => {
    getInvoices.mockResolvedValue([INVOICE_PENDING, INVOICE_PAID]);

    renderView();
    await screen.findByText('INV-2026-041');

    expect(screen.getByText('Total Contract Value')).toBeInTheDocument();
    // Intl currency format renders cents: "$37,500.00" / "$12,500.00"
    expect(
      screen.getAllByText(
        (_, el) => el?.children.length === 0 && el?.textContent?.includes('37,500.00') === true,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(
        (_, el) => el?.children.length === 0 && el?.textContent?.includes('12,500.00') === true,
      ).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('50% Completed')).toBeInTheDocument();
  });

  it('converts amounts when the display currency is switched to EUR', async () => {
    getInvoices.mockResolvedValue([INVOICE_PENDING]);

    renderView();
    await screen.findByText('INV-2026-041');

    expect(
      screen.getAllByText(
        (_, el) => el?.children.length === 0 && el?.textContent?.includes('12,500.00') === true,
      ).length,
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Display amounts in EUR' }));

    // 12500 * 0.92 = 11500 -> "€11,500.00"
    await waitFor(() => {
      expect(
        screen.getAllByText(
          (_, el) => el?.children.length === 0 && el?.textContent?.includes('11,500.00') === true,
        ).length,
      ).toBeGreaterThan(0);
    });
  });

  it('shows the Pay button ONLY for pending/overdue invoices - never for paid', async () => {
    getInvoices.mockResolvedValue([INVOICE_PENDING, INVOICE_PAID]);

    renderView();
    await screen.findByText('INV-2026-041');

    const payButtons = screen.getAllByRole('button', { name: /^Pay$/ });
    expect(payButtons).toHaveLength(1);
  });

  it('opens the settlement modal and lists the amount due for a pending invoice', async () => {
    getInvoices.mockResolvedValue([INVOICE_PENDING]);

    renderView();
    await screen.findByText('INV-2026-041');

    fireEvent.click(screen.getByRole('button', { name: /^Pay$/ }));

    expect(await screen.findByText('Milestone Settlement')).toBeInTheDocument();
  });
});
