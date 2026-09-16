/**
 * cost-estimator.controller.ts
 * NestJS controller — Automated Cost Estimator API
 * HEXA Studio — Sprint S022.4
 *
 * Endpoints:
 *   POST   /api/v1/cost-estimate/calculate  — calculate cost from surface areas
 *   POST   /api/v1/cost-estimate/pdf       — generate PDF material takeoff
 *   GET    /api/v1/cost-estimate/materials — list Egyptian materials with pricing
 */
import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { CostEstimatorService } from "./cost-estimator.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  CostEstimateRequestDto,
  CostEstimateResponseDto,
} from "./dto";
import { Response } from "express";

@ApiTags("cost-estimate")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "cost-estimate", version: "1" })
export class CostEstimatorController {
  constructor(private readonly service: CostEstimatorService) {}

  @Get("materials")
  @ApiOperation({ summary: "List Egyptian materials with pricing (EGP/m²)" })
  async getMaterials() {
    return this.service.listMaterials();
  }

  @Post("calculate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Calculate estimated cost from material surface areas",
  })
  @ApiResponse({ status: 200, type: CostEstimateResponseDto })
  async calculateCost(
    @Body() dto: CostEstimateRequestDto
  ): Promise<unknown> {
    return this.service.calculateSceneCost(dto.surfaceAreas);
  }

  @Post("pdf")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Generate PDF material takeoff",
  })
  async generatePdf(
    @Body() dto: CostEstimateRequestDto,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.service.generatePdf(
      dto.surfaceAreas,
      dto.projectName || "HEXA Studio Cost Estimate"
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${
        dto.projectName || "cost-estimate"
      }.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}
