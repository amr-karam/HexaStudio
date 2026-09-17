import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomerCreatePage from '@/app/admin/odoo/customers/create/page';

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

describe('CustomerCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('renders the page title', () => {
    render(<CustomerCreatePage />);
    expect(screen.getByText('Add New Customer')).toBeInTheDocument();
  });

  it('renders all form sections', () => {
    render(<CustomerCreatePage />);
    expect(screen.getByText('Customer Information')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Contact Details & Website')).toBeInTheDocument();
  });

  it('displays cancel and create buttons', () => {
    render(<CustomerCreatePage />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Customer')).toBeInTheDocument();
  });

  it('shows validation error for missing name', async () => {
    render(<CustomerCreatePage />);
    
    const submitButton = screen.getByText('Create Customer');
    fireEvent.click(submitButton);
    
    expect(await screen.findByText('Customer name is required')).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<CustomerCreatePage />);
    
    // Fill in name so only email is invalid
    const nameInput = screen.getByLabelText('Customer Name');
    fireEvent.change(nameInput, { target: { value: 'Test Customer', name: 'name' } });
    
    // Find email input and set invalid value
    const emailInput = screen.getAllByLabelText('Email')[0];
    fireEvent.change(emailInput, { target: { value: 'invalid-email', name: 'email' } });
    
    const submitButton = screen.getByText('Create Customer');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('shows error when neither email nor phone provided', async () => {
    render(<CustomerCreatePage />);
    
    // Fill in valid name but leave email and phone empty
    const nameInput = screen.getByLabelText('Customer Name');
    fireEvent.change(nameInput, { target: { value: 'Test Customer' } });
    
    const submitButton = screen.getByText('Create Customer');
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/Either email or phone number is required/)).toBeInTheDocument();
  });

  it('successfully submits form with valid data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        customer: { id: 'new-customer-123' },
      }),
    });

    render(<CustomerCreatePage />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Customer Name'), {
      target: { value: 'New Customer' },
    });
    fireEvent.change(screen.getAllByLabelText('Email')[0], {
      target: { value: 'test@example.com' },
    });
    
    const submitButton = screen.getByText('Create Customer');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/odoo/customers',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
    
    expect(mockPush).toHaveBeenCalledWith('/admin/odoo/customers/new-customer-123');
  });

  it('shows error when submission fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Failed to create customer',
      }),
    });

    render(<CustomerCreatePage />);
    
    // Fill in valid form
    fireEvent.change(screen.getByLabelText('Customer Name'), {
      target: { value: 'New Customer' },
    });
    fireEvent.change(screen.getAllByLabelText('Email')[0], {
      target: { value: 'test@example.com' },
    });
    
    const submitButton = screen.getByText('Create Customer');
    fireEvent.click(submitButton);
    
    expect(await screen.findByText(/Failed to create customer/)).toBeInTheDocument();
  });

  it('calls router.push with customers when clicking Cancel', () => {
    render(<CustomerCreatePage />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockPush).toHaveBeenCalledWith('/admin/odoo/customers');
  });

  it('renders all input fields', () => {
    render(<CustomerCreatePage />);
    
    expect(screen.getByLabelText('Customer Name')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Email')[0]).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Street Address')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('Website')).toBeInTheDocument();
  });
});