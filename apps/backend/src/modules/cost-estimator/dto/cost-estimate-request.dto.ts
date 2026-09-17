import { IsObject, IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from "class-validator";

/**
 * cost-estimate-request.dto.ts
 * Request DTO — calculate cost estimate from surface areas
 * HEXA Studio — Sprint S022.4
 */




export class MaterialSurfaceArea {
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @IsNumber()
  areaSqm: number;
}

export class CostEstimateRequestDto {
  @IsObject()
  @ValidateNested()
  surfaceAreas: Record<string, number>;

  @IsString()
  @IsOptional()
  projectName?: string = "HEXA Studio Cost Estimate";
}
