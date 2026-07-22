import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { getEnv } from '../../config/env';

const LOCALIZED_TYPES = ['articles', 'portfolios', 'services', 'faqs', 'categories'] as const;

export interface LocaleEntry {
  id: number;
  title: string;
  slug?: string;
  fields: Record<string, unknown>;
  locale: string;
  localizations: Array<{ id: number; locale: string }>;
}

export interface TranslationExport {
  exportedAt: string;
  locale: string;
  contentTypes: Record<string, LocaleEntry[]>;
}

export interface TranslationStatus {
  locale: string;
  total: number;
  translated: number;
  missing: number;
  contentTypes: Record<string, { total: number; translated: number }>;
}

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  constructor(private readonly http: HttpService) {}

  private get cmsUrl() {
    return getEnv().CMS_URL;
  }

  private get apiToken() {
    return getEnv().CMS_API_TOKEN;
  }

  private get headers() {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = this.apiToken;
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async exportLocale(locale: string): Promise<TranslationExport> {
    const contentTypes: Record<string, LocaleEntry[]> = {};

    for (const type of LOCALIZED_TYPES) {
      const entries = await this.fetchType(type, locale);
      if (entries.length > 0) contentTypes[type] = entries;
    }

    return {
      exportedAt: new Date().toISOString(),
      locale,
      contentTypes,
    };
  }

  async importLocale(locale: string, data: TranslationExport): Promise<{ updated: number }> {
    if (!this.apiToken) {
      throw new ForbiddenException('CMS_API_TOKEN required for import');
    }

    let updated = 0;

    for (const [type, entries] of Object.entries(data.contentTypes)) {
      for (const entry of entries) {
        await this.upsertEntry(type, entry, locale);
        updated++;
      }
    }

    this.logger.log(`Imported ${updated} entries for locale ${locale}`);
    return { updated };
  }

  async getStatus(): Promise<TranslationStatus[]> {
    const locales = ['ar', 'es', 'fr', 'de', 'ja', 'ko', 'zh'];
    const statuses: TranslationStatus[] = [];

    for (const locale of locales) {
      const contentTypes: Record<string, { total: number; translated: number }> = {};
      let total = 0;
      let translated = 0;

      for (const type of LOCALIZED_TYPES) {
        const [allEntries, localizedEntries] = await Promise.all([
          this.fetchType(type, 'en'),
          this.fetchType(type, locale),
        ]);
        const count = allEntries.length;
        const locCount = localizedEntries.length;
        total += count;
        translated += locCount;
        contentTypes[type] = { total: count, translated: locCount };
      }

      statuses.push({ locale, total, translated, missing: total - translated, contentTypes });
    }

    return statuses;
  }

  private async fetchType(type: string, locale: string): Promise<LocaleEntry[]> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.cmsUrl}/api/${type}`, {
          params: {
            'locale': locale,
            'populate': '*',
            'pagination[pageSize]': 100,
          },
          headers: this.headers,
        }),
      );

      return (response.data?.data ?? []).map((item: Record<string, unknown>) =>
        this.mapEntry(item),
      );
    } catch (err) {
      this.logger.warn(`Failed to fetch ${type} for ${locale}: ${(err as Error).message}`);
      return [];
    }
  }

  private mapEntry(item: Record<string, unknown>): LocaleEntry {
    const attrs = (item.attributes ?? item) as Record<string, unknown>;
    const localizationAttrs = (attrs.localizations as { data?: Array<Record<string, unknown>> }) ?? {};
    const localizations = Array.isArray(localizationAttrs.data)
      ? localizationAttrs.data.map((loc: Record<string, unknown>) => ({
          id: loc.id as number,
          locale: ((loc.attributes ?? loc) as Record<string, unknown>).locale as string,
        }))
      : [];

    const fields: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(attrs)) {
      if (!['locale', 'localizations', 'createdAt', 'updatedAt', 'publishedAt', 'isPublished', 'createdBy', 'updatedBy'].includes(key)) {
        fields[key] = val;
      }
    }

    return {
      id: item.id as number,
      title: (attrs.title ?? attrs.question ?? attrs.name ?? '') as string,
      slug: attrs.slug as string | undefined,
      fields,
      locale: attrs.locale as string,
      localizations,
    };
  }

  private async upsertEntry(type: string, entry: LocaleEntry, locale: string): Promise<void> {
    try {
      const body = { data: { ...entry.fields, locale } };
      const existingLocalization = entry.localizations.find((l) => l.locale === locale);

      if (existingLocalization) {
        await firstValueFrom(
          this.http.put(`${this.cmsUrl}/api/${type}/${existingLocalization.id}`, body, {
            params: { locale },
            headers: this.headers,
          }),
        );
      } else {
        await firstValueFrom(
          this.http.post(`${this.cmsUrl}/api/${type}`, body, {
            params: { locale },
            headers: this.headers,
          }),
        );
      }
    } catch (err) {
      this.logger.error(`Failed to upsert ${type}/${entry.id} for ${locale}: ${(err as Error).message}`);
    }
  }
}
