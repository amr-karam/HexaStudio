import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TeamMemberDetailPage from "@/app/admin/odoo/team/members/[id]/page";

describe("TeamMemberDetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches team member detail and renders profile information", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "John Doe",
        email: "john@hexastudio.net",
        jobTitle: "Senior Architect",
        hexa_role: "Architect",
        hexa_department: "Design",
        hexa_bio: "Lead architect with 15 years experience in luxury residential projects"
      }),
    } as Response);

    render(<TeamMemberDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@hexastudio.net")).toBeInTheDocument();
      expect(screen.getByText("Architect")).toBeInTheDocument();
      expect(screen.getByText("Design")).toBeInTheDocument();
      expect(screen.getByText("Lead architect with 15 years experience in luxury residential projects")).toBeInTheDocument();
    });
  });

  it("handles null email gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 2,
        name: "Jane Smith",
        email: null,
        jobTitle: null,
        hexa_role: "Project Manager",
        hexa_department: "Operations"
      }),
    } as Response);

    render(<TeamMemberDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Project Manager")).toBeInTheDocument();
      expect(screen.getByText("Operations")).toBeInTheDocument();
      // Email should show em dash
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders bio and skills sections", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 3,
        name: "Alice Johnson",
        email: "alice@hexastudio.net",
        hexa_role: "Interior Designer",
        hexa_department: "Design",
        hexa_bio: "Certified interior designer specializing in sustainable materials",
        hexa_skills: ["Sustainable Design", "Material Selection", "3D Modeling"]
      }),
    } as Response);

    render(<TeamMemberDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Bio")).toBeInTheDocument();
      expect(screen.getByText("Certified interior designer")).toBeInTheDocument();
      expect(screen.getByText("Skills")).toBeInTheDocument();
      expect(screen.getByText("Sustainable Design")).toBeInTheDocument();
      expect(screen.getByText("Material Selection")).toBeInTheDocument();
      expect(screen.getByText("3D Modeling")).toBeInTheDocument();
    });
  });

  it("shows back button", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "John Doe",
        email: "john@hexastudio.net",
        hexa_role: "Architect",
        hexa_department: "Design"
      }),
    } as Response);

    render(<TeamMemberDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("← Back to Team")).toBeInTheDocument();
    });
  });
});