/**
 * controlnet-generate.dto.ts
 * Data Transfer Object — ControlNet-guided style transfer
 * HEXA Studio — Sprint S022.3
 *
 * Uses local AUTOMATIC1111 WebUI with ControlNet extension.
 * controlNetInput can be: "canny" | "depth" | "seg" | "normal" | "pose"
 */
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
} from "class-validator";

export type ControlNetInput = "canny" | "depth" | "seg" | "normal" | "pose";

export class ControlNetGenerateDto {
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsOptional()
  negativePrompt?: string;

  @IsString()
  @IsNotEmpty()
  controlNetInput: string;

  @IsString()
  @IsOptional()
  controlImageBase64: string;

  @IsEnum(["canny", "depth", "seg", "normal", "pose"])
  @IsOptional()
  controlNetProcessor: ControlNetInput = "canny";

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
  outputId?: string;
}
