// ─── HEXA Hub — Sales Hooks ────────────────────────────────────────────────
// React Query hooks for the Sales module (quotations, invoices, stats).
// ───────────────────────────────────────────────────────────────────────────

'use client';

import { useOdooList, useOdooItem } from './use-odoo-query';
import type {
  OdooQuotation,
  OdooInvoice,
  OdooSalesOrder,
  SalesStats,
} from '@hexa-hub/types';
import type { ListParams } from './use-odoo-query';

// ─── Query Key Constants ───────────────────────────────────────────────────

const SALES_KEYS = {
  quotations: 'sales-quotations',
  quotation: 'sales-quotation',
  invoices: 'sales-invoices',
  invoice: 'sales-invoice',
  orders: 'sales-orders',
  stats: 'sales-stats',
} as const;

// ─── useQuotations ──────────────────────────────────────────────────────────

/**
 * Fetch quotations with optional filters.
 * GET /odoo/quotations
 *
 * @param filters — Optional filter parameters (state, partner, date range, etc.).
 */
export function useQuotations(filters?: ListParams) {
  return useOdooList<OdooQuotation>(
    SALES_KEYS.quotations,
    '/odoo/quotations',
    filters,
  );
}

// ─── useQuotation ───────────────────────────────────────────────────────────

/**
 * Fetch a single quotation by ID.
 * GET /odoo/quotations/:id
 *
 * @param id — The quotation ID.
 */
export function useQuotation(id?: string | number) {
  return useOdooItem<OdooQuotation>(
    SALES_KEYS.quotation,
    '/odoo/quotations',
    id,
  );
}

// ─── useInvoices ────────────────────────────────────────────────────────────

/**
 * Fetch invoices with optional filters.
 * GET /odoo/invoices
 *
 * @param filters — Optional filter parameters (state, partner, date range, etc.).
 */
export function useInvoices(filters?: ListParams) {
  return useOdooList<OdooInvoice>(
    SALES_KEYS.invoices,
    '/odoo/invoices',
    filters,
  );
}

// ─── useInvoice ─────────────────────────────────────────────────────────────

/**
 * Fetch a single invoice by ID.
 * GET /odoo/invoices/:id
 *
 * @param id — The invoice ID.
 */
export function useInvoice(id?: string | number) {
  return useOdooItem<OdooInvoice>(
    SALES_KEYS.invoice,
    '/odoo/invoices',
    id,
  );
}

// ─── useSalesOrders ─────────────────────────────────────────────────────────

/**
 * Fetch sales orders with optional filters.
 * GET /odoo/sales-orders
 *
 * @param filters — Optional filter parameters.
 */
export function useSalesOrders(filters?: ListParams) {
  return useOdooList<OdooSalesOrder>(
    SALES_KEYS.orders,
    '/odoo/sales-orders',
    filters,
  );
}

// ─── useSalesStats ─────────────────────────────────────────────────────────

/**
 * Fetch sales statistics (revenue, pending approvals, etc.).
 * GET /odoo/sales/stats
 */
export function useSalesStats() {
  return useOdooItem<SalesStats>(
    SALES_KEYS.stats,
    '/odoo/sales/stats',
    'stats',
  );
}
