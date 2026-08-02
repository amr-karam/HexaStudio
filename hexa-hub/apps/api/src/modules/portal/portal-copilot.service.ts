import { Injectable, Logger } from '@nestjs/common';
import { AIService } from '../ai/services/ai.service';

interface CopilotQuery {
  imageUrl?: string;
  audioBase64?: string;
  text: string;
  userId: string;
  context?: {
    projectId?: string;
    workspaceId?: string;
    channelId?: string;
  };
}

interface CopilotResponse {
  answer: string;
  sources: string[];
  confidence: number;
  tags?: string[];
  followUpQuestions?: string[];
  timestamp: Date;
}

@Injectable()
export class PortalCopilotService {
  private readonly logger = new Logger(PortalCopilotService.name);

  constructor(private readonly aiService: AIService) {}

  /**
   * Process a multimodal query from the Portal Copilot
   */
  async processMultimodalQuery(query: CopilotQuery): Promise<CopilotResponse> {
    if (!query.text && !query.imageUrl && !query.audioBase64) {
      return {
        answer: 'Please provide a question, image, or audio to get started.',
        sources: [],
        confidence: 0,
        timestamp: new Date(),
      };
    }

    try {
      // Process the query based on available inputs
      const { imageBase64, audioBase64 } = this.extractBase64(query.imageUrl, query.audioBase64);

      const result = await this.aiService.processMultimodalQuery(
        imageBase64,
        audioBase64,
        query.text,
      );

      return {
        answer: result.response,
        sources: result.sources,
        confidence: 0.9,
        followUpQuestions: this.generateFollowUpQuestions(query.text),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to process copilot query: ${error.message}`);
      return {
        answer: `[Error: Could not process your request. Please try again.]`,
        sources: [],
        confidence: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Extract base64 data from URLs or base64 strings
   */
  private extractBase64(imageUrl?: string, audioBase64?: string): { imageBase64: string | null; audioBase64: string | null } {
    let imageBase64Result: string | null = null;
    let audioBase64Result: string | null = audioBase64 || null;

    if (imageUrl) {
      // In a real implementation, you would fetch the image and convert to base64
      // For now, we'll just pass it through
      imageBase64Result = '[image-data]';
    }

    return { imageBase64: imageBase64Result, audioBase64: audioBase64Result };
  }

  /**
   * Generate follow-up questions based on the query
   */
  private generateFollowUpQuestions(query: string): string[] {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('style') || queryLower.includes('material') || queryLower.includes('lighting')) {
      return [
        'Can you suggest similar projects with this style?',
        'What materials would work well with this design?',
        'How would you improve the lighting in this rendering?',
      ];
    }

    if (queryLower.includes('render') || queryLower.includes('3d') || queryLower.includes('model')) {
      return [
        'What software was used to create this 3D model?',
        'Can you optimize this model for real-time viewing?',
        'What are the key features of this architectural design?',
      ];
    }

    return [
      'Can you provide more details about this?',
      'What are the next steps for this project?',
      'Who should I contact for more information?',
    ];
  }

  /**
   * Analyze a 3D model or rendering and return structured tags
   */
  async analyzeModel(fileBase64: string, fileName: string) {
    try {
      const result = await this.aiService.analyzeVision(fileBase64, fileName);

      return {
        success: true,
        tags: result.tags,
        metadata: result.metadata,
        fileName,
      };
    } catch (error) {
      this.logger.error(`Failed to analyze model: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Transcribe audio to text
   */
  async transcribeAudio(audioBase64: string): Promise<{ text: string; confidence: number }> {
    try {
      const result = await this.aiService.transcribeAudio(audioBase64);
      return result;
    } catch (error) {
      this.logger.error(`Failed to transcribe audio: ${error.message}`);
      return { text: '[Transcription error]', confidence: 0 };
    }
  }
}
