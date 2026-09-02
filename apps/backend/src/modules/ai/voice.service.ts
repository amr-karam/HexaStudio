import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Env } from '../../config/env';
import { sanitizePrompt } from './llm.factory';

/**
 * Supported audio MIME types for Hermes Agent audio transcription.
 */
const SUPPORTED_AUDIO_MIME_TYPES = [
  'audio/webm',
  'audio/wav',
  'audio/wave',
  'audio/mp3',
  'audio/mpeg',
  'audio/ogg',
  'audio/mp4',
  'audio/aac',
  'audio/flac',
] as const;

/**
 * VoiceService
 *
 * Provides speech-to-text transcription using Hermes Agent voice processing
 * (OpenAI-compatible audio endpoint). Accepts base64-encoded audio data in
 * common formats (webm, wav, mp3, ogg, mp4, aac, flac).
 *
 * Gracefully handles missing API keys and transcription failures.
 */
@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private client: OpenAI | null = null;
  private readonly model: string;

  constructor(private readonly configService: ConfigService<Env>) {
    const apiKey = this.configService.get('HERMES_API_KEY');
    const baseUrl =
      this.configService.get('HERMES_BASE_URL') ??
      'http://19.16.1.100:8000/v1';

    this.model = this.configService.get('HERMES_MODEL') ?? 'hermes-agent-1.0';

    this.client = new OpenAI({
      apiKey: apiKey ?? '',
      baseURL: baseUrl,
    });
  }

  /**
   * Returns true when the Hermes Agent client is configured and available.
   */
  get isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Transcribe audio data to text using Hermes Agent audio processing.
   *
   * Sends the audio to Hermes Agent which can natively process audio
   * content and return a text transcription.
   *
   * @param audioData - Base64-encoded audio binary data
   * @param mimeType  - MIME type of the audio (e.g. 'audio/webm', 'audio/wav', 'audio/mp3')
   * @returns Transcribed text string
   * @throws Error if Hermes Agent is unavailable or transcription fails
   */
  async transcribeAudio(audioData: string, mimeType: string): Promise<string> {
    if (!this.client) {
      throw new Error('Hermes Agent is unavailable — no API key configured');
    }

    if (!VoiceService.isSupportedAudioMimeType(mimeType)) {
      this.logger.warn(`Unsupported audio MIME type "${mimeType}", attempting transcription anyway`);
    }

    try {
      // Hermes Agent accepts audio via the OpenAI-compatible audio input format.
      const sanitized = sanitizePrompt('Transcribe the speech in this audio recording accurately. Return only the transcribed text, no additional commentary or formatting.');

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: sanitized },
              {
                type: 'audio', // OpenAI-compatible multimodal audio input
                audio: {
                  data: audioData,
                  mime_type: mimeType,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      });

      const transcribed = response.choices?.[0]?.message?.content?.trim() ?? '';
      if (!transcribed) {
        throw new Error('Empty transcription result from Hermes Agent');
      }

      this.logger.debug(`Audio transcribed successfully (${transcribed.length} chars)`);
      return transcribed;
    } catch (error) {
      this.logger.error(`Audio transcription failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Check whether a given MIME type is among the supported audio formats.
   *
   * @param mimeType - MIME type string to validate
   * @returns True if the MIME type is supported
   */
  static isSupportedAudioMimeType(mimeType: string): boolean {
    return (SUPPORTED_AUDIO_MIME_TYPES as readonly string[]).includes(mimeType);
  }
}
