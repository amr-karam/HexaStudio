import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResearchToolsService } from './research-tools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Research Tools')
@Controller({ path: 'research', version: ['1'] })
export class ResearchToolsController {
  constructor(private readonly researchToolsService: ResearchToolsService) {}

  @Post('web-search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search the web for architectural trends, materials, or competitor data' })
  @HttpCode(HttpStatus.OK)
  async webSearch(@Body() { query, limit }: { query: string; limit?: number }) {
    return this.researchToolsService.webSearch({ query, limit });
  }

  @Post('scrape-page')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Extract deep content from a specific URL' })
  @HttpCode(HttpStatus.OK)
  async scrapePage(@Body() { url }: { url: string }) {
    return this.researchToolsService.scrapePage({ url });
  }

  @Post('synthesize-report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transform raw findings into a structured, cited architectural report' })
  @HttpCode(HttpStatus.OK)
  async synthesizeReport(@Body() { findings, focus }: { findings: string; focus: string }) {
    return this.researchToolsService.synthesizeReport({ findings, focus });
  }

  @Post('export-luxury-pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a high-fidelity, branded PDF from a synthesized report' })
  @HttpCode(HttpStatus.OK)
  async exportLuxuryPdf(@Body() { reportId, projectName, findings }: { reportId: string; projectName: string; findings: string }) {
    return this.researchToolsService.exportLuxuryPdf({ reportId, projectName, findings });
  }

  @Post('apply-live-material')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply a material mutation to the 3D scene in real-time' })
  @HttpCode(HttpStatus.OK)
  async applyLiveMaterial(@Body() { projectId, element, color, roughness, metalness, name }: { projectId: string; element: string; color: string; roughness: number; metalness: number; name: string }) {
    return this.researchToolsService.applyLiveMaterial({ projectId, element, materialSpec: { color, roughness, metalness, name } });
  }
}