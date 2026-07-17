import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { PricingRequest, PricingResponse, CurrencyConfig } from './currency.types';

/**
 * CurrencyController: Public API for pricing and currency conversion
 * Endpoints:
 * - GET /api/currency/list — List all supported currencies
 * - GET /api/currency/:code — Get currency details
 * - POST /api/pricing/calculate — Calculate regional pricing with tax
 * - GET /api/pricing/rates — Get current exchange rates
 */
@Controller('api/currency')
export class CurrencyController {
  private readonly logger = new Logger(CurrencyController.name);

  constructor(private readonly currencyService: CurrencyService) {}

  /**
   * GET /api/currency/list
   * Returns all supported currencies with details
   */
  @Get('list')
  @HttpCode(HttpStatus.OK)
  listCurrencies(): CurrencyConfig[] {
    return this.currencyService.listCurrencies();
  }

  /**
   * GET /api/currency/:code
   * Returns details for a specific currency
   */
  @Get(':code')
  @HttpCode(HttpStatus.OK)
  getCurrency(code: string): CurrencyConfig | { error: string } {
    const currency = this.currencyService.getCurrency(code.toUpperCase());
    if (!currency) {
      return { error: `Currency ${code} not found` };
    }
    return currency;
  }

  /**
   * GET /api/pricing/rates?from=USD&to=EUR
   * Returns exchange rate between two currencies
   */
  @Get('rates')
  @HttpCode(HttpStatus.OK)
  getExchangeRate(
    @Query('from') from: string = 'USD',
    @Query('to') to: string = 'EUR',
  ): { from: string; to: string; rate: number; timestamp: Date } | { error: string } {
    const rate = this.currencyService.getExchangeRate(from.toUpperCase(), to.toUpperCase());
    if (!rate) {
      return { error: `Exchange rate not found for ${from} → ${to}` };
    }
    return {
      from: rate.from,
      to: rate.to,
      rate: rate.rate,
      timestamp: rate.lastUpdated,
    };
  }
}

/**
 * PricingController: Calculate regional pricing with tax compliance
 */
@Controller('api/pricing')
export class PricingController {
  private readonly logger = new Logger(PricingController.name);

  constructor(private readonly currencyService: CurrencyService) {}

  /**
   * POST /api/pricing/calculate
   * Body: {
   *   baseAmount: 99.99,
   *   baseCurrency: "USD",
   *   targetCurrency: "EUR",
   *   region: "DE",
   *   includesTax: true
   * }
   * Response: Full pricing breakdown with tax, regional markup, final amount
   */
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  async calculatePrice(@Body() request: PricingRequest): Promise<PricingResponse> {
    return this.currencyService.calculateRegionalPrice(request);
  }

  /**
   * GET /api/pricing/preview
   * Query params: ?baseAmount=99.99&baseCurrency=USD&region=FR
   * Quick preview of pricing in a region
   */
  @Get('preview')
  @HttpCode(HttpStatus.OK)
  async previewPrice(
    @Query('baseAmount') baseAmount: string = '99.99',
    @Query('baseCurrency') baseCurrency: string = 'USD',
    @Query('region') region?: string,
  ): Promise<PricingResponse> {
    const request: PricingRequest = {
      baseAmount: parseFloat(baseAmount),
      baseCurrency: baseCurrency.toUpperCase(),
      targetCurrency: baseCurrency.toUpperCase(), // Use same currency for base
      region,
    };

    return this.currencyService.calculateRegionalPrice(request);
  }
}
