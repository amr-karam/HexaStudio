import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { Project } from '@hexastudio/types';
import { Env } from '../../config/env';

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService<Env>) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateSummary(project: Project): Promise<string> {
    if (!this.openai) {
      return this.fallbackSummary(project);
    }

    try {
      const prompt = `Generate a compelling architectural project summary (2-3 paragraphs) from the following data.

Title: ${project.title}
Description: ${project.description}
Category: ${project.category?.name ?? 'N/A'}
Services: ${(project.services || []).join(', ')}
Location: ${project.location ?? 'N/A'}
Area: ${project.area ?? 'N/A'}

Write in a professional, evocative tone suitable for a high-end architecture portfolio. Highlight the design philosophy, material choices, and spatial experience.`;

      const response = await this.openai!.chat.completions.create({
        model: this.configService.get<string>('OPENAI_MODEL')!,
        messages: [
          { role: 'system', content: 'You are an architectural copywriter. Generate concise, evocative project summaries in plain text.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 400,
      });

      const content = response.choices[0]?.message?.content?.trim();
      return content || this.fallbackSummary(project);
    } catch (error) {
      this.logger.error(`Summary generation failed: ${error}`);
      return this.fallbackSummary(project);
    }
  }

  private fallbackSummary(project: Project): string {
    if (project.description) {
      return `${project.title}: ${project.description}`;
    }
    return `${project.title} — ${project.category?.name ?? 'Architecture'} project.`;
  }
}
