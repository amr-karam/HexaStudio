import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { TranslationService, TranslationExport, TranslationStatus } from './translation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'editor')
@Controller({ path: 'translations', version: '1' })
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get('export/:locale')
  async export(@Param('locale') locale: string): Promise<TranslationExport> {
    return this.translationService.exportLocale(locale);
  }

  @Post('import/:locale')
  async import(
    @Param('locale') locale: string,
    @Body() data: TranslationExport,
  ): Promise<{ updated: number }> {
    return this.translationService.importLocale(locale, data);
  }

  @Get('status')
  async status(): Promise<TranslationStatus[]> {
    return this.translationService.getStatus();
  }
}
