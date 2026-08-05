export type LanguageCode = 'en' | 'hi' | 'es' | 'ja' | 'de';

export type CardTone = '60w' | 'brief' | 'eli5' | 'deepdive';

export interface PerspectiveItem {
  perspective: string;
  sentiment: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface TranslationContent {
  title: string;
  summary60w: string[];
  summaryEli5: string[];
  summaryDeepDive: string;
}

export interface Story {
  id: string;
  title: string;
  category: string;
  readTime: string;
  publishedAt: string;
  source: string;
  originalUrl?: string;
  summary60w: string[];
  summaryEli5: string[];
  summaryDeepDive: string;
  translations?: Record<string, TranslationContent>;
  biasRating: string;
  biasScore: number;
  perspectives?: PerspectiveItem[];
  smartGlossary?: GlossaryItem[];
  voiceAudioText?: string;
  isBookmarked: boolean;
}
