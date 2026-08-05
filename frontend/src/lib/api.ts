import axios from 'axios';
import { Story } from '../types';
import { MOCK_STORIES } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

const FILLER_PATTERNS = [
  /\blatest news\b/gi,
  /\blatest\b/gi,
  /\bnews\b/gi,
  /\btoday\b/gi,
  /\bupdates\b/gi,
  /\bbreaking\b/gi,
  /\brecent\b/gi,
  /\barticle\b/gi,
  /\barticles\b/gi
];

export function cleanSearchQuery(q: string): string {
  if (!q) return '';
  let cleaned = q.trim();
  for (const pattern of FILLER_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned.length >= 2 ? cleaned : q.trim();
}

export const api = {
  async getStories(
    category?: string,
    scope?: string,
    location?: string,
    isDemoMode: boolean = false
  ): Promise<Story[]> {
    return this.getRecommendations('history', category, scope, location, isDemoMode);
  },

  async getRecommendations(
    mode: 'history' | 'random' = 'history',
    category?: string,
    scope?: string,
    location?: string,
    isDemoMode: boolean = false
  ): Promise<Story[]> {
    if (isDemoMode) {
      let filtered = [...MOCK_STORIES];
      if (mode === 'random') {
        filtered = [...filtered].sort(() => Math.random() - 0.5);
      }
      if (category && category !== 'All') {
        filtered = filtered.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
      }
      if (location && location.trim()) {
        const q = location.toLowerCase();
        filtered = filtered.filter(s => s.title.toLowerCase().includes(q) || s.summary60w.some(b => b.toLowerCase().includes(q)));
      }
      return filtered;
    }

    try {
      const params: any = { mode };
      if (category && category !== 'All') params.category = category;
      if (scope) params.scope = scope;
      if (location) params.location = location;

      const response = await apiClient.get('/recommendations', { params });
      return response.data;
    } catch (error) {
      console.warn('Backend recommendation API failed, falling back to client stories:', error);
      let filtered = [...MOCK_STORIES];
      if (mode === 'random') {
        filtered = [...filtered].sort(() => Math.random() - 0.5);
      }
      if (category && category !== 'All') {
        filtered = filtered.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
      }
      return filtered;
    }
  },

  async getSearchSuggestions(query: string): Promise<string[]> {
    const cleaned = cleanSearchQuery(query);
    if (!cleaned || cleaned.length < 2) return [];
    try {
      const response = await apiClient.get('/news/suggest', {
        params: { q: cleaned }
      });
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch search suggestions:', error);
      return [
        `${cleaned} news`,
        `${cleaned} updates today`,
        `${cleaned} breaking report`
      ];
    }
  },

  async searchLiveNews(
    query: string,
    category?: string,
    scope?: string,
    location?: string,
    isDemoMode: boolean = false
  ): Promise<Story[]> {
    const cleaned = cleanSearchQuery(query);

    if (isDemoMode) {
      const mockStory: Story = {
        id: `demo-search-${Date.now()}`,
        title: `Live News Results: ${cleaned || query}`,
        category: category && category !== 'All' ? category : (query.toLowerCase().includes('virat') || query.toLowerCase().includes('ipl') ? "Sports" : "Search Intelligence"),
        readTime: "1 min read",
        publishedAt: "Just now",
        source: "NextPulse Demo Engine",
        originalUrl: undefined,
        summary60w: [
          `[DEMO MODE] Live RSS search executed for keyword: '${cleaned || query}'.`,
          "Takeaway 1: Scraped top breaking headlines and body passages.",
          "Takeaway 2: Gemini 2.5 Flash synthesized Smart Brief HUD card.",
          "Takeaway 3: Calculated bias rating (Neutral 90%) and key glossary terms."
        ],
        summaryEli5: [
          `[DEMO MODE] Here are the latest news updates for '${cleaned || query}' explained simply!`
        ],
        summaryDeepDive: `Live Search Breakdown for ${cleaned || query}.\n\nSynthetic intelligence parsed real-time headlines across verified sources.`,
        biasRating: "Neutral",
        biasScore: 90,
        perspectives: [
          { perspective: "Search Crawler", sentiment: "Extracted high-density headlines." }
        ],
        smartGlossary: [
          { term: "live news RSS", definition: "Real-time news syndication feed indexed by search engines." }
        ],
        voiceAudioText: `Live news search summary for ${cleaned || query}.`,
        isBookmarked: false
      };
      MOCK_STORIES.unshift(mockStory);
      return [mockStory, ...MOCK_STORIES.slice(1, 4)];
    }

    try {
      const response = await apiClient.post('/news/search', {
        query: cleaned || query,
        category: category !== 'All' ? category : undefined,
        scope,
        location
      });
      return response.data;
    } catch (error) {
      console.warn('Live news search API failed, returning mock search result:', error);
      return this.getRecommendations('random', category, scope, location, true);
    }
  },

  async getStoryById(id: string): Promise<Story> {
    try {
      const response = await apiClient.get(`/stories/${id}`);
      return response.data;
    } catch (error) {
      const found = MOCK_STORIES.find(s => s.id === id);
      if (found) return found;
      throw error;
    }
  },

  async toggleBookmark(id: string): Promise<{ story_id: string; isBookmarked: boolean }> {
    try {
      const response = await apiClient.post(`/stories/${id}/bookmark`);
      return response.data;
    } catch (error) {
      const story = MOCK_STORIES.find(s => s.id === id);
      if (story) {
        story.isBookmarked = !story.isBookmarked;
        return { story_id: id, isBookmarked: story.isBookmarked };
      }
      return { story_id: id, isBookmarked: true };
    }
  },

  async deleteStory(id: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`/stories/${id}`);
      return response.data;
    } catch (error) {
      const index = MOCK_STORIES.findIndex(s => s.id === id);
      if (index !== -1) {
        MOCK_STORIES.splice(index, 1);
      }
      return { success: true };
    }
  },

  async ingest(
    payload: { url?: string; text?: string; title?: string; target_language?: string },
    isDemoMode: boolean = false
  ): Promise<any> {
    if (isDemoMode) {
      const title = payload.title || (payload.url ? `Scraped Article: ${payload.url.split('://')[-1]}` : 'Custom Demo Text');
      const mockStory: Story = {
        id: `demo-ingest-${Date.now()}`,
        title,
        category: "Demo Intelligence",
        readTime: "1 min read",
        publishedAt: "Just now",
        source: "NextPulse Demo Mode",
        originalUrl: payload.url,
        summary60w: [
          `[DEMO MODE] Ingested input payload successfully: '${title}'.`,
          "Takeaway 1: Operating in offline demo mode using client-side mock engines.",
          "Takeaway 2: Zero API tokens consumed while exploring HUD card features.",
          "Takeaway 3: Toggle Demo Mode OFF in header to use live Gemini 2.5 Flash API."
        ],
        summaryEli5: [
          "[DEMO MODE] You are using Demo Mode! Switch it off in the top bar to connect live Gemini AI."
        ],
        summaryDeepDive: `Demo Mode Synthesis for ${title}.\n\nThis is a mock deep-dive breakdown running locally.`,
        biasRating: "Neutral",
        biasScore: 92,
        perspectives: [
          { perspective: "Demo Mode Engine", sentiment: "Simulated response active." }
        ],
        smartGlossary: [
          { term: "Demo Mode", definition: "Client-side offline mode using mock intelligence dataset." }
        ],
        voiceAudioText: `Demo mode article summary for ${title}.`,
        isBookmarked: false
      };
      MOCK_STORIES.unshift(mockStory);
      return mockStory;
    }

    try {
      const response = await apiClient.post('/ingest', payload);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        return error.response.data;
      }
      throw error;
    }
  },

  async ingestUrl(url: string, targetLanguage: string = 'en', isDemoMode: boolean = false): Promise<any> {
    return this.ingest({ url, target_language: targetLanguage }, isDemoMode);
  },

  async ingestText(title: string, text: string, targetLanguage: string = 'en', isDemoMode: boolean = false): Promise<any> {
    return this.ingest({ title, text, target_language: targetLanguage }, isDemoMode);
  },

  async ingestDocument(formData: FormData, isDemoMode: boolean = false): Promise<any> {
    if (isDemoMode) {
      const file = formData.get('file') as File;
      const fileName = file ? file.name : 'scanned_news_doc.png';
      const mockStory: Story = {
        id: `demo-doc-${Date.now()}`,
        title: `Scanned News Document: ${fileName}`,
        category: "Omni-Media Ingest",
        readTime: "1 min read",
        publishedAt: "Just now",
        source: `Multimodal Vision Demo (${fileName})`,
        originalUrl: undefined,
        summary60w: [
          `[DEMO MODE] Scanned news document/image '${fileName}'.`,
          "Takeaway 1: Optical character recognition extracted headline and article layout.",
          "Takeaway 2: Gemini 2.5 Flash multimodal vision parsed key metrics.",
          "Takeaway 3: Generated Smart Brief HUD news card with zero manual typing required."
        ],
        summaryEli5: [
          "[DEMO MODE] We scanned your news document image and converted it into an easy Smart Brief card!"
        ],
        summaryDeepDive: `Multimodal Vision OCR Synthesis for ${fileName}.\n\nText, headlines, and visual graphics were extracted and synthesized.`,
        biasRating: "Neutral",
        biasScore: 92,
        perspectives: [
          { perspective: "Document OCR Vision", sentiment: "Extracted high-fidelity text." }
        ],
        smartGlossary: [
          { term: "multimodal vision", definition: "AI capability to process and understand text directly within image and document files." }
        ],
        voiceAudioText: `Scanned news document summary for ${fileName}.`,
        isBookmarked: false
      };
      MOCK_STORIES.unshift(mockStory);
      return mockStory;
    }

    try {
      const response = await apiClient.post('/ingest/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        return error.response.data;
      }
      throw error;
    }
  },

  async ingestMedia(formData: FormData): Promise<Story> {
    return this.ingestDocument(formData, false);
  },

  async getChatHistory(articleId: string): Promise<{ id: number; sender: 'user' | 'assistant'; message: string; created_at: string }[]> {
    try {
      const response = await apiClient.get(`/chat/${articleId}`);
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch chat history for ${articleId}:`, error);
      return [];
    }
  },

  async chatWithArticle(
    payload: {
      article_id?: string;
      article_title: string;
      article_text: string;
      user_message: string;
      chat_history?: { role: string; content: string }[];
      target_language?: string;
    },
    isDemoMode: boolean = false
  ): Promise<{ reply: string; suggested_chips: string[] }> {
    if (isDemoMode) {
      return {
        reply: `[DEMO MODE] Based on '${payload.article_title}': The article outlines key developments, operational metrics, and domain implications. You asked: "${payload.user_message}".`,
        suggested_chips: [
          "What are the key risks involved?",
          "Who are the major entities involved?",
          "What is the expected future market impact?"
        ]
      };
    }

    try {
      const response = await apiClient.post('/chat/article', payload);
      return response.data;
    } catch (error) {
      console.warn('Backend chat failed, falling back to local Co-Pilot response:', error);
      return {
        reply: `Based on '${payload.article_title}': The article outlines key developments and operational metrics regarding "${payload.user_message}".`,
        suggested_chips: [
          "What are the primary key takeaways?",
          "Who are the main entities involved?",
          "What is the expected future outlook?"
        ]
      };
    }
  }
};
