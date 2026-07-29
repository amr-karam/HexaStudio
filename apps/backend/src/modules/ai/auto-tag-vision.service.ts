import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Content, GoogleGenAI } from '@google/genai';
import { Env } from '../../config/env';
import { MultimodalService } from './multimodal.service';

/**
 * A single vision-derived tag with confidence and category.
 */
export interface VisionTagResult {
  /** Tag label (lowercase, sanitized) */
  tag: string;
  /** Confidence score 0–1 */
  confidence: number;
  /** Semantic category for grouping/filtering */
  category: 'style' | 'material' | 'color' | 'lighting' | 'spatial' | 'feature';
}

/**
 * AutoTagVisionService
 *
 * Generates tags from architectural images using Gemini Vision.
 * Extends the AutoTagService concept from OpenAI text → Gemini Vision.
 *
 * Detects: architecture style, materials, colors, lighting type, spatial composition.
 * Returns up to 10 tags with confidence scores.
 * Falls back to keyword extraction from project context when Gemini is unavailable.
 */
@Injectable()
export class AutoTagVisionService {
  private readonly logger = new Logger(AutoTagVisionService.name);
  private client: GoogleGenAI | null = null;

  constructor(
    private readonly configService: ConfigService<Env>,
    private readonly multimodalService: MultimodalService,
  ) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Returns true when the Gemini Vision client is ready.
   */
  get isAvailable(): boolean {
    return this.client !== null && this.multimodalService.isAvailable;
  }

  /**
   * Generate vision-based tags from an architectural image.
   *
   * Uses a single targeted Gemini Vision call to extract:
   *   - Architectural style
   *   - Materials
   *   - Colors
   *   - Lighting type
   *   - Spatial composition
   *   - Notable features
   *
   * @param imageData - Base64-encoded image data
   * @param mimeType  - MIME type of the image (default: 'image/jpeg')
   * @param context   - Optional project context (title/description) used for fallback tagging
   * @returns Up to 10 VisionTagResult items sorted by confidence descending
   */
  async generateVisionTags(
    imageData: string,
    mimeType: string = 'image/jpeg',
    context?: { title?: string; description?: string },
  ): Promise<VisionTagResult[]> {
    if (!this.isAvailable) {
      this.logger.warn('Gemini Vision unavailable — using context-based fallback tags');
      return this.extractContextTags(context);
    }

    try {
      const model = this.configService.get<string>('GEMINI_MODEL')!;

      const response = await this.client!.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyze this architectural image and generate relevant tags. Identify:

1. Architectural style(s) — e.g., modern, brutalist, minimalist, industrial, neoclassical, contemporary, mid-century, art-deco
2. Materials visible — e.g., concrete, glass, steel, wood, stone, brick, marble, copper, terracotta
3. Dominant colors — e.g., warm neutrals, cool grays, earth tones, monochrome, pastel, vibrant accent
4. Lighting type — e.g., natural daylight, artificial ambient, dramatic, mixed, warm, cool
5. Spatial composition — e.g., open plan, enclosed, mixed-use, fluid, compartmentalized, double-height
6. Notable features — e.g., green roof, floor-to-ceiling windows, cantilever, skylight, water feature, parametric facade

Return as JSON with: tags[{tag: string, confidence: number (0-1), category: "style"|"material"|"color"|"lighting"|"spatial"|"feature"}]
Include up to 12 tags, sorted by confidence descending. Only return valid JSON.`,
              },
              {
                inlineData: {
                  mimeType,
                  data: imageData,
                },
              },
            ],
          },
        ] as Content[],
        config: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text ?? '';
      if (!text) {
        return this.extractContextTags(context);
      }

      const parsed = JSON.parse(text) as { tags: VisionTagResult[] };
      if (!Array.isArray(parsed.tags)) {
        return this.extractContextTags(context);
      }

      const validCategories = new Set<VisionTagResult['category']>([
        'style', 'material', 'color', 'lighting', 'spatial', 'feature',
      ]);

      const validTags = parsed.tags
        .filter((t) =>
          typeof t.tag === 'string' &&
          t.tag.length > 0 &&
          typeof t.confidence === 'number' &&
          t.confidence >= 0 &&
          t.confidence <= 1 &&
          validCategories.has(t.category),
        )
        .slice(0, 10);

      if (validTags.length === 0) {
        return this.extractContextTags(context);
      }

      // Sanitize tags
      for (const tag of validTags) {
        tag.tag = tag.tag.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim();
      }

      return validTags;
    } catch (error) {
      this.logger.error(`Vision tag generation failed: ${(error as Error).message}`);
      return this.extractContextTags(context);
    }
  }

  /**
   * Extract color palette tags specifically from the image.
   *
   * @param imageData - Base64-encoded image data
   * @param mimeType  - MIME type of the image
   * @returns Color tags with confidence scores
   */
  async extractColorPalette(
    imageData: string,
    mimeType: string = 'image/jpeg',
  ): Promise<VisionTagResult[]> {
    if (!this.isAvailable) return [];

    try {
      const materialAnalysis = await this.multimodalService.analyzeMaterialTexture(imageData, mimeType);

      return materialAnalysis.colorPalette.slice(0, 5).map((color) => ({
        tag: color.toLowerCase().replace(/[^a-z0-9\s#]/g, '').trim(),
        confidence: 0.7,
        category: 'color' as const,
      }));
    } catch (error) {
      this.logger.error(`Color palette extraction failed: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Fallback: extract simple tags from project context (title + description).
   * Used when Gemini Vision is unavailable or returns empty results.
   */
  private extractContextTags(context?: { title?: string; description?: string }): VisionTagResult[] {
    if (!context?.title && !context?.description) return [];

    const text = `${context.title ?? ''} ${context.description ?? ''}`.toLowerCase();
    const words = text
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const unique = [...new Set(words)];
    return unique.slice(0, 5).map((tag) => ({
      tag,
      confidence: 0.3,
      category: 'feature' as const,
    }));
  }
}
