import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Content, GoogleGenAI } from '@google/genai';
import { Env } from '../../config/env';

@Injectable()
export class MultimodalService {
  private readonly logger = new Logger(MultimodalService.name);
  private client: GoogleGenAI | null = null;

  constructor(private configService: ConfigService<Env>) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  get isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Analyze architectural image for design insights
   */
  async analyzeArchitecturalImage(
    imageData: string,
    mimeType: string = 'image/jpeg'
  ): Promise<{
    style: string;
    materials: string[];
    lighting: string;
    spatialComposition: string;
    suggestions: string[];
    confidence: number;
  }> {
    if (!this.client) {
      throw new Error('Gemini API is unavailable');
    }

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyze this architectural image and provide:
1. Architectural style (e.g., modern, brutalist, minimalist)
2. Key materials used (list 3-5)
3. Lighting analysis (natural, artificial, mixed)
4. Spatial composition (open, closed, mixed-use)
5. 3 specific design improvement suggestions

Return as JSON with: style, materials[], lighting, spatialComposition, suggestions[], confidence (0-1)`
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageData
                }
              }
            ]
          }
        ] as Content[],
        config: {
          temperature: 0.3,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json'
        }
      });

      const text = response.text ?? '';
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(`Image analysis failed: ${error}`);
      throw error;
    }
  }

  /**
   * Analyze 3D scene render for quality assessment
   */
  async analyze3DScene(
    imageData: string,
    mimeType: string = 'image/png'
  ): Promise<{
    visualQuality: string;
    lightingQuality: string;
    materialRealism: string;
    composition: string;
    improvements: string[];
    technicalNotes: string[];
  }> {
    if (!this.client) {
      throw new Error('Gemini API is unavailable');
    }

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyze this 3D architectural render and assess:
1. Visual quality (lighting, shadows, reflections)
2. Lighting quality (naturalness, intensity, color temperature)
3. Material realism (textures, materials, PBR accuracy)
4. Composition (camera angle, framing, depth)
5. 3-4 specific improvement suggestions
6. 2-3 technical notes for 3D artists

Return as JSON with: visualQuality, lightingQuality, materialRealism, composition, improvements[], technicalNotes[]`
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageData
                }
              }
            ]
          }
        ] as Content[],
        config: {
          temperature: 0.2,
          maxOutputTokens: 1200,
          responseMimeType: 'application/json'
        }
      });

      const text = response.text ?? '';
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(`3D scene analysis failed: ${error}`);
      throw error;
    }
  }

  /**
   * Analyze material texture for architectural applications
   */
  async analyzeMaterialTexture(
    imageData: string,
    mimeType: string = 'image/jpeg'
  ): Promise<{
    materialType: string;
    colorPalette: string[];
    textureCharacteristics: string[];
    suitableApplications: string[];
    sustainabilityScore: number;
    maintenanceNotes: string[];
  }> {
    if (!this.client) {
      throw new Error('Gemini API is unavailable');
    }

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyze this architectural material texture and provide:
1. Material type (e.g., concrete, wood, metal, stone)
2. Dominant color palette (3-5 hex codes or color names)
3. Texture characteristics (smooth, rough, porous, etc.)
4. Suitable architectural applications (interior/exterior specific)
5. Sustainability score (0-1 based on durability and environmental impact)
6. Maintenance considerations

Return as JSON with: materialType, colorPalette[], textureCharacteristics[], suitableApplications[], sustainabilityScore, maintenanceNotes[]`
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageData
                }
              }
            ]
          }
        ] as Content[],
        config: {
          temperature: 0.3,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json'
        }
      });

      const text = response.text ?? '';
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(`Material analysis failed: ${error}`);
      throw error;
    }
  }

  /**
   * Compare two architectural designs for similarity
   */
  async compareDesigns(
    image1Data: string,
    image2Data: string,
    mimeType: string = 'image/jpeg'
  ): Promise<{
    similarityScore: number;
    sharedElements: string[];
    differences: string[];
    stylisticRelationship: string;
    recommendation: string;
  }> {
    if (!this.client) {
      throw new Error('Gemini API is unavailable');
    }

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Compare these two architectural designs and provide:
1. Similarity score (0-1)
2. Shared design elements (3-5 items)
3. Key differences (3-5 items)
4. Stylistic relationship (e.g., complementary, contrasting, evolution)
5. Brief recommendation for design direction

Return as JSON with: similarityScore, sharedElements[], differences[], stylisticRelationship, recommendation`
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: image1Data
                }
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: image2Data
                }
              }
            ]
          }
        ] as Content[],
        config: {
          temperature: 0.3,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json'
        }
      });

      const text = response.text ?? '';
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(`Design comparison failed: ${error}`);
      throw error;
    }
  }

  /**
   * Generate design suggestions based on reference image
   */
  async generateDesignSuggestions(
    referenceImageData: string,
    projectContext: string,
    mimeType: string = 'image/jpeg'
  ): Promise<{
    conceptVariations: Array<{
      title: string;
      description: string;
      keyFeatures: string[];
      materials: string[];
    }>;
    technicalRecommendations: string[];
    feasibilityScore: number;
  }> {
    if (!this.client) {
      throw new Error('Gemini API is unavailable');
    }

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Based on this reference architectural image and the project context: "${projectContext}"

Generate 3 concept variations that:
1. Maintain the essence of the reference
2. Adapt to the project context
3. Offer distinct approaches

For each variation provide:
- Title
- Brief description
- 3-4 key architectural features
- 2-3 material suggestions

Also provide:
- 3-4 technical recommendations
- Overall feasibility score (0-1)

Return as JSON with: conceptVariations[{title, description, keyFeatures[], materials[]}], technicalRecommendations[], feasibilityScore`
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: referenceImageData
                }
              }
            ]
          }
        ] as Content[],
        config: {
          temperature: 0.4,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json'
        }
      });

      const text = response.text ?? '';
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(`Design suggestions failed: ${error}`);
      throw error;
    }
  }

  /**
   * Extract BIM/model metadata from screenshot
   */
  async extractBIMMetadata(
    imageData: string,
    mimeType: string = 'image/png'
  ): Promise<{
    detectedElements: Array<{
      type: string;
      count: number;
      confidence: number;
    }>;
    viewType: string;
    scale: string;
    layerInformation: string[];
    potentialIssues: string[];
  }> {
    if (!this.client) {
      throw new Error('Gemini API is unavailable');
    }

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyze this BIM/model screenshot and extract:
1. Detected architectural elements (walls, doors, windows, etc.) with counts
2. View type (plan, elevation, section, 3D)
3. Apparent scale (if visible)
4. Visible layer information
5. Potential modeling issues or inconsistencies

Return as JSON with: detectedElements[{type, count, confidence}], viewType, scale, layerInformation[], potentialIssues[]`
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageData
                }
              }
            ]
          }
        ] as Content[],
        config: {
          temperature: 0.2,
          maxOutputTokens: 1000,
          responseMimeType: 'application/json'
        }
      });

      const text = response.text ?? '';
      return JSON.parse(text);
    } catch (error) {
      this.logger.error(`BIM metadata extraction failed: ${error}`);
      throw error;
    }
  }
}
