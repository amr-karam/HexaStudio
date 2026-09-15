/**
 * style-transfer-status.dto.ts
 * Response DTO — SD WebUI health check status
 * HEXA Studio — Sprint S022.3
 */
import { IsString, IsBoolean, IsArray, IsOptional } from "class-validator";

export class StyleTransferStatusDto {
  @IsBoolean()
  available: boolean;

  @IsBoolean()
  sdWebuiReady: boolean;

  @IsBoolean()
  controlnetAvailable: boolean;

  @IsArray()
  models: string[];

  @IsArray()
  controlnetModels: string[];

  @IsString()
  @IsOptional()
  error?: string;
}
