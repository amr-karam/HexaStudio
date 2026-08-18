// Ambient module declarations for dependencies that ship without their own
// TypeScript types. Keep this list minimal — prefer installing @types/* when
// available rather than widening types here.

declare module 'i18next-browser-languagedetector' {
  import type { Module, LanguageDetectorOptions } from 'i18next';

  export interface LanguageDetector extends Module {
    init(options?: LanguageDetectorOptions): void;
    detect(): string | readonly string[] | undefined;
    cacheUserLanguage(lng: string): void;
  }

  export default class LanguageDetectorFactory implements LanguageDetector {
    constructor(options?: LanguageDetectorOptions, allOptions?: object);
    init(options?: LanguageDetectorOptions): void;
    detect(): string | readonly string[] | undefined;
    cacheUserLanguage(lng: string): void;
    type: 'languageDetector';
  }
}
