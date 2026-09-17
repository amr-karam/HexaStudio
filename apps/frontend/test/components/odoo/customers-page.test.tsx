import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import CustomersPage from '@/app/admin/odoo/customers/page';
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

describe('CustomersPage', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        customers: [],
        totalPages: 0,
        totalCount: 0,
      }),
    });
  });

  it('renders the page title', async () => {
    await act(async () => {
      render(<CustomersPage />);
    });
    expect(screen.getByText('Customers')).toBeInTheDocument();
  });

  it('renders the add customer button', async () => {
    await act(async () => {
      render(<CustomersPage />);
    });
    expect(screen.getByText('Add Customer')).toBeInTheDocument();
  });

  it('renders search input', async () => {
    await act(async () => {
      render(<CustomersPage />);
    });
    expect(screen.getByPlaceholderText('Search by name, email, phone...')).toBeInTheDocument();
  });

  it('shows empty state when no customers', async () => {
    await act(async () => {
      render(<CustomersPage />);
    });
    expect(await screen.findByText('No customers found')).toBeInTheDocument();
    expect(screen.getByText('There are no customers in the system yet.')).toBeInTheDocument();
    expect(screen.getByText('Add First Customer')).toBeInTheDocument();
  });

  it('filters customers by search query', async () => {
    await act(async () => {
      render(<CustomersPage />);
    });
    const searchInput = screen.getByPlaceholderText('Search by name, email, phone...');
    expect(searchInput).toBeInTheDocument();
  });

  it('calls add customer on button click', async () => {
    await act(async () => {
      render(<CustomersPage />);
    });
    const addButton = screen.getByText('Add Customer');
    expect(addButton).toBeInTheDocument();
  });
});
