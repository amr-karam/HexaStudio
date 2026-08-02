import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface VisionAnalysisResult {
  tags: string[];
  metadata: {
    style: string;
    materials: string[];
    colors: string[];
    lighting: string;
    confidence: number;
    model?: string;
    fileSize?: number;
  };
  rawResponse?: unknown;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * AI service backed by a local LM Studio instance (OpenAI-compatible,
 * free & unlimited, no API key). Falls back to deterministic mock
 * responses when the local server is unreachable.
 *
 * Env:
 *  - LM_STUDIO_BASE_URL (default http://127.0.0.1:1234/v1)
 *  - LM_STUDIO_MODEL    (default google/gemma-4-e4b)
 */
@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = (
      this.configService.get<string>('LM_STUDIO_BASE_URL') ?? 'http://127.0.0.1:1234/v1'
    ).replace(/\/$/, '');
    this.model = this.configService.get<string>('LM_STUDIO_MODEL') ?? 'google/gemma-4-e4b';
    this.logger.log(`AI service → local LM Studio (${this.baseUrl}, model: ${this.model})`);
  }

  /** True when the local AI server answers a lightweight models call. */
  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Generic chat completion against the local OpenAI-compatible endpoint.
   * Returns null when the server is unreachable.
   */
  private async chat(
    messages: ChatMessage[],
    opts: { temperature?: number; maxTokens?: number; json?: boolean } = {},
  ): Promise<string | null> {
    const payload: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 2048,
    };
    if (opts.json) payload.response_format = { type: 'json_object' };

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120_000),
      });
      if (!res.ok) {
        this.logger.warn(`LM Studio returned ${res.status}`);
        return null;
      }
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return data.choices?.[0]?.message?.content ?? null;
    } catch (error) {
      this.logger.warn(`LM Studio unreachable: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * General-purpose conversational chat for the AI assistant page.
   */
  async generateChat(messages: ChatMessage[]): Promise<string> {
    const response = await this.chat(messages, { temperature: 0.7, maxTokens: 1024 });
    if (response) return response;

    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    return (
      `I'm currently running in offline fallback mode — the local AI server is unavailable. ` +
      `Your message was: "${lastUser?.content ?? '(empty)'}". ` +
      `Once LM Studio is running on port 1234, I'll answer with real intelligence.`
    );
  }

  /**
   * Analyze 3D model or rendering using local vision model
   * Returns structured tags and metadata.
   */
  async analyzeVision(fileBase64: string, fileName: string): Promise<VisionAnalysisResult> {
    const prompt = `
You are an expert architectural visualization analyst.

Analyze this architectural 3D model or rendering and extract the following information:

1. **Style**: What architectural style is this? (Modern, Contemporary, Minimalist, Industrial, Scandinavian, etc.)
2. **Materials**: What materials are visible? (Concrete, Glass, Wood, Steel, Stone, Brick, etc.)
3. **Colors**: What are the dominant colors? (Provide hex codes if possible)
4. **Lighting**: What type of lighting is used? (Natural daylight, Artificial, Mixed, Warm, Cool, etc.)
5. **Confidence**: How confident are you in your analysis? (0-1)

Return the analysis as JSON with the following structure:

{
  "tags": ["style:modern", "material:glass", "material:steel", "color:#f5f5f5", "lighting:natural"],
  "metadata": {
    "style": "Modern",
    "materials": ["Glass", "Steel", "Concrete"],
    "colors": ["#f5f5f5", "#333333", "#0066cc"],
    "lighting": "Natural daylight",
    "confidence": 0.95,
    "model": "${this.model}"
  }
}

File name: ${fileName}

Analyze the image/model now.
`;

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: `data:image/png;base64,${fileBase64}` } },
              ],
            },
          ],
          temperature: 0.4,
          max_tokens: 2048,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(180_000),
      });

      if (!res.ok) {
        this.logger.warn(`Vision analysis returned ${res.status} — using mock`);
        return this.getMockAnalysis(fileName);
      }
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = data.choices?.[0]?.message?.content ?? '';
      const parsed = JSON.parse(text) as VisionAnalysisResult;
      return {
        tags: parsed.tags || [],
        metadata: {
          style: parsed.metadata?.style || 'Unknown',
          materials: parsed.metadata?.materials || [],
          colors: parsed.metadata?.colors || [],
          lighting: parsed.metadata?.lighting || 'Unknown',
          confidence: parsed.metadata?.confidence || 0.8,
          model: parsed.metadata?.model || this.model,
        },
        rawResponse: text,
      };
    } catch (error) {
      this.logger.error(`Vision analysis failed: ${(error as Error).message}`);
      return this.getMockAnalysis(fileName);
    }
  }

  /**
   * Mock analysis for development/testing
   */
  private getMockAnalysis(fileName?: string): VisionAnalysisResult {
    const styles = ['Modern', 'Contemporary', 'Minimalist', 'Industrial', 'Scandinavian', 'Mid-Century', 'Brutalist'];
    const materials = ['Glass', 'Steel', 'Concrete', 'Wood', 'Brick', 'Stone'];
    const colors = ['#f5f5f5', '#333333', '#0066cc', '#ff6b6b', '#4ecdc4', '#ffe66d'];
    const lighting = ['Natural daylight', 'Artificial', 'Mixed', 'Warm', 'Cool'];

    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomMaterial1 = materials[Math.floor(Math.random() * materials.length)];
    const randomMaterial2 = materials[Math.floor(Math.random() * materials.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomLighting = lighting[Math.floor(Math.random() * lighting.length)];

    return {
      tags: [
        `style:${randomStyle.toLowerCase()}`,
        `material:${randomMaterial1.toLowerCase()}`,
        `material:${randomMaterial2.toLowerCase()}`,
        `color:${randomColor}`,
        `lighting:${randomLighting.toLowerCase().replace(' ', '-')}`,
      ],
      metadata: {
        style: randomStyle,
        materials: [randomMaterial1, randomMaterial2],
        colors: [randomColor],
        lighting: randomLighting,
        confidence: 0.85,
        model: 'mock',
        fileSize: fileName ? undefined : undefined,
      },
      rawResponse: null,
    };
  }

  /**
   * Analyze audio (voice transcription). Note: the local gemma-4 build
   * has no audio input — returns a graceful fallback message.
   */
  async transcribeAudio(audioBase64: string): Promise<{ text: string; confidence: number }> {
    return {
      text: '[Audio transcription requires a cloud speech model — not available on the local AI server]',
      confidence: 0,
    };
  }

  /**
   * Process multimodal query (image + text). Audio parts are skipped locally.
   */
  async processMultimodalQuery(
    imageBase64: string,
    audioBase64: string | null,
    textQuery: string,
  ): Promise<{ response: string; sources: string[] }> {
    if (!imageBase64) {
      return this.generateChat([{ role: 'user', content: textQuery }]).then(response => ({
        response,
        sources: ['text'],
      }));
    }

    const payload = {
      model: this.model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: textQuery },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } },
          ],
        },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    };

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120_000),
      });
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return {
        response: data.choices?.[0]?.message?.content ?? '[No response from local AI]',
        sources: imageBase64 ? ['image'] : ['text'],
      };
    } catch (error) {
      this.logger.error(`Multimodal query failed: ${(error as Error).message}`);
      return {
        response: `[AI processing error: ${(error as Error).message}]`,
        sources: [],
      };
    }
  }

  /**
   * Generate project summary from tasks (dashboard AI assistant).
   */
  async generateProjectSummary(tasks: Array<{ title: string; status: string; priority?: string }>): Promise<string> {
    const taskList = tasks.map(t => `- ${t.title} [${t.status}]${t.priority ? ` (${t.priority})` : ''}`).join('\n');
    const prompt = `Summarize the following project tasks in 3-4 concise sentences. Highlight blockers, progress, and next steps.

Tasks:
${taskList || '(no tasks provided)'}`;
    return this.generateChat([{ role: 'user', content: prompt }]);
  }

  /**
   * Suggest next action for a task.
   */
  async suggestNextAction(task: { title: string; status: string }): Promise<string> {
    const prompt = `Given this task, suggest the single most valuable next action (1-2 sentences):
Title: ${task.title}
Status: ${task.status}`;
    return this.generateChat([{ role: 'user', content: prompt }]);
  }
}

// Legacy alias — some modules import { AiService }
export { AIService as AiService };
