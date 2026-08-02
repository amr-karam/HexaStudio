import { Injectable, Logger } from '@nestjs/common';
import { AiChatService } from '../ai/ai-chat.service';
import { MultimodalService } from '../ai/multimodal.service';
import { AutoTagVisionService, VisionTagResult } from '../ai/auto-tag-vision.service';
import { VoiceService } from '../ai/voice.service';

@Injectable()
export class PortalCopilotService {
  private readonly logger = new Logger(PortalCopilotService.name);

  constructor(
    private readonly aiChat: AiChatService,
    private readonly multimodalService: MultimodalService,
    private readonly autoTagVisionService: AutoTagVisionService,
    private readonly voiceService: VoiceService,
  ) {}

  /**
   * Process a standard text-only client query.
   * Uses the existing OpenAI-compatible chat completion flow.
   */
  async processClientQuery(query: string, projectName = 'Horizon Villa'): Promise<{ reply: string }> {
    this.logger.log(`Processing Client Copilot Query for [${projectName}]: "${query}"`);

    const prompt = `You are the HEXA Studio Portal Copilot for client project "${projectName}".
Answer the client's query politely, accurately, and professionally.
Rules:
- Never disclose internal company financial margins, raw operational costs, employee personal details, or internal passwords.
- Always focus on project progress, deliverables, timeline transparency, and assistance.
- Keep answers concise and structured.

User Query: "${query}"`;

    try {
      if (this.aiChat.client) {
        const completion = await this.aiChat.client.chat.completions.create({
          model: this.aiChat.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 400,
        });
        const reply = completion.choices[0]?.message?.content || 'No response generated';
        return { reply };
      }
      throw new Error('No AI chat client available');
    } catch (error) {
      this.logger.warn(`AI Copilot generation fallback: ${(error as any).message}`);
      return {
        reply: `Project **${projectName}** is currently on schedule in Phase 2 (3D Renderings & Lighting). All active deliverables are moving according to the agreed milestone timeline.`,
      };
    }
  }

  /**
   * Process a multimodal query that may include image and/or audio data.
   *
   * Pipeline:
   *   1. If `audioData` is provided → transcribe with VoiceService,
   *      prepend transcribed text to the query.
   *   2. If `imageData` is provided → analyze with Gemini Vision
   *      (AutoTagVisionService) to extract architectural context.
   *   3. Combine vision insights + transcribed text + original query into
   *      a single enriched prompt.
   *   4. Send to the LLM and return the response along with any extracted tags.
   *
   * @param query       - Text query from the user
   * @param projectName - Name of the related project
   * @param imageData   - Optional base64-encoded image data
   * @param mimeType    - MIME type of the image (required if imageData provided)
   * @param audioData   - Optional base64-encoded audio data
   * @param audioMimeType - MIME type of the audio (required if audioData provided)
   * @returns Reply text and optionally extracted vision tags
   */
  async processMultimodalQuery(
    query: string,
    projectName: string,
    imageData?: string,
    mimeType?: string,
    audioData?: string,
    audioMimeType?: string,
  ): Promise<{ reply: string; tags?: Array<{ tag: string; confidence: number; category: string }> }> {
    this.logger.log(`Processing Multimodal Copilot Query for [${projectName}]`);

    // ── Step 1: Transcribe audio if provided ──
    let transcribedText: string | undefined;
    if (audioData && audioMimeType) {
      try {
        transcribedText = await this.voiceService.transcribeAudio(audioData, audioMimeType);
        this.logger.log(`Audio transcribed (${transcribedText.length} chars)`);
      } catch (error) {
        this.logger.warn(`Audio transcription failed, continuing without it: ${(error as any).message}`);
      }
    }

    // ── Step 2: Analyze image if provided ──
    let visionTags: VisionTagResult[] | undefined;
    let visionSummary: string | undefined;
    if (imageData && mimeType) {
      try {
        // Use AutoTagVisionService for comprehensive tagging
        if (this.autoTagVisionService.isAvailable) {
          visionTags = await this.autoTagVisionService.generateVisionTags(imageData, mimeType, {
            title: projectName,
          });
        }

        // Also get architectural analysis for richer context
        if (this.multimodalService.isAvailable) {
          const analysis = await this.multimodalService.analyzeArchitecturalImage(imageData, mimeType);
          visionSummary = [
            `Architectural Style: ${analysis.style}`,
            `Materials: ${analysis.materials.join(', ')}`,
            `Lighting: ${analysis.lighting}`,
            `Spatial Composition: ${analysis.spatialComposition}`,
          ].join('\n');
        }
      } catch (error) {
        this.logger.warn(`Image analysis failed, continuing without vision context: ${(error as any).message}`);
      }
    }

    // ── Step 3: Build the enriched prompt ──
    const contextParts: string[] = [`Project: "${projectName}"`];

    if (transcribedText) {
      contextParts.push(`Audio transcription of user speech: "${transcribedText}"`);
    }

    if (visionSummary) {
      contextParts.push(`Image analysis:\n${visionSummary}`);
    }

    if (visionTags && visionTags.length > 0) {
      const tagList = visionTags.map((t) => `${t.tag} (${t.category}, ${Math.round(t.confidence * 100)}%)`).join(', ');
      contextParts.push(`Detected tags: ${tagList}`);
    }

    const contextBlock = contextParts.join('\n\n');
    const effectiveQuery = transcribedText
      ? `${transcribedText}\n\nAdditional question: ${query}`
      : query;

    const prompt = `You are the HEXA Studio Portal Copilot for client project "${projectName}". You have access to the following context derived from the user's uploaded image and/or audio recording:

${contextBlock}

Answer the user's query politely, accurately, and professionally. Reference what you observed in the image and/or audio transcription where relevant.
Rules:
- Never disclose internal company financial margins, raw operational costs, employee personal details, or internal passwords.
- Always focus on project progress, deliverables, timeline transparency, and assistance.
- If you saw an image, describe what you noticed about the design style, materials, lighting, and composition.
- If you processed audio, acknowledge the spoken content.
- Keep answers concise and structured.

User Query: "${effectiveQuery}"`;

    // ── Step 4: Generate response ──
    try {
      if (this.aiChat.client) {
        const completion = await this.aiChat.client.chat.completions.create({
          model: this.aiChat.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 600,
        });
        const reply = completion.choices[0]?.message?.content || 'No response generated';

        return {
          reply,
          tags: visionTags?.map((t) => ({
            tag: t.tag,
            confidence: t.confidence,
            category: t.category,
          })),
        };
      }
      throw new Error('No AI chat client available');
    } catch (error) {
      this.logger.warn(`Multimodal Copilot generation fallback: ${(error as any).message}`);

      // Build a sensible fallback that still references vision context
      let fallbackReply = `Project **${projectName}** is currently on schedule in Phase 2 (3D Renderings & Lighting).`;
      if (visionSummary) {
        fallbackReply += ` Based on the image, I can see ${visionSummary.split('\n')[0]?.toLowerCase() ?? 'architectural details'}.`;
      }
      if (transcribedText) {
        fallbackReply += ` I heard your audio regarding "${transcribedText.slice(0, 80)}...".`;
      }

      return {
        reply: fallbackReply,
        tags: visionTags?.map((t) => ({
          tag: t.tag,
          confidence: t.confidence,
          category: t.category,
        })),
      };
    }
  }
}
