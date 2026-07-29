import { Controller, Post, Body, UseGuards, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MultimodalService } from './multimodal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class AnalyzeImageDto {
  imageData!: string;
  mimeType?: string;
}

class CompareDesignsDto {
  image1Data!: string;
  image2Data!: string;
  mimeType?: string;
}

class DesignSuggestionsDto {
  referenceImageData!: string;
  projectContext!: string;
  mimeType?: string;
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
    return this.multimodalService.generateDesignSuggestions(dto.referenceImageData, dto.projectContext, dto.mimeType);
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
  async generateBrief(
    @Body()
    dto: {
      projectType: string;
      squareFootage: number;
      stylePreference: string;
      sustainabilityGoals: string;
      budgetRange: string;
    }
  ) {
    return this.multimodalService.generateArchitecturalBrief(dto);
  }
}
