'use client';

import { useState, useEffect } from 'react';

export default function AccountingPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface InvoiceData {
    id: number;
    name: string;
    partner: string | null;
    amount: number;
    currency: string;
    state: string;
    date: string;
  }

  useEffect(() => {
    fetch('/api/odoo/accounting/invoices')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch invoices');
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.invoices ?? data.result ?? []);
        setInvoices(Array.isArray(list) ? list : []);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl border border-sl-glass-border flex items-center justify-center">
          {/* Using a simple financial icon */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
            <rect x="4" y="5" width="16" height="14" rx="2" />
            <line x1="9" y1="17" x2="15" y2="17" />
            <line x1="12" y1="5" x2="12" y2="11" />
          </svg>
        </div>
        <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-4">Accounting Invoices</h1>
        <p className="text-xs text-sl-silver mb-6 uppercase tracking-widest">Invoice status — Paid, Pending, Overdue</p>

        {loading ? (
          <p className="text-sl-silver">Loading invoices...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : invoices.length === 0 ? (
          <p className="text-sl-silver text-center py-12">No invoices found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sl-silver text-xs border-b border-sl-glass-border/50">
                  <th className="font-medium w-48">Invoice</th>
                  <th className="text-center w-32">Customer</th>
                  <th className="text-right w-32">Amount</th>
                  <th className="text-center w-32">Currency</th>
                  <th className="text-center w-40">Status</th>
                  <th className="text-center w-32">Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id} className="border-b border-sl-glass-border/10 hover:bg-sl-void/5 transition-colors">
                    <td className="font-medium">
                      <a href={`/admin/odoo/accounting/invoices/${invoice.id}`} className="text-accent hover:underline">
                        {invoice.name}
                      </a>
                    </td>
                    <td className="text-sl-silver text-sm">
                      {invoice.partner || '—'}
                    </td>
                    <td className="text-right text-accent font-medium">
                      {invoice.amount}
                    </td>
                    <td className="text-center text-sl-silver capitalize">
                      {invoice.currency}
                    </td>
                    <td className="text-center text-sl-silver capitalize">
                      {invoice.state}
                    </td>
                    <td className="text-center text-sl-silver">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}