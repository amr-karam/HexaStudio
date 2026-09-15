'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface SalesOrder {
  id: number;
  name: string;
  customer: string | null;
  amount: number;
  currency: string;
  state: string;
  date: string | null;
}

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/odoo/sales/orders/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch sales order');
        return res.json();
      })
      .then(setOrder)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-sl-silver">Loading sales order...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!order) return null;

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-sl-silver hover:text-accent transition-colors text-sm"
        >
          ← Back to Sales Orders
        </button>

        <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-8">
          {order.name}
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Customer</p>
            <p className="font-medium">{order.customer || '—'}</p>
          </div>
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Amount</p>
            <p className="text-accent text-2xl font-bold">{order.amount} {order.currency}</p>
          </div>
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">State</p>
            <p className="font-medium capitalize">{order.state}</p>
          </div>
          <div className="p-3 bg-sl-glass-bg border border-sl-glass-border rounded">
            <p className="text-xs text-sl-silver uppercase tracking-widest mb-1">Date</p>
            <p className="font-medium">
              {order.date ? new Date(order.date).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-sl-glass-border/20">
          <h2 className="text-sm text-sl-silver uppercase tracking-widest mb-3">Order Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sl-silver text-xs uppercase tracking-widest">Order Number</span>
              <p className="text-accent font-bold mt-1">{order.name}</p>
            </div>
            <div>
              <span className="text-sl-silver text-xs uppercase tracking-widest">State</span>
              <p className="text-foreground capitalize mt-1">{order.state}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}