export type LanguageCode = 'en' | 'hi' | 'gu' | 'es' | 'fr' | 'ja' | 'de';

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
  voiceAudioText?: string;
}

export interface Story {
  id: string;
  title: string;
  category: string;
  readTime: string;
  publishedAt: string;
  source: any;
  originalUrl?: string;
  imageUrl?: string;
  urlToImage?: string;
  description?: string;
  tags?: string[];
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
  isTranslating?: boolean;
}
