import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SalesOrderDetailPage from "@/app/admin/odoo/sales/orders/[id]/page";

describe("SalesOrderDetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches sales order detail and renders order information", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "SO/2024/001",
        customer: "Acme Corp",
        amount: 15000,
        currency: "EGP",
        state: "draft",
        date: "2024-01-15"
      }),
    } as Response);

    render(<SalesOrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("SO/2024/001")).toBeInTheDocument();
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("15,000 EGP")).toBeInTheDocument();
      expect(screen.getByText("draft")).toBeInTheDocument();
      expect(screen.getByText("January 15, 2024")).toBeInTheDocument();
    });
  });

  it("handles null customer and date gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 2,
        name: "SO/2024/002",
        customer: null,
        amount: 8500,
        currency: "USD",
        state: "sale",
        date: null
      }),
    } as Response);

    render(<SalesOrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("SO/2024/002")).toBeInTheDocument();
      expect(screen.getByText("—")).toBeInTheDocument();
      expect(screen.getByText("sale")).toBeInTheDocument();
      expect(screen.getByText("8,500 USD")).toBeInTheDocument();
    });
  });

  it("renders order details section", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "SO/2024/001",
        customer: "Acme Corp",
        amount: 15000,
        currency: "EGP",
        state: "draft",
        date: "2024-01-15"
      }),
    } as Response);

    render(<SalesOrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Order Details")).toBeInTheDocument();
      expect(screen.getByText("Order Number")).toBeInTheDocument();
      expect(screen.getByText("State")).toBeInTheDocument();
    });
  });

  it("shows back button", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "SO/2024/001",
        customer: "Acme Corp",
        amount: 15000,
        currency: "EGP",
        state: "draft",
        date: "2024-01-15"
      }),
    } as Response);

    render(<SalesOrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("← Back to Sales Orders")).toBeInTheDocument();
    });
  });
});