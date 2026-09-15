import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TeamPage from "@/app/admin/odoo/team/page";

describe("TeamPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the team members header", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: [] }),
    } as Response);

    render(<TeamPage />);

    expect(screen.getByText("Team Members")).toBeInTheDocument();
    expect(screen.getByText(/Employee directory with roles & departments/i)).toBeInTheDocument();
  });

  it("renders team members from the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        members: [
          { id: 1, name: "John Doe", email: "john@hexastudio.net", jobTitle: "Senior Architect", hexa_role: "Architect", hexa_department: "Design" },
          { id: 2, name: "Jane Smith", email: null, jobTitle: null, hexa_role: "Project Manager", hexa_department: "Operations" },
        ],
      }),
    } as Response);

    render(<TeamPage />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@hexastudio.net")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Architect")).toBeInTheDocument();
    expect(screen.getByText("Project Manager")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("Design")).toBeInTheDocument();
      expect(screen.getByText("Operations")).toBeInTheDocument();
    });
  });

  it("shows no team members message when empty", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: [] }),
    } as Response);

    render(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("No team members found")).toBeInTheDocument();
    });
  });
});