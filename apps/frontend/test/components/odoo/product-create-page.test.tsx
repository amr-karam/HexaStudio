import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductCreatePage from '@/app/admin/odoo/products/create/page';

// Mock next/navigation
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  back: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ProductCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('renders the page title', () => {
    render(<ProductCreatePage />);
    expect(screen.getByText('Add New Product')).toBeInTheDocument();
  });

  it('renders all form sections', () => {
    render(<ProductCreatePage />);
    expect(screen.getByText('Product Information')).toBeInTheDocument();
  });

  it('displays cancel and create buttons', () => {
    render(<ProductCreatePage />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Product')).toBeInTheDocument();
  });

  it('shows validation error for missing name', async () => {
    render(<ProductCreatePage />);

    const submitButton = screen.getByText('Create Product');
    fireEvent.click(submitButton);

    expect(await screen.findByText('Product name is required')).toBeInTheDocument();
  });

  it('successfully submits form with valid data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        product: { id: 456 },
      }),
    });

    render(<ProductCreatePage />);

    fireEvent.change(screen.getByLabelText('Product Name'), {
      target: { value: 'New Product' },
    });
    fireEvent.change(screen.getByLabelText('SKU'), {
      target: { value: 'PRD-001' },
    });

    const submitButton = screen.getByText('Create Product');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/odoo/products',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    expect(mockPush).toHaveBeenCalledWith('/admin/odoo/products/456');
  });

  it('shows error when submission fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Failed to create product',
      }),
    });

    render(<ProductCreatePage />);

    fireEvent.change(screen.getByLabelText('Product Name'), {
      target: { value: 'New Product' },
    });

    const submitButton = screen.getByText('Create Product');
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Failed to create product/)).toBeInTheDocument();
  });

  it('calls router.push with products when clicking Cancel', () => {
    render(<ProductCreatePage />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockPush).toHaveBeenCalledWith('/admin/odoo/products');
  });

  it('renders all input fields', () => {
    render(<ProductCreatePage />);

    expect(screen.getByLabelText('Product Name')).toBeInTheDocument();
    expect(screen.getByLabelText('SKU')).toBeInTheDocument();
    expect(screen.getByLabelText('Price')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
  });
});
