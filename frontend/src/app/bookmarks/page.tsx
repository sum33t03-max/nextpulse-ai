'use client';

import React, { useState, useEffect } from 'react';
import { HeaderHUD } from '../../components/HeaderHUD';
import { StoryCard } from '../../components/StoryCard';
import { NewsCoPilotDrawer } from '../../components/NewsCoPilotDrawer';
import { Story, LanguageCode } from '../../types';
import { api } from '../../lib/api';
import { Bookmark, ArrowLeft, Layers } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  // Co-Pilot drawer state
  const [selectedCoPilotStory, setSelectedCoPilotStory] = useState<Story | null>(null);
  const [isCoPilotOpen, setIsCoPilotOpen] = useState<boolean>(false);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const allStories = await api.getStories();
      setStories(allStories.filter((s) => s.isBookmarked));
    } catch (err) {
      console.error('Failed to load bookmarked stories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleBookmarkToggle = (storyId: string, isBookmarked: boolean) => {
    if (!isBookmarked) {
      setStories((prev) => prev.filter((s) => s.id !== storyId));
    }
  };

  const handleDeleteStory = (storyId: string) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
  };

  const handleOpenCoPilot = (story: Story) => {
    setSelectedCoPilotStory(story);
    setIsCoPilotOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <HeaderHUD
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        selectedCategory="All"
        onCategorySelect={() => {}}
        bookmarkCount={stories.length}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Feed
          </Link>
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-500">
            <Bookmark className="w-3.5 h-3.5 text-neutral-400" />
            <span>Saved Vault</span>
          </div>
        </div>

        {/* Header Banner */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100">
              <Bookmark className="w-5 h-5 text-neutral-200" />
            </div>
            <div>
              <h1 className="font-sans text-xl font-bold text-white">Saved Intelligence Cards</h1>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">
                Your bookmarked articles saved for quick reading and voice playback.
              </p>
            </div>
          </div>
        </div>

        {/* Stories List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-6 h-72 animate-pulse"
              >
                <div className="h-6 w-3/4 bg-neutral-800 rounded mb-4"></div>
                <div className="h-20 w-full bg-neutral-800/60 rounded"></div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-12 text-center my-6 max-w-md mx-auto space-y-4">
            <Layers className="w-10 h-10 text-neutral-600 mx-auto" />
            <h3 className="font-sans text-base font-bold text-white">No bookmarked cards</h3>
            <p className="text-xs font-mono text-neutral-400">
              Bookmark news cards from the feed to view them here anytime.
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-lg bg-white text-neutral-950 font-mono text-xs font-bold hover:bg-neutral-200 transition-colors"
            >
              Explore Feed
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
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
      />
    </div>
  );
}
