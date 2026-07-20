import { Injectable, Logger } from '@nestjs/common';
import type { Project } from '@hexastudio/types';
import { AiChatService } from './ai-chat.service';

@Injectable()
export class AutoTagService {
  private readonly logger = new Logger(AutoTagService.name);

  constructor(private readonly aiChat: AiChatService) {}

  async generateTags(project: Project): Promise<string[]> {
    if (!this.aiChat.isAvailable) {
      this.logger.warn('Chat LLM not available — using keyword extraction fallback');
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

      const response = await this.aiChat.client!.chat.completions.create({
        model: this.aiChat.model,
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
