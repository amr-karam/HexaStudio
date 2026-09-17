/**
 * style-transfer.service.spec.ts
 * Unit tests — AI Style-Transfer Renderer service (Sprint S022.3)
 * HEXA Studio — AUTOMATIC1111 WebUI is mocked; no local SD needed.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { of, throwError } from "rxjs";
import type { HttpService } from "@nestjs/axios";
import { StyleTransferService } from "./style-transfer.service";

function makeService() {
  const httpService = {
    get: vi.fn(),
    post: vi.fn(),
  };
  const service = new StyleTransferService(
    httpService as unknown as HttpService
  );
  return { service, httpService };
}

describe("StyleTransferService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkStatus", () => {
    it("reports ready with models when SD WebUI + ControlNet answer", async () => {
      const { service, httpService } = makeService();
      httpService.get.mockImplementation((url: string) => {
        if (url.endsWith("/sdapi/v1/cmd_flags")) {
          return of({ data: { sd_model_checkpoint: "realisticVision.safetensors" } });
        }
        return of({ data: { version: 2 } });
      });

      const status = await service.checkStatus();

      expect(status.available).toBe(true);
      expect(status.sdWebuiReady).toBe(true);
      expect(status.controlnetAvailable).toBe(true);
      expect(status.models).toEqual(["realisticVision.safetensors"]);
      expect(status.controlnetModels).toEqual([
        "canny",
        "depth",
        "seg",
        "normal",
        "pose",
      ]);
    });

    it("reports unavailable when SD WebUI is down", async () => {
      const { service, httpService } = makeService();
      httpService.get.mockReturnValue(
        throwError(() => new Error("connect ECONNREFUSED"))
      );

      const status = await service.checkStatus();

      expect(status.available).toBe(false);
      expect(status.sdWebuiReady).toBe(false);
      expect(status.controlnetAvailable).toBe(false);
      expect(status.models).toEqual([]);
      expect(status.error).toBeTypeOf("string");
    });

    it("reports SD ready but ControlNet missing when only the version probe fails", async () => {
      const { service, httpService } = makeService();
      httpService.get.mockImplementation((url: string) => {
        if (url.endsWith("/sdapi/v1/cmd_flags")) {
          return of({ data: {} });
        }
        return throwError(() => new Error("404"));
      });

      const status = await service.checkStatus();

      expect(status.available).toBe(true);
      expect(status.controlnetAvailable).toBe(false);
      expect(status.controlnetModels).toEqual([]);
    });
  });

  describe("listStylishableMaterials", () => {
    it("lists the four Egyptian materials with texture hints", () => {
      const { service } = makeService();
      const materials = service.listStylishableMaterials();

      expect(materials).toHaveLength(4);
      expect(materials.map((m) => m.id)).toEqual([
        "nile-lotus-wood",
        "egyptian-granite",
        "papyrus-fabric",
        "pharaoh-bronze",
      ]);
      expect(materials[0].textureHints).toMatchObject({
        pattern: "lotus grain",
      });
    });
  });

  describe("generateTexture", () => {
    it("calls txt2img and returns the first image", async () => {
      const { service, httpService } = makeService();
      httpService.post.mockReturnValue(of({ data: { images: ["base64img"] } }));

      const result = await service.generateTexture({
        prompt: "sandstone palace",
        materialId: "egyptian-granite",
        outputId: "out-1",
      });

      expect(httpService.post).toHaveBeenCalledOnce();
      const [url] = httpService.post.mock.calls[0] as [string, unknown];
      expect(url).toContain("/sdapi/v1/txt2img");
      expect(result).toMatchObject({
        success: true,
        imageUrl: "base64img",
        materialId: "egyptian-granite",
        outputId: "out-1",
      });
    });

    it("routes to img2img when an init image is provided", async () => {
      const { service, httpService } = makeService();
      httpService.post.mockReturnValue(of({ data: { images: ["base64img"] } }));

      await service.generateTexture({
        prompt: "carved wood",
        materialId: "nile-lotus-wood",
        initImageBase64: "initbase64",
      });

      const [url, payload] = httpService.post.mock.calls[0] as [
        string,
        Record<string, unknown>,
      ];
      expect(url).toContain("/sdapi/v1/img2img");
      expect(payload.init_images).toEqual(["initbase64"]);
    });

    it("returns success:false when SD returns no images", async () => {
      const { service, httpService } = makeService();
      httpService.post.mockReturnValue(of({ data: { images: [] } }));

      const result = await service.generateTexture({
        prompt: "empty",
        materialId: "papyrus-fabric",
      });

      expect(result.success).toBe(false);
      expect(result.imageUrl).toBe("");
      expect(result.metadata?.error).toMatch(/No images/);
    });

    it("returns success:false with an honest error when SD is unreachable", async () => {
      const { service, httpService } = makeService();
      httpService.post.mockReturnValue(
        throwError(() => new Error("connect ECONNREFUSED"))
      );

      const result = await service.generateTexture({
        prompt: "down",
        materialId: "pharaoh-bronze",
      });

      expect(result.success).toBe(false);
      expect(result.metadata?.error).toMatch(/ECONNREFUSED/);
    });
  });

  describe("generateWithControlNet", () => {
    it("posts a ControlNet payload to img2img", async () => {
      const { service, httpService } = makeService();
      httpService.post.mockReturnValue(of({ data: { images: ["cnimg"] } }));

      const result = await service.generateWithControlNet({
        prompt: "temple facade",
        materialId: "egyptian-granite",
        controlNetInput: "canny",
        controlImageBase64: "controlbase64",
        controlNetProcessor: "canny",
      });

      const [url, payload] = httpService.post.mock.calls[0] as [
        string,
        Record<string, unknown>,
      ];
      expect(url).toContain("/sdapi/v1/img2img");
      const scripts = (
        payload.alwayson_scripts as {
          controlnet: { args: Array<{ model: string }> };
        }
      ).controlnet;
      expect(scripts.args[0].model).toContain("canny");
      expect(result).toMatchObject({ success: true, imageUrl: "cnimg" });
    });
  });
});
