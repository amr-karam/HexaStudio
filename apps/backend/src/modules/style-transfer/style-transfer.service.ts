/**
 * style-transfer.service.ts
 * NestJS service — AI Style-Transfer Renderer (local SD + ControlNet)
 * HEXA Studio — Sprint S022.3
 *
 * Communicates with local AUTOMATIC1111 WebUI API (http://127.0.0.1:7860)
 * No cloud/SaaS. No API keys needed for local SD.
 *
 * Endpoints proxied via /backend/src/main.ts or standalone:
 *   POST /sdapi/v1/txt2img
 *   POST /sdapi/v1/img2img
 *   POST /sdapi/v1/controlnet/img2img
 *   GET  /sdapi/v1/cmd_flags
 *   GET  /controlnet/version
 */
import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import {
  StyleTransferGenerateDto,
  ControlNetGenerateDto,
  StyleTransferResponseDto,
  StyleTransferStatusDto,
} from "./dto";
import type { EgyptianMaterial } from "../../data/materials/egyptian-materials.interface";
import { getAllMaterials } from "../cost-estimator/materials-data";

@Injectable()
export class StyleTransferService {
  private readonly logger = new Logger(StyleTransferService.name);
  private readonly SD_API_URL = process.env.SD_WEBUI_URL || "http://127.0.0.1:7860";
  private readonly materials: EgyptianMaterial[] = getAllMaterials();

  constructor(private readonly httpService: HttpService) {}

  /**
   * Check local SD WebUI + ControlNet availability
   */
  async checkStatus(): Promise<StyleTransferStatusDto> {
    try {
      const flags = await lastValueFrom(
        this.httpService.get(`${this.SD_API_URL}/sdapi/v1/cmd_flags`)
      );

      let controlnetAvailable = false;
      try {
        await lastValueFrom(
          this.httpService.get(`${this.SD_API_URL}/controlnet/version`)
        );
        controlnetAvailable = true;
      } catch {
        controlnetAvailable = false;
      }

      const opts = flags.data || {};
      return {
        available: true,
        sdWebuiReady: true,
        controlnetAvailable,
        models: opts.sd_model_checkpoint
          ? [opts.sd_model_checkpoint]
          : [],
        controlnetModels: controlnetAvailable
          ? ["canny", "depth", "seg", "normal", "pose"]
          : [],
      };
      } catch {
      this.logger.warn(`SD WebUI unreachable at ${this.SD_API_URL}`);
      return {
        available: false,
        sdWebuiReady: false,
        controlnetAvailable: false,
        models: [],
        controlnetModels: [],
        error: "AUTOMATIC1111 WebUI not running or unreachable",
      };
    }
  }

  /**
   * List Egyptian materials available for style transfer
   */
  listStylishableMaterials() {
    return this.materials.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      description: m.description,
      basePriceEGP: m.basePriceEGP,
      textureHints: m.textureHints,
    }));
  }

  /**
   * Generate a style-transferred texture from a text prompt (txt2img)
   * If initImageBase64 is provided, uses img2img instead
   */
  async generateTexture(
    dto: StyleTransferGenerateDto
  ): Promise<StyleTransferResponseDto> {
    const material = this.materials.find((m) => m.id === dto.materialId);

    const payload: Record<string, unknown> = {
      prompt: `${dto.prompt}, ${material?.textureHints?.pattern || ""}, ${material?.textureHints?.finish || "matte"} finish, cultural detail`,
      negative_prompt: dto.negativePrompt || "lowquality, blur, jpeg artifacts",
      width: dto.width || 512,
      height: dto.height || 512,
      steps: dto.steps || 30,
      cfg_scale: dto.cfgScale || 7,
      sampler_name: "DPM++ 2M Karras",
      batch_size: 1,
    };

    if (dto.initImageBase64) {
      payload.init_images = [dto.initImageBase64];
      payload.denoising_strength = 0.75;
      return this.callImg2Img(payload, dto.materialId, dto.outputId);
    }

    return this.callTxt2Img(payload, dto.materialId, dto.outputId);
  }

  /**
   * Generate via ControlNet (canny/depth/seg/normal/pose)
   */
  async generateWithControlNet(
    dto: ControlNetGenerateDto
  ): Promise<StyleTransferResponseDto> {
    const material = this.materials.find((m) => m.id === dto.materialId);

    const payload: Record<string, unknown> = {
      prompt: `${dto.prompt}, ${material?.textureHints?.pattern || ""}, ${material?.textureHints?.finish || "matte"} finish`,
      negative_prompt: dto.negativePrompt || "lowquality, blur, jpeg artifacts",
      width: dto.width || 512,
      height: dto.height || 512,
      steps: dto.steps || 30,
      cfg_scale: dto.cfgScale || 7,
      sampler_name: "DPM++ 2M Karras",
      batch_size: 1,
      init_images: [dto.controlImageBase64],
      controlnet_input_images: [dto.controlImageBase64],
      alwayson_scripts: {
        controlnet: {
          args: [
            {
              input_image: dto.controlImageBase64,
              model: `${dto.controlNetProcessor}_sd15_safe.safetensors`,
              controlnet_conditioning_scale: 1.0,
              starting_control: 0.0,
              ending_control: 1.0,
              resize_mode: "JUST_RESIZE",
            },
          ],
        },
      },
    };

    return this.callImg2Img(payload, dto.materialId, dto.outputId);
  }

  /**
   * Call AUTOMATIC1111 /sdapi/v1/txt2img
   */
  private async callTxt2Img(
    payload: Record<string, unknown>,
    materialId: string,
    outputId?: string
  ): Promise<StyleTransferResponseDto> {
    try {
      const resp = await lastValueFrom(
        this.httpService.post(`${this.SD_API_URL}/sdapi/v1/txt2img`, payload)
      );

      const images: string[] = resp.data.images || [];
      if (images.length === 0) {
        return {
          success: false,
          imageUrl: "",
          materialId,
          metadata: { error: "No images returned from SD WebUI" },
        };
      }

      return {
        success: true,
        imageUrl: images[0],
        materialId,
        outputId: outputId || `gen_${Date.now()}`,
        metadata: {
          model: payload.prompt,
          width: payload.width,
          height: payload.height,
          steps: payload.steps,
          cfgScale: payload.cfg_scale,
        },
      };
    } catch (err: unknown) {
      this.logger.error(
        `txt2img failed: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : undefined
      );
      return {
        success: false,
        imageUrl: "",
        materialId,
        metadata: { error: err instanceof Error ? err.message : String(err) },
      };
    }
  }

  /**
   * Call AUTOMATIC1111 /sdapi/v1/img2img
   */
  private async callImg2Img(
    payload: Record<string, unknown>,
    materialId: string,
    outputId?: string
  ): Promise<StyleTransferResponseDto> {
    try {
      const resp = await lastValueFrom(
        this.httpService.post(`${this.SD_API_URL}/sdapi/v1/img2img`, payload)
      );

      const images: string[] = resp.data.images || [];
      if (images.length === 0) {
        return {
          success: false,
          imageUrl: "",
          materialId,
          metadata: { error: "No images returned from SD WebUI" },
        };
      }

      return {
        success: true,
        imageUrl: images[0],
        materialId,
        outputId: outputId || `gen_${Date.now()}`,
        metadata: {
          denoising_strength: payload.denoising_strength || 0.75,
          width: payload.width,
          height: payload.height,
          steps: payload.steps,
          cfgScale: payload.cfg_scale,
        },
      };
    } catch (err: unknown) {
      this.logger.error(
        `img2img failed: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : undefined
      );
      return {
        success: false,
        imageUrl: "",
        materialId,
        metadata: { error: err instanceof Error ? err.message : String(err) },
      };
    }
  }
}
