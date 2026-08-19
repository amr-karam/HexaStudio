import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { KnowledgeService } from './knowledge.service';

@ApiTags('Knowledge')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('odoo/knowledge')
export class KnowledgeController {
  constructor(private readonly service: KnowledgeService) {}

  @Get('articles')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  @ApiOperation({ summary: 'List knowledge articles' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  getArticles(@Query('page') p?: string, @Query('limit') l?: string, @Query('category') c?: string, @Query('search') s?: string) {
    return this.service.getArticles({ page: p ? +p : undefined, limit: l ? +l : undefined, category: c, search: s });
  }

  @Get('articles/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get article by ID' })
  getArticle(@Param('id', ParseIntPipe) id: number) { return this.service.getArticle(id); }
}
