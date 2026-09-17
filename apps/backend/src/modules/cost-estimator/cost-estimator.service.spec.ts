/**
 * cost-estimator.service.spec.ts
 * Unit tests — Automated Cost Estimator service (Sprint S022.4)
 * HEXA Studio
 */
import { describe, it, expect, beforeEach } from "vitest";
import { CostEstimatorService } from "./cost-estimator.service";

describe("CostEstimatorService", () => {
  let service: CostEstimatorService;

  beforeEach(() => {
    service = new CostEstimatorService();
  });

  describe("getPricing", () => {
    it("returns an EGP lookup for all four Egyptian materials", () => {
      const pricing = service.getPricing();

      expect(Object.keys(pricing)).toHaveLength(4);
      expect(pricing["nile-lotus-wood"]).toBe(850);
      expect(pricing["egyptian-granite"]).toBe(1200);
      expect(pricing["papyrus-fabric"]).toBe(320);
      expect(pricing["pharaoh-bronze"]).toBe(2100);
    });
  });

  describe("listMaterials", () => {
    it("lists every material with pricing and cultural metadata", () => {
      const materials = service.listMaterials();

      expect(materials).toHaveLength(4);
      for (const m of materials) {
        expect(m.id).toBeTypeOf("string");
        expect(m.name).toBeTypeOf("string");
        expect(m.basePriceEGP).toBeGreaterThan(0);
        expect(m.culturalNote).toBeTypeOf("string");
      }
    });
  });

  describe("calculateSceneCost", () => {
    it("multiplies unit prices by areas and totals honestly", () => {
      const result = service.calculateSceneCost({
        "nile-lotus-wood": 10,
        "egyptian-granite": 5,
      });

      expect(result.success).toBe(true);
      // 850 x 10 + 1200 x 5 = 8500 + 6000
      expect(result.summary.totalAreaSqm).toBe(15);
      expect(result.summary.totalCostEGP).toBe(14500);
      expect(result.summary.materialsUsed).toBe(2);
      expect(result.breakdown).toHaveLength(2);
      expect(result.breakdown[0]).toMatchObject({
        materialId: "nile-lotus-wood",
        areaSqm: 10,
        unitPriceEGP: 850,
        totalEGP: 8500,
      });
      expect(result.generatedAt).toBeTypeOf("string");
    });

    it("skips unknown material ids instead of failing", () => {
      const result = service.calculateSceneCost({
        "not-a-material": 3,
        "papyrus-fabric": 2,
      });

      expect(result.summary.materialsUsed).toBe(1);
      expect(result.summary.totalCostEGP).toBe(640);
      expect(result.breakdown).toHaveLength(1);
    });

    it("returns zeroed totals for an empty scene", () => {
      const result = service.calculateSceneCost({});

      expect(result.success).toBe(true);
      expect(result.summary.totalAreaSqm).toBe(0);
      expect(result.summary.totalCostEGP).toBe(0);
      expect(result.summary.materialsUsed).toBe(0);
      expect(result.breakdown).toEqual([]);
    });
  });

  describe("generatePdf", () => {
    it("resolves a real PDF Buffer (not a Promise cast)", async () => {
      const pdf = await service.generatePdf(
        { "nile-lotus-wood": 10 },
        "Test Villa"
      );

      expect(Buffer.isBuffer(pdf)).toBe(true);
      expect(pdf.length).toBeGreaterThan(0);
      expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    });

    it("generates a PDF for an empty scene without throwing", async () => {
      const pdf = await service.generatePdf({});

      expect(Buffer.isBuffer(pdf)).toBe(true);
      expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    });
  });
});
