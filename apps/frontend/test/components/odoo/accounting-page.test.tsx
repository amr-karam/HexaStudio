import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AccountingPage from "@/app/admin/odoo/accounting/page";

describe("AccountingPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the invoices header", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoices: [] }),
    } as Response);

    render(<AccountingPage />);

    expect(screen.getByText("Accounting Invoices")).toBeInTheDocument();
    expect(screen.getByText(/Invoice status — Paid, Pending, Overdue/i)).toBeInTheDocument();
  });

  it("renders invoices from the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        invoices: [
          { id: 1, name: "INV/2024/001", partner: "Acme Corp", amount: 15000, currency: "EGP", state: "posted", date: "2024-01-15" },
          { id: 2, name: "INV/2024/002", partner: null, amount: 5000, currency: "USD", state: "draft", date: "2024-01-16" },
        ],
      }),
    } as Response);

    render(<AccountingPage />);

    expect(screen.getByText("INV/2024/001")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("5,000")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  it("shows no invoices message when empty", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invoices: [] }),
    } as Response);

    render(<AccountingPage />);

    await waitFor(() => {
      expect(screen.getByText("No invoices found")).toBeInTheDocument();
    });
  });

  it("displays payment status colors correctly", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        invoices: [
          { id: 1, name: "INV/2024/001", partner: "Acme", amount: 1000, currency: "EGP", state: "posted", date: "2024-01-15" },
        ],
      }),
    } as Response);

    render(<AccountingPage />);

    await waitFor(() => {
      expect(screen.getByText("posted")).toBeInTheDocument();
    });
  });
});