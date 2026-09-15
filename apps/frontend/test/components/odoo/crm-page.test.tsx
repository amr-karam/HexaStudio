import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import CrmPage from "@/app/admin/odoo/crm/page";

describe("CrmPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the CRM leads header", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ leads: [] }),
    } as Response);

    render(<CrmPage />);

    expect(screen.getByText("CRM Leads")).toBeInTheDocument();
    expect(screen.getByText(/Lead pipeline — qualification, source, probability/i)).toBeInTheDocument();
  });

  it("renders leads from the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        leads: [
          { id: 1, name: "Acme Corp", email: "contact@acme.com", hexa_source: "website", probability: 85, state: "qualified" },
          { id: 2, name: "Beta Industries", email: null, hexa_source: "referral", probability: 40, state: "prospect" },
        ],
      }),
    } as Response);

    render(<CrmPage />);

    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });
    expect(screen.getByText("contact@acme.com")).toBeInTheDocument();
    expect(screen.getByText("Beta Industries")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("85%")).toBeInTheDocument();
      expect(screen.getByText("40%")).toBeInTheDocument();
    });
  });

  it("shows no leads message when empty", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ leads: [] }),
    } as Response);

    render(<CrmPage />);

    await waitFor(() => {
      expect(screen.getByText("No leads found")).toBeInTheDocument();
    });
  });
});