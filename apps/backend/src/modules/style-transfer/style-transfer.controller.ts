/**
 * style-transfer.controller.ts
 * NestJS controller — AI Style-Transfer Renderer API
 * HEXA Studio — Sprint S022.3
 *
 * Endpoints:
 *   POST   /api/v1/style-transfer/generate  — generate styled texture from prompt + init image
 *   POST   /api/v1/style-transfer/controlnet — ControlNet-guided generation (canny/seg/depth)
 *   GET    /api/v1/style-transfer/status    — local SD WebUI health check
 *   GET    /api/v1/style-transfer/materials — list Egyptian materials available for styling
 */
import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { StyleTransferService } from "./style-transfer.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  StyleTransferGenerateDto,
  ControlNetGenerateDto,
  StyleTransferResponseDto,
  StyleTransferStatusDto,
} from "./dto";

@ApiTags("style-transfer")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "style-transfer", version: "1" })
export class StyleTransferController {
  constructor(private readonly service: StyleTransferService) {}

  @Get("status")
  @ApiOperation({
    summary: "Check local SD WebUI + ControlNet availability",
  })
  @ApiResponse({ status: 200, type: StyleTransferStatusDto })
  async getStatus(): Promise<StyleTransferStatusDto> {
    return this.service.checkStatus();
  }

  @Get("materials")
  @ApiOperation({
    summary: "List Egyptian materials available for style transfer",
  })
  async getMaterials() {
    return this.service.listStylishableMaterials();
  }

  @Post("generate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Generate a style-transferred texture from a text prompt",
  })
  @ApiResponse({ status: 200, type: StyleTransferResponseDto })
  async generateTexture(
    @Body() dto: StyleTransferGenerateDto
  ): Promise<StyleTransferResponseDto> {
    return this.service.generateTexture(dto);
  }

  @Post("controlnet")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Generate via ControlNet (canny depth seg) — local SD + ControlNet",
  })
  @ApiResponse({ status: 200, type: StyleTransferResponseDto })
  async generateWithControlNet(
    @Body() dto: ControlNetGenerateDto
  ): Promise<StyleTransferResponseDto> {
    return this.service.generateWithControlNet(dto);
  }
}
