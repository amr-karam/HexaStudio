'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Filter,
  DollarSign,
  Calendar,
  type LucideIcon,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  name: string;
  partner_name?: string;
  state: 'draft' | 'posted' | 'paid' | 'cancelled';
  move_type: string;
  invoice_date: string;
  invoice_date_due?: string;
  amount_total: number;
  amount_untaxed: number;
  amount_tax: number;
  currency_symbol?: string;
  payment_state?: string;
  invoice_line_ids?: InvoiceLine[];
}

interface InvoiceLine {
  id: string;
  name: string;
  quantity: number;
  price_unit: number;
  price_subtotal: number;
}

// ─── Status Config ──────────────────────────────────────────────────────────

const INVOICE_STATUS: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    icon: LucideIcon;
  }
> = {
  draft: {
    label: 'Draft',
    color: 'text-neutral-400',
    bg: 'bg-neutral-500/10 border-neutral-500/20',
    icon: FileText,
  },
  posted: {
    label: 'Pending',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: Clock,
  },
  paid: {
    label: 'Paid',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    icon: XCircle,
  },
};

// ─── Invoice Card ───────────────────────────────────────────────────────────

function InvoiceCard({ invoice, index }: { invoice: Invoice; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = INVOICE_STATUS[invoice.state] || INVOICE_STATUS.draft;
  const StatusIcon = status.icon;
  const symbol = invoice.currency_symbol || '€';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-gold/10 transition-all duration-500">
        {/* Main row */}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full p-5 flex items-center gap-4 text-left group"
        >
          {/* Invoice icon */}
          <div className="w-11 h-11 rounded-xl bg-neutral-800/50 flex items-center justify-center text-neutral-500 group-hover:text-gold transition-colors flex-shrink-0">
            <FileText size={18} />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-white truncate">{invoice.name}</h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] uppercase tracking-widest font-medium flex-shrink-0 ${status.bg} ${status.color}`}
              >
                <StatusIcon size={9} />
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              {invoice.invoice_date && (
                <span className="text-[10px] text-neutral-600 flex items-center gap-1">
                  <Calendar size={9} />
                  {new Date(invoice.invoice_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
              {invoice.invoice_date_due && invoice.state !== 'paid' && (
                <span
                  className={`text-[10px] flex items-center gap-1 ${
                    new Date(invoice.invoice_date_due) < new Date()
                      ? 'text-red-400'
                      : 'text-neutral-600'
                  }`}
                >
                  Due{' '}
                  {new Date(invoice.invoice_date_due).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Amount + actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <p className="text-base font-serif text-white">
                {symbol}
                {invoice.amount_total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              {invoice.amount_tax > 0 && (
                <p className="text-[10px] text-neutral-600">
                  incl. {symbol}
                  {invoice.amount_tax.toFixed(2)} tax
                </p>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                // Placeholder download
              }}
              className="p-2 text-neutral-600 hover:text-gold rounded-lg hover:bg-gold/5 transition-all"
              title="Download Invoice"
            >
              <Download size={16} />
            </button>
          </div>
        </button>

        {/* Expanded line items */}
        {isExpanded && invoice.invoice_line_ids && invoice.invoice_line_ids.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border/50"
          >
            <div className="p-5">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-neutral-600">
                    <th className="text-left pb-3 font-medium">Description</th>
                    <th className="text-center pb-3 font-medium">Qty</th>
                    <th className="text-right pb-3 font-medium">Unit Price</th>
                    <th className="text-right pb-3 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.invoice_line_ids.map((line) => (
                    <tr key={line.id} className="border-t border-border/20">
                      <td className="py-3 text-xs text-neutral-400 font-light">{line.name}</td>
                      <td className="py-3 text-xs text-neutral-500 text-center">{line.quantity}</td>
                      <td className="py-3 text-xs text-neutral-500 text-right">
                        {symbol}
                        {line.price_unit.toFixed(2)}
                      </td>
                      <td className="py-3 text-xs text-white text-right">
                        {symbol}
                        {line.price_subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-4 pt-3 border-t border-border/30 space-y-1">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Subtotal</span>
                  <span>
                    {symbol}
                    {invoice.amount_untaxed.toFixed(2)}
                  </span>
                </div>
                {invoice.amount_tax > 0 && (
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Tax</span>
                    <span>
                      {symbol}
                      {invoice.amount_tax.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-white font-medium pt-1">
                  <span>Total</span>
                  <span>
                    {symbol}
                    {invoice.amount_total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function InvoiceSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-neutral-800 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-800 rounded w-32" />
          <div className="h-3 bg-neutral-800 rounded w-24" />
        </div>
        <div className="h-6 w-20 bg-neutral-800 rounded" />
        <div className="h-5 bg-neutral-800 rounded w-24" />
      </div>
    </div>
  );
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function ClientInvoicesPage() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!token) return;

    const fetchInvoices = async () => {
      try {
        const res = await axios.get<Invoice[]>(`${API_URL}/client/invoices`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoices(res.data);
      } catch {
        setError('Failed to load invoices. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [token, API_URL]);

  const filteredInvoices =
    filterStatus === 'all'
      ? invoices
      : invoices.filter((inv) => inv.state === filterStatus);

  const totalOutstanding = invoices
    .filter((inv) => inv.state === 'posted')
    .reduce((sum, inv) => sum + inv.amount_total, 0);

  const totalPaid = invoices
    .filter((inv) => inv.state === 'paid')
    .reduce((sum, inv) => sum + inv.amount_total, 0);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-serif font-light text-white mb-2">
          My <span className="text-gold">Invoices</span>
        </h1>
        <p className="text-neutral-500 font-light">
          Review and download your project invoices.
        </p>
      </motion.div>

      {/* Summary Cards */}
      {!isLoading && invoices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="p-5 bg-surface border border-border rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={14} className="text-amber-400" />
              <span className="text-[10px] uppercase tracking-widest text-neutral-600">
                Outstanding
              </span>
            </div>
            <p className="text-2xl font-serif text-white">
              €{totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-5 bg-surface border border-border rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} className="text-emerald-400" />
              <span className="text-[10px] uppercase tracking-widest text-neutral-600">Paid</span>
            </div>
            <p className="text-2xl font-serif text-white">
              €{totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-5 bg-surface border border-border rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-gold" />
              <span className="text-[10px] uppercase tracking-widest text-neutral-600">
                Total Invoices
              </span>
            </div>
            <p className="text-2xl font-serif text-white">{invoices.length}</p>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      {!isLoading && invoices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-2 mb-6 flex-wrap"
        >
          <Filter size={14} className="text-neutral-600" />
          {['all', 'posted', 'paid', 'draft', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-medium transition-all duration-300 ${
                filterStatus === st
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-neutral-500 border border-border hover:border-neutral-600'
              }`}
            >
              {st === 'all' ? 'All' : INVOICE_STATUS[st]?.label || st}
            </button>
          ))}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <InvoiceSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 bg-surface border border-red-500/20 rounded-2xl text-center"
        >
          <AlertCircle size={32} className="mx-auto text-red-400/50 mb-3" />
          <p className="text-neutral-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredInvoices.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-12 bg-surface border border-border rounded-3xl text-center"
        >
          <DollarSign size={40} className="mx-auto text-neutral-700 mb-4" />
          <p className="text-neutral-500 font-light text-lg">
            {invoices.length === 0
              ? 'No invoices yet.'
              : 'No invoices match the selected filter.'}
          </p>
          <p className="text-neutral-600 text-sm mt-2">
            {invoices.length === 0
              ? 'Your invoices will appear here once generated.'
              : 'Try selecting a different filter.'}
          </p>
        </motion.div>
      )}

      {/* Invoice List */}
      {!isLoading && !error && filteredInvoices.length > 0 && (
        <div className="space-y-3">
          {filteredInvoices.map((invoice, i) => (
            <InvoiceCard key={invoice.id} invoice={invoice} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
