import { Job } from 'bull';
import { AiJobPayload } from '@hexa-hub/types';
import axios from 'axios';
import { env } from '../config/env';
import { Logger } from '@nestjs/common';

const logger = new Logger('AiProcessor');

export async function processAiJob(job: Job<AiJobPayload>): Promise<void> {
  const { userId, prompt, taskType, context } = job.data;

  logger.log(`[ai] Processing job ${job.id}: ${taskType} for user ${userId}`);

  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  try {
    await job.progress(10);

    // Constructing the prompt based on taskType
    let finalPrompt = prompt;
    if (taskType === 'summary') {
      finalPrompt = `Summarize the following information concisely: ${prompt}. Context: ${JSON.stringify(context)}`;
    } else if (taskType === 'action_items') {
      finalPrompt = `Based on the following information, list the most important next action items: ${prompt}. Context: ${JSON.stringify(context)}`;
    } else if (taskType === 'search') {
      finalPrompt = `Search for and provide information about: ${prompt}. Context: ${JSON.stringify(context)}`;
    }

    await job.progress(30);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${env.geminiApiKey}`,
      {
        contents: [{ parts: [{ text: finalPrompt }] }]
      }
    );

    const aiResult = response.data.candidates[0].content.parts[0].text;

    await job.progress(90);
    
    // In a real app, we might save this to a database or send it via another service
    logger.log(`[ai] Result for job ${job.id}: ${aiResult.slice(0, 100)}...`);

    await job.progress(100);
    logger.log(`[ai] Job ${job.id} completed`);
  } catch (error: any) {
    logger.error(`[ai] Error processing job ${job.id}: ${error.message}`);
    throw error;
  }
}
