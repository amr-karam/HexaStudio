import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CostEstimatorPanel from "@/components/CostEstimatorPanel";
import { getAllMaterials } from "@/lib/materials/MaterialLibrary";

const MATERIALS = getAllMaterials();
const FIRST = MATERIALS[0];

describe("CostEstimatorPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the material catalogue with EGP prices", () => {
    render(<CostEstimatorPanel />);
    expect(screen.getByText("Cost Estimator")).toBeInTheDocument();
    expect(screen.getByText(FIRST.name)).toBeInTheDocument();
    expect(
      screen.getByText(`${FIRST.basePriceEGP.toLocaleString()} EGP`)
    ).toBeInTheDocument();
  });

  it("keeps Calculate disabled until a surface area is entered", async () => {
    const user = userEvent.setup();
    render(<CostEstimatorPanel />);
    const calculate = screen.getByRole("button", { name: "Calculate" });
    expect(calculate).toBeDisabled();

    const inputs = screen.getAllByPlaceholderText("0.0");
    await user.type(inputs[0], "10");
    expect(calculate).toBeEnabled();
    expect(screen.getByText("10.00 m²")).toBeInTheDocument();
  });

  it("posts a calculate action and renders the returned summary", async () => {
    const user = userEvent.setup();
    const onEstimateGenerated = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        summary: { materialsUsed: 1, totalCostEGP: FIRST.basePriceEGP * 10 },
      }),
    } as Response);
    render(<CostEstimatorPanel onEstimateGenerated={onEstimateGenerated} />);

    await user.type(screen.getAllByPlaceholderText("0.0")[0], "10");
    await user.click(screen.getByRole("button", { name: "Calculate" }));

    await waitFor(() =>
      expect(
        screen.getByText(`${(FIRST.basePriceEGP * 10).toLocaleString()} EGP`)
      ).toBeInTheDocument()
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/cost-estimate",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"action":"calculate"'),
      })
    );
    expect(onEstimateGenerated).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it("gates Export PDF behind a successful estimate", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        summary: { materialsUsed: 1, totalCostEGP: 100 },
      }),
    } as Response);
    render(<CostEstimatorPanel />);

    expect(screen.getByRole("button", { name: "Export PDF" })).toBeDisabled();
    await user.type(screen.getAllByPlaceholderText("0.0")[0], "5");
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Export PDF" })).toBeEnabled()
    );
  });
});
