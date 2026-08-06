'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HeaderHUD } from '../components/HeaderHUD';
import { StoryCard } from '../components/StoryCard';
import { NewsCoPilotDrawer } from '../components/NewsCoPilotDrawer';
import { FullScreenSplash } from '../components/FullScreenSplash';
import { SearchBar } from '../components/SearchBar';
import { Story, LanguageCode } from '../types';
import { api } from '../lib/api';
import { Sparkles, RefreshCw, Cpu, Bot, Bookmark, TrendingUp } from 'lucide-react';

export default function Home() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [selectedScope, setSelectedScope] = useState<string>('global');
  const [locationInput, setLocationInput] = useState<string>('');
  const [replaySplash, setReplaySplash] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Recommendation Mode State: 'history' (For You) or 'random' (Discovery)
  const [recMode, setRecMode] = useState<'history' | 'random'>('history');

  // Live News Keyword Search Engine State
  const [isSearchingLive, setIsSearchingLive] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Co-Pilot Drawer State
  const [selectedCoPilotStory, setSelectedCoPilotStory] = useState<Story | null>(null);
  const [isCoPilotOpen, setIsCoPilotOpen] = useState<boolean>(false);

  const fetchFeed = useCallback(async (langToUse?: LanguageCode) => {
    setLoading(true);
    const activeLang = langToUse || currentLanguage;
    try {
      const data = await api.getRecommendations(recMode, selectedCategory, selectedScope, locationInput, isDemoMode, activeLang);
      setStories(data);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  }, [recMode, selectedCategory, selectedScope, locationInput, isDemoMode, currentLanguage]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchFeed();
    }
  }, [fetchFeed, searchQuery]);

  const handleLanguageChange = async (newLang: LanguageCode) => {
    setCurrentLanguage(newLang);
    setSearchError(null);

    if (searchQuery.trim()) {
      handleLiveNewsSearch(searchQuery, newLang);
      return;
    }

    // Batch translate & fetch feed in a single API call via backend batch translator
    await fetchFeed(newLang);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchError(null);
    if (category !== 'All') {
      setIsSearchingLive(true);
      api.searchLiveNews(searchQuery || '', category, selectedScope, locationInput, isDemoMode, currentLanguage)
        .then((res) => {
          if (res && res.length > 0) setStories(res);
        })
        .finally(() => setIsSearchingLive(false));
    } else if (!searchQuery.trim()) {
      fetchFeed();
    }
  };

  const handleLiveNewsSearch = async (query: string, overrideLang?: LanguageCode) => {
    if (!query.trim()) return;

    const langToUse = overrideLang || currentLanguage;
    setSearchQuery(query);
    setIsSearchingLive(true);
    setSearchError(null);

    try {
      const liveResults = await api.searchLiveNews(
        query.trim(),
        selectedCategory,
        selectedScope,
        locationInput,
        isDemoMode,
        langToUse
      );

      if (liveResults && liveResults.length > 0) {
        setStories(liveResults);
      } else {
        setSearchError('No recent news found for this keyword. Showing broad fallback recommendations.');
      }
    } catch (err: any) {
      setSearchError(err?.message || 'Failed to fetch live news stream. Showing fallback stream.');
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleBookmarkToggle = (storyId: string, isBookmarked: boolean) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, isBookmarked } : s))
    );
  };

  const handleDeleteStory = (storyId: string) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
  };

  const handleOpenCoPilot = (story: Story) => {
    setSelectedCoPilotStory(story);
    setIsCoPilotOpen(true);
  };

  const bookmarkedCount = stories.filter((s) => s?.isBookmarked).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col relative font-sans">
      {/* Full Screen Cinematic Intro Splash Overlay */}
      <FullScreenSplash
        forceShow={replaySplash}
        onComplete={() => setReplaySplash(false)}
      />

      {/* Header Bar with Regional Scope, Category Filter & Language Selector */}
      <HeaderHUD
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        bookmarkCount={bookmarkedCount}
        isDemoMode={isDemoMode}
        onDemoModeToggle={setIsDemoMode}
        selectedScope={selectedScope}
        onScopeChange={setSelectedScope}
        locationInput={locationInput}
        onLocationChange={setLocationInput}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Hero Section & Live Keyword News Search Engine Bar */}
        <div className="text-center space-y-4 max-w-2xl mx-auto pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Keyword News Search & AI Summarizer</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Search any news topic or headline
          </h1>
          <p className="text-sm font-sans text-neutral-400 leading-relaxed">
            Type any breaking news topic, event, or keyword to instantly fetch, analyze, and summarize live news into adaptive executive briefs with explicit bias percentages.
          </p>

          {/* Prominent Live News Search Engine Bar with Autocomplete Dropdown */}
          <SearchBar onSearchSubmit={handleLiveNewsSearch} isSearching={isSearchingLive} />
        </div>

        {/* Live News Searching Indicator */}
        {isSearchingLive && (
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between font-mono text-xs max-w-2xl mx-auto w-full animate-pulse">
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
              <div>
                <p className="text-white font-medium">Querying Google News RSS & Gemini 2.5 Flash...</p>
                <p className="text-neutral-500 text-[11px]">Fetching live articles & synthesizing adaptive HUD cards in {currentLanguage.toUpperCase()}...</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Error Notice Banner */}
        {searchError && (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 font-mono text-xs max-w-2xl mx-auto w-full flex items-center justify-between">
            <span>{searchError}</span>
            <button onClick={() => setSearchError(null)} className="text-neutral-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Feed Controls & Recommendation Stream Switcher */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="text-neutral-500 uppercase tracking-wider font-semibold">Feed Stream:</span>
            
            {/* Feed Recommendation Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-neutral-900 border border-neutral-800">
              <button
                onClick={() => setRecMode('history')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  recMode === 'history'
                    ? 'bg-white text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                For You
              </button>

              <button
                onClick={() => setRecMode('random')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  recMode === 'random'
                    ? 'bg-white text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Discover
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-mono text-[11px] hidden sm:inline">
              Showing {stories.length} stories
            </span>
            <button
              onClick={() => fetchFeed()}
              disabled={loading}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Refresh Recommendation Stream"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stories Grid Feed */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-6 h-80 flex flex-col justify-between animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 w-20 bg-neutral-800 rounded"></div>
                  <div className="h-6 w-3/4 bg-neutral-800 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-neutral-800/60 rounded"></div>
                  <div className="h-3 w-full bg-neutral-800/60 rounded"></div>
                </div>
                <div className="h-8 w-full bg-neutral-800/40 rounded"></div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/30 border border-neutral-800 rounded-2xl max-w-lg mx-auto space-y-3">
            <TrendingUp className="w-8 h-8 text-neutral-500 mx-auto" />
            <h3 className="font-mono text-sm font-bold text-neutral-200">No Stories Available</h3>
            <p className="text-xs text-neutral-400 font-mono px-4">
              Try searching a broad keyword above (e.g. "AI", "IPL", "Tech", "Space") or select another category tab.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); fetchFeed(); }}
              className="mt-2 px-4 py-2 rounded-lg bg-white text-neutral-950 font-mono text-xs font-bold hover:bg-neutral-200 transition-colors"
            >
              Reset to All Headlines
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story, idx) => (
              <StoryCard
                key={story?.id || `story-${idx}`}
                story={story}
                index={idx}
                currentLanguage={currentLanguage}
                onBookmarkToggle={handleBookmarkToggle}
                onOpenCoPilot={handleOpenCoPilot}
                onDeleteStory={handleDeleteStory}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 py-6 px-4 bg-neutral-950 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>NextPulse AI // Live Keyword News Search & Summarizer</span>
          </div>
          <div>
            <span>Powered by Gemini 2.5 Flash</span>
          </div>
        </div>
      </footer>

      {/* Ask Co-Pilot Slide-over Drawer */}
      <NewsCoPilotDrawer
        story={selectedCoPilotStory}
        isOpen={isCoPilotOpen}
        onClose={() => setIsCoPilotOpen(false)}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
