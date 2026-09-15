'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface InvoiceDetail {
  id: number;
  name: string;
  partner: string | null;
  amount: number;
  currency: string;
  date: string;
  state: string;
}

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/odoo/accounting/invoices/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch invoice');
        return res.json();
      })
      .then(setInvoice)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-sl-silver">Loading invoice...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!invoice) return null;

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-sl-silver hover:text-accent transition-colors text-sm"
        >
          ← Back to Invoices
        </button>

        <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-8">
          {invoice.name}
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Customer</p>
            <p className="font-medium">{invoice.partner || '—'}</p>
          </div>
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Amount</p>
            <p className="text-accent text-2xl font-bold">{invoice.amount} {invoice.currency}</p>
          </div>
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Status</p>
            <p className="text-accent font-medium capitalize">{invoice.state}</p>
          </div>
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Date</p>
            <p className="font-medium">
              {new Date(invoice.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-sl-glass-border/20">
          <h2 className="text-sm text-sl-silver uppercase tracking-widest mb-2">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sl-silver text-xs uppercase tracking-widest">Invoice Number</span>
              <p className="text-accent font-bold mt-1">{invoice.name}</p>
            </div>
            <div>
              <span className="text-sl-silver text-xs uppercase tracking-widest">Currency</span>
              <p className="text-foreground capitalize mt-1">{invoice.currency}</p>
            </div>
            <div>
              <span className="text-sl-silver text-xs uppercase tracking-widest">Partner</span>
              <p className="text-foreground pt-1">{invoice.partner || '—'}</p>
            </div>
            <div>
              <span className="text-sl-silver text-xs uppercase tracking-widest">State</span>
              <p className="text-foreground capitalize mt-1">{invoice.state}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}