import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { Project } from '@hexastudio/types';
import { getEnv, Env } from '../../config/env';

@Injectable()
export class AutoTagService {
  private readonly logger = new Logger(AutoTagService.name);
  private openai: OpenAI | null = null;
  private env: Env;

  constructor() {
    this.env = getEnv();
    if (this.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: this.env.OPENAI_API_KEY });
    }
  }

  async generateTags(project: Project): Promise<string[]> {
    if (!this.openai) {
      this.logger.warn('OpenAI not available — using keyword extraction fallback');
      return this.extractKeywords(project);
    }

    try {
      const prompt = `Extract 5-10 relevant tags for this architecture project.
Title: ${project.title}
Description: ${project.description}
Category: ${project.category?.name ?? 'N/A'}
Services: ${(project.services || []).join(', ')}

Return ONLY a JSON array of strings, e.g. ["tag1", "tag2"].
Focus on: architecture style, materials, project type, location context, design features.`;

      const response = await this.openai!.chat.completions.create({
        model: this.env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: 'You are a tag generator for an architecture portfolio. Return only valid JSON arrays of strings.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) return this.extractKeywords(project);

      const tags = JSON.parse(content) as string[];
      return tags.filter(t => typeof t === 'string' && t.length > 0).slice(0, 10);
    } catch (error) {
      this.logger.error(`Auto-tag generation failed: ${error}`);
      return this.extractKeywords(project);
    }
  }

  private extractKeywords(project: Project): string[] {
    const tags: string[] = [];

    if (project.category?.name) {
      tags.push(project.category.name.toLowerCase());
    }

    const descWords = (project.description || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4);

    const unique = [...new Set(descWords)];
    tags.push(...unique.slice(0, 5));

    if (project.services) {
      tags.push(...project.services.map(s => s.toLowerCase()));
    }

    return [...new Set(tags)].slice(0, 10);
  }
}
