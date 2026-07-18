import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '../storage/redis.service';
import { getRegionFromCountry as getRegion } from './geoip-regions';
import type { Env } from '../../config/env';

export interface GeoIpResult {
  status: 'success' | 'fail';
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  timezone: string;
  query: string;
  isp: string;
  lat: number;
  lon: number;
}

const REDIS_TTL = 24 * 60 * 60; // 24 hours in seconds

@Injectable()
export class GeoipService {
  private readonly logger = new Logger(GeoipService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService<Env>,
  ) {}

  /**
   * Lookup GeoIP data for a given IP address.
   * Results are cached in Redis for 24 hours.
   */
  async lookup(ip: string): Promise<GeoIpResult> {
    const cacheKey = `geoip:${ip}`;

    // Try cache first
    try {
      const cached = await this.redisService.get<GeoIpResult>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (err: unknown) {
      this.logger.warn(`Redis cache read failed for ${cacheKey}: ${(err as Error).message}`);
    }

    // Call ip-api.com
    try {
      const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;
      const { data } = await firstValueFrom(this.httpService.get<GeoIpResult>(url));

      // If the API returned a failure, throw so we fall through to default
      if (data.status !== 'success') {
        throw new Error(`ip-api.com returned status: ${data.status} — ${(data as unknown as { message?: string }).message ?? 'unknown'}`);
      }

      // Cache in Redis (non-blocking)
      try {
        await this.redisService.set(cacheKey, data, REDIS_TTL);
      } catch (err: unknown) {
        this.logger.warn(`Redis cache write failed for ${cacheKey}: ${(err as Error).message}`);
      }

      return data;
    } catch (err: unknown) {
      this.logger.error(`GeoIP lookup failed for ${ip}: ${(err as Error).message}`);
      // Return fallback (US)
      return this.fallbackResult(ip);
    }
  }

  /**
   * Map a country code to a region code using the COUNTRY_TO_REGION mapping.
   * Falls back to DEFAULT_REGION if not found.
   */
  getRegionFromCountry(countryCode: string): string {
    return getRegion(countryCode);
  }

  /**
   * Build a safe fallback GeoIpResult when the API is unreachable.
   */
  private fallbackResult(ip: string): GeoIpResult {
    return {
      status: 'fail',
      country: 'United States',
      countryCode: 'US',
      region: '',
      regionName: '',
      city: '',
      timezone: 'America/New_York',
      query: ip,
      isp: '',
      lat: 37.751,
      lon: -97.822,
    };
  }
}
