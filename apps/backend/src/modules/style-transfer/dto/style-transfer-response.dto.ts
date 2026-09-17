/**
 * style-transfer-response.dto.ts
 * Response DTO — style transfer generation result
 * HEXA Studio — Sprint S022.3
 */
import { IsString, IsNotEmpty, IsOptional, IsObject } from "class-validator";

export class StyleTransferResponseDto {
  @IsString()
  @IsNotEmpty()
  success: boolean;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsOptional()
  outputId?: string;

  @IsString()
  @IsNotEmpty()
  materialId: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
