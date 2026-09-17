import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ProjectDetailPage from "@/app/admin/odoo/projects/[id]/page";

describe("ProjectDetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches project detail data", async () => {
    const projectId = "1";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Villa Dusk",
        hexa_deliverables_count: 5,
        hexa_last_deliverable_at: "2024-01-15T10:00:00Z",
        hexa_public_strapi_id: "abc123",
        hexa_team_member_ids: [1, 2]
      }),
    } as Response);

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Villa Dusk")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("abc123")).toBeInTheDocument();
      expect(screen.getByText("January 15, 2024")).toBeInTheDocument();
    });
  });

  it("returns null when no project data", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    } as Response);

    render(<ProjectDetailPage />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading project...")).toBeInTheDocument();
    });
  });

  it("shows error on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<ProjectDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});