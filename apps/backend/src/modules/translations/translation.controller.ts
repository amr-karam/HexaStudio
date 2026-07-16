import { Controller, Get, Post, Param, Body, VERSION_NEUTRAL } from '@nestjs/common';
import { TranslationService, TranslationExport, TranslationStatus } from './translation.service';

@Controller({ path: 'translations', version: VERSION_NEUTRAL })
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
