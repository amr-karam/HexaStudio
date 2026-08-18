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
    this.logger.log(`AI service -> local LM Studio (${this.baseUrl}, model: ${this.model})`);
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

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

  async generateChat(messages: ChatMessage[]): Promise<string> {
    const response = await this.chat(messages, { temperature: 0.7, maxTokens: 1024 });
    if (response) return response;
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    return (
      `I'm currently running in offline fallback mode - the local AI server is unavailable. ` +
      `Your message was: "${lastUser?.content ?? '(empty)'}". ` +
      `Once LM Studio is running on port 1234, I'll answer with real intelligence.`
    );
  }

  async analyzeVision(fileBase64: string, fileName: string): Promise<VisionAnalysisResult> {
    const prompt = `
You are an expert architectural visualization analyst.
Analyze this architectural 3D model or rendering.
File name: ${fileName}
Analyze the image/model now.`;
    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: `data:image/png;base64,${fileBase64}` } }] }],
          temperature: 0.4,
          max_tokens: 2048,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(180_000),
      });
      if (!res.ok) {
        this.logger.warn(`Vision analysis returned ${res.status} - using mock`);
        return this.getMockAnalysis(fileName);
      }
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content ?? '';
      let parsed: VisionAnalysisResult;
      try {
        parsed = JSON.parse(text) as VisionAnalysisResult;
      } catch (parseError) {
        this.logger.warn(`Vision analysis returned invalid JSON: ${String(parseError)} - using mock`);
        return this.getMockAnalysis(fileName);
      }
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transcribeAudio(audioBase64: string): Promise<{ text: string; confidence: number }> {
    return {
      text: '[Audio transcription requires a cloud speech model - not available on the local AI server]',
      confidence: 0,
    };
  }

  async processMultimodalQuery(
    imageBase64: string | null,
    _audioBase64: string | null,
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
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: textQuery },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } },
        ],
      }],
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

  async generateProjectSummary(tasks: Array<{ title: string; status: string; priority?: string }>): Promise<string> {
    const taskList = tasks.map(t => `- ${t.title} [${t.status}]${t.priority ? ` (${t.priority})` : ''}`).join('\n');
    const prompt = `Summarize the following project tasks in 3-4 concise sentences. Highlight blockers, progress, and next steps.\n\nTasks:\n${taskList || '(no tasks provided)'}`;
    return this.generateChat([{ role: 'user', content: prompt }]);
  }

  async suggestNextAction(task: { title: string; status: string }): Promise<string> {
    const prompt = `Given this task, suggest the single most valuable next action (1-2 sentences):\nTitle: ${task.title}\nStatus: ${task.status}`;
    return this.generateChat([{ role: 'user', content: prompt }]);
  }
}

export { AIService as AiService };
