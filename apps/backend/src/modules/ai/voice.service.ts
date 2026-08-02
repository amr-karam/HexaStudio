import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Content, GoogleGenAI } from '@google/genai';
import { Env } from '../../config/env';

/**
 * Supported audio MIME types for Gemini audio transcription.
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
 * Provides speech-to-text transcription using Gemini's native audio processing
 * capability. Accepts base64-encoded audio data in common formats (webm, wav,
 * mp3, ogg, mp4, aac, flac).
 *
 * Gracefully handles missing API keys and transcription failures.
 */
@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private client: GoogleGenAI | null = null;

  constructor(private readonly configService: ConfigService<Env>) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  /**
   * Returns true when the Gemini client is configured and available.
   */
  get isAvailable(): boolean {
    return this.client !== null;
  }

  /**
   * Transcribe audio data to text using Gemini's audio processing.
   *
   * Sends the audio to Gemini 3.5 Flash which can natively process audio
   * content and return a text transcription.
   *
   * @param audioData - Base64-encoded audio binary data
   * @param mimeType  - MIME type of the audio (e.g. 'audio/webm', 'audio/wav', 'audio/mp3')
   * @returns Transcribed text string
   * @throws Error if Gemini API is unavailable or transcription fails
   */
  async transcribeAudio(audioData: string, mimeType: string): Promise<string> {
    if (!this.client) {
      throw new Error('Gemini API is unavailable — no API key configured');
    }

    if (!VoiceService.isSupportedAudioMimeType(mimeType)) {
      this.logger.warn(`Unsupported audio MIME type "${mimeType}", attempting transcription anyway`);
    }

    try {
      const model = this.configService.get<string>('GEMINI_MODEL')!;

      const response = await this.client.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: 'Transcribe the speech in this audio recording accurately. Return only the transcribed text, no additional commentary or formatting.',
              },
              {
                inlineData: {
                  mimeType,
                  data: audioData,
                },
              },
            ],
          },
        ] as Content[],
        config: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      });

      const transcribed = response.text?.trim() ?? '';
      if (!transcribed) {
        throw new Error('Empty transcription result from Gemini');
      }

      this.logger.debug(`Audio transcribed successfully (${transcribed.length} chars)`);
      return transcribed;
    } catch (error) {
      this.logger.error(`Audio transcription failed: ${(error as any).message}`);
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
