import { Controller, Get, Param, Req, UseGuards, HttpCode, HttpStatus, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GeoipService } from './geoip.service';
import type { GeoIpResult } from './geoip.service';
import type { Request } from 'express';

@ApiTags('GeoIP')
@Controller({ path: 'geoip', version: ['1', VERSION_NEUTRAL] })
export class GeoipController {
  constructor(private readonly geoipService: GeoipService) {}

  /**
   * GET /api/geoip
   * Self-lookup: returns GeoIP data for the requestor's IP address.
   * Public endpoint — no authentication required.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GeoIP self-lookup — returns region data for the caller\'s IP' })
  async selfLookup(@Req() req: Request): Promise<GeoIpResult> {
    const ip = this.extractClientIp(req);
    return this.geoipService.lookup(ip);
  }

  /**
   * GET /api/geoip/:ip
   * Lookup a specific IP address. Admin-only.
   */
  @Get(':ip')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GeoIP lookup for a specific IP (admin only)' })
  async lookupIp(@Param('ip') ip: string): Promise<GeoIpResult> {
    return this.geoipService.lookup(ip);
  }

  /**
   * Extract the client IP from the request, checking trusted headers first.
   */
  private extractClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded)) {
      return forwarded[0].split(',')[0].trim();
    }

    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string') {
      return realIp.trim();
    }

    // Fall back to Express's `req.ip` (respects trust proxy settings)
    return req.ip ?? '127.0.0.1';
  }
}
