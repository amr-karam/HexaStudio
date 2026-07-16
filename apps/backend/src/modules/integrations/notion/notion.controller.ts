import { Controller, Get, Post, Body, Param, VERSION_NEUTRAL } from '@nestjs/common';
import { NotionService } from './notion.service';

@Controller({ path: 'integrations/notion', version: VERSION_NEUTRAL })
export class NotionController {
  constructor(private readonly notionService: NotionService) {}

  @Get('status')
  getStatus() {
    return {
      configured: this.notionService.isConfigured,
      provider: 'notion',
    };
  }

  @Get('databases')
  async getDatabases() {
    return this.notionService.searchDatabases();
  }

  @Get('databases/:id/pages')
  async getPages(@Param('id') databaseId: string) {
    return this.notionService.queryDatabase(databaseId);
  }

  @Post('databases/:id/sync')
  async syncProject(
    @Param('id') databaseId: string,
    @Body() body: { projectId: string; name: string; status: string; phase?: string },
  ) {
    const success = await this.notionService.syncProject(
      body.projectId,
      { name: body.name, status: body.status, phase: body.phase },
      databaseId,
    );
    return { success };
  }
}
