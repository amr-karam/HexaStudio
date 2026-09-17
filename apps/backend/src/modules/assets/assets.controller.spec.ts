/**
 * assets.controller.spec.ts
 * Unit tests — 3D Asset Marketplace controller (Sprint S022.5)
 * HEXA Studio
 */
import { describe, it, expect, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { AssetsController } from "./assets.controller";

describe("AssetsController", () => {
  let controller: AssetsController;

  beforeEach(() => {
    controller = new AssetsController();
  });

  describe("getModels", () => {
    it("returns the full self-hosted catalogue with an honest count", () => {
      const result = controller.getModels();

      expect(result.success).toBe(true);
      expect(result.count).toBe(5);
      expect(result.models).toHaveLength(5);
      expect(result.models[0]).toMatchObject({
        id: "egyptian-temple-column-doric",
        category: "architecture",
      });
    });

    it("exposes metadata every 3D viewer needs (url, thumbnail, license)", () => {
      const result = controller.getModels();

      for (const model of result.models) {
        expect(model.url).toMatch(/\.glb$/);
        expect(model.thumbnail).toBeTypeOf("string");
        expect(model.license).toBeTypeOf("string");
        expect(Array.isArray(model.compatibleWith)).toBe(true);
      }
    });
  });

  describe("getModel", () => {
    it("returns a single model by id", () => {
      const result = controller.getModel("ramadan-lantern-brass");

      expect(result.success).toBe(true);
      expect(result.model.name).toBe("Ramadan Brass Lantern");
      expect(result.model.category).toBe("decoration");
    });

    it("throws NotFoundException for an unknown id", () => {
      expect(() => controller.getModel("does-not-exist")).toThrow(
        NotFoundException
      );
    });
  });
});
