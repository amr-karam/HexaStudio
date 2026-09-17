import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import LeadDetailPage from "@/app/admin/odoo/crm/leads/[id]/page";

describe("LeadDetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches lead detail and renders contact information", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Acme Corp",
        email: "contact@acme.com",
        phone: "+1234567890",
        hexa_source: "website",
        probability: 85,
        state: "qualified",
        expected_closing_date: "2024-03-15T00:00:00Z",
        notes: "High-value prospect interested in commercial project"
      }),
    } as Response);

    render(<LeadDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("contact@acme.com")).toBeInTheDocument();
      expect(screen.getByText("+1234567890")).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
      expect(screen.getByText("qualified")).toBeInTheDocument();
      expect(screen.getByText("website")).toBeInTheDocument();
    });
  });

  it("handles null phone and email gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 2,
        name: "Beta Industries",
        email: null,
        phone: null,
        hexa_source: "referral",
        probability: 40,
        state: "prospect"
      }),
    } as Response);

    render(<LeadDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Beta Industries")).toBeInTheDocument();
      // Should show em dash for null values
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("renders notes and expected closing date when present", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 3,
        name: "Gamma LLC",
        email: "gamma@test.com",
        hexa_source: "cold_call",
        probability: 70,
        state: "negotiation",
        expected_closing_date: "2024-03-15T00:00:00Z",
        notes: "Interested in residential project"
      }),
    } as Response);

    render(<LeadDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Notes")).toBeInTheDocument();
      expect(screen.getByText("Interested in residential project")).toBeInTheDocument();
      expect(screen.getByText(/Expected close:/)).toBeInTheDocument();
    });
  });

  it("hides notes section when notes are null", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 4,
        name: "No Notes Co",
        email: "nonotes@test.com",
        hexa_source: "partner",
        probability: 30,
        state: "new"
      }),
    } as Response);

    render(<LeadDetailPage />);

    await waitFor(() => {
      expect(screen.queryByText("Notes")).not.toBeInTheDocument();
    });
  });
});