/**
 * assets.controller.ts
 * NestJS controller — 3D Asset Marketplace endpoints
 * HEXA Studio — Sprint S022.5
 *
 * Endpoints:
 *   GET  /assets/models      — list all Egyptian 3D models
 *   GET  /assets/models/:id  — get model metadata + download URL
 */
import { Controller, Get, Param, NotFoundException, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import * as modelsRaw from "../../data/assets/models/index.json";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

interface AssetModel {
  id: string;
  name: string;
  category: "architecture" | "furniture" | "decoration" | "landscape";
  url: string;
  thumbnail: string;
  size: string;
  license: string;
  compatibleWith: string[];
}

interface ModelsIndexFile {
  models?: AssetModel[];
}

/**
 * The index file is a `{ models: [...], metadata: {...} }` envelope —
 * extract the array defensively so a shape drift degrades to an empty
 * catalogue instead of a 500 on `.find`.
 */
function readModelsIndex(): AssetModel[] {
  const raw = (modelsRaw as unknown as { default?: unknown }).default ?? modelsRaw;
  const models = (raw as ModelsIndexFile).models;
  return Array.isArray(models) ? models : [];
}

@Controller({ path: "assets", version: "1" })
@ApiTags("assets")
@UseGuards(JwtAuthGuard)
export class AssetsController {
  private readonly models: AssetModel[] = readModelsIndex();

  @Get("models")
  @ApiOperation({ summary: "List all Egyptian 3D models" })
  getModels() {
    return {
      success: true,
      count: this.models.length,
      models: this.models,
    };
  }

  @Get("models/:id")
  @ApiOperation({ summary: "Get model metadata by ID" })
  getModel(@Param("id") id: string) {
    const model = this.models.find((m) => m.id === id);
    if (!model) {
      throw new NotFoundException(`Model ${id} not found`);
    }
    return { success: true, model };
  }
}
