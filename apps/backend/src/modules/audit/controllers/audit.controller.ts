import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { DesignAuditService, DesignAuditResult, PageBalanceResult } from '../services/design-audit.service';
import { LuxuryForgeService, LuxuryForgeRequest, LuxuryForgeResult } from '../services/luxury-forge.service';

export class AuditRequestDto {
  tsx?: string;
  image?: {
    mimeType: string;
    data: string;
  };
  context?: string;
}

@Controller('audit')
export class AuditController {
  constructor(
    private readonly auditService: DesignAuditService,
    private readonly forgeService: LuxuryForgeService,
  ) {}

  @Post('design')
  @HttpCode(HttpStatus.OK)
  async auditDesign(@Body() body: AuditRequestDto): Promise<DesignAuditResult> {
    return this.auditService.auditDesign(
      { tsx: body.tsx, image: body.image },
      body.context || 'UI Component',
    );
  }

  @Post('balance')
  @HttpCode(HttpStatus.OK)
  async auditBalance(@Body() body: { image: { data: string; mimeType?: string } }): Promise<PageBalanceResult> {
    return this.auditService.auditPageBalance(
      body.image.data,
      body.image.mimeType || 'image/jpeg',
    );
  }

  @Post('forge')
  @HttpCode(HttpStatus.OK)
  async forgeComponent(@Body() body: LuxuryForgeRequest): Promise<LuxuryForgeResult> {
    return this.forgeService.forgeComponent(body);
  }
}

