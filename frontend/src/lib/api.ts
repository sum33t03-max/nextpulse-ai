import axios from 'axios';
import { Story } from '../types';
import { MOCK_STORIES } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

      const response = await axios.get(`${API_BASE_URL}/recommendations`, { params });
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
    if (!query || query.trim().length < 2) return [];
    try {
      const response = await axios.get(`${API_BASE_URL}/news/suggest`, {
        params: { q: query.trim() }
      });
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch search suggestions:', error);
      return [
        `${query} latest news`,
        `${query} IPL updates`,
        `${query} breaking coverage`,
        `${query} sports match stats`,
        `${query} today's report`
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
    if (isDemoMode) {
      const mockStory: Story = {
        id: `demo-search-${Date.now()}`,
        title: `Live News Results: ${query}`,
        category: category && category !== 'All' ? category : (query.toLowerCase().includes('virat') || query.toLowerCase().includes('ipl') ? "Sports" : "Search Intelligence"),
        readTime: "1 min read",
        publishedAt: "Just now",
        source: "NextPulse Demo Engine",
        originalUrl: undefined,
        summary60w: [
          `[DEMO MODE] Live RSS search executed for keyword: '${query}'.`,
          "Takeaway 1: Scraped top breaking headlines and body passages.",
          "Takeaway 2: Gemini 2.5 Flash synthesized 60-word HUD card.",
          "Takeaway 3: Calculated bias rating (Neutral 90%) and key glossary terms."
        ],
        summaryEli5: [
          `[DEMO MODE] Here are the latest news updates for '${query}' explained simply!`
        ],
        summaryDeepDive: `Live Search Breakdown for ${query}.\n\nSynthetic intelligence parsed real-time headlines across verified sources.`,
        biasRating: "Neutral",
        biasScore: 90,
        perspectives: [
          { perspective: "Search Crawler", sentiment: "Extracted high-density headlines." }
        ],
        smartGlossary: [
          { term: "live news RSS", definition: "Real-time news syndication feed indexed by search engines." }
        ],
        voiceAudioText: `Live news search summary for ${query}.`,
        isBookmarked: false
      };
      MOCK_STORIES.unshift(mockStory);
      return [mockStory, ...MOCK_STORIES.slice(1, 4)];
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/news/search`, {
        query,
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
      const response = await axios.get(`${API_BASE_URL}/stories/${id}`);
      return response.data;
    } catch (error) {
      const found = MOCK_STORIES.find(s => s.id === id);
      if (found) return found;
      throw error;
    }
  },

  async toggleBookmark(id: string): Promise<{ story_id: string; isBookmarked: boolean }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/stories/${id}/bookmark`);
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
      const response = await axios.delete(`${API_BASE_URL}/stories/${id}`);
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
      const response = await axios.post(`${API_BASE_URL}/ingest`, payload);
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
          "Takeaway 3: Generated 60-word HUD news card with zero manual typing required."
        ],
        summaryEli5: [
          "[DEMO MODE] We scanned your news document image and converted it into an easy 60-word card!"
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
      const response = await axios.post(`${API_BASE_URL}/ingest/document`, formData, {
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
      const response = await axios.get(`${API_BASE_URL}/chat/${articleId}`);
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
      const response = await axios.post(`${API_BASE_URL}/chat/article`, payload);
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
