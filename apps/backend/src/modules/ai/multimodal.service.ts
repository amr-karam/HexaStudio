import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Env } from '../../config/env';

/**
 * Multimodal (vision) analysis via local LM Studio (gemma-4 vision).
 * Self-hosted OpenAI-compatible endpoint — free & unlimited, no API key.
 */
@Injectable()
export class MultimodalService {
  private readonly logger = new Logger(MultimodalService.name);
  private client: OpenAI | null = null;
  private model: string;

  constructor(private configService: ConfigService<Env>) {
    this.model = this.configService.get('LM_STUDIO_MODEL', 'google/gemma-4-e4b');
    this.client = new OpenAI({
      apiKey: 'lm-studio',
      baseURL: this.configService.get('LM_STUDIO_BASE_URL', 'http://host.docker.internal:1234/v1'),
    });
  }

  get isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Shared vision prompt helper — OpenAI-compatible (LM Studio / gemma-4 vision).
   * Returns the parsed JSON object, or throws when the model is unreachable.
   */
  private async generateVision(
    prompt: string,
    images: Array<{ mimeType: string; data: string }>,
    temperature: number,
    maxTokens: number,
  ): Promise<Record<string, unknown>> {
    if (!this.client) {
      throw new Error('Vision model is unavailable');
    }

    const content = [
      { type: 'text', text: prompt },
      ...images.map((img) => ({
        type: 'image_url' as const,
        image_url: { url: `data:${img.mimeType};base64,${img.data}` },
      })),
    ];

    const response = (await (
      this.client.chat as unknown as {
        completions: {
          create: (args: Record<string, unknown>) => Promise<{
            choices?: Array<{ message?: { content?: string } }>;
          }>;
        };
      }
    ).completions.create({
      model: this.model,
      messages: [{ role: 'user', content }],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    })) as unknown as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = response.choices?.[0]?.message?.content ?? '';
    return JSON.parse(text);
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
    return this.generateVision(
      `Analyze this architectural image and provide:
1. Architectural style (e.g., modern, brutalist, minimalist)
2. Key materials used (list 3-5)
3. Lighting analysis (natural, artificial, mixed)
4. Spatial composition (open, closed, mixed-use)
5. 3 specific design improvement suggestions

Return as JSON with: style, materials[], lighting, spatialComposition, suggestions[], confidence (0-1)`,
      [{ mimeType, data: imageData }],
      0.3,
      1000,
    ) as Promise<{
      style: string;
      materials: string[];
      lighting: string;
      spatialComposition: string;
      suggestions: string[];
      confidence: number;
    }>;
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
    return this.generateVision(
      `Analyze this 3D architectural render and assess:
1. Visual quality (lighting, shadows, reflections)
2. Lighting quality (naturalness, intensity, color temperature)
3. Material realism (textures, materials, PBR accuracy)
4. Composition (camera angle, framing, depth)
5. 3-4 specific improvement suggestions
6. 2-3 technical notes for 3D artists

Return as JSON with: visualQuality, lightingQuality, materialRealism, composition, improvements[], technicalNotes[]`,
      [{ mimeType, data: imageData }],
      0.2,
      1200,
    ) as Promise<{
      visualQuality: string;
      lightingQuality: string;
      materialRealism: string;
      composition: string;
      improvements: string[];
      technicalNotes: string[];
    }>;
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
    return this.generateVision(
      `Analyze this architectural material texture and provide:
1. Material type (e.g., concrete, wood, metal, stone)
2. Dominant color palette (3-5 hex codes or color names)
3. Texture characteristics (smooth, rough, porous, etc.)
4. Suitable architectural applications (interior/exterior specific)
5. Sustainability score (0-1 based on durability and environmental impact)
6. Maintenance considerations

Return as JSON with: materialType, colorPalette[], textureCharacteristics[], suitableApplications[], sustainabilityScore, maintenanceNotes[]`,
      [{ mimeType, data: imageData }],
      0.3,
      1000,
    ) as Promise<{
      materialType: string;
      colorPalette: string[];
      textureCharacteristics: string[];
      suitableApplications: string[];
      sustainabilityScore: number;
      maintenanceNotes: string[];
    }>;
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
    return this.generateVision(
      `Compare these two architectural designs and provide:
1. Similarity score (0-1)
2. Shared design elements (3-5 items)
3. Key differences (3-5 items)
4. Stylistic relationship (e.g., complementary, contrasting, evolution)
5. Brief recommendation for design direction

Return as JSON with: similarityScore, sharedElements[], differences[], stylisticRelationship, recommendation`,
      [
        { mimeType, data: image1Data },
        { mimeType, data: image2Data },
      ],
      0.3,
      1000,
    ) as Promise<{
      similarityScore: number;
      sharedElements: string[];
      differences: string[];
      stylisticRelationship: string;
      recommendation: string;
    }>;
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
    return this.generateVision(
      `Based on this reference architectural image and the project context: "${projectContext}"

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

Return as JSON with: conceptVariations[{title, description, keyFeatures[], materials[]}], technicalRecommendations[], feasibilityScore`,
      [{ mimeType, data: referenceImageData }],
      0.4,
      1500,
    ) as Promise<{
      conceptVariations: Array<{
        title: string;
        description: string;
        keyFeatures: string[];
        materials: string[];
      }>;
      technicalRecommendations: string[];
      feasibilityScore: number;
    }>;
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
    return this.generateVision(
      `Analyze this BIM/model screenshot and extract:
1. Detected architectural elements (walls, doors, windows, etc.) with counts
2. View type (plan, elevation, section, 3D)
3. Apparent scale (if visible)
4. Visible layer information
5. Potential modeling issues or inconsistencies

Return as JSON with: detectedElements[{type, count, confidence}], viewType, scale, layerInformation[], potentialIssues[]`,
      [{ mimeType, data: imageData }],
      0.2,
      1000,
    ) as Promise<{
      detectedElements: Array<{
        type: string;
        count: number;
        confidence: number;
      }>;
      viewType: string;
      scale: string;
      layerInformation: string[];
      potentialIssues: string[];
    }>;
  }

  /**
   * Generate AI architectural project brief from parameters
   */
  async generateArchitecturalBrief(params: {
    projectType: string;
    squareFootage: number;
    stylePreference: string;
    sustainabilityGoals: string;
    budgetRange: string;
  }): Promise<{
    executiveSummary: string;
    spatialRequirements: Array<{ space: string; areaSqFt: number; notes: string }>;
    recommendedMaterials: string[];
    estimatedTimelineMonths: number;
    sustainabilityScoreEstimate: number;
  }> {
    return this.generateVision(
      `Generate a comprehensive architectural project brief for a project with these parameters:
- Project Type: ${params.projectType}
- Square Footage: ${params.squareFootage} sq ft
- Style Preference: ${params.stylePreference}
- Sustainability Goals: ${params.sustainabilityGoals}
- Budget Range: ${params.budgetRange}

Return as JSON with: executiveSummary, spatialRequirements[{space, areaSqFt, notes}], recommendedMaterials[], estimatedTimelineMonths, sustainabilityScoreEstimate (0-1)`,
      [],
      0.4,
      1200,
    ) as Promise<{
      executiveSummary: string;
      spatialRequirements: Array<{ space: string; areaSqFt: number; notes: string }>;
      recommendedMaterials: string[];
      estimatedTimelineMonths: number;
      sustainabilityScoreEstimate: number;
    }>;
  }
}
