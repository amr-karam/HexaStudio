import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
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
