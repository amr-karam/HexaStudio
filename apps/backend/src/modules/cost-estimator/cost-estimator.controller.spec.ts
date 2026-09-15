/**
 * cost-estimator.controller.spec.ts
 * Unit tests — Automated Cost Estimator controller (Sprint S022.4)
 * HEXA Studio — service is mocked; PDF bytes are stubbed.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import { CostEstimatorController } from "./cost-estimator.controller";
import type { CostEstimatorService } from "./cost-estimator.service";

function makeRes() {
  const res = {
    set: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response & {
    set: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
  };
}

describe("CostEstimatorController", () => {
  const service = {
    listMaterials: vi.fn(),
    calculateSceneCost: vi.fn(),
    generatePdf: vi.fn(),
  };
  let controller: CostEstimatorController;

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new CostEstimatorController(
      service as unknown as CostEstimatorService
    );
  });

  it("lists materials from the service", async () => {
    service.listMaterials.mockReturnValue([{ id: "egyptian-granite" }]);

    await expect(controller.getMaterials()).resolves.toEqual([
      { id: "egyptian-granite" },
    ]);
  });

  it("delegates cost calculation to the service", async () => {
    service.calculateSceneCost.mockReturnValue({ success: true });

    const result = await controller.calculateCost({
      surfaceAreas: { "egyptian-granite": 5 },
    } as never);

    expect(service.calculateSceneCost).toHaveBeenCalledWith({
      "egyptian-granite": 5,
    });
    expect(result).toEqual({ success: true });
  });

  it("awaits the PDF buffer and streams it as application/pdf", async () => {
    const pdf = Buffer.from("%PDF-1.4 stub");
    service.generatePdf.mockResolvedValue(pdf);
    const res = makeRes();

    await controller.generatePdf(
      { surfaceAreas: {}, projectName: "Test Villa" } as never,
      res as Response
    );

    expect(service.generatePdf).toHaveBeenCalledWith({}, "Test Villa");
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({ "Content-Type": "application/pdf" })
    );
    expect(res.send).toHaveBeenCalledWith(pdf);
  });

  it("falls back to the default project name when none is given", async () => {
    service.generatePdf.mockResolvedValue(Buffer.from("%PDF"));
    const res = makeRes();

    await controller.generatePdf({ surfaceAreas: {} } as never, res as Response);

    expect(service.generatePdf).toHaveBeenCalledWith(
      {},
      "HEXA Studio Cost Estimate"
    );
  });
});
