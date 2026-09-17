'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  default_code: string | null;
  list_price: number;
  type: string;
  categ_id: number | null;
  is_active: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/odoo/products')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : (data.products ?? data.result ?? []);
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(err => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = searchQuery
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.default_code && p.default_code.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : products;

  return (
    <main className="flex-1 flex flex-col p-6">
      {error && (
        <>
          <p className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive font-semibold" role="alert">
            Failed to load products
          </p>
          <p className="mb-6 text-sm text-destructive">{error}</p>
        </>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-accent">Products</h1>
          <p className="text-xs text-sl-silver uppercase tracking-widest">Product catalog</p>
        </div>
        <button
          onClick={() => router.push('/admin/odoo/products/create')}
          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
        >
          Add Product
        </button>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search by name, SKU..."
          className="w-full pl-10 pr-4 py-2 bg-sl-glass-bg border border-sl-glass-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sl-silver"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.05-4.65a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sl-silver mb-4">No products found</p>
          <p className="text-sm text-sl-silver/70 mb-6">There are no products in the catalog yet.</p>
          <button
            onClick={() => router.push('/admin/odoo/products/create')}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Add First Product
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sl-silver text-xs border-b border-sl-glass-border/50">
                <th className="font-medium w-48">Product</th>
                <th className="text-center w-32">SKU</th>
                <th className="text-center w-32">Price</th>
                <th className="text-center w-32">Type</th>
                <th className="text-center w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-b border-sl-glass-border/10 hover:bg-sl-void/5 transition-colors">
                  <td className="font-medium">
                    <a href={`/admin/odoo/products/${product.id}`} className="text-accent hover:underline">
                      {product.name}
                    </a>
                  </td>
                  <td className="text-sl-silver text-sm text-center">
                    {product.default_code || '—'}
                  </td>
                  <td className="text-sl-silver text-sm text-center">
                    ${product.list_price?.toFixed(2) || '—'}
                  </td>
                  <td className="text-sl-silver text-sm text-center capitalize">
                    {product.type || '—'}
                  </td>
                  <td className="text-center text-sl-silver capitalize">
                    {product.is_active ? 'Active' : 'Inactive'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
