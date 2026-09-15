import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import InvoiceDetailPage from "@/app/admin/odoo/accounting/invoices/[id]/page";

describe("InvoiceDetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches invoice detail and renders invoice information", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "INV/2024/001",
        partner: "Acme Corp",
        amount: 15000,
        currency: "EGP",
        date: "2024-01-15",
        state: "posted"
      }),
    } as Response);

    render(<InvoiceDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText("INV/2024/001").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("15,000 EGP")).toBeInTheDocument();
      expect(screen.getByText("posted")).toBeInTheDocument();
      expect(screen.getByText("January 15, 2024")).toBeInTheDocument();
    });
  });

  it("handles null partner gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 2,
        name: "INV/2024/002",
        partner: null,
        amount: 5000,
        currency: "USD",
        date: "2024-01-16",
        state: "draft"
      }),
    } as Response);

    render(<InvoiceDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText("INV/2024/002").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("—")).toBeInTheDocument();
      expect(screen.getByText("5,000 USD")).toBeInTheDocument();
      expect(screen.getByText("draft")).toBeInTheDocument();
    });
  });

  it("renders invoice details section", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "INV/2024/001",
        partner: "Acme Corp",
        amount: 15000,
        currency: "EGP",
        date: "2024-01-15",
        state: "posted"
      }),
    } as Response);

    render(<InvoiceDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Invoice Details").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Invoice Number").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Currency").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Partner")).toBeInTheDocument();
      expect(screen.getAllByText("State").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows back button", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "INV/2024/001",
        partner: "Acme Corp",
        amount: 15000,
        currency: "EGP",
        date: "2024-01-15",
        state: "posted"
      }),
    } as Response);

    render(<InvoiceDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("← Back to Invoices")).toBeInTheDocument();
    });
  });
});