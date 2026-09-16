import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SalesOrdersPage from "@/app/admin/odoo/sales/orders/page";

describe("SalesOrdersPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the sales orders header", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orders: [] }),
    } as Response);

    render(<SalesOrdersPage />);

    expect(screen.getByText("Sales Orders")).toBeInTheDocument();
    expect(screen.getByText(/Quotes → orders — linked to projects/i)).toBeInTheDocument();
  });

  it("renders sales orders from the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        orders: [
          { id: 1, name: "SO/2024/001", customer: "Acme Corp", amount: 15000, currency: "EGP", state: "draft", projectId: 10, date: "2024-01-15" },
          { id: 2, name: "SO/2024/002", customer: null, amount: 8500, currency: "USD", state: "sale", projectId: null, date: null },
        ],
      }),
    } as Response);

    render(<SalesOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("SO/2024/001")).toBeInTheDocument();
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("SO/2024/002")).toBeInTheDocument();
      expect(screen.getByText("8,500")).toBeInTheDocument();
      expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows no orders message when empty", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ orders: [] }),
    } as Response);

    render(<SalesOrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("No sales orders found")).toBeInTheDocument();
    });
  });
});