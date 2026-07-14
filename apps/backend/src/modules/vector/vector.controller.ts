import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { VectorService } from './vector.service';
import { VectorSyncService } from './vector-sync.service';
import { SemanticSearchRequest, SemanticSearchResponse } from '@hexastudio/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vector')
export class VectorController {
  constructor(
    private readonly vectorService: VectorService,
    private readonly vectorSyncService: VectorSyncService,
  ) {}

  @Post('search')
  @UseGuards(JwtAuthGuard)
  async search(@Body() request: SemanticSearchRequest): Promise<SemanticSearchResponse> {
    return this.vectorService.search('projects', request);
  }

  @Post('sync/all')
  @UseGuards(JwtAuthGuard)
  async syncAll(): Promise<{ message: string }> {
    await this.vectorSyncService.syncAllProjects();
    return { message: 'Full re-index started' };
  }

  @Post('sync/:slug')
  @UseGuards(JwtAuthGuard)
  async syncBySlug(@Body('slug') slug: string): Promise<{ message: string }> {
    await this.vectorSyncService.syncProject(slug);
    return { message: `Syncing project ${slug} started` };
  }
}
