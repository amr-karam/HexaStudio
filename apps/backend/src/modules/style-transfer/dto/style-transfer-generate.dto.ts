/**
 * style-transfer-generate.dto.ts
 * Data Transfer Object — generate texture from text prompt
 * HEXA Studio — Sprint S022.3
 */
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from "class-validator";

export type MaterialCategory = "wood" | "stone" | "fabric" | "metal";

export class StyleTransferGenerateDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsNotEmpty()
  materialId: string;

  @IsString()
  @IsOptional()
  negativePrompt?: string;

  @IsInt()
  @Min(64)
  @Max(2048)
  @IsOptional()
  width?: number = 512;

  @IsInt()
  @Min(64)
  @Max(2048)
  @IsOptional()
  height?: number = 512;

  @IsInt()
  @Min(1)
  @Max(150)
  @IsOptional()
  steps?: number = 30;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  cfgScale?: number = 7;

  @IsString()
  @IsOptional()
  initImageBase64?: string;

  @IsString()
  @IsOptional()
  outputId?: string;
}
