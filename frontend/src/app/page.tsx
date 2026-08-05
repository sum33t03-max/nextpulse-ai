'use client';

import React, { useState, useEffect } from 'react';
import { HeaderHUD } from '../components/HeaderHUD';
import { StoryCard } from '../components/StoryCard';
import { NewsCoPilotDrawer } from '../components/NewsCoPilotDrawer';
import { FullScreenSplash } from '../components/FullScreenSplash';
import { SearchBar } from '../components/SearchBar';
import { Story, LanguageCode } from '../types';
import { api } from '../lib/api';
import { Search, RefreshCw, Sparkles, UploadCloud, Cpu, AlertCircle, Layers, Dices, Target } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedScope, setSelectedScope] = useState<string>('global');
  const [locationInput, setLocationInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [replaySplash, setReplaySplash] = useState<boolean>(false);

  // Recommendation Mode State: 'history' (For You) or 'random' (Discovery)
  const [recMode, setRecMode] = useState<'history' | 'random'>('history');

  // Live News Keyword Search Engine State
  const [isSearchingLive, setIsSearchingLive] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Co-Pilot Drawer State
  const [selectedCoPilotStory, setSelectedCoPilotStory] = useState<Story | null>(null);
  const [isCoPilotOpen, setIsCoPilotOpen] = useState<boolean>(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const data = await api.getRecommendations(recMode, selectedCategory, selectedScope, locationInput, isDemoMode);
      setStories(data);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [recMode, selectedCategory, selectedScope, locationInput, isDemoMode]);

  const handleLiveNewsSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearchingLive(true);
    setSearchError(null);

    try {
      const liveResults = await api.searchLiveNews(
        query.trim(),
        selectedCategory,
        selectedScope,
        locationInput,
        isDemoMode
      );

      if (liveResults && liveResults.length > 0) {
        setStories(liveResults);
      } else {
        setSearchError('No recent news found for this keyword. Try another search query.');
      }
    } catch (err: any) {
      setSearchError(err?.message || 'Failed to fetch live news stream. Try another keyword.');
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

  const filteredStories = stories.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.summary60w.some((bullet) => bullet.toLowerCase().includes(q))
    );
  });

  const bookmarkedCount = stories.filter((s) => s.isBookmarked).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col relative font-sans">
      {/* Full Screen Cinematic Intro Splash Overlay */}
      <FullScreenSplash
        forceShow={replaySplash}
        onComplete={() => setReplaySplash(false)}
      />

      {/* Header Bar with Regional Scope, Category Filter & Replay Splash Trigger */}
      <HeaderHUD
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        bookmarkCount={bookmarkedCount}
        isDemoMode={isDemoMode}
        onDemoModeToggle={setIsDemoMode}
        selectedScope={selectedScope}
        onScopeChange={setSelectedScope}
        locationInput={locationInput}
        onLocationChange={setLocationInput}
        onReplaySplash={() => setReplaySplash(true)}
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
            Type any breaking news topic, event, or keyword to instantly fetch, analyze, and summarize live news into 60-word cards with explicit bias percentages.
          </p>

          {/* Prominent Live News Search Engine Bar with Autocomplete Dropdown */}
          <SearchBar onSearchSubmit={handleLiveNewsSearch} isSearching={isSearchingLive} />

          {/* Search Loading Shimmer Indicator */}
          {isSearchingLive && (
            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 font-mono text-xs text-left flex items-center gap-2.5 animate-pulse mt-3">
              <Cpu className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              <span>Fetching live RSS feeds & generating AI 60-word summaries...</span>
            </div>
          )}

          {searchError && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 font-mono text-xs text-left flex items-start gap-2 mt-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Feed Header with Dual-Mode Recommendation Switch */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            {/* Segmented Switch for Recommendation Modes */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono">
              <button
                onClick={() => setRecMode('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  recMode === 'history'
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-cyan-500" />
                <span>For You (History-Based)</span>
              </button>

              <button
                onClick={() => setRecMode('random')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  recMode === 'random'
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Dices className="w-3.5 h-3.5 text-purple-400" />
                <span>Discovery (Random)</span>
              </button>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 font-mono text-[11px] text-neutral-400">
              {filteredStories.length} Articles
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Filter Local History Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter feed history..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors"
              />
            </div>

            <button
              onClick={fetchFeed}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Refresh Recommendation Stream"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Feed Cards List with Bi-Directional Scroll Physics */}
        {loading || isSearchingLive ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-6 h-80 flex flex-col justify-between animate-pulse"
              >
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
        ) : filteredStories.length === 0 ? (
          /* Clean Minimal Empty State */
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-12 text-center my-6 max-w-lg mx-auto space-y-4">
            <Layers className="w-10 h-10 text-neutral-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-sans text-base font-bold text-white">No news found for this search</h3>
              <p className="text-xs font-mono text-neutral-400">
                Type a topic above (e.g., "Virat Kohli", "IPL 2026") or upload a news document.
              </p>
            </div>
            <Link
              href="/ingest"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-neutral-950 font-mono text-xs font-bold hover:bg-neutral-200 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Scan Document or Image</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStories.map((story, idx) => (
              <StoryCard
                key={story.id}
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

      {/* News Co-Pilot Slide-Over Drawer */}
      <NewsCoPilotDrawer
        isOpen={isCoPilotOpen}
        onClose={() => setIsCoPilotOpen(false)}
        story={selectedCoPilotStory}
        currentLanguage={currentLanguage}
        isDemoMode={isDemoMode}
      />

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
    </div>
  );
}
