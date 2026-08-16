import { Controller, Post, Body, UseGuards, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MultimodalService } from './multimodal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { sanitizePrompt } from './llm.factory';

const MAX_IMAGE_DATA_LENGTH = 15_000_000; // base64 payload (~11 MB binary)
const MAX_TEXT_LENGTH = 8000;

class AnalyzeImageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_IMAGE_DATA_LENGTH)
  imageData!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;
}

class CompareDesignsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_IMAGE_DATA_LENGTH)
  image1Data!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_IMAGE_DATA_LENGTH)
  image2Data!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;
}

class DesignSuggestionsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_IMAGE_DATA_LENGTH)
  referenceImageData!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TEXT_LENGTH)
  projectContext!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;
}

class GenerateBriefDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  projectType!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  squareFootage!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  stylePreference!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  sustainabilityGoals!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  budgetRange!: string;
}

@ApiTags('AI Multimodal')
@Controller('ai/multimodal')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MultimodalController {
  constructor(private readonly multimodalService: MultimodalService) {}

  @Post('analyze-architecture')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Analyze architectural image for style, materials, and lighting' })
  @ApiResponse({ status: 200, description: 'Analysis complete' })
  async analyzeArchitecture(@Body() dto: AnalyzeImageDto) {
    return this.multimodalService.analyzeArchitecturalImage(dto.imageData, dto.mimeType);
  }

  @Post('analyze-3d-scene')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Analyze 3D render quality and realism' })
  @ApiResponse({ status: 200, description: '3D scene analysis complete' })
  async analyze3dScene(@Body() dto: AnalyzeImageDto) {
    return this.multimodalService.analyze3DScene(dto.imageData, dto.mimeType);
  }

  @Post('analyze-material')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Analyze material texture for architectural applications' })
  @ApiResponse({ status: 200, description: 'Material analysis complete' })
  async analyzeMaterial(@Body() dto: AnalyzeImageDto) {
    return this.multimodalService.analyzeMaterialTexture(dto.imageData, dto.mimeType);
  }

  @Post('compare-designs')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Compare two architectural designs for similarity' })
  @ApiResponse({ status: 200, description: 'Comparison complete' })
  async compareDesigns(@Body() dto: CompareDesignsDto) {
    return this.multimodalService.compareDesigns(dto.image1Data, dto.image2Data, dto.mimeType);
  }

  @Post('design-suggestions')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Generate design suggestions based on reference image and context' })
  @ApiResponse({ status: 200, description: 'Suggestions generated' })
  async designSuggestions(@Body() dto: DesignSuggestionsDto) {
    return this.multimodalService.generateDesignSuggestions(
      dto.referenceImageData,
      sanitizePrompt(dto.projectContext),
      dto.mimeType,
    );
  }

  @Post('extract-bim')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Extract BIM/model metadata from screenshot' })
  @ApiResponse({ status: 200, description: 'BIM metadata extracted' })
  async extractBim(@Body() dto: AnalyzeImageDto) {
    return this.multimodalService.extractBIMMetadata(dto.imageData, dto.mimeType);
  }

  @Post('generate-brief')
  @Version(['1', VERSION_NEUTRAL])
  @ApiOperation({ summary: 'Generate AI architectural project brief' })
  @ApiResponse({ status: 200, description: 'Brief generated' })
  async generateBrief(@Body() dto: GenerateBriefDto) {
    return this.multimodalService.generateArchitecturalBrief({
      projectType: sanitizePrompt(dto.projectType),
      squareFootage: dto.squareFootage,
      stylePreference: sanitizePrompt(dto.stylePreference),
      sustainabilityGoals: sanitizePrompt(dto.sustainabilityGoals),
      budgetRange: sanitizePrompt(dto.budgetRange),
    });
  }
}
