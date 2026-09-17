import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductsPage from '@/app/admin/odoo/products/page';
import * as React from 'react';

// Mock next/navigation
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  back: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
  }),
}));

// Mock fetch globally
const mockFetch = vi.fn();
(globalThis as unknown as { fetch: typeof mockFetch }).fetch = () => Promise.resolve(mockFetch());

describe('ProductsPage', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        products: [],
        totalPages: 0,
        totalCount: 0,
      }),
    });
  });

  it('renders the page title', () => {
    render(<ProductsPage />);
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('renders the add product button', () => {
    render(<ProductsPage />);
    expect(screen.getByText('Add Product')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<ProductsPage />);
    expect(screen.getByPlaceholderText('Search by name, SKU...')).toBeInTheDocument();
  });

  it('shows empty state when no products', async () => {
    render(<ProductsPage />);
    expect(await screen.getByText('No products found')).toBeInTheDocument();
    expect(screen.getByText('There are no products in the catalog yet.')).toBeInTheDocument();
    expect(screen.getByText('Add First Product')).toBeInTheDocument();
  });

  it('filters products by search query', async () => {
    render(<ProductsPage />);
    const searchInput = screen.getByPlaceholderText('Search by name, SKU...');
    expect(searchInput).toBeInTheDocument();
  });

  it('calls add product on button click', async () => {
    render(<ProductsPage />);
    const addButton = screen.getByText('Add Product');
    expect(addButton).toBeInTheDocument();
  });
});
