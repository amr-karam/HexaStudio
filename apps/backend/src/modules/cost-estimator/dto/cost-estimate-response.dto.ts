/**
 * cost-estimate-response.dto.ts
 * Response DTO — cost estimate breakdown
 * HEXA Studio — Sprint S022.4
 */
import { IsBoolean, IsObject, IsString, IsArray } from "class-validator";

export class CostBreakdownItemDto {
  materialId: string;
  name: string;
  areaSqm: number;
  unitPriceEGP: number;
  totalEGP: number;
}

export class CostSummaryDto {
  totalAreaSqm: number;
  totalCostEGP: number;
  materialsUsed: number;
}

export class CostEstimateResponseDto {
  @IsBoolean()
  success: boolean;

  @IsObject()
  summary: CostSummaryDto;

  @IsArray()
  breakdown: CostBreakdownItemDto[];

  @IsString()
  generatedAt: string;
}
