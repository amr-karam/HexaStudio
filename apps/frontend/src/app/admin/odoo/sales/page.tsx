'use client';

import { useState, useEffect } from 'react';

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface SalesOrder {
    id: number;
    name: string;
    customer: string | null;
    amount: number;
    currency: string;
    state: string;
    projectId: number | null;
  }

  useEffect(() => {
    fetch('/api/odoo/sales/orders')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch sales orders');
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.orders ?? data.result ?? []);
        setOrders(Array.isArray(list) ? list : []);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl border border-sl-glass-border flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <h1 className="font-['Bodoni_Moda'] text-3xl font-bold text-accent tracking-tight mb-4">Sales Orders</h1>
        <p className="text-xs text-sl-silver mb-6 uppercase tracking-widest">Quotes → orders — linked to projects</p>

        {loading ? (
          <p className="text-sl-silver">Loading sales orders...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : orders.length === 0 ? (
          <p className="text-sl-silver text-center py-12">No sales orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sl-silver text-xs border-b border-sl-glass-border/50">
                  <th className="font-medium w-48">Order</th>
                  <th className="text-center w-32">Customer</th>
                  <th className="text-right w-32">Amount</th>
                  <th className="text-center w-40">Currency</th>
                  <th className="text-center w-40">State</th>
                  <th className="text-center w-40">Project</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-sl-glass-border/10 hover:bg-sl-void/5 transition-colors">
                    <td className="font-medium">
                      <a href={`/admin/odoo/sales/orders/${order.id}`} className="text-accent hover:underline">
                        {order.name}
                      </a>
                    </td>
                    <td className="text-sl-silver text-sm">
                      {order.customer || '—'}
                    </td>
                    <td className="text-right text-accent font-medium">
                      {order.amount}
                    </td>
                    <td className="text-center text-sl-silver capitalize">
                      {order.currency}
                    </td>
                    <td className="text-center text-sl-silver capitalize">
                      {order.state}
                    </td>
                    <td className="text-center text-sl-silver">
                      {order.projectId ? `#${order.projectId}` : '—'}
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