import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { DocumentsService } from './documents.service';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE)
@Controller('odoo/documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List documents' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'search', required: false })
  getDocuments(@Query('page') p?: string, @Query('limit') l?: string, @Query('projectId') pr?: string, @Query('search') s?: string) {
    return this.service.getDocuments({ page: p ? +p : undefined, limit: l ? +l : undefined, projectId: pr ? +pr : undefined, search: s });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  getDocument(@Param('id', ParseIntPipe) id: number) { return this.service.getDocument(id); }
}
