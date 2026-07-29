import {
  Controller, Get, Param, Query, UseGuards, VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KnowledgeService } from './knowledge.service';

@ApiTags('Knowledge')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'odoo/knowledge', version: ['1', VERSION_NEUTRAL] })
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('articles')
  @ApiOperation({ summary: 'List knowledge articles with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by article category' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in name and body' })
  @ApiResponse({ status: 200, description: 'Paginated list of knowledge articles' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getArticles(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.knowledgeService.getArticles({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      category,
      search,
    });
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get a single knowledge article by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getArticle(@Param('id') id: string) {
    return this.knowledgeService.getArticle(parseInt(id, 10));
  }
}
