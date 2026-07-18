/**
 * Country-to-region mapping for GeoIP-based regional pricing and features.
 * Each country code maps to a broader region code.
 */
export const COUNTRY_TO_REGION: Record<string, string> = {
  US: 'US',
  CA: 'US',

  GB: 'UK',
  IE: 'UK',

  DE: 'DE',
  FR: 'FR',
  IT: 'EU',
  ES: 'EU',
  NL: 'EU',
  BE: 'EU',

  JP: 'JP',
  KR: 'KR',
  CN: 'APAC',

  AE: 'AE',
  SA: 'AE',
  QA: 'AE',
  KW: 'AE',
  OM: 'AE',
  BH: 'AE',

  AU: 'AU',
  NZ: 'AU',

  BR: 'BR',
  MX: 'MX',
  AR: 'LATAM',

  IN: 'IN',
  SG: 'SG',
  HK: 'HK',

  ZA: 'ZA',
  NG: 'AFRICA',
};

export const DEFAULT_REGION = 'US';

/**
 * Map a country code to a region code using the COUNTRY_TO_REGION mapping.
 * Falls back to DEFAULT_REGION if the country code is not found.
 */
export function getRegionFromCountry(countryCode: string): string {
  return COUNTRY_TO_REGION[countryCode.toUpperCase()] ?? DEFAULT_REGION;
}
