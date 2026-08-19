import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT)
  async search(
    @Query('q') q: string,
    @Query('models') models?: string,
    @Query('limit') limit?: string,
  ) {
    if (!q) return { data: [], meta: { total: 0, query: '' } };

    const modelList = models ? models.split(',') : undefined;
    return this.searchService.globalSearch(q, modelList, limit ? parseInt(limit) : 20);
  }
}
