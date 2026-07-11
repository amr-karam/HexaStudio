import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {}

  async generateProjectSummary(tasks: any[]) {
    const prompt = `Summarize the following project tasks into a concise executive report: ${JSON.stringify(tasks)}`;
    
    try {
      // Using Gemini API (simulated call based on provided API keys/docs)
      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.configService.get('GEMINI_API_KEY')}`, {
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      return 'AI Summary currently unavailable. Please check the task board for details.';
    }
  }

  async suggestNextAction(task: any) {
    const prompt = `Given this task: ${task.title} - ${task.description}. Suggest the next most logical professional action step.`;
    
    try {
      const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.configService.get('GEMINI_API_KEY')}`, {
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      return 'Continue as planned.';
    }
  }
}
