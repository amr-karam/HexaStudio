import { Controller, Get, Post, Param, Body, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TranslationService, TranslationExport, TranslationStatus } from './translation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'editor')
@ApiTags('Translations')
@ApiBearerAuth()
@Controller({ path: 'translations', version: ['1', VERSION_NEUTRAL] })
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get('export/:locale')
  @ApiOperation({ summary: 'Export translations for a locale' })
  async export(@Param('locale') locale: string): Promise<TranslationExport> {
    return this.translationService.exportLocale(locale);
  }

  @Post('import/:locale')
  @ApiOperation({ summary: 'Import translations for a locale' })
  async import(
    @Param('locale') locale: string,
    @Body() data: TranslationExport,
  ): Promise<{ updated: number }> {
    return this.translationService.importLocale(locale, data);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get translation status for all locales' })
  async status(): Promise<TranslationStatus[]> {
    return this.translationService.getStatus();
  }
}
